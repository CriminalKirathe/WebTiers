
import { Badge, Player } from "./types";

const badges: Badge[] = [
  { id: "1", name: "Tournament Winner", imageUrl: "/trophy.png" },
  { id: "2", name: "PvP Master", imageUrl: "/sword.png" },
  { id: "3", name: "Veteran", imageUrl: "/shield.png" },
  { id: "4", name: "Top Tier", imageUrl: "/crown.png" },
  { id: "5", name: "Rising Star", imageUrl: "/star.png" },
];

export const players: Player[] = [
  {
    id: "1",
    username: "DragonSlayer99",
    skinUrl: "https://mc-heads.net/avatar/DragonSlayer99/100",
    overallRank: 1,
    totalPoints: 43,
    badges: [badges[0], badges[3]],
    lastTested: {
      date: "2023-05-10",
      tester: "MainAdmin",
    },
    tiers: {
      vanilla: "ht1",
      potPvp: "ht2",
      netherite: "lt1",
      smp: "ht3",
      sword: "ht1",
      axe: "lt2",
      mace: "lt3",
    },
  },
  {
    id: "2",
    username: "EnderQueen",
    skinUrl: "https://mc-heads.net/avatar/EnderQueen/100",
    overallRank: 2,
    totalPoints: 38,
    badges: [badges[1], badges[2]],
    lastTested: {
      date: "2023-05-08",
      tester: "MainAdmin",
    },
    tiers: {
      vanilla: "lt1",
      potPvp: "ht1",
      netherite: "ht2",
      smp: "lt2",
      sword: "lt1",
      axe: "ht3",
      mace: "ht2",
    },
  },
  {
    id: "3",
    username: "RedstoneWizard",
    skinUrl: "https://mc-heads.net/avatar/RedstoneWizard/100",
    overallRank: 3,
    totalPoints: 35,
    badges: [badges[2], badges[4]],
    lastTested: {
      date: "2023-05-05",
      tester: "AdminHelper",
    },
    tiers: {
      vanilla: "ht2",
      potPvp: "lt1",
      netherite: "ht3",
      smp: "ht1",
      sword: "lt2",
      axe: "ht2",
      mace: "lt4",
    },
  },
  {
    id: "4",
    username: "DiamondMiner",
    skinUrl: "https://mc-heads.net/avatar/DiamondMiner/100",
    overallRank: 4,
    totalPoints: 31,
    badges: [badges[0], badges[4]],
    lastTested: {
      date: "2023-05-02",
      tester: "AdminHelper",
    },
    tiers: {
      vanilla: "lt2",
      potPvp: "ht3",
      netherite: "lt2",
      smp: "ht2",
      sword: "ht3",
      axe: "lt1",
      mace: "ht5",
    },
  },
  {
    id: "5",
    username: "NetherKnight",
    skinUrl: "https://mc-heads.net/avatar/NetherKnight/100",
    overallRank: 5,
    totalPoints: 28,
    badges: [badges[1], badges[3]],
    lastTested: {
      date: "2023-04-30",
      tester: "MainAdmin",
    },
    tiers: {
      vanilla: "ht3",
      potPvp: "lt2",
      netherite: "ht1",
      smp: "lt3",
      sword: "lt3",
      axe: "ht2",
      mace: "lt2",
    },
  },
  {
    id: "6",
    username: "EmeraldArcher",
    skinUrl: "https://mc-heads.net/avatar/EmeraldArcher/100",
    overallRank: 6,
    totalPoints: 25,
    badges: [badges[2]],
    lastTested: {
      date: "2023-04-28",
      tester: "AdminHelper",
    },
    tiers: {
      vanilla: "lt3",
      potPvp: "ht4",
      netherite: "lt3",
      smp: "lt1",
      sword: "ht4",
      axe: "lt5",
      mace: "ht1",
    },
  },
  {
    id: "7",
    username: "BlazeMaster",
    skinUrl: "https://mc-heads.net/avatar/BlazeMaster/100",
    overallRank: 7,
    totalPoints: 22,
    badges: [badges[4]],
    lastTested: {
      date: "2023-04-25",
      tester: "MainAdmin",
    },
    tiers: {
      vanilla: "ht4",
      potPvp: "lt3",
      netherite: "ht4",
      smp: "ht4",
      sword: "lt4",
      axe: "ht1",
      mace: "rlt1",
    },
  },
  {
    id: "8",
    username: "IronGolem",
    skinUrl: "https://mc-heads.net/avatar/IronGolem/100",
    overallRank: 8,
    totalPoints: 19,
    badges: [],
    lastTested: {
      date: "2023-04-22",
      tester: "AdminHelper",
    },
    tiers: {
      vanilla: "lt4",
      potPvp: "ht5",
      netherite: "lt4",
      smp: "lt5",
      sword: "lt5",
      axe: "ht4",
      mace: "ht3",
    },
  },
  {
    id: "9",
    username: "WitherKing",
    skinUrl: "https://mc-heads.net/avatar/WitherKing/100",
    overallRank: 9,
    totalPoints: 16,
    badges: [],
    lastTested: {
      date: "2023-04-20",
      tester: "MainAdmin",
    },
    tiers: {
      vanilla: "ht5",
      potPvp: "lt4",
      netherite: "rht1",
      smp: "ht5",
      sword: "rht2",
      axe: "lt3",
      mace: "rht2",
    },
  },
  {
    id: "10",
    username: "ZombieHunter",
    skinUrl: "https://mc-heads.net/avatar/ZombieHunter/100",
    overallRank: 10,
    totalPoints: 13,
    badges: [],
    lastTested: {
      date: "2023-04-18",
      tester: "AdminHelper",
    },
    tiers: {
      vanilla: "lt5",
      potPvp: "rlt1",
      netherite: "lt5",
      smp: "rlt2",
      sword: "ht5",
      axe: "rlt2",
      mace: "lt5",
    },
  },
];

export const getPlayerById = (id: string): Player | undefined => {
  return players.find(player => player.id === id);
};

export const calculateTotalPoints = (player: Player): number => {
  let totalPoints = 0;
  
  Object.entries(player.tiers).forEach(([_, tierRating]) => {
    if (tierRating) {
      totalPoints += TIER_POINTS[tierRating as keyof typeof TIER_POINTS] || 0;
    }
  });
  
  return totalPoints;
};

import { MINI_GAMES, TIER_POINTS, TierRating } from "./types";

export const getPlayersWithUpdatedRanks = (): Player[] => {
  // Create a copy of players and calculate total points
  const updatedPlayers = players.map(player => {
    const totalPoints = calculateTotalPoints(player);
    return { ...player, totalPoints };
  });
  
  // Sort by total points in descending order
  updatedPlayers.sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Update overall ranks
  return updatedPlayers.map((player, index) => ({
    ...player,
    overallRank: index + 1
  }));
};
