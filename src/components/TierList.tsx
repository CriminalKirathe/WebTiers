import React from 'react';
import { Player, TierRating, TIER_LABELS } from '@/utils/types';
import PlayerCard from '@/components/PlayerCard'; // დარწმუნდით, რომ PlayerCard-ის იმპორტი სწორია

interface TierListProps {
  players: Player[];
  miniGameType: string;
}

type SubTierType = 'high' | 'low' | 'reserveHigh' | 'reserveLow';

// სტილების კონფიგურაცია ტაიერის სვეტებისთვის (უცვლელი)
const TIER_COLUMN_STYLES_CONFIG: Record<number, { label: string; headerColor: string; bgColor: string; textColor: string }> = {
  1: { label: 'Tier 1', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  2: { label: 'Tier 2', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  3: { label: 'Tier 3', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  4: { label: 'Tier 4', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
  5: { label: 'Tier 5', headerColor: 'bg-[#ffc125]', bgColor: 'bg-[#1f2028]', textColor: 'text-[#0a0e15]' },
};

const FALLBACK_TIER_STYLE = {
  label: `Tier X`,
  headerColor: 'bg-gray-700',
  bgColor: 'bg-gray-800',
  textColor: 'text-white'
};

const TierList: React.FC<TierListProps> = ({ players, miniGameType }) => {
  // მოთამაშეების დაჯგუფება ტიერების და ქვე-ტიერების მიხედვით (ლოგიკა უცვლელი)
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

  return (
    // მთავარი კონტეინერი ტაიერების სიისთვის
    // - `px-2 sm:px-3 lg:px-0`: ჰორიზონტალური padding-ები კონტეინერის კიდეებთან დაშორებისთვის.
    //   - ნაგულისხმევად (<sm): 8px მარცხნივ/მარჯვნივ
    //   - `sm` (640px+) და (<lg): 12px მარცხნივ/მარჯვნივ
    //   - `lg` (1024px+): 0px (რადგან სქროლი ითიშება და განლაგება იცვლება)
    // - `gap-2 sm:gap-3 lg:gap-4`: დაშორება სვეტებს შორის.
    // - `overflow-x-auto lg:overflow-x-visible`: ჰორიზონტალური სქროლი <lg ზომებზე.
    // - `pb-2 lg:pb-0`: ქვედა padding სქროლბარისთვის <lg ზომებზე.
    <div className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 px-2 sm:px-3 lg:px-0">
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
            // ტაიერის სვეტის სტილები (უცვლელი წინა ვერსიიდან, რადგან აკმაყოფილებს მოთხოვნებს)
            // `flex flex-col max-h-[75vh]`: ძირითადი flex და სიმაღლის შეზღუდვის სტილები.
            // სიგანეები და flex ქცევა:
            //   - <lg (1024px-მდე):
            //     - `w-72 min-w-72`: სვეტის სიგანე და მინიმალური სიგანე დაყენებულია 288px-ზე.
            //     - `flex-shrink-0`: ხელს უშლის სვეტის შეკუმშვას, ინარჩუნებს 288px სიგანეს.
            //   - lg+ (1024px და ზემოთ):
            //     - `lg:w-auto`: სიგანე ხდება ავტომატური.
            //     - `lg:min-w-0`: მინიმალური სიგანე ხდება 0.
            //     - `lg:flex-1`: სვეტი ხდება მოქნილი (flex-grow: 1, flex-shrink: 1, flex-basis: 0%).
            className={`tier-column ${tierStyle.bgColor} rounded-lg shadow-xl dark:shadow-[0_8px_20px_rgba(255,193,37,0.07)] 
                        flex flex-col max-h-[75vh] 
                        w-72 min-w-72 flex-shrink-0
                        lg:w-auto lg:min-w-0 lg:flex-1
                        border border-transparent hover:border-[#ffc125]/30 transition-all`}
          >
            {/* ტაიერის სათაური */}
            <div className={`tier-header ${tierStyle.headerColor} ${tierStyle.textColor} p-3 rounded-t-lg text-lg font-bold text-center sticky top-0 z-10`}>
              {tierStyle.label}
            </div>

            {/* მოთამაშეების სიის კონტეინერი სვეტის შიგნით */}
            {/* `p-2 sm:p-3`: შიდა დაშორებები რესპონსიულია. */}
            <div className="players-in-tier-content p-2 sm:p-3 space-y-1 sm:space-y-1.5 overflow-y-auto flex-grow">
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
