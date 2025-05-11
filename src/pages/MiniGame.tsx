import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // useNavigate აღარ არის საჭირო, თუ "Back" ღილაკი არ გვაქვს
import TierList from '@/components/TierList';
// import { getPlayersWithUpdatedRanks } from '@/utils/mockData'; // აღარ ვიყენებთ
import { Player, MINI_GAMES } from '@/utils/types';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
// Button და ArrowLeft იმპორტები აღარ არის საჭირო, თუ "Back" ღილაკი არ არის
// import { Button } from '@/components/ui/button';
// import { ArrowLeft } from 'lucide-react';

// დამხმარე ფუნქცია ბაზიდან მიღებული მონაცემების Player ტიპზე ტრანსფორმაციისთვის
const mapFromDbData = (dbData: any): Player => ({
  id: dbData.id,
  username: dbData.username,
  skinUrl: dbData.skin_url,
  overallRank: dbData.overall_rank,
  totalPoints: dbData.total_points,
  badges: dbData.badges || [],
  lastTested: dbData.last_tested,
  tiers: dbData.tiers || {},
  createdAt: dbData.created_at,
  updatedAt: dbData.updated_at,
});

const MiniGame = () => {
  const { miniGameId } = useParams<{ miniGameId: string }>();
  // const navigate = useNavigate(); // აღარ არის საჭირო, თუ "Back" ღილაკი არ არის

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const miniGame = MINI_GAMES.find(game => game.id === miniGameId);
  const miniGameName = miniGame?.name || miniGameId || 'Unknown Game';
  
  useEffect(() => {
    if (!miniGameId) {
      setIsLoading(false);
      setAllPlayers([]);
      // toast.error("Mini-game ID not specified for fetching players."); // შეგვიძლია ეს დავტოვოთ ან მოვაშოროთ
      return;
    }

    const fetchPlayersData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*');

      if (error) {
        console.error(`Error fetching players for MiniGame "${miniGameName}":`, error);
        toast.error(`Failed to load players for ${miniGameName}.`);
        setAllPlayers([]);
      } else if (data) {
        setAllPlayers(data.map(mapFromDbData));
      }
      setIsLoading(false);
    };

    fetchPlayersData();
  }, [miniGameId, miniGameName]);

  const playersWithThisTier = allPlayers.filter(
    player => player.tiers && player.tiers[miniGameId as keyof Player['tiers']]
  );

  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading {miniGameName} Tiers...</p>
      </div>
    );
  }

  return (
    // გვერდის ძირითადი კონტეინერი თქვენი სტილებით
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-8 sm:py-10"> 
      <div className="container mx-auto px-4">
        {/* სათაურის სექცია ზუსტად ისე, როგორც თქვენს კოდში იყო */}
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
          // "მოთამაშეები არ არიან" შეტყობინება თქვენი სტილებით
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">
              No players have been ranked in this mini-game yet.
            </p>
            {/* თქვენს კოდში დაკომენტარებული ღილაკი */}
            {/* <Button 
              variant="outline" 
              className="mt-6 border-[#ffc125]/50 text-[#ffc125]/90 hover:bg-[#1f2028] hover:text-[#ffc125] focus:ring-1 focus:ring-[#ffc125]"
              onClick={() => navigate('/some-other-page')}
            >
              Explore Other Games
            </Button> 
            */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGame;