import React from 'react';
import { Link } from 'react-router-dom';
import { Player, TierRating, TIER_LABELS } from '@/utils/types';

type SubTierType = 'high' | 'low' | 'reserveHigh' | 'reserveLow';

interface PlayerCardProps {
  player: Player;
  miniGameType?: string;
  showTier?: boolean;
  subTierType?: SubTierType;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, miniGameType, showTier = true, subTierType }) => {
  const tierRatingForBadge = miniGameType ? player.tiers[miniGameType as keyof typeof player.tiers] as TierRating : undefined;
  const tierInfoForBadge = tierRatingForBadge ? TIER_LABELS[tierRatingForBadge] : undefined;

  const getBadgeStyling = () => {
    // ეს ფერები უზრუნველყოფს სტატუსის კარგ ვიზუალიზაციას მუქ ფონზეც
    let badgeBgClass = 'bg-gray-500 dark:bg-gray-700'; // დეფოლტი, თუ subTierType არ არის
    let badgeTextColorClass = 'text-white dark:text-gray-100';

    if (subTierType) {
      if (subTierType === 'high') {
        badgeBgClass = 'bg-green-500 dark:bg-green-600';
        badgeTextColorClass = 'text-white';
      } else if (subTierType === 'low') {
        badgeBgClass = 'bg-red-500 dark:bg-red-600';
        badgeTextColorClass = 'text-white';
      } else if (subTierType === 'reserveHigh') {
        badgeBgClass = 'bg-green-300 dark:bg-green-400';
        badgeTextColorClass = 'text-green-900 dark:text-green-50';
      } else if (subTierType === 'reserveLow') {
        badgeBgClass = 'bg-red-300 dark:bg-red-400';
        badgeTextColorClass = 'text-red-900 dark:text-red-50';
      }
    }
    return `${badgeBgClass} ${badgeTextColorClass}`;
  };
  
  return (
    // Link-ს focus სტილისთვის primary ფერი იქნება #ffc125 (თუ ასეა განსაზღვრული თქვენს თემაში)
    <Link to={`/player/${player.id}`} className="block w-full outline-none focus:ring-2 focus:ring-[#ffc125] focus:rounded-md transition-all duration-150 ease-in-out transform hover:scale-[1.02]">
      {/* ბარათის მთავარი div: ახალი ფერები და სტილები */}
      <div className="flex items-center bg-[#0a0e15] border border-[#1f2028]/70 rounded-md px-2 py-1.5 shadow-md hover:bg-[#1f2028]/50 hover:border-[#1f2028] transition-colors duration-150 ease-in-out">
        <div className="flex-shrink-0 mr-2"> 
          <img 
            src={player.skinUrl || `https://mc-heads.net/avatar/${player.username}/24`} // ავატარის URL-ში ზომა 24x24 (w-6 h-6)
            alt={`${player.username}'s skin`}
            className="w-6 h-6 rounded-sm border border-gray-700" // ავატარის ზომა და საზღვარი
          />
        </div>
        <div className="flex-grow min-w-0"> 
          {/* ტექსტის ფერები მორგებულია მუქ ფონზე */}
          <h3 className="font-minecraft text-xs sm:text-sm text-gray-200 truncate">
            {player.username}
          </h3>
          <p className="text-xs text-gray-400">
            {player.overallRank !== undefined ? `Rank #${player.overallRank}` : 'Unranked'}
          </p>
        </div>
        {showTier && tierInfoForBadge && (
          <div className={`ml-1.5 flex-shrink-0 px-1.5 py-px rounded text-xs font-bold ${getBadgeStyling()}`}>
            {tierInfoForBadge.isReserve ? 'R' : ''}
            {tierInfoForBadge.isHigh ? 'H' : 'L'}
            T{tierInfoForBadge.tierNumber}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PlayerCard;