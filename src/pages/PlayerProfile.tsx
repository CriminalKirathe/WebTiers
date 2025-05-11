import React, { useState, useEffect } from 'react'; // დაემატა useState, useEffect
import { useParams, useNavigate } from 'react-router-dom';
// import { getPlayerById } from '@/utils/mockData'; // აღარ ვიყენებთ mockData-ს
import { Player, MINI_GAMES, TIER_LABELS, TierRating } from '@/utils/types'; // Player ტიპი
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Supabase კლიენტის იმპორტი
import { toast } from 'sonner'; // შეტყობინებებისთვის

// დამხმარე ფუნქცია ბაზიდან მიღებული მონაცემების Player ტიპზე ტრანსფორმაციისთვის
const mapFromDbData = (dbData: any): Player | null => {
  if (!dbData) return null;
  return {
    id: dbData.id,
    username: dbData.username,
    skinUrl: dbData.skin_url,
    overallRank: dbData.overall_rank,
    totalPoints: dbData.total_points,
    badges: dbData.badges || [],
    lastTested: dbData.last_tested,
    tiers: dbData.tiers || {},
    createdAt: dbData.created_at, // დავუშვათ ეს ველები არსებობს Player ტიპში
    updatedAt: dbData.updated_at,  // და Player ცხრილში
  };
};

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null); // საწყისი მნიშვნელობა null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setIsLoading(false);
      setPlayer(null);
      toast.error("Player ID is missing from URL.");
      return;
    }

    const fetchPlayerData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('players') // თქვენი მოთამაშეების ცხრილის სახელი
        .select('*')
        .eq('id', playerId) // ვფილტრავთ playerId-ით
        .single(); // ველით ერთ ჩანაწერს ან null-ს

      if (error && error.code !== 'PGRST116') { // PGRST116 ნიშნავს "ოპერაციამ არ დააბრუნა რიგები" - ეს არ არის კრიტიკული შეცდომა, თუ single() გამოიყენება
        console.error('Error fetching player profile:', error);
        toast.error(`Failed to load player profile: ${error.message}`);
        setPlayer(null);
      } else if (data) {
        setPlayer(mapFromDbData(data));
      } else {
        setPlayer(null); // მოთამაშე ამ ID-ით ვერ მოიძებნა
      }
      setIsLoading(false);
    };

    fetchPlayerData();
  }, [playerId]);

  // ჩატვირთვის მდგომარეობის ჩვენება
  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading Player Profile...</p>
      </div>
    );
  }

  // თუ მოთამაშე ვერ მოიძებნა ჩატვირთვის შემდეგ
  if (!player) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl font-minecraft mb-6 text-[#ffc125]">Player Not Found</h1>
        <Button 
          onClick={() => navigate(-1)}
          className="bg-[#1f2028] text-[#ffc125] border border-[#ffc125]/50 hover:bg-[#0a0e15] hover:border-[#ffc125]/70 focus:ring-1 focus:ring-[#ffc125] px-4 py-2 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // getTierDisplay და getTierColorClasses ფუნქციები უცვლელი რჩება
  const getTierDisplay = (tierRating: TierRating | undefined) => {
    if (!tierRating) return 'Not Rated'; 
    const tierInfo = TIER_LABELS[tierRating];
    return `${tierInfo.isReserve ? 'Reserve ' : ''}${tierInfo.isHigh ? 'High' : 'Low'} Tier ${tierInfo.tierNumber}`; 
  };

  const getTierColorClasses = (tierRating: TierRating | undefined) => {
    if (!tierRating) {
      return 'bg-gray-600 text-gray-200'; // განახლებული ფერი მუქი თემისთვის
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

  // JSX სტრუქტურა და სტილები შენარჩუნებულია თქვენი კოდის მიხედვით
  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Button 
          onClick={() => navigate(-1)} 
          className="mb-6 group transition-colors bg-[#1f2028] text-[#ffc125] border border-[#ffc125]/50 hover:bg-[#0a0e15] hover:border-[#ffc125]/70 focus:ring-1 focus:ring-[#ffc125] px-4 py-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
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
                  <div className="text-xl font-semibold text-[#ffc125]/90">Overall #{player.overallRank !== null && player.overallRank !== undefined ? player.overallRank : 'N/A'}</div>
                  <div className="text-lg font-bold text-[#ffc125]">{player.totalPoints || 0} Points</div>
                </div>

                {player.lastTested && (
                  <div className="border-t border-gray-700/70 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2 text-center tracking-wider">Activity</h3>
                    <div className="text-center text-sm text-gray-400 space-y-0.5">
                      <div>Last tested: {player.lastTested.date}</div>
                      <div>Tester: {player.lastTested.tester}</div>
                    </div>
                  </div>
                )}
                
                {player.badges && player.badges.length > 0 && (
                  <div className="border-t border-gray-700/70 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 text-center tracking-wider">Achievements</h3>
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
            <Card className="bg-[#1f2028] border border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg">
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="text-xl md:text-2xl text-gray-100">Mini-game Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {MINI_GAMES.map(game => {
                    const tierRating = player.tiers?.[game.id as keyof Player['tiers']] as TierRating | undefined; // დაცვა, თუ tiers არ არის
                    
                    return (
                      <div key={game.id} className="bg-[#0a0e15]/70 border border-transparent hover:border-[#ffc125]/40 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1">
                        <h3 className="font-minecraft text-base mb-2 truncate text-gray-200 hover:text-[#ffc125] transition-colors">{game.name}</h3>
                        {tierRating ? (
                           <div className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md ${getTierColorClasses(tierRating)}`}>
                             {getTierDisplay(tierRating)}
                           </div>
                        ) : (
                          <Badge variant="outline" className="px-2.5 py-1 text-xs border-gray-600 text-gray-400 rounded-md">{getTierDisplay(undefined)}</Badge> // undefined გადაცემა, თუ tierRating არ არის
                        )}
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