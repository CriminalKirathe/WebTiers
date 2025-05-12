import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// დარწმუნდით, რომ ეს იმპორტები სწორია თქვენი პროექტის სტრუქტურის მიხედვით
import {
  Player,
  MINI_GAMES,
  TIER_LABELS, // იმპორტი განახლებული TIER_LABELS-ისთვის
  TierRating,
  MiniGameType, // საჭიროა tiers ობიექტის ტიპიზაციისთვის
} from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // იმპორტი Badge კომპონენტისთვის
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// SVG იმპორტები (დარწმუნდით, რომ ფაილის გზები სწორია)
import vanillaIconUrl from '@/assets/icons/gamemodes/vanila.svg';
import axeIconUrl from '@/assets/icons/gamemodes/axe.svg';
import maceIconUrl from '@/assets/icons/gamemodes/mace.svg';
import netheriteIconUrl from '@/assets/icons/gamemodes/netherite.svg';
import potIconUrl from '@/assets/icons/gamemodes/pot.svg';
import uhcIconUrl from '@/assets/icons/gamemodes/uhc.svg';
import swordIconUrl from '@/assets/icons/gamemodes/sword.svg';
import smpIconUrl from '@/assets/icons/gamemodes/smp.svg';
import elytraIconUrl from '@/assets/icons/gamemodes/elytra.webp';

// მონაცემების გარდაქმნა მონაცემთა ბაზიდან Player ინტერფეისზე
const mapFromDbData = (dbData: any): Player | null => {
  if (!dbData) { return null; }
  let rankFromDb = dbData.overall_rank;
  if (typeof rankFromDb === 'string') {
    const parsedRank = parseInt(rankFromDb, 10);
    rankFromDb = isNaN(parsedRank) ? null : parsedRank;
  } else if (typeof rankFromDb !== 'number' && rankFromDb !== null) {
    rankFromDb = null;
  }

  // დარწმუნდით, რომ tiers არის ობიექტი
  let tiersData = dbData.tiers;
  if (typeof tiersData !== 'object' || tiersData === null) {
      tiersData = {}; // თუ tiers არ არის ობიექტი, ვაყენებთ ცარიელ ობიექტს
  }

  return {
    id: dbData.id,
    username: dbData.username,
    skinUrl: dbData.skin_url, // Assuming skin_url exists
    overallRank: rankFromDb, // Can be null
    totalPoints: dbData.total_points || 0,
    badges: dbData.badges || [],
    // აუცილებლად შევამოწმოთ tiers-ის ტიპი
    tiers: tiersData as { [key in MiniGameType]?: TierRating },
    lastTested: dbData.last_tested, // Assuming last_tested exists
    createdAt: dbData.created_at, // Assuming created_at exists
    updatedAt: dbData.updated_at, // Assuming updated_at exists
  };
};

// მინი-თამაშების ხატულების რუკა
const miniGameIcons: Record<string, string> = {
  vanilla: vanillaIconUrl,
  axe: axeIconUrl,
  mace: maceIconUrl,
  netherite: netheriteIconUrl,
  potpvp: potIconUrl,
  uhc: uhcIconUrl,
  sword: swordIconUrl,
  smp: smpIconUrl,
  elytra: elytraIconUrl,
};


// მთავარი კომპონენტი
const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>(); // URL პარამეტრის წამოღება
  const navigate = useNavigate(); // ნავიგაციისთვის
  const [player, setPlayer] = useState<Player | null>(null); // მოთამაშის მონაცემების მდგომარეობა
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true); // საწყისი ჩატვირთვის მდგომარეობა

  // სტაბილური ფუნქცია მონაცემების წამოსაღებად (useCallback-ით ოპტიმიზებული)
  const stableFetchProfileAndCalculateRank = useCallback(async (isInitialCall = false) => {
    if (!playerId) {
      if (isInitialCall) setIsInitiallyLoading(false);
      setPlayer(null);
      return;
    }

    if (isInitialCall) {
      setIsInitiallyLoading(true);
    }

    try {
      // 1. სამიზნე მოთამაშის მონაცემების წამოღება
      const { data: targetPlayerData, error: targetPlayerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();

      if (targetPlayerError && targetPlayerError.code !== 'PGRST116') {
        console.error(`Error fetching player by ID (${playerId}):`, targetPlayerError);
        if (isInitialCall) { toast.error('Failed to load player profile.'); setPlayer(null); }
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      if (!targetPlayerData) {
        // Player not found
        if (isInitialCall) { toast.error(`Player with ID "${playerId}" not found.`); }
        setPlayer(null); // Clear player state if not found
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      // 2. ყველა მოთამაშის მონაცემის წამოღება რანგის გამოსათვლელად
      const { data: allPlayersData, error: allPlayersError } = await supabase
        .from('players')
        .select('id, total_points') // Only select necessary fields for ranking
        .order('total_points', { ascending: false, nullsLast: true });
        // Removed secondary username ordering as it's not strictly needed for rank index

      let calculatedRank = null;
      if (allPlayersError) {
        console.error('Error fetching all players for ranking:', allPlayersError);
        if (isInitialCall) toast.warn('Could not calculate player rank.');
      } else if (allPlayersData) {
        // Ensure total_points are numbers for correct sorting/finding index
        const playerIndex = allPlayersData.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          calculatedRank = playerIndex + 1;
        }
      }

      // 3. მონაცემების დამაპვა და მდგომარეობის განახლება
      const mappedPlayer = mapFromDbData(targetPlayerData);
      if (mappedPlayer) {
        // Update state, React will handle re-render if data changes
        setPlayer({
            ...mappedPlayer,
            overallRank: calculatedRank, // Update with the calculated rank
        });
      } else {
        if (isInitialCall) { toast.error("Failed to process player data."); setPlayer(null); }
      }

    } catch (e) {
      console.error("Unexpected error in fetchProfileAndCalculateRank:", e);
      if (isInitialCall) { toast.error("An unexpected error occurred."); setPlayer(null); }
    } finally {
      if (isInitialCall) {
        setIsInitiallyLoading(false); // Always stop initial loading
      }
    }
  }, [playerId]); // Dependency array only includes playerId

  // ეფექტი მონაცემების პირველადი წამოღებისთვის და პოლინგისთვის
  useEffect(() => {
    if (!playerId) {
      setIsInitiallyLoading(false);
      setPlayer(null);
      toast.error("Player ID is missing from URL.");
      return;
    }

    stableFetchProfileAndCalculateRank(true); // Initial fetch

    // Setup polling interval
    const intervalId = setInterval(() => {
      stableFetchProfileAndCalculateRank(false); // Polling fetch
    }, 10000); // Poll every 10 seconds (Adjust as needed)

    // Cleanup interval on component unmount or when playerId changes
    return () => {
      clearInterval(intervalId);
    };
  }, [playerId, stableFetchProfileAndCalculateRank]); // Re-run effect if playerId changes

  // --- დამხმარე ფუნქციები ტიერებისთვის (განახლებული) ---

  // ფუნქცია ტიერის საჩვენებელი ტექსტის მისაღებად
  const getTierDisplay = (tierRating: TierRating | undefined): string => {
    if (!tierRating) {
      return 'Not Rated';
    }
    const tierInfo = TIER_LABELS[tierRating]; // ვიღებთ ინფორმაციას განახლებული TIER_LABELS-დან

    if (!tierInfo) {
      console.warn(`PlayerProfile (getTierDisplay): Tier rating "${tierRating}" not found in TIER_LABELS.`);
      return 'Unknown Tier'; // თუ რეიტინგი ვერ მოიძებნა
    }
    return tierInfo.display; // ვიყენებთ display თვისებას
  };

  // ფუნქცია ტიერის ფერის კლასების მისაღებად (განახლებული Retired ლოგიკით და ფერებით)
  const getTierColorClasses = (tierRating: TierRating | undefined): string => {
    const defaultClasses = 'bg-gray-500 text-gray-100 border border-gray-600'; // ნაგულისხმევი "Not Rated"-თვის
    const errorClasses = 'bg-black text-red-500 border border-red-500'; // "Unknown Tier"-თვის

    if (!tierRating) {
      return defaultClasses;
    }

    const tierInfo = TIER_LABELS[tierRating];

    if (!tierInfo) {
      console.warn(`PlayerProfile (getTierColorClasses): Tier rating "${tierRating}" not found in TIER_LABELS.`);
      return errorClasses;
    }

    // 1. შევამოწმოთ, არის თუ არა Retired
    if (tierInfo.isRetired) {
      return 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-700'; // ნაცრისფერი Retired ტიერებისთვის
    }

    // 2. თუ არ არის Retired, განვსაზღვროთ ფერი isHigh და tierNumber-ის მიხედვით
    if (tierInfo.isHigh) {
      // მწვანე/ყვითელი High ტიერებისთვის
      switch (tierInfo.tierNumber) {
          case 1: return 'bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-600'; // HT1
          case 2: return 'bg-green-500 hover:bg-green-400 text-white border border-green-600';   // HT2
          case 3: return 'bg-lime-500 hover:bg-lime-400 text-black border border-lime-600';     // HT3
          case 4: return 'bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-600'; // HT4
          case 5: return 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-600';   // HT5
          default: return defaultClasses; // Fallback
      }
    } else {
       // წითელი/ნარინჯისფერი Low ტიერებისთვის
       switch (tierInfo.tierNumber) {
          case 1: return 'bg-red-600 hover:bg-red-500 text-white border border-red-700';         // LT1
          case 2: return 'bg-red-500 hover:bg-red-400 text-white border border-red-600';       // LT2
          case 3: return 'bg-orange-500 hover:bg-orange-400 text-white border border-orange-600'; // LT3
          case 4: return 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-700';   // LT4
          case 5: return 'bg-yellow-600 hover:bg-yellow-500 text-white border border-yellow-700'; // LT5
          default: return defaultClasses; // Fallback
      }
    }
  };


  // --- რენდერინგი ---

  // 1. საწყისი ჩატვირთვის მდგომარეობა
  if (isInitiallyLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading player profile...</p>
      </div>
    );
  }

  // 2. მოთამაშე ვერ მოიძებნა (ან შეცდომა მოხდა)
  if (!player) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl font-minecraft mb-6 text-[#ffc125]">Player Not Found</h1>
        <p className="text-gray-400 mb-6 text-center">The player with the specified ID could not be found or loaded.</p>
        <Button
          onClick={() => navigate(-1)} // უკან დაბრუნება
          className="bg-[#1f2028] text-[#ffc125] border border-[#ffc125]/50 hover:bg-[#0a0e15] hover:border-[#ffc125]/70 focus:ring-1 focus:ring-[#ffc125] px-4 py-2 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // 3. მოთამაშის პროფილი (თუ player არსებობს)
  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* უკან დაბრუნების ღილაკი */}
        <Button
          onClick={() => navigate(-1)}
          className="mb-6 group transition-colors bg-[#1f2028] text-[#ffc125] border border-[#ffc125]/50 hover:bg-[#0a0e15] hover:border-[#ffc125]/70 focus:ring-1 focus:ring-[#ffc125] px-4 py-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        {/* მთავარი კონტენტი გრიდში */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* მარცხენა სვეტი: მოთამაშის ინფო */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-[#1f2028] border border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg overflow-hidden">
              <CardHeader className="items-center text-center pb-4 pt-6">
                <div className="mb-4">
                  <img
                    // იყენებს მოთამაშის skinUrl-ს, ან mc-heads.net-ის ავატარს თუ skinUrl არ არის
                    src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/128`}
                    alt={`${player.username}'s skin`}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-lg mx-auto animate-minecraft-float shadow-md border-2 border-[#ffc125]/50 object-contain" // object-contain სურათის პროპორციებისთვის
                    loading="lazy" // სურათის ზარმაცი ჩატვირთვა
                  />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-minecraft text-white break-words">{player.username}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-gray-300">
                <div className="text-center mb-6 space-y-1.5">
                  {/* რანკის ჩვენება */}
                  <div className="text-xl font-semibold text-[#ffc125]/90">
                    Overall #{player.overallRank ?? 'N/A'}
                  </div>
                  {/* ქულების ჩვენება */}
                  <div className="text-lg font-bold text-[#ffc125]">{player.totalPoints} Points</div>
                </div>

                {/* ბეჯების სექცია (თუ არსებობს) */}
                {player.badges && player.badges.length > 0 && (
                  <div className="border-t border-gray-700/70 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 text-center tracking-wider">Achievements</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {player.badges.map(badge => (
                        <Badge
                          key={badge.id}
                          variant="outline"
                          className="px-3 py-1.5 text-xs cursor-default border-[#ffc125]/60 text-[#ffc125]/90 hover:bg-[#ffc125]/10 transition-colors rounded-full"
                          title={badge.name} // Tooltip ბეჯის სახელისთვის
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

          {/* მარჯვენა სვეტი: მინი-თამაშების ტიერები */}
          <div className="md:col-span-2">
            <Card className="bg-[#1f2028] border border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg">
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="text-xl md:text-2xl text-gray-100">Mini-game Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {/* MINI_GAMES მასივზე იტერაცია */}
                  {MINI_GAMES.map(game => {
                    // მოთამაშის ტიერის რეიტინგის მიღება ამ თამაშისთვის
                    const tierRating = player.tiers?.[game.id]; // Correctly access using game.id
                    const iconUrl = miniGameIcons[game.id.toLowerCase()]; // ხატულის URL

                    return (
                      <div
                        key={game.id}
                        className="bg-[#0a0e15]/70 border border-transparent hover:border-[#ffc125]/40 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col group"
                      >
                        {/* თამაშის სახელი და ხატულა */}
                        <div className="flex items-center mb-2">
                          {iconUrl && (
                            <img src={iconUrl} alt={`${game.name} icon`} className="w-5 h-5 mr-2 flex-shrink-0" loading="lazy"/>
                          )}
                          <h3 className="font-minecraft text-base truncate text-gray-200 group-hover:text-[#ffc125] transition-colors">{game.name}</h3>
                        </div>
                        {/* ტიერის ჩვენება (Badge გამოყენებით) */}
                        <div className="mt-auto text-center sm:text-left">
                          <Badge
                            variant="default" // ვიყენებთ className-ს სტილებისთვის
                            className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${getTierColorClasses(tierRating)}`}
                            title={getTierDisplay(tierRating)} // Tooltip სრული ტიერის სახელისთვის
                          >
                              {getTierDisplay(tierRating)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div> {/* grid end */}
      </div> {/* container end */}
    </div> // main wrapper end
  );
};

export default PlayerProfile;