import React, { useState, useEffect } from 'react';
import { Player, MINI_GAMES, TierRating, TIER_LABELS } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AdminPlayerFormProps {
  player?: Player;
  onSave: (player: Partial<Player>) => void;
  onCancel: () => void;
}

const DEFAULT_PLAYER: Partial<Player> = {
  username: '',
  skinUrl: 'https://mc-heads.net/avatar/steave/100',
  badges: [],
  tiers: {},
  totalPoints: 0,
};

const AdminPlayerForm: React.FC<AdminPlayerFormProps> = ({ player, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Player>>(player ? { ...player } : { ...DEFAULT_PLAYER });

  useEffect(() => {
    if (player) {
      setFormData(player);
    } else {
      setFormData({ ...DEFAULT_PLAYER });
    }
  }, [player]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // შესწორებული handleTierChange ფუნქცია
  const handleTierChange = (miniGameId: string, value: TierRating | string) => { // value შეიძლება იყოს "" placeholder-ის გამო
    const newTiers = { ...formData.tiers };
    if (value === "" || value === "NOT_RATED_PLACEHOLDER") {
      delete newTiers[miniGameId as keyof typeof formData.tiers];
    } else {
      newTiers[miniGameId as keyof Player['tiers']] = value as TierRating; // Player['tiers'] უფრო ზუსტი ტიპისთვის
    }
    setFormData(prev => ({
      ...prev,
      tiers: newTiers
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ამოშლილია lastTested-თან დაკავშირებული ლოგიკა
    onSave(formData);
  };

  const tierOptions = Object.entries(TIER_LABELS).map(([value, info]) => ({
    value: value as TierRating,
    label: info.display
  }));

  return (
    <Card className="w-full bg-[#1f2028] border-transparent text-gray-300 shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.07)] rounded-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-gray-400">Username</label>
            <Input
              id="username"
              name="username"
              value={formData.username || ''}
              onChange={handleChange}
              required
              className="bg-[#0a0e15] border-[#0a0e15]/80 text-gray-200 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] placeholder-gray-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="skinUrl" className="text-sm font-medium text-gray-400">Skin URL</label>
            <Input
              id="skinUrl"
              name="skinUrl"
              value={formData.skinUrl || ''}
              onChange={handleChange}
              placeholder="MC Heads URL or direct skin URL"
              className="bg-[#0a0e15] border-[#0a0e15]/80 text-gray-200 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] placeholder-gray-500"
            />
          </div>

          {/* ამოშლილია Tester Name ველი */}

          <div className="space-y-4 pt-2">
            <h3 className="font-medium text-gray-200">Mini-game Tiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              {MINI_GAMES.map((game) => (
                <div key={game.id} className="space-y-1.5">
                  <label htmlFor={`tier-${game.id}`} className="text-sm font-medium text-gray-400">{game.name}</label>
                  <Select
                    value={formData.tiers?.[game.id as keyof Player['tiers']] || ""}
                    onValueChange={(value) => handleTierChange(game.id, value as TierRating | "")}
                  >
                    <SelectTrigger className="w-full bg-[#0a0e15] border-[#0a0e15]/80 text-gray-200 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125]">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2028] border-[#0a0e15]/80 text-gray-200">
                      {tierOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="hover:bg-[#0a0e15] focus:bg-[#0a0e15]"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-6 border-t border-[#0a0e15]/70">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-[#ffc125]/70 text-[#ffc125]/90 hover:bg-[#1f2028]/50 hover:text-[#ffc125] focus:ring-1 focus:ring-[#ffc125]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#ffc125] text-[#0a0e15] font-semibold hover:bg-[#ffc125]/90 focus:ring-2 focus:ring-[#ffc125]/50 focus:ring-offset-2 focus:ring-offset-[#1f2028]"
          >
            Save Player
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminPlayerForm;