import React from 'react';
import { Player, TierRating, TIER_LABELS } from '@/utils/types';
import PlayerCard from '@/components/PlayerCard';

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

const FALLBACK_TIER_STYLE_BASE = {
  headerColor: 'bg-gray-700',
  bgColor: 'bg-gray-800',
  textColor: 'text-white'
};

const TIERS_TO_DISPLAY: number[] = [1, 2, 3, 4, 5];

const TierList: React.FC<TierListProps> = ({ players, miniGameType }) => {
  const playersByTier: Record<number, { high: Player[], low: Player[], reserveHigh: Player[], reserveLow: Player[] }> = {};
  TIERS_TO_DISPLAY.forEach(tierNum => {
    playersByTier[tierNum] = { high: [], low: [], reserveHigh: [], reserveLow: [] };
  });

  players.forEach(player => {
    const tierRating = player.tiers[miniGameType as keyof typeof player.tiers] as TierRating | undefined;
    if (tierRating) {
      const tierDetails = TIER_LABELS[tierRating];
      if (tierDetails) {
        const { tierNumber, isHigh, isReserve } = tierDetails;
        if (!playersByTier[tierNumber]) {
          playersByTier[tierNumber] = { high: [], low: [], reserveHigh: [], reserveLow: [] };
        }
        if (isReserve) {
          if (isHigh) {
            playersByTier[tierNumber].reserveHigh.push(player);
          } else {
            playersByTier[tierNumber].reserveLow.push(player);
          }
        } else {
          if (isHigh) {
            playersByTier[tierNumber].high.push(player);
          } else {
            playersByTier[tierNumber].low.push(player);
          }
        }
      }
    }
  });

  return (
    // --- აქ დაემატა items-start კლასი ---
    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 px-2 sm:px-3 lg:px-0">
      {TIERS_TO_DISPLAY.map(tierNumber => {
        const tierGroup = playersByTier[tierNumber] || { high: [], low: [], reserveHigh: [], reserveLow: [] };
        const allPlayersInTierWithSubTier: { player: Player, subTier: SubTierType }[] = [
          ...tierGroup.high.map(p => ({ player: p, subTier: 'high' as SubTierType })),
          ...tierGroup.low.map(p => ({ player: p, subTier: 'low' as SubTierType })),
          ...tierGroup.reserveHigh.map(p => ({ player: p, subTier: 'reserveHigh' as SubTierType })),
          ...tierGroup.reserveLow.map(p => ({ player: p, subTier: 'reserveLow' as SubTierType })),
        ];
        const styleConfig = TIER_COLUMN_STYLES_CONFIG[tierNumber];
        const tierStyle = styleConfig
          ? styleConfig
          : { ...FALLBACK_TIER_STYLE_BASE, label: `Tier ${tierNumber}` };

        return (
          <div
            key={tierNumber}
            className={`tier-column ${tierStyle.bgColor} rounded-lg shadow-xl dark:shadow-[0_8px_20px_rgba(255,193,37,0.07)]
                          flex flex-col
                          w-[249px] flex-shrink-0
                          lg:w-auto lg:min-w-0 lg:flex-1
                          border border-transparent hover:border-[#ffc125]/30 transition-all`}
          >
            <div className={`tier-header ${tierStyle.headerColor} ${tierStyle.textColor} p-3 rounded-t-lg text-lg font-bold text-center sticky top-0 z-10`}>
              {tierStyle.label}
            </div>
            <div className={`players-in-tier-content
                              p-2 sm:p-3 space-y-1 sm:space-y-1.5
                              flex-grow 
                            `}>
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
                <p className="text-xs sm:text-sm text-gray-500 italic text-center py-6 sm:py-8">
                  ამ ტიერში მოთამაშეები არ არიან
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