import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, MINI_GAMES, TIER_LABELS, TierRating } from '@/utils/types'; // Assuming these types are correctly defined
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// SVG icon imports (ensure paths and filenames are correct)
import vanillaIconUrl from '@/assets/icons/gamemodes/vanila.svg';
import axeIconUrl from '@/assets/icons/gamemodes/axe.svg';
import maceIconUrl from '@/assets/icons/gamemodes/mace.svg';
import netheriteIconUrl from '@/assets/icons/gamemodes/netherite.svg';
import potIconUrl from '@/assets/icons/gamemodes/pot.svg';
import uhcIconUrl from '@/assets/icons/gamemodes/uhc.svg';
import swordIconUrl from '@/assets/icons/gamemodes/sword.svg';
import smpIconUrl from '@/assets/icons/gamemodes/smp.svg';

// mapFromDbData function remains the same as it's used elsewhere.
// It will attempt to read dbData.overall_rank, but in PlayerProfile,
// we will overwrite this value with the client-side calculated rank.
const mapFromDbData = (dbData: any): Player | null => {
  if (!dbData) {
    // console.warn("[mapFromDbData] Received dbData is null or undefined."); // Developer log
    return null;
  }
  let rankFromDb = dbData.overall_rank; // Rank read from DB (might be null/undefined)
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
    overallRank: rankFromDb, // This value will be overwritten in PlayerProfile
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
      toast.error("Player ID is missing from URL."); // Already English
      // console.warn("[PlayerProfile] Player ID is not provided in the URL."); // Developer log
      return;
    }

    const fetchProfileAndCalculateRank = async () => {
      setIsLoading(true);
      setPlayer(null); // Clear previous player data

      try {
        // console.log('[PlayerProfile] Fetching data for playerId:', playerId); // Developer log
        const { data: allPlayersData, error: allPlayersError } = await supabase
          .from('players')
          .select('*') // Selects all fields. For optimization, select only necessary fields.
          .order('total_points', { ascending: false, nullsLast: true })
          .order('username', { ascending: true });

        if (allPlayersError) {
          console.error('Error fetching all players for ranking:', allPlayersError);
          toast.error('Failed to load player rankings.');
          setPlayer(null);
          setIsLoading(false);
          return;
        }

        if (allPlayersData && allPlayersData.length > 0) {
          // console.log('[PlayerProfile] Raw data received from Supabase for ranking:', JSON.stringify(allPlayersData, null, 2)); // Developer log for all players
          let targetPlayerData: any = null;
          let calculatedRank = 0;

          for (let i = 0; i < allPlayersData.length; i++) {
            if (allPlayersData[i].id === playerId) {
              targetPlayerData = allPlayersData[i];
              calculatedRank = i + 1;
              break;
            }
          }

          if (targetPlayerData) {
            const mappedPlayerBase = mapFromDbData(targetPlayerData);

            if (mappedPlayerBase) {
              setPlayer({
                ...mappedPlayerBase,
                overallRank: calculatedRank,
              });
            } else {
              console.error('Failed to map target player data.');
              toast.error('Error processing player data.');
              setPlayer(null);
            }
          } else {
            // console.warn(`Player with ID ${playerId} not found in ranked list. Attempting individual fetch.`); // Developer log
            toast.info('Player not found in rankings.');

            const { data: singlePlayerData, error: singlePlayerError } = await supabase
              .from('players')
              .select('*')
              .eq('id', playerId)
              .single();
            
            // console.log('[PlayerProfile] Raw data for single player (fallback):', JSON.stringify(singlePlayerData, null, 2)); // Developer log

            if (singlePlayerError && singlePlayerError.code !== 'PGRST116') { // PGRST116 means no rows found
                console.error('Error fetching player individually:', singlePlayerError);
                toast.error('Failed to load player profile.');
                setPlayer(null);
            } else if (singlePlayerData) {
                const mappedSinglePlayer = mapFromDbData(singlePlayerData);
                if (mappedSinglePlayer) {
                    setPlayer({
                        ...mappedSinglePlayer,
                        overallRank: null, // Explicitly null as not found in ranked list
                    });
                } else {
                    setPlayer(null); // mapFromDbData returned null
                }
            } else {
                setPlayer(null); // Player not found even individually
            }
          }
        } else {
          toast.error('No player data available to determine rank.');
          setPlayer(null);
        }
      } catch (e) {
        console.error("Unexpected error in fetchProfileAndCalculateRank:", e);
        toast.error("An unexpected error occurred.");
        setPlayer(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndCalculateRank();

  }, [playerId]);

  if (isLoading) {
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
    const tierInfo = TIER_LABELS[tierRating]; // Assuming TIER_LABELS contains English strings or is structured for it
    // If TIER_LABELS itself needs localization, that's outside this scope, assuming it provides base English terms.
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
                          {badge.name} {/* Assuming badge.name is already in the desired language */}
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
                  {MINI_GAMES.map(game => { // Assuming MINI_GAMES contains game.name in the desired language
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