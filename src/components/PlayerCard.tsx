import React from 'react';
import { Link } from 'react-router-dom';
import { Player, TierRating, TIER_LABELS, TierLabelInfo, MiniGameType } from '@/utils/types';

// განახლებული ქვე-ტიპები
type SubTierType = 'high' | 'low' | 'retiredHigh' | 'retiredLow';

// კომპონენტის Props
interface PlayerCardProps {
  player: Player;
  miniGameType?: MiniGameType | string;
  showTier?: boolean;
  subTierType?: SubTierType; // მიიღება TierList-დან ('retiredHigh', 'retiredLow' და ა.შ.)
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  miniGameType,
  showTier = true,
  subTierType // ეს მნიშვნელობა განსაზღვრავს სტილს
}) => {

  // --- განახლებული ფუნქცია ბეჯის სტილისთვის მითითებული ფერებით ---
  const getBadgeStyling = (): string => {
    // ნაგულისხმევი სტილი
    let badgeBgClass = 'bg-gray-500 dark:bg-gray-700';
    let badgeTextColorClass = 'text-white dark:text-gray-100';

    if (subTierType) {
      if (subTierType === 'high') {
        // სტილი აქტიური High ტიერისთვის (მწვანე #11b980)
        badgeBgClass = 'bg-[#11b980]'; // ვიყენებთ პირდაპირ hex კოდს
        badgeTextColorClass = 'text-white'; // თეთრი ტექსტი კარგად ჩანს ამ მწვანეზე
      } else if (subTierType === 'low') {
        // სტილი აქტიური Low ტიერისთვის (წითელი #dc2727)
        badgeBgClass = 'bg-[#dc2727]'; // ვიყენებთ პირდაპირ hex კოდს
        badgeTextColorClass = 'text-white'; // თეთრი ტექსტი კარგად ჩანს ამ წითელზე
      } else if (subTierType === 'retiredHigh' || subTierType === 'retiredLow') {
        // ნაცრისფერი სტილი Retired ტიერებისთვის (უცვლელი)
        badgeBgClass = 'bg-gray-600 dark:bg-gray-500';
        badgeTextColorClass = 'text-gray-200 dark:text-gray-100';
      }
    }
    return `${badgeBgClass} ${badgeTextColorClass}`;
  };

  // ფუნქცია ტიერის ტექსტის ფორმატირებისთვის ("RLT 1", "HT 3"...) (უცვლელი)
  const getFormattedTierText = (): string | null => {
    if (!showTier || !miniGameType) {
      return null;
    }
    const tierRating = player.tiers?.[miniGameType as keyof Player['tiers']];
    if (!tierRating) {
      return "N/A";
    }
    const tierDetails: TierLabelInfo | undefined = TIER_LABELS[tierRating];
    if (!tierDetails) {
      console.warn(`PlayerCard: Tier details not found for rating ${tierRating} (Player: ${player.username}, Game: ${miniGameType})`);
      return "Unknown";
    }
    if (tierDetails.isRetired) {
      const prefix = tierDetails.isHigh ? "RHT" : "RLT";
      return `${prefix}${tierDetails.tierNumber}`;
    } else {
      const prefix = tierDetails.isHigh ? "HT" : "LT";
      return `${prefix}${tierDetails.tierNumber}`;
    }
  };

  const formattedTierText = getFormattedTierText();

  return (
    <Link to={`/player/${player.id}`} className="block w-full outline-none focus:ring-2 focus:ring-[#ffc125] focus:rounded-md transition-all duration-150 ease-in-out transform hover:scale-[1.02]">
      <div className="flex items-center bg-[#0a0e15] border border-[#1f2028]/70 rounded-md px-2 py-1.5 shadow-md hover:bg-[#1f2028]/50 hover:border-[#1f2028] transition-colors duration-150 ease-in-out">
        {/* ავატარი */}
        <div className="flex-shrink-0 mr-2">
          <img
            src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/24`}
            alt={`${player.username}'s skin`}
            className="w-6 h-6 rounded-sm border border-gray-700 object-contain"
            loading="lazy"
          />
        </div>
        {/* მოთამაშის სახელი */}
        <div className="flex-grow min-w-0">
          <h3 className="font-minecraft text-xs sm:text-sm text-gray-200 truncate" title={player.username}>
            {player.username}
          </h3>
        </div>
        {/* ტიერის ბეჯი */}
        {formattedTierText && (
          <div
             className={`ml-1.5 flex-shrink-0 px-1.5 py-px rounded text-xs font-bold ${getBadgeStyling()}`} // ვიყენებთ განახლებულ სტილებს
             title={TIER_LABELS[player.tiers?.[miniGameType as keyof Player['tiers']] as TierRating]?.display || ''} // Tooltip სრული სახელით
          >
            {formattedTierText}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PlayerCard;