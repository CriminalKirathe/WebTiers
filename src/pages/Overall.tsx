import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Player, MINI_GAMES } from '@/utils/types';
import { Trophy, ListX } from 'lucide-react'; // Users2 არ გამოიყენება ამ ფაილში
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Icon imports - დარწმუნდით, რომ maceIconSrc და სხვა მსგავსი იმპორტების გზა სწორია
// თუ assets საქაღალდე src-ს გარეთაა, გზა შეიძლება იყოს '../assets/...' ან '@assets/...' თუ alias გაქვთ კონფიგურირებული
import axeIconSrc from '@/assets/icons/gamemodes/axe.svg';
import vanillaIconSrc from '@/assets/icons/gamemodes/vanila.svg';
import smpIconSrc from '@/assets/icons/gamemodes/smp.svg';
import maceIconSrc from '@/assets/icons/gamemodes/mace.svg'; // განვიხილოთ გზა: '../assets/...' თუ src-ს გარეთაა
import netheriteIconSrc from '@/assets/icons/gamemodes/netherite.svg'; // განვიხილოთ გზა
import potIconSrc from '@/assets/icons/gamemodes/pot.svg'; // განვიხილოთ გზა
import uhcIconSrc from '@/assets/icons/gamemodes/uhc.svg'; // განვიხილოთ გზა
import swordIconSrc from '@/assets/icons/gamemodes/sword.svg'; // განვიხილოთ გზა
import elytraIconSrc from '@/assets/icons/gamemodes/elytra.webp';

const gameModeIconSources: { [key: string]: string } = {
  vanilla: vanillaIconSrc,
  smp: smpIconSrc,
  axe: axeIconSrc,
  mace: maceIconSrc,
  netherite: netheriteIconSrc,
  potpvp: potIconSrc,
  uhc: uhcIconSrc,
  sword: swordIconSrc,
  elytra: elytraIconSrc,
};

