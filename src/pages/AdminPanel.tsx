import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminPlayerForm from '@/components/AdminPlayerForm'; // ეს კომპონენტი უკვე უნდა იყოს განახლებული
import { Player, TierRating, TIER_LABELS, TIER_POINTS } from '@/utils/types';
import { toast } from 'sonner';
import { PlusCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// განახლებული mapToDbData: ამოშლილია last_tested
const mapToDbData = (data: Partial<Player>): any => {
  const dbData: any = {};
  if (data.username !== undefined) dbData.username = data.username;
  if (data.skinUrl !== undefined) dbData.skin_url = data.skinUrl;
  if (data.totalPoints !== undefined) dbData.total_points = data.totalPoints;
  if (data.badges !== undefined) dbData.badges = data.badges;
  // lastTested-თან დაკავშირებული ხაზი ამოშლილია
  if (data.tiers !== undefined) dbData.tiers = data.tiers;
  return dbData;
};

// განახლებული mapFromDbData: ამოშლილია lastTested
const mapFromDbData = (dbData: any): Player => ({
  id: dbData.id,
  username: dbData.username,
  skinUrl: dbData.skin_url,
  overallRank: dbData.overall_rank,
  totalPoints: dbData.total_points,
  badges: dbData.badges || [],
  // lastTested ხაზი ამოშლილია
  tiers: dbData.tiers || {},
  createdAt: dbData.created_at,
  updatedAt: dbData.updated_at,
});

const calculateTotalPoints = (tiers: Player['tiers'] | undefined): number => {
  if (!tiers || Object.keys(tiers).length === 0) return 0;
  let totalCalculatedPoints = 0;
  for (const gameId in tiers) {
    const tierRating = tiers[gameId as keyof Player['tiers']];
    if (tierRating) {
      const pointsForThisTier = TIER_POINTS[tierRating as TierRating];
      if (pointsForThisTier !== undefined) {
        totalCalculatedPoints += pointsForThisTier;
      }
    }
  }
  return totalCalculatedPoints;
};

const rankPlayersClientSide = (playersToRank: Player[]): Player[] => {
  const sortedByPoints = [...playersToRank].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
  return sortedByPoints.map((player, index) => ({
    ...player,
    overallRank: index + 1,
  }));
};


const AdminPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayersAndSetState = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_points', { ascending: false, nullsLast: true })
      .order('username', { ascending: true });

    if (error) {
      console.error('Error fetching players:', error.message, error.details);
      toast.error(`Failed to load players: ${error.message}`);
      setPlayerList([]);
    } else if (data) {
      const mappedData = data.map(mapFromDbData); // mapFromDbData განახლებულია
      const clientSideRankedData = rankPlayersClientSide(mappedData);
      setPlayerList(clientSideRankedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlayersAndSetState();
  }, []);

  const filteredPlayers = searchTerm
    ? playerList.filter(player =>
        player.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : playerList;

  const handleAddPlayer = () => {
    setSelectedPlayer(undefined);
    setShowForm(true);
  };

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowForm(true);
  };

  const handleSavePlayer = async (playerDataFromForm: Partial<Player>) => {
    let playerObjectForSave: Partial<Player> = { ...playerDataFromForm };
    playerObjectForSave.totalPoints = calculateTotalPoints(playerDataFromForm.tiers);

    setShowForm(false);
    setSelectedPlayer(undefined);

    try {
      if (selectedPlayer && selectedPlayer.id) {
        // lastTested აღარ იქნება playerObjectForSave-ში, თუ AdminPlayerForm-დან არ მოდის
        const { id, createdAt, updatedAt, overallRank, ...payloadToUpdate } = playerObjectForSave as Player;
        const updatePayload = mapToDbData(payloadToUpdate); // mapToDbData განახლებულია

        const { data: updatedDbPlayer, error } = await supabase
          .from('players')
          .update(updatePayload)
          .eq('id', selectedPlayer.id)
          .select()
          .single();

        if (error) throw error;
        if (updatedDbPlayer) {
          toast.success(`Player ${mapFromDbData(updatedDbPlayer).username} updated! Points: ${mapFromDbData(updatedDbPlayer).totalPoints}`);
          await fetchPlayersAndSetState();
        }
      } else {
        const { id, createdAt, updatedAt, overallRank, ...payloadToInsert } = playerObjectForSave as Player;
        const insertPayload = mapToDbData(payloadToInsert); // mapToDbData განახლებულია

        if (!insertPayload.username) insertPayload.username = "New Player";
        if (insertPayload.skin_url === undefined && insertPayload.username) {
            insertPayload.skin_url = `https://mc-heads.net/avatar/${insertPayload.username}/100`;
        }

        const { data: insertedDbPlayer, error } = await supabase
          .from('players')
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;
        if (insertedDbPlayer) {
          toast.success(`Player ${mapFromDbData(insertedDbPlayer).username} added! Points: ${mapFromDbData(insertedDbPlayer).totalPoints}`);
          await fetchPlayersAndSetState();
        }
      }
    } catch (error: any) {
      console.error('Error saving player:', error.message, error.details);
      toast.error(`Failed to save player: ${error.message}`);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);

        if (error) throw error;
        await fetchPlayersAndSetState();
        toast.success('Player deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting player:', error.message, error.details);
        toast.error(`Failed to delete player: ${error.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] text-gray-300 min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading Players...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-minecraft text-[#ffc125] mb-6 md:mb-8 text-center sm:text-left">
          Admin Panel
        </h1>

        {showForm ? (
          <Card className="bg-[#1f2028] border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.07)] rounded-lg">
            <CardHeader className="border-b border-[#0a0e15]/70 pb-4">
              <CardTitle className="text-[#ffc125] text-2xl font-semibold">
                {selectedPlayer ? `Edit Player: ${selectedPlayer.username}` : 'Add New Player'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AdminPlayerForm
                player={selectedPlayer}
                onSave={handleSavePlayer}
                onCancel={() => { setShowForm(false); setSelectedPlayer(undefined); }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search players by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1f2028] border border-[#0a0e15]/80 rounded-md text-gray-200 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] placeholder-gray-500"
                />
              </div>
              <Button
                onClick={handleAddPlayer}
                className="w-full sm:w-auto bg-[#ffc125] text-[#0a0e15] font-semibold hover:bg-[#ffc125]/90 focus:ring-2 focus:ring-[#ffc125]/50 focus:ring-offset-2 focus:ring-offset-[#0a0e15] px-5 py-2.5 rounded-md flex items-center justify-center"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Player
              </Button>
            </div>

            <Card className="bg-[#1f2028] shadow-xl rounded-lg overflow-hidden border-transparent dark:shadow-[0_8px_30px_rgba(255,193,37,0.07)]">
              <CardContent className="p-0">
                {/* ცხრილის ჰედერში Last Tested სვეტის ამოშლა და col-span-ების განახლება */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-4 bg-[#0a0e15]/80 border-b-2 border-[#ffc125]/30 text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 z-10">
                  <div className="col-span-1 text-center hidden sm:block">#</div>
                  <div className="col-span-7 sm:col-span-5">Player</div> {/* იყო col-span-5 sm:col-span-4 */}
                  <div className="col-span-4 sm:col-span-3 text-center">Points</div> {/* იყო col-span-3 sm:col-span-2 */}
                  {/* Last Tested სვეტი ამოშლილია */}
                  <div className="col-span-12 sm:col-span-3 text-center sm:text-right">Actions</div> {/* იყო sm:col-span-3, xs იგივე */}
                </div>

                <div className="divide-y divide-[#0a0e15]/70 max-h-[60vh] overflow-y-auto">
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                      // ცხრილის რიგში Last Tested მონაცემების ამოშლა და col-span-ების განახლება
                      <div key={player.id} className="grid grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-4 items-center hover:bg-[#2a2b34] transition-colors duration-150">
                        <div className="col-span-1 text-center hidden sm:block text-gray-400">{player.overallRank !== null && player.overallRank !== undefined ? player.overallRank : 'N/A'}</div>

                        <div className="col-span-7 sm:col-span-5 flex items-center min-w-0"> {/* იყო col-span-5 sm:col-span-4 */}
                          <img
                            src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/32`}
                            alt={player.username}
                            className="w-8 h-8 mr-2 sm:mr-3 rounded-md border border-gray-700"
                          />
                          <span className="font-medium text-gray-100 truncate">{player.username}</span>
                        </div>

                        <div className="col-span-4 sm:col-span-3 text-center text-gray-300">{player.totalPoints}</div> {/* იყო col-span-3 sm:col-span-2 */}
                        
                        {/* Last Tested მონაცემები ამოშლილია */}
                        
                        <div className="col-span-12 sm:col-span-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:justify-end mt-2 sm:mt-0"> {/* იყო sm:col-span-3, xs იგივე */}
                          <Button
                            onClick={() => handleEditPlayer(player)}
                            variant="outline"
                            size="sm"
                            className="border-[#ffc125]/70 text-[#ffc125]/90 hover:bg-[#ffc125]/10 hover:text-[#ffc125] focus:ring-1 focus:ring-[#ffc125] w-full sm:w-auto flex items-center justify-center"
                          >
                            <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            onClick={() => handleDeletePlayer(player.id)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-1 focus:ring-red-500 w-full sm:w-auto flex items-center justify-center"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">{searchTerm ? 'No players found matching your search.' : 'No players available.'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;