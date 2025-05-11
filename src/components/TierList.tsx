import React from 'react';
import { Player, TierRating, TIER_LABELS } from '@/utils/types';
import PlayerCard from '@/components/PlayerCard'; // დარწმუნდით, რომ ეს იმპორტი სწორია თქვენი პროექტის სტრუქტურისთვის

interface TierListProps {
  players: Player[];
  miniGameType: string; 
}
  
type SubTierType = 'high' | 'low' | 'reserveHigh' | 'reserveLow';

const TIER_COLUMN_STYLES_CONFIG: Record<number, { label: string; headerColor: string; bgColor: string; textColor: string }> = {
  1: { label: 'Tier 1', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  2: { label: 'Tier 2', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  3: { label: 'Tier 3', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  4: { label: 'Tier 4', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  5: { label: 'Tier 5', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
};

const FALLBACK_TIER_STYLE = { 
  label: `Tier X`, 
  headerColor: 'bg-gray-700', // დეფოლტ ფერები, თუ TIER_COLUMN_STYLES_CONFIG-ში ვერ მოიძებნა
  bgColor: 'bg-gray-800',
  textColor: 'text-white' 
};

const TierList: React.FC<TierListProps> = ({ players, miniGameType }) => {
  const playersByTier: Record<number, { high: Player[], low: Player[], reserveHigh: Player[], reserveLow: Player[] }> = {
    1: { high: [], low: [], reserveHigh: [], reserveLow: [] },
    2: { high: [], low: [], reserveHigh: [], reserveLow: [] },
    3: { high: [], low: [], reserveHigh: [], reserveLow: [] },
    4: { high: [], low: [], reserveHigh: [], reserveLow: [] },
    5: { high: [], low: [], reserveHigh: [], reserveLow: [] },
  };

  players.forEach(player => {
    const tierRating = player.tiers[miniGameType as keyof typeof player.tiers] as TierRating;
    if (tierRating) {
      const { tierNumber, isHigh, isReserve } = TIER_LABELS[tierRating];
      
      if (isReserve) {
        isHigh 
          ? playersByTier[tierNumber].reserveHigh.push(player) 
          : playersByTier[tierNumber].reserveLow.push(player);
      } else {
        isHigh 
          ? playersByTier[tierNumber].high.push(player) 
          : playersByTier[tierNumber].low.push(player);
      }
    }
  });

  // TierList კომპონენტი ახლა მხოლოდ სვეტებს აჩვენებს, გვერდის დონის სათაურის გარეშე
  return (
    <div className="flex gap-3 md:gap-4"> 
      {[1, 2, 3, 4, 5].map(tier => {
        const allPlayersInTierWithSubTier: { player: Player, subTier: SubTierType }[] = [
          ...playersByTier[tier].high.map(p => ({ player: p, subTier: 'high' as SubTierType })),
          ...playersByTier[tier].low.map(p => ({ player: p, subTier: 'low' as SubTierType })),
          ...playersByTier[tier].reserveHigh.map(p => ({ player: p, subTier: 'reserveHigh' as SubTierType })),
          ...playersByTier[tier].reserveLow.map(p => ({ player: p, subTier: 'reserveLow' as SubTierType })),
        ];

        const tierStyle = TIER_COLUMN_STYLES_CONFIG[tier] || { ...FALLBACK_TIER_STYLE, label: `Tier ${tier}` };

        return (
          <div 
            key={tier} 
            className={`tier-column ${tierStyle.bgColor} rounded-lg shadow-xl dark:shadow-[0_8px_20px_rgba(255,193,37,0.07)] flex-1 flex flex-col max-h-[75vh] min-w-0 border border-transparent hover:border-[#ffc125]/30 transition-all`} 
          >
            <div className={`tier-header ${tierStyle.headerColor} ${tierStyle.textColor} p-3 rounded-t-lg text-lg font-bold text-center sticky top-0 z-10`}>
              {tierStyle.label}
            </div>
            
            <div className="players-in-tier-content p-3 space-y-1.5 overflow-y-auto flex-grow">
              {allPlayersInTierWithSubTier.length > 0 ? (
                allPlayersInTierWithSubTier.map(item => (
                  <PlayerCard 
                    key={item.player.id} 
                    player={item.player} 
                    miniGameType={miniGameType}
                    subTierType={item.subTier}
                    showTier={true}
                  />
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 italic text-center py-8">
                  No players in this tier
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TierList;