const mapFromDbData = (dbData: any): Player => {
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

const Overall = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);

  const fetchPlayersAndRank = useCallback(async (isInitialCall = false) => {
    if (isInitialCall) {
      setIsInitiallyLoading(true);
    }

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_points', { ascending: false, nullsLast: true })
      .order('username', { ascending: true });

    if (error) {
      console.error('Overall.tsx: Error fetching players:', error);
      if (isInitialCall) {
        toast.error('Failed to load player rankings.');
      }
    } else if (data) {
      const clientSideRankedData = data.map((dbPlayer, index) => {
        const player = mapFromDbData(dbPlayer);
        return {
          ...player,
          overallRank: index + 1,
        };
      });
      setPlayers(clientSideRankedData);
    }

    if (isInitialCall) {
      setIsInitiallyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayersAndRank(true);

    const intervalId = setInterval(() => {
      fetchPlayersAndRank(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchPlayersAndRank]);

  // getRankStylingInfo და getRankRowStyling ფუნქციები უცვლელია, რადგან მათში რესპონსიული კლასები არ არის პირდაპირ.

  const getRankStylingInfo = (rank: number | null | undefined): { bg: string; text: string; trophyClass: string; cardShadow: string; } => {
    if (rank === null || rank === undefined) { return { bg: 'bg-transparent', text: 'text-gray-500', trophyClass: 'hidden', cardShadow: 'shadow-none' }; }
    if (rank === 1) return { bg: 'bg-gradient-to-br from-yellow-400 via-[#ffc125] to-amber-500', text: 'text-[#0a0e15]', trophyClass: 'text-[#ffc125]', cardShadow: 'shadow-[0_0px_18px_rgba(255,193,37,0.5)] hover:shadow-[0_0px_25px_rgba(255,193,37,0.7)]'};
    if (rank === 2) return { bg: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500', text: 'text-[#0a0e15]', trophyClass: 'text-slate-300', cardShadow: 'shadow-[0_0px_12px_rgba(100,116,139,0.4)] hover:shadow-[0_0px_18px_rgba(100,116,139,0.6)]'};
    if (rank === 3) return { bg: 'bg-gradient-to-br from-yellow-600 via-amber-700 to-yellow-800', text: 'text-white', trophyClass: 'text-yellow-400', cardShadow: 'shadow-[0_0px_12px_rgba(202,138,4,0.4)] hover:shadow-[0_0px_18px_rgba(202,138,4,0.6)]'};
    return { bg: 'bg-gray-700/40', text: 'text-gray-300', trophyClass: 'hidden', cardShadow: 'shadow-md'};
  };

  const getRankRowStyling = (rank: number | null | undefined, index: number): string => {
    let baseHover = "hover:bg-[#2a2b34] transition-all duration-200 ease-in-out transform hover:scale-[1.015] hover:shadow-lg";
    let specialStyling = "";
    if (rank !== null && rank !== undefined) {
      if (rank === 1) specialStyling = "bg-[#ffc125]/10 border-l-4 border-[#ffc125]";
      else if (rank === 2) specialStyling = "bg-slate-800/10 border-l-4 border-slate-500";
      else if (rank === 3) specialStyling = "bg-yellow-800/10 border-l-4 border-yellow-600";
      else if (index % 2 !== 0) specialStyling = "bg-[#0a0e15]/50"; // Alternating rows
      else specialStyling = "bg-[#1f2028]/30"; // Alternating rows
    } else if (index % 2 !== 0) specialStyling = "bg-[#0a0e15]/50";
    else specialStyling = "bg-[#1f2028]/30";
    return `${specialStyling || 'bg-transparent'} ${baseHover}`;
  };


  if (isInitiallyLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading Rankings...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e15] min-h-screen text-gray-300">
      {/* container padding-ები უკვე რესპონსიულია (px-4 sm:px-6 lg:px-8) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Header section typography already responsive */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Trophy className="w-14 h-14 sm:w-16 md:w-20 text-[#ffc125] mx-auto mb-3 sm:mb-4 filter drop-shadow-[0_0_10px_rgba(255,193,37,0.5)]" strokeWidth={1.5}/>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-minecraft text-[#ffc125] mb-2 sm:mb-3 tracking-wider">
            Overall Rankings
          </h1>
          <p className="text-sm sm:text-md md:text-lg text-gray-400 max-w-xl md:max-w-2xl mx-auto">
            Players ranked by their total points, showcasing skill and dedication across all mini-games.
          </p>
        </div>

        <div className="bg-[#1f2028] shadow-2xl rounded-lg sm:rounded-xl overflow-hidden border border-[#2D3748]/70 dark:shadow-[0_10px_35px_rgba(255,193,37,0.15)]">
          {/* Table Header: sticky top-X needs to consider global sticky navbar height if any. Assuming 0 for now relative to this component's scroll. */}
          {/* Header text size made responsive */}
          <div className="p-3 sm:p-4 md:p-5 bg-[#0e131c]/90 border-b-2 border-[#ffc125]/50 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-70">
            <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center text-xs sm:text-sm font-semibold text-gray-300 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              {/* Adjusted col-spans for player and minigames for better balance on small screens */}
              <div className="col-span-5 md:col-span-5 pl-1">Player</div>
              <div className="col-span-6 md:col-span-6 text-right pr-1 sm:pr-2">Mini-games</div>
            </div>
          </div>

          <div className="player-list-container">
            {players.length > 0 ? (
              players.map((player, index) => {
                const allGameModeDetails = MINI_GAMES
                  .map((gameConfig, originalIndex) => {
                    const playerTierForThisGame = player.tiers?.[gameConfig.id];
                    return {
                      id: gameConfig.id,
                      name: gameConfig.name || gameConfig.id,
                      tier: playerTierForThisGame,
                      iconSrc: gameModeIconSources[gameConfig.id.toLowerCase()],
                      isPlayed: !!playerTierForThisGame,
                      originalIndex: originalIndex,
                    };
                  })
                  .sort((a, b) => {
                    if (a.isPlayed && !b.isPlayed) return -1;
                    if (!a.isPlayed && b.isPlayed) return 1;
                    return a.originalIndex - b.originalIndex;
                  });

                const rank = player.overallRank;
                const currentRankStyling = getRankStylingInfo(rank);

                return (
                  <Link
                    to={`/player/${player.id}`}
                    key={player.id}
                    // Player row padding adjusted
                    className={`w-full flex items-center p-2 sm:p-3 md:p-4 border-b border-[#0a0e15]/60 dark:border-[#2d3748]/40 last:border-b-0 ${getRankRowStyling(rank, index)} cursor-pointer group`}
                  >
                    {/* Rank Display: sizes adjusted */}
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-md sm:rounded-lg mr-2 sm:mr-3 md:mr-4 ${currentRankStyling.bg} ${currentRankStyling.cardShadow || ''} transition-all duration-300 group-hover:brightness-110 relative`}>
                      <span className={`text-base sm:text-lg md:text-xl font-bold font-minecraft ${currentRankStyling.text}`}>
                        {player.overallRank}
                      </span>
                    </div>

                    {/* Player Info (Skin, Name, Points) */}
                    <div className="flex-grow flex items-center min-w-0">
                      {/* Skin image sizes adjusted */}
                      <img
                        src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/48`} // Consider a smaller default size for mc-heads on mobile: /32 or /40
                        alt={`${player.username}'s skin`}
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded sm:rounded-md mr-2 sm:mr-3 md:mr-4 border-2 border-gray-700 group-hover:border-[#ffc125]/60 transition-colors duration-200"
                      />
                      <div className="min-w-0">
                        {/* Username and Points text sizes adjusted */}
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-100 group-hover:text-[#ffc125] transition-colors duration-200 truncate">{player.username}</h3>
                        <p className="text-xs sm:text-sm text-[#ffc125]/80 font-medium group-hover:text-[#ffc125] transition-colors duration-200">{player.totalPoints || 0} Points</p>
                      </div>
                    </div>

                    {/* Mini-games Icons Area - Significant responsive changes here */}
                    <div className="ml-auto flex-shrink-0 flex flex-wrap justify-end items-center gap-px sm:gap-1">
                      {allGameModeDetails.length > 0 ? (
                        allGameModeDetails.map((gameDetails) => {
                          return (
                            <div
                              key={gameDetails.id}
                              // Icon wrapper: adjusted sizes, padding, rounded corners for different breakpoints
                              className={`flex flex-col items-center justify-center p-0.5 rounded-sm 
                                          w-[30px] h-[30px] 
                                          sm:w-9 sm:h-9 sm:p-1 sm:rounded 
                                          md:w-11 md:h-11 md:p-1.5 md:rounded-md
                                          ${gameDetails.isPlayed ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gray-800/30 opacity-60'} 
                                          transition-all duration-200 group 
                                          ${gameDetails.isPlayed ? 'cursor-pointer' : 'cursor-default'}`}
                              title={gameDetails.isPlayed ? `${gameDetails.name} - Tier: ${(gameDetails.tier as string)?.toUpperCase()}` : gameDetails.name}
                            >
                              {/* Icon image/initial: adjusted sizes */}
                              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center">
                                {gameDetails.isPlayed ? (
                                  gameDetails.iconSrc ? (
                                    <img
                                      src={gameDetails.iconSrc}
                                      alt={gameDetails.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#ffc125]/70 group-hover:text-[#ffc125]/90">
                                      {gameDetails.name.substring(0,1).toUpperCase()}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-sm sm:text-base md:text-lg font-bold text-gray-500 group-hover:text-gray-400">
                                    ?
                                  </span>
                                )}
                              </div>
                              {/* Tier text: adjusted sizes, leading, tracking */}
                              <span className={`text-[7px] leading-tight tracking-tighter 
                                               sm:text-[9px] sm:tracking-normal 
                                               md:text-[10px] md:tracking-wider 
                                               max-w-full truncate ${gameDetails.isPlayed ? 'text-amber-400 group-hover:text-amber-300' : 'text-gray-600'}`}>
                                {gameDetails.isPlayed ? (gameDetails.tier as string)?.toUpperCase() : "???"}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500 italic">No minigames defined.</span>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              !isInitiallyLoading && players.length === 0 && (
                <div className="p-8 sm:p-10 text-center text-gray-500 flex flex-col items-center space-y-3">
                  <ListX className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
                  <p className="text-base sm:text-lg">No players available to display.</p>
                  <p className="text-xs sm:text-sm">Please check back later or add players via the admin panel.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overall;