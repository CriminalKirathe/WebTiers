import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TierList from '@/components/TierList';
import { Player, MINI_GAMES } from '@/utils/types';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// დამხმარე ფუნქცია ბაზიდან მიღებული მონაცემების Player ტიპზე ტრანსფორმაციისთვის
// (დარწმუნდით, რომ overallRank სწორად მუშავდება)
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
  const [isLoading, setIsLoading] = useState(true); // ეს ძირითადად საწყისი ჩატვირთვისთვისაა

  const miniGame = MINI_GAMES.find(game => game.id === miniGameId);
  const miniGameName = miniGame?.name || miniGameId || 'Unknown Game';
  
  const fetchPlayersData = useCallback(async (isInitialLoad = false) => {
    if (!miniGameId) {
      setAllPlayers([]);
      if (isInitialLoad) setIsLoading(false);
      return;
    }

    // setIsLoading(true) მხოლოდ საწყისი ჩატვირთვისას, პოლინგისას არა, რათა თავიდან ავიცილოთ UI-ს ციმციმი
    if (isInitialLoad) {
      setIsLoading(true);
    }

    // console.log(`Workspaceing players for ${miniGameName} (Initial: ${isInitialLoad})`);
    const { data, error } = await supabase
      .from('players')
      .select('*');
      // .order('total_points', { ascending: false, nullsLast: true }); // სურვილისამებრ

    if (error) {
      console.error(`Error fetching players for MiniGame "${miniGameName}":`, error);
      // პოლინგის დროს განმეორებითი toast შეტყობინებები შეიძლება მომაბეზრებელი იყოს.
      // თუ გსურთ, შეგიძლიათ toast.error მხოლოდ isInitialLoad = true-ს დროს გამოიძახოთ.
      if (isInitialLoad) toast.error(`Failed to load players for ${miniGameName}.`);
      // შეცდომის შემთხვევაში, შესაძლოა ძველი მონაცემები დავტოვოთ, ვიდრე სიის გასუფთავება
      // setAllPlayers([]); 
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

    // 1. საწყისი მონაცემების ჩატვირთვა
    fetchPlayersData(true); // true მიუთითებს, რომ ეს საწყისი ჩატვირთვაა

    // 2. Polling-ის დაყენება ყოველ 5 წამში
    const intervalId = setInterval(() => {
      // console.log(`Polling for player updates for ${miniGameName} - ${new Date().toLocaleTimeString()}`);
      fetchPlayersData(false); // false მიუთითებს, რომ ეს პოლინგით განახლებაა
    }, 5000); // 5000 მილიწამი = 5 წამი

    // 3. Interval-ის გასუფთავება კომპონენტის დაშლისას ან miniGameId-ის ცვლილებისას
    return () => {
      // console.log(`Clearing player data polling interval for ${miniGameName}.`);
      clearInterval(intervalId);
    };
  }, [miniGameId, fetchPlayersData, miniGameName]); // დამოკიდებულებები

  const playersWithThisTier = allPlayers.filter(
    player => player.tiers && player.tiers[miniGameId as keyof Player['tiers']]
  );

  if (isLoading) { // ვაჩვენებთ Loading... მხოლოდ საწყისი ჩატვირთვისას
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading {miniGameName} Tiers...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-8 sm:py-10"> 
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl font-bold sm:text-4xl font-minecraft text-[#ffc125] mb-3">
            {miniGameName.charAt(0).toUpperCase() + miniGameName.slice(1)} Tier List
          </h1>
          <p className="text-gray-400 text-md sm:text-lg max-w-2xl mx-auto">
            Players are ranked in tiers from 1 (highest) to 5 (lowest), with high and low subdivisions within each.
          </p>
        </div>

        {playersWithThisTier.length > 0 ? (
          <TierList players={playersWithThisTier} miniGameType={miniGameId || ''} />
        ) : (
          // !isLoading-ის პირობა აქ აღარ არის კრიტიკული, რადგან isLoading მხოლოდ საწყის ჩატვირთვას ეხება
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">
              No players have been ranked in this mini-game yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGame;