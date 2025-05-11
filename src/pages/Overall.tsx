import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Player, MINI_GAMES } from '@/utils/types';
import { Badge } from '@/components/ui/badge';
import { Trophy, ListX, Users2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('total_points', { ascending: false, nullsLast: true })
        .order('username', { ascending: true });

      if (error) {
        console.error('Error fetching players for Overall page:', error);
        toast.error('Failed to load player rankings.');
        setPlayers([]);
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
      setIsLoading(false);
    };

    fetchPlayers();
  }, []);

  // განახლებული ფუნქცია რანგის სტილებისთვის
  const getRankStylingInfo = (rank: number | null | undefined): {
    bg: string;
    text: string;
    trophyClass: string; // ეს კლასი აღარ გამოიყენება ხატულისთვის 1-3 ადგილებზე, რადგან ხატულა იშლება
    cardShadow?: string;
  } => {
    if (rank === null || rank === undefined) {
      return { bg: 'bg-transparent', text: 'text-gray-500', trophyClass: 'hidden', cardShadow: 'shadow-none' };
    }
    if (rank === 1) return {
      bg: 'bg-gradient-to-br from-yellow-400 via-[#ffc125] to-amber-500',
      text: 'text-[#0a0e15]',
      trophyClass: 'text-[#ffc125]', // ეს კლასი რჩება, თუმცა ხატულა აღარ იქნება
      cardShadow: 'shadow-[0_0px_18px_rgba(255,193,37,0.5)] hover:shadow-[0_0px_25px_rgba(255,193,37,0.7)]'
    };
    if (rank === 2) return {
      bg: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
      text: 'text-[#0a0e15]',
      trophyClass: 'text-slate-300', // ეს კლასი რჩება
      cardShadow: 'shadow-[0_0px_12px_rgba(100,116,139,0.4)] hover:shadow-[0_0px_18px_rgba(100,116,139,0.6)]'
    };
    if (rank === 3) return {
      bg: 'bg-gradient-to-br from-yellow-600 via-amber-700 to-yellow-800',
      text: 'text-white',
      trophyClass: 'text-yellow-400', // ეს კლასი რჩება
      cardShadow: 'shadow-[0_0px_12px_rgba(202,138,4,0.4)] hover:shadow-[0_0px_18px_rgba(202,138,4,0.6)]'
    };
    return {
      bg: 'bg-gray-700/40',
      text: 'text-gray-300',
      trophyClass: 'hidden', // თასი აქაც არ ჩანს
      cardShadow: 'shadow-md'
    };
  };

  const getRankRowStyling = (rank: number | null | undefined, index: number): string => {
    let baseHover = "hover:bg-[#2a2b34] transition-all duration-200 ease-in-out transform hover:scale-[1.015] hover:shadow-lg";
    let specialStyling = "";

    if (rank !== null && rank !== undefined) {
      if (rank === 1) {
        specialStyling = "bg-[#ffc125]/10 border-l-4 border-[#ffc125]";
      } else if (rank === 2) {
        specialStyling = "bg-slate-800/10 border-l-4 border-slate-500";
      } else if (rank === 3) {
        specialStyling = "bg-yellow-800/10 border-l-4 border-yellow-600";
      } else if (index % 2 !== 0) {
        specialStyling = "bg-[#0a0e15]/50";
      } else {
         specialStyling = "bg-[#1f2028]/30";
      }
    } else if (index % 2 !== 0) {
        specialStyling = "bg-[#0a0e15]/50";
    } else {
        specialStyling = "bg-[#1f2028]/30";
    }
    return `${specialStyling || 'bg-transparent'} ${baseHover}`;
  };

  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading Rankings...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e15] min-h-screen text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="text-center mb-10 sm:mb-16">
          <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-[#ffc125] mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(255,193,37,0.5)]" strokeWidth={1.5}/>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-minecraft text-[#ffc125] mb-3 tracking-wider">
            Overall Rankings
          </h1>
          <p className="text-md sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Players ranked by their total points, showcasing skill and dedication across all mini-games.
          </p>
        </div>

        <div className="bg-[#1f2028] shadow-2xl rounded-lg sm:rounded-xl overflow-hidden border border-[#2D3748]/70 dark:shadow-[0_10px_35px_rgba(255,193,37,0.15)]">
          <div className="p-4 sm:p-5 bg-[#0e131c]/90 border-b-2 border-[#ffc125]/50 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-70">
            <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center text-xs font-semibold text-gray-300 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 sm:col-span-5 pl-1">Player</div>
              <div className="col-span-5 sm:col-span-6 text-right pr-2">Mini-games Played</div>
            </div>
          </div>

          <div className="player-list-container">
            {players.length > 0 ? (
              players.map((player, index) => {
                const playerGames = Object.entries(player.tiers || {})
                  .filter(([_, tier]) => tier)
                  .map(([gameId, _]) => {
                    const game = MINI_GAMES.find(g => g.id === gameId);
                    return game?.name || gameId;
                  });

                const rank = player.overallRank;
                const currentRankStyling = getRankStylingInfo(rank);

                return (
                  <Link
                    to={`/player/${player.id}`}
                    key={player.id}
                    // დაემატა w-full კლასი მოთამაშის ბოქსის 100% სიგანისთვის
                    className={`w-full flex items-center p-3 sm:p-4 border-b border-[#0a0e15]/60 dark:border-[#2d3748]/40 last:border-b-0 ${getRankRowStyling(rank, index)} cursor-pointer group`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg mr-3 sm:mr-4 ${currentRankStyling.bg} ${currentRankStyling.cardShadow || ''} transition-all duration-300 group-hover:brightness-110 relative`}>
                      <span className={`text-lg sm:text-xl font-bold font-minecraft ${currentRankStyling.text}`}>
                        {player.overallRank}
                      </span>
                      {/* თასის იკონი მოშორებულია 1, 2 და მე-3 ადგილებიდან (და შესაბამისად ყველა ადგილიდან, რადგან მხოლოდ მათთვის იყო) */}
                      {/* {rank !== null && rank !== undefined && rank <=3 &&
                        <Trophy
                          className={`w-4 h-4 sm:w-[17px] sm:h-[17px] absolute top-1 right-1 ${currentRankStyling.trophyClass} opacity-80 group-hover:opacity-100 transition-opacity duration-200`}
                          fill="none"
                          strokeWidth={2}
                        />
                      }
                      */}
                    </div>

                    <div className="flex-grow flex items-center min-w-0">
                      <img
                        src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/48`}
                        alt={`${player.username}'s skin`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-md mr-3 sm:mr-4 border-2 border-gray-700 group-hover:border-[#ffc125]/60 transition-colors duration-200"
                      />
                      <div className="min-w-0">
                        <h3 className="text-md sm:text-lg font-semibold text-gray-100 group-hover:text-[#ffc125] transition-colors duration-200 truncate">{player.username}</h3>
                        <p className="text-xs sm:text-sm text-[#ffc125]/80 font-medium group-hover:text-[#ffc125] transition-colors duration-200">{player.totalPoints || 0} Points</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-wrap justify-end items-center gap-1 sm:gap-1.5 w-1/3 sm:w-2/5 lg:w-1/2 pl-2">
                      {playerGames.length > 0 ? (
                        playerGames.slice(0, 3).map((gameName, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="px-2 py-0.5 text-[10px] sm:text-xs border-[#ffc125]/30 text-[#ffc125]/60 group-hover:border-[#ffc125]/50 group-hover:text-[#ffc125]/90 rounded-full cursor-default transition-colors"
                          >
                            {gameName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">No games</span>
                      )}
                      {playerGames.length > 3 && (
                        <Badge variant="outline" className="px-2 py-0.5 text-[10px] sm:text-xs border-gray-700 text-gray-500 group-hover:text-gray-400 rounded-full cursor-default transition-colors">
                          +{playerGames.length - 3}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
                <div className="p-10 text-center text-gray-500 flex flex-col items-center space-y-3">
                  <ListX className="w-12 h-12 text-gray-600" />
                  <p className="text-lg">No players available to display.</p>
                  <p className="text-sm">Please check back later or add players via the admin panel.</p>
                </div>
            )}
          </div>

          {players.length === 0 && !isLoading && (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center space-y-3">
                <Users2 className="w-12 h-12 text-gray-600" />
                <p className="text-lg">No players found.</p>
                <p className="text-sm">Consider adding players to see rankings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overall;