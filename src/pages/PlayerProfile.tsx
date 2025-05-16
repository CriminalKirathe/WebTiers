import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// დარწმუნდით, რომ ეს იმპორტები სწორია თქვენი პროექტის სტრუქტურის მიხედვით
import {
    Player,
    MINI_GAMES,
    TIER_LABELS, // იმპორტი განახლებული TIER_LABELS-ისთვის
    TierRating,
    MiniGameType, 
    // TierLabelInfo, // ეს ტიპი TIER_LABELS-დან ავტომატურად უნდა იყოს ცნობილი
} from '@/utils/types'; // TierLabelInfo-ს შეიძლება არ სჭირდებოდეს ცალკე იმპორტი თუ TIER_LABELS სწორად არის ტიპიზირებული
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

  let tiersData = dbData.tiers;
  if (typeof tiersData !== 'object' || tiersData === null) {
      tiersData = {}; 
  }

  return {
    id: dbData.id,
    username: dbData.username,
    skinUrl: dbData.skin_url, 
    overallRank: rankFromDb, 
    totalPoints: dbData.total_points || 0,
    badges: dbData.badges || [],
    tiers: tiersData as { [key in MiniGameType]?: TierRating },
    lastTested: dbData.last_tested, 
    createdAt: dbData.created_at, 
    updatedAt: dbData.updated_at, 
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
  const { playerId } = useParams<{ playerId: string }>(); 
  const navigate = useNavigate(); 
  const [player, setPlayer] = useState<Player | null>(null); 
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true); 

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
        if (isInitialCall) { toast.error(`Player with ID "${playerId}" not found.`); }
        setPlayer(null); 
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      const { data: allPlayersData, error: allPlayersError } = await supabase
        .from('players')
        .select('id, total_points') 
        .order('total_points', { ascending: false, nullsLast: true });

      let calculatedRank = null;
      if (allPlayersError) {
        console.error('Error fetching all players for ranking:', allPlayersError);
        if (isInitialCall) toast.warn('Could not calculate player rank.');
      } else if (allPlayersData) {
        const playerIndex = allPlayersData.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          calculatedRank = playerIndex + 1;
        }
      }

      const mappedPlayer = mapFromDbData(targetPlayerData);
      if (mappedPlayer) {
        setPlayer({
            ...mappedPlayer,
            overallRank: calculatedRank, 
        });
      } else {
        if (isInitialCall) { toast.error("Failed to process player data."); setPlayer(null); }
      }

    } catch (e) {
      console.error("Unexpected error in fetchProfileAndCalculateRank:", e);
      if (isInitialCall) { toast.error("An unexpected error occurred."); setPlayer(null); }
    } finally {
      if (isInitialCall) {
        setIsInitiallyLoading(false); 
      }
    }
  }, [playerId]); 

  useEffect(() => {
    if (!playerId) {
      setIsInitiallyLoading(false);
      setPlayer(null);
      toast.error("Player ID is missing from URL.");
      return;
    }

    stableFetchProfileAndCalculateRank(true); 

    const intervalId = setInterval(() => {
      stableFetchProfileAndCalculateRank(false); 
    }, 10000); 

    return () => {
      clearInterval(intervalId);
    };
  }, [playerId, stableFetchProfileAndCalculateRank]); 

  // --- დამხმარე ფუნქციები ტიერებისთვის (განახლებული) ---

  const getTierDisplay = (tierRating: TierRating | undefined): string => {
    if (!tierRating) {
      return 'Not Rated';
    }
    const tierInfo = TIER_LABELS[tierRating]; 

    if (!tierInfo) {
      // console.warn(`PlayerProfile (getTierDisplay): Tier rating "${tierRating}" not found in TIER_LABELS.`);
      return tierRating.toUpperCase(); // ვაბრუნებთ უბრალოდ TierRating-ს თუ ვერ ვიპოვეთ
    }
    return tierInfo.display; 
  };
  
  const getTierColorClasses = (tierRating: TierRating | undefined): string => {
    // ნაგულისხმევი და შეცდომის კლასები
    const notRatedClasses = 'bg-slate-600 hover:bg-slate-500 text-slate-100 border-slate-700'; // "Not Rated"-თვის
    const unknownTierClasses = 'bg-neutral-800 text-red-400 border-neutral-700'; // "Unknown Tier"-თვის (თუ tierRating არსებობს, მაგრამ TIER_LABELS-ში არ არის)

    if (!tierRating) {
        return notRatedClasses;
    }

    const tierInfo = TIER_LABELS[tierRating];

    if (!tierInfo) {
        // console.warn(`PlayerProfile (getTierColorClasses): Tier rating "${tierRating}" not found in TIER_LABELS.`);
        return unknownTierClasses;
    }

    // 1. Retired ტიერები (ნაცრისფერი)
    if (tierInfo.isRetired) {
        return `bg-gray-500 hover:bg-gray-400 text-gray-800 border border-gray-600`;
    }

    // 2. High ტიერები (მწვანე)
    if (tierInfo.isHigh) {
        return `bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700`;
    }

    // 3. Low ტიერები (წითელი)
    // isHigh არის false და isRetired არის false
    return `bg-red-600 hover:bg-red-500 text-white border border-red-700`;
};


  // --- რენდერინგი ---

  if (isInitiallyLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading player profile...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl font-minecraft mb-6 text-[#ffc125]">Player Not Found</h1>
        <p className="text-gray-400 mb-6 text-center">The player with the specified ID could not be found or loaded.</p>
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
            <Card className="bg-[#1f2028] border border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg overflow-hidden">
              <CardHeader className="items-center text-center pb-4 pt-6">
                <div className="mb-4">
                  <img
                    src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/128`}
                    alt={`${player.username}'s skin`}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-lg mx-auto animate-minecraft-float shadow-md border-2 border-[#ffc125]/50 object-contain" 
                    loading="lazy" 
                  />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-minecraft text-white break-words">{player.username}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-gray-300">
                <div className="text-center mb-6 space-y-1.5">
                  <div className="text-xl font-semibold text-[#ffc125]/90">
                    Overall #{player.overallRank ?? 'N/A'}
                  </div>
                  <div className="text-lg font-bold text-[#ffc125]">{player.totalPoints} Points</div>
                </div>

                {player.badges && player.badges.length > 0 && (
                  <div className="border-t border-gray-700/70 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 text-center tracking-wider">Achievements</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {player.badges.map(badge => (
                        <Badge
                          key={badge.id}
                          variant="outline"
                          className="px-3 py-1.5 text-xs cursor-default border-[#ffc125]/60 text-[#ffc125]/90 hover:bg-[#ffc125]/10 transition-colors rounded-full"
                          title={badge.name} 
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
                    const tierRating = player.tiers?.[game.id]; 
                    const iconUrl = miniGameIcons[game.id.toLowerCase()]; 

                    return (
                      <div
                        key={game.id}
                        className="bg-[#0a0e15]/70 border border-transparent hover:border-[#ffc125]/40 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col group"
                      >
                        <div className="flex items-center mb-2">
                          {iconUrl && (
                            <img src={iconUrl} alt={`${game.name} icon`} className="w-5 h-5 mr-2 flex-shrink-0" loading="lazy"/>
                          )}
                          <h3 className="font-minecraft text-base truncate text-gray-200 group-hover:text-[#ffc125] transition-colors">{game.name}</h3>
                        </div>
                        <div className="mt-auto text-center sm:text-left">
                          <Badge
                            variant="default" // This variant might not be doing much if className overrides everything
                            className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${getTierColorClasses(tierRating)}`}
                            title={getTierDisplay(tierRating)} 
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
        </div> 
      </div> 
    </div> 
  );
};

export default PlayerProfile;