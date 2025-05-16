import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TierList from '@/components/TierList'; 
import { Player, MINI_GAMES } from '@/utils/types';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Info აიკონი (SVG) "მოთამაშეები არ არიან" ბლოკისთვის
const InfoIcon = () => (
  <svg className="mx-auto h-12 w-12 text-[#ffc125]/70 mb-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

// სპინერი ჩატვირთვისთვის (SVG)
const SpinnerIcon = () => (
  <svg className="animate-spin h-10 w-10 text-[#ffc125] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

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

const MiniGame = () => {
  const { miniGameId } = useParams<{ miniGameId: string }>();
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const miniGame = MINI_GAMES.find(game => game.id === miniGameId);
  const miniGameName = miniGame?.name || miniGameId || 'Unknown Game';
  
  const fetchPlayersData = useCallback(async (isInitialLoad = false) => {
    if (!miniGameId) {
      setAllPlayers([]);
      if (isInitialLoad) setIsLoading(false);
      return;
    }

    if (isInitialLoad) {
      setIsLoading(true);
    }

    const { data, error } = await supabase
      .from('players')
      .select('*');

    if (error) {
      console.error(`Error fetching players for MiniGame "${miniGameName}":`, error);
      if (isInitialLoad) toast.error(`Failed to load players for ${miniGameName}.`);
    } else if (data) {
      setAllPlayers(data.map(mapFromDbData));
    }

    if (isInitialLoad) {
      setIsLoading(false);
    }
  }, [miniGameId, miniGameName]);

  useEffect(() => {
    if (!miniGameId) {
      setIsLoading(false);
      setAllPlayers([]);
      return;
    }

    fetchPlayersData(true); 

    const intervalId = setInterval(() => {
      fetchPlayersData(false); 
    }, 5000); 

    return () => {
      clearInterval(intervalId);
    };
  }, [miniGameId, fetchPlayersData, miniGameName]);

  const playersWithThisTier = allPlayers.filter(
    player => player.tiers && player.tiers[miniGameId as keyof Player['tiers']]
  );

  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex flex-col items-center justify-center p-4">
        <SpinnerIcon />
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading {miniGameName} Tiers...</p>
      </div>
    );
  }

  return (
    // <<<--- აქ შეიცვალა py-8 sm:py-10 -> py-4 sm:py-5 ---<<<
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-4 sm:py-5"> 
      <div className="container mx-auto px-4">
        <div className="text-center mb-4"> 
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl font-minecraft text-[#ffc125] mb-1"> 
            {miniGameName.charAt(0).toUpperCase() + miniGameName.slice(1)} Tier List
          </h1>
          <div className="w-24 md:w-32 h-1 bg-[#ffc125]/60 mx-auto mb-2 rounded-full"></div>
          <p className="text-gray-400 text-md sm:text-lg max-w-xl md:max-w-2xl mx-auto">
            Players are ranked in tiers from 1 (highest) to 5 (lowest), with high and low subdivisions within each.
          </p>
        </div>

        {playersWithThisTier.length > 0 ? (
          <TierList players={playersWithThisTier} miniGameType={miniGameId || ''} />
        ) : (
          <div className="text-center py-12 sm:py-16 px-6 bg-[#1f2028]/50 rounded-xl shadow-2xl border border-[#ffc125]/20 max-w-lg mx-auto mt-8">
            <InfoIcon />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-3">
              No Rankings Yet for {miniGameName}
            </h2>
            <p className="text-md text-gray-400">
              Currently, there are no players ranked in this mini-game. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGame;