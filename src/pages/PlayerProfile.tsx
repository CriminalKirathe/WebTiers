import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, MINI_GAMES, TIER_LABELS, TierRating } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// SVG იკონების იმპორტი (დარწმუნდით, რომ გზები და ფაილის სახელები სწორია)
import vanillaIconUrl from '@/assets/vanila.svg';
import axeIconUrl from '@/assets/axe.svg';
import maceIconUrl from '@/assets/mace.svg';
import netheriteIconUrl from '@/assets/netherite.svg';
import potIconUrl from '@/assets/pot.svg';
import uhcIconUrl from '@/assets/uhc.svg';
import swordIconUrl from '@/assets/sword.svg';
import smpIconUrl from '@/assets/smp.svg';

// mapFromDbData ფუნქცია უცვლელი რჩება, რადგან მას სხვაგანაც იყენებთ.
// ის შეეცდება dbData.overall_rank-ის წაკითხვას, მაგრამ PlayerProfile-ში ჩვენ ამ მნიშვნელობას
// გადავაწერთ კლიენტის მხარეს გამოთვლილი რანკით.
const mapFromDbData = (dbData: any): Player | null => {
  if (!dbData) return null;
  let rankFromDb = dbData.overall_rank; // მონაცემთა ბაზიდან წაკითხული რანკი (შეიძლება იყოს null/undefined)
  if (typeof rankFromDb === 'string') {
    const parsedRank = parseInt(rankFromDb, 10);
    rankFromDb = isNaN(parsedRank) ? null : parsedRank;
  } else if (typeof rankFromDb !== 'number' && rankFromDb !== null) {
    rankFromDb = null;
  }
  return {
    id: dbData.id,
    username: dbData.username,
    skinUrl: dbData.skin_url,
    overallRank: rankFromDb, // ეს მნიშვნელობა PlayerProfile-ში გადაიწერება
    totalPoints: dbData.total_points,
    badges: dbData.badges || [],
    lastTested: dbData.last_tested,
    tiers: dbData.tiers || {},
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
};

const miniGameIcons: Record<string, string> = {
  vanilla: vanillaIconUrl,
  axe: axeIconUrl,
  mace: maceIconUrl,
  netherite: netheriteIconUrl,
  potpvp: potIconUrl,
  uhc: uhcIconUrl,
  sword: swordIconUrl,
  smp: smpIconUrl,
};

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setIsLoading(false);
      setPlayer(null);
      toast.error("Player ID is missing from URL.");
      return;
    }

    const fetchProfileAndCalculateRank = async () => {
      setIsLoading(true);
      setPlayer(null); // წინა მოთამაშის მონაცემების გასუფთავება

      try {
        // ნაბიჯი 1: ჩამოვტვირთოთ ყველა მოთამაშე, დალაგებული ქულების მიხედვით, რანკის დასადგენად.
        // ვირჩევთ ყველა ველს (*), რადგან mapFromDbData-ს შეიძლება დასჭირდეს ისინი.
        // ოპტიმიზაციისთვის, უმჯობესია აირჩიოთ მხოლოდ საჭირო ველები.
        const { data: allPlayersData, error: allPlayersError } = await supabase
          .from('players')
          .select('*') // ირჩევს ყველა ველს
          .order('total_points', { ascending: false, nullsLast: true })
          .order('username', { ascending: true });

        if (allPlayersError) {
          console.error('Error fetching all players for ranking:', allPlayersError);
          toast.error('მოთამაშეთა რანკების ჩატვირთვა ვერ მოხერხდა.');
          setPlayer(null); // შეცდომის შემთხვევაში მოთამაშის მონაცემები null გახდება
          setIsLoading(false);
          return;
        }

        if (allPlayersData && allPlayersData.length > 0) {
          let targetPlayerData: any = null; // dbData ტიპის უნდა იყოს
          let calculatedRank = 0; // 0 ნიშნავს, რომ ვერ მოიძებნა ან არ არის რანჟირებული

          for (let i = 0; i < allPlayersData.length; i++) {
            if (allPlayersData[i].id === playerId) {
              targetPlayerData = allPlayersData[i];
              calculatedRank = i + 1;
              break;
            }
          }

          if (targetPlayerData) {
            // ვიყენებთ mapFromDbData-ს სამიზნე მოთამაშის მონაცემების სტრუქტურირებისთვის
            const mappedPlayerBase = mapFromDbData(targetPlayerData);

            if (mappedPlayerBase) {
              // გადავაწერთ overallRank-ს კლიენტის მხარეს გამოთვლილი რანკით
              setPlayer({
                ...mappedPlayerBase,
                overallRank: calculatedRank, // calculatedRank > 0 ? calculatedRank : null (თუ გვინდა N/A ვაჩვენოთ თუ ვერ მოიძებნა)
              });
            } else {
              console.error('სამიზნე მოთამაშის მონაცემების გარდაქმნა ვერ მოხერხდა.');
              toast.error('მოთამაშის მონაცემების დამუშავების შეცდომა.');
              setPlayer(null);
            }
          } else {
            // მოთამაშე playerId-ით ვერ მოიძებნა ჩამოტვირთულ სიაში.
            // ეს შეიძლება ნიშნავდეს, რომ მოთამაშე არ არსებობს, ან არ აქვს ქულები და სიის ბოლოშია.
            // ამ შემთხვევაში, ვცადოთ მოთამაშის მონაცემების პირდაპირ ჩამოტვირთვა რანკის გარეშე.
            console.warn(`მოთამაშე ID ${playerId}-ით ვერ მოიძებნა რანჟირებულ სიაში. ვცდილობ ინდივიდუალურ ჩატვირთვას.`);
            toast.info('მოთამაშე ვერ მოიძებნა რანჟირებულ სიაში.');

            const { data: singlePlayerData, error: singlePlayerError } = await supabase
              .from('players')
              .select('*')
              .eq('id', playerId)
              .single();

            if (singlePlayerError && singlePlayerError.code !== 'PGRST116') {
                console.error('მოთამაშის ინდივიდუალური ჩატვირთვის შეცდომა:', singlePlayerError);
                toast.error('მოთამაშის პროფილის ჩატვირთვა ვერ მოხერხდა.');
                setPlayer(null);
            } else if (singlePlayerData) {
                const mappedSinglePlayer = mapFromDbData(singlePlayerData);
                if (mappedSinglePlayer) {
                    // ვაჩვენებთ მოთამაშის პროფილს, მაგრამ overallRank იქნება ის, რასაც mapFromDbData დააბრუნებს
                    // (სავარაუდოდ null, თუ dbData.overall_rank არ არის სანდო), ან პირდაპირ null-ს ვანიჭებთ.
                    setPlayer({
                        ...mappedSinglePlayer,
                        overallRank: null, // რადგან რანჟირებულ სიაში ვერ ვიპოვეთ
                    });
                } else {
                    setPlayer(null); // mapFromDbData-მ null დააბრუნა
                }
            } else {
                setPlayer(null); // მოთამაშე ინდივიდუალურადაც ვერ მოიძებნა
            }
          }
        } else {
          // ზოგადად მოთამაშეების მონაცემები არ დაბრუნდა
          toast.error('რანკის დასადგენად მოთამაშეების მონაცემები არ არის ხელმისაწვდომი.');
          setPlayer(null);
        }
      } catch (e) {
        console.error("მოულოდნელი შეცდომა fetchProfileAndCalculateRank-ში:", e);
        toast.error("მოხდა მოულოდნელი შეცდომა.");
        setPlayer(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndCalculateRank();

  }, [playerId]); // useEffect ხელახლა იმუშავებს, როცა playerId შეიცვლება

  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">იტვირთება მოთამაშის პროფილი...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl font-minecraft mb-6 text-[#ffc125]">მოთამაშე ვერ მოიძებნა</h1>
        <Button
          onClick={() => navigate(-1)}
          className="bg-[#1f2028] text-[#ffc125] border border-[#ffc125]/50 hover:bg-[#0a0e15] hover:border-[#ffc125]/70 focus:ring-1 focus:ring-[#ffc125] px-4 py-2 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          უკან დაბრუნება
        </Button>
      </div>
    );
  }

  // getTierDisplay და getTierColorClasses ფუნქციები უცვლელი რჩება...
  const getTierDisplay = (tierRating: TierRating | undefined) => {
    if (!tierRating) return 'შეფასების გარეშე';
    const tierInfo = TIER_LABELS[tierRating];
    return `${tierInfo.isReserve ? 'სათადარიგო ' : ''}${tierInfo.isHigh ? 'მაღალი' : 'დაბალი'} ტიერი ${tierInfo.tierNumber}`;
  };

  const getTierColorClasses = (tierRating: TierRating | undefined) => {
    if (!tierRating) {
      return 'bg-gray-600 text-gray-200';
    }
    const tierInfo = TIER_LABELS[tierRating];
    if (tierInfo.isReserve) {
      if (tierInfo.isHigh) {
        return 'bg-green-700/70 text-green-100';
      } else {
        return 'bg-red-700/70 text-red-100';
      }
    } else {
      if (tierInfo.isHigh) {
        return 'bg-green-500 text-white';
      } else {
        return 'bg-red-500 text-white';
      }
    }
  };

  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Button
          onClick={() => navigate(-1)}
          className="mb-6 group transition-colors bg-[#1f2028] text-[#ffc125] border border-[#ffc125]/50 hover:bg-[#0a0e15] hover:border-[#ffc125]/70 focus:ring-1 focus:ring-[#ffc125] px-4 py-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          უკან
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-[#1f2028] border border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg">
              <CardHeader className="items-center text-center pb-4 pt-6">
                <div className="mb-4">
                  <img
                    src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/128`}
                    alt={`${player.username}'s skin`}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-lg mx-auto animate-minecraft-float shadow-md border-2 border-[#ffc125]/50"
                  />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-minecraft text-white">{player.username}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-gray-300">
                <div className="text-center mb-6 space-y-1.5">
                  {/* რანკის ჩვენება: ახლა აქ გამოჩნდება კლიენტის მხარეს გამოთვლილი რანკი */}
                  <div className="text-xl font-semibold text-[#ffc125]/90">
                    რანკი #{player.overallRank !== null && player.overallRank !== 0 && player.overallRank !== undefined ? player.overallRank : 'N/A'}
                  </div>
                  <div className="text-lg font-bold text-[#ffc125]">{player.totalPoints || 0} ქულა</div>
                </div>

                {player.lastTested && (
                  <div className="border-t border-gray-700/70 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2 text-center tracking-wider">აქტივობა</h3>
                    <div className="text-center text-sm text-gray-400 space-y-0.5">
                      <div>ბოლოს შემოწმდა: {player.lastTested.date}</div>
                      <div>შემმოწმებელი: {player.lastTested.tester}</div>
                    </div>
                  </div>
                )}

                {player.badges && player.badges.length > 0 && (
                  <div className="border-t border-gray-700/70 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 text-center tracking-wider">მიღწევები</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {player.badges.map(badge => (
                        <Badge
                          key={badge.id}
                          variant="outline"
                          className="px-3 py-1.5 text-xs cursor-default border-[#ffc125]/60 text-[#ffc125]/90 hover:bg-[#ffc125]/10 transition-colors rounded-full"
                        >
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {/* ... მინი-თამაშების ტიერების სექცია უცვლელი რჩება ... */}
            <Card className="bg-[#1f2028] border border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg">
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="text-xl md:text-2xl text-gray-100">მინი-თამაშების ტიერები</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {MINI_GAMES.map(game => {
                    const tierRating = player.tiers?.[game.id as keyof Player['tiers']] as TierRating | undefined;
                    const iconUrl = miniGameIcons[game.id.toLowerCase()];

                    return (
                      <div key={game.id} className="bg-[#0a0e15]/70 border border-transparent hover:border-[#ffc125]/40 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col">
                        <div className="flex items-center mb-2">
                          {iconUrl && (
                            <img src={iconUrl} alt={`${game.name} icon`} className="w-5 h-5 mr-2 flex-shrink-0" />
                          )}
                          <h3 className="font-minecraft text-base truncate text-gray-200 group-hover:text-[#ffc125] transition-colors">{game.name}</h3>
                        </div>
                        <div className="mt-auto text-center sm:text-left">
                          {tierRating ? (
                            <div className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md ${getTierColorClasses(tierRating)}`}>
                              {getTierDisplay(tierRating)}
                            </div>
                          ) : (
                            <Badge variant="outline" className="px-2.5 py-1 text-xs border-gray-600 text-gray-400 rounded-md">{getTierDisplay(undefined)}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;