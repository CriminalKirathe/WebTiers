
export interface Player {
  id: string;
  username: string;
  skinUrl: string;
  overallRank: number;
  totalPoints: number;
  badges: Badge[];
  lastTested?: {
    date: string;
    tester: string;
  };
  tiers: {
    [key in MiniGameType]?: TierRating;
  };
}

export type MiniGameType = 
  | "vanilla"
  | "UHC" 
  | "potPvp" 
  | "netherite" 
  | "smp" 
  | "sword" 
  | "axe" 
  | "mace";

export type TierRating = 
  | "lt5" | "ht5" 
  | "lt4" | "ht4" 
  | "lt3" | "ht3" 
  | "lt2" | "ht2" 
  | "lt1" | "ht1"
  | "rlt2" | "rht2" 
  | "rlt1" | "rht1";

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
}

export const TIER_POINTS: Record<TierRating, number> = {
  lt5: 1,
  ht5: 2,
  lt4: 3,
  ht4: 4,
  lt3: 5,
  ht3: 6,
  lt2: 7,
  ht2: 8,
  lt1: 9,
  ht1: 10,
  rlt2: 7,
  rht2: 8,
  rlt1: 9,
  rht1: 10,
};

export const MINI_GAMES: {id: MiniGameType, name: string}[] = [
  { id: "vanilla", name: "Vanilla" },
  { id: "UHC", name: "UHC" },
  { id: "potPvp", name: "Pot PvP" },
  { id: "netherite", name: "Netherite" },
  { id: "smp", name: "SMP" },
  { id: "sword", name: "Sword" },
  { id: "axe", name: "Axe" },
  { id: "mace", name: "Mace" }
];

export const TIER_LABELS: Record<TierRating, {
  display: string;
  tierNumber: 1 | 2 | 3 | 4 | 5;
  isHigh: boolean;
  isReserve?: boolean;
}> = {
  ht1: { display: "High Tier 1", tierNumber: 1, isHigh: true },
  lt1: { display: "Low Tier 1", tierNumber: 1, isHigh: false },
  ht2: { display: "High Tier 2", tierNumber: 2, isHigh: true },
  lt2: { display: "Low Tier 2", tierNumber: 2, isHigh: false },
  ht3: { display: "High Tier 3", tierNumber: 3, isHigh: true },
  lt3: { display: "Low Tier 3", tierNumber: 3, isHigh: false },
  ht4: { display: "High Tier 4", tierNumber: 4, isHigh: true },
  lt4: { display: "Low Tier 4", tierNumber: 4, isHigh: false },
  ht5: { display: "High Tier 5", tierNumber: 5, isHigh: true },
  lt5: { display: "Low Tier 5", tierNumber: 5, isHigh: false },
  rht1: { display: "Reserve High Tier 1", tierNumber: 1, isHigh: true, isReserve: true },
  rlt1: { display: "Reserve Low Tier 1", tierNumber: 1, isHigh: false, isReserve: true },
  rht2: { display: "Reserve High Tier 2", tierNumber: 2, isHigh: true, isReserve: true },
  rlt2: { display: "Reserve Low Tier 2", tierNumber: 2, isHigh: false, isReserve: true },
};
