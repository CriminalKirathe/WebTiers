import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { Player, MINI_GAMES, TIER_LABELS, TierRating } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// SVG იმპორტები იგივე რჩება
import vanillaIconUrl from '@/assets/icons/gamemodes/vanila.svg';
import axeIconUrl from '@/assets/icons/gamemodes/axe.svg';
import maceIconUrl from '@/assets/icons/gamemodes/mace.svg';
import netheriteIconUrl from '@/assets/icons/gamemodes/netherite.svg';
import potIconUrl from '@/assets/icons/gamemodes/pot.svg';
import uhcIconUrl from '@/assets/icons/gamemodes/uhc.svg';
import swordIconUrl from '@/assets/icons/gamemodes/sword.svg';
import smpIconUrl from '@/assets/icons/gamemodes/smp.svg';

const mapFromDbData = (dbData: any): Player | null => {
  if (!dbData) { return null; }
  let rankFromDb = dbData.overall_rank;
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
    overallRank: rankFromDb,
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
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true); // For initial load

  const fetchProfileAndCalculateRank = useCallback(async (isInitialCall = false) => {
    if (!playerId) {
      if (isInitialCall) setIsInitiallyLoading(false);
      setPlayer(null);
      // toast.error might be too frequent if playerId is persistently missing
      // Consider logging or a one-time error display if playerId prop itself is problematic
      return;
    }

    if (isInitialCall) {
      setIsInitiallyLoading(true);
    }
    // For polling, we don't set a global loading unless no player data is present at all
    // if (!player && !isInitialCall) setIsLoading(true); // Or a more subtle loading state

    // console.log(`PlayerProfile: Fetching data for ID ${playerId}. Initial: ${isInitialCall}`);

    try {
      const { data: targetPlayerData, error: targetPlayerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();

      if (targetPlayerError && targetPlayerError.code !== 'PGRST116') {
        console.error(`PlayerProfile: Error fetching player by ID (${playerId}):`, targetPlayerError);
        if (isInitialCall) toast.error('Failed to load player profile.');
        if (isInitialCall) setPlayer(null); // Clear only on initial load error
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      if (!targetPlayerData) {
        if (isInitialCall) toast.error(`Player with ID "${playerId}" not found.`);
        setPlayer(null); // Player not found, clear state
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      const { data: allPlayersData, error: allPlayersError } = await supabase
        .from('players')
        .select('id, total_points, username')
        .order('total_points', { ascending: false, nullsLast: true })
        .order('username', { ascending: true });

      let calculatedRank = null;
      if (allPlayersError) {
        console.error('PlayerProfile: Error fetching all players for ranking:', allPlayersError);
        if (isInitialCall || !player) { // Show warning if initial or if player data was lost
            toast.warn('Could not calculate player rank due to an error.');
        }
      } else if (allPlayersData) {
        const playerIndex = allPlayersData.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          calculatedRank = playerIndex + 1;
        } else if (isInitialCall) {
            // This case (player found individually but not in ranked list) might warrant a specific log/toast
            // console.warn(`PlayerProfile: Player with ID ${playerId} not found in ranked list for rank calculation during initial load.`);
        }
      }
      
      const mappedPlayer = mapFromDbData(targetPlayerData);
      if (mappedPlayer) {
        // To ensure React detects changes, especially if only sub-properties of player object change:
        setPlayer(prevPlayer => {
            const newPlayerData = {
                ...mappedPlayer,
                overallRank: calculatedRank,
            };
            // Basic check to see if significant data has changed to avoid unnecessary re-renders
            // This is a shallow comparison, for complex objects a deep comparison or library might be needed
            if (JSON.stringify(prevPlayer) !== JSON.stringify(newPlayerData)) {
                // console.log("PlayerProfile: Player data updated.", newPlayerData);
                return newPlayerData;
            }
            return prevPlayer; // No change, return previous state
        });
      } else {
        if (isInitialCall) toast.error("Failed to process player data.");
        if (isInitialCall) setPlayer(null);
      }

    } catch (e) {
      console.error("PlayerProfile: Unexpected error in fetchProfileAndCalculateRank:", e);
      if (isInitialCall) toast.error("An unexpected error occurred.");
      if (isInitialCall) setPlayer(null);
    } finally {
      if (isInitialCall) {
        setIsInitiallyLoading(false);
      }
    }
  }, [playerId, player]); // Added 'player' to dependencies of useCallback to re-evaluate if prevPlayer logic is used.
                         // However, for polling, fetchProfileAndCalculateRank should ideally not depend on 'player' state
                         // to avoid potential loops if not careful.
                         // Let's remove 'player' and rely on setPlayer triggering re-renders if data actually changes.
                         // The JSON.stringify comparison in setPlayer also helps.

  // Corrected useCallback dependencies:
  // const fetchProfileAndCalculateRank = useCallback(async (isInitialCall = false) => { ... }, [playerId]);


  // Re-defining fetchProfileAndCalculateRank with stable dependencies for polling
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
        console.error(`PlayerProfile: Error fetching player by ID (${playerId}):`, targetPlayerError);
        if (isInitialCall) { toast.error('Failed to load player profile.'); setPlayer(null); }
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      if (!targetPlayerData) {
        if (isInitialCall) { toast.error(`Player with ID "${playerId}" not found.`); setPlayer(null); }
        if (isInitialCall) setIsInitiallyLoading(false);
        return;
      }

      const { data: allPlayersData, error: allPlayersError } = await supabase
        .from('players')
        .select('id, total_points, username') 
        .order('total_points', { ascending: false, nullsLast: true })
        .order('username', { ascending: true });

      let calculatedRank = null; 
      if (allPlayersError) {
        console.error('PlayerProfile: Error fetching all players for ranking:', allPlayersError);
        // Avoid repeated toasts on polling if rank calculation fails but player data is available
        if (isInitialCall) toast.warn('Could not calculate player rank.');
      } else if (allPlayersData) {
        const playerIndex = allPlayersData.findIndex(p => p.id === playerId); 
        if (playerIndex !== -1) {
          calculatedRank = playerIndex + 1;
        }
      }
      
      const mappedPlayer = mapFromDbData(targetPlayerData);
      if (mappedPlayer) {
          setPlayer({ // This will always create a new object reference if data changed or not.
                      // React should pick this up for re-render if values differ.
              ...mappedPlayer,
              overallRank: calculatedRank, 
          });
      } else {
          if (isInitialCall) { toast.error("Failed to process player data."); setPlayer(null); }
      }

    } catch (e) {
      console.error("PlayerProfile: Unexpected error in fetchProfileAndCalculateRank:", e);
      if (isInitialCall) { toast.error("An unexpected error occurred."); setPlayer(null); }
    } finally {
      if (isInitialCall) {
        setIsInitiallyLoading(false);
      }
    }
  }, [playerId]); // useCallback depends only on playerId

  useEffect(() => {
    if (!playerId) {
      setIsInitiallyLoading(false); // Ensure loading stops if no ID
      setPlayer(null);
      toast.error("Player ID is missing from URL."); // This toast implies playerId was expected but missing
      return;
    }

    stableFetchProfileAndCalculateRank(true); // Initial fetch

    const intervalId = setInterval(() => {
      // console.log(`PlayerProfile: Polling for player ID ${playerId} - ${new Date().toLocaleTimeString()}`);
      stableFetchProfileAndCalculateRank(false); // Polling fetch
    }, 5000); // 5 seconds

    return () => {
      // console.log(`PlayerProfile: Clearing polling interval for player ID ${playerId}.`);
      clearInterval(intervalId);
    };
  }, [playerId, stableFetchProfileAndCalculateRank]);


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

  const getTierDisplay = (tierRating: TierRating | undefined) => {
    if (!tierRating) return 'Not Rated';
    const tierInfo = TIER_LABELS[tierRating]; 
    return `${tierInfo.isReserve ? 'Reserve ' : ''}${tierInfo.isHigh ? 'High ' : 'Low '}Tier ${tierInfo.tierNumber}`;
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
                  <div className="text-xl font-semibold text-[#ffc125]/90">
                    Overall #{player.overallRank !== null && player.overallRank !== 0 && player.overallRank !== undefined ? player.overallRank : 'N/A'}
                  </div>
                  <div className="text-lg font-bold text-[#ffc125]">{player.totalPoints || 0} Points</div> {/* ქულების ჩვენება */}
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