// ფაილი: @/utils/types.ts (ან თქვენი ფაილის შესაბამისი სახელი)

export interface Player {
  id: string;
  username: string;
  skinUrl: string; // დარწმუნდით, რომ ეს ყოველთვის არის, ან გააკეთეთ string | undefined
  overallRank: number; // დარწმუნდით, რომ ეს ყოველთვის არის, ან number | undefined
  totalPoints: number;
  badges: Badge[];
  tiers: {
    [key in MiniGameType]?: TierRating; // იყენებს განახლებულ MiniGameType-ს
  };
}

// MiniGameType სტანდარტიზებულია პატარა ასოებზე (lowercase)
export type MiniGameType =
  | "vanilla"
  | "uhc"
  | "potpvp"
  | "netherite"
  | "smp"
  | "sword"
  | "axe"
  | "mace"
  | "elytra";

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
  lt3: 6,
  ht3: 10,
  lt2: 20,
  ht2: 30,
  lt1: 45,
  ht1: 60,
  rlt2: 20,
  rht2: 30,
  rlt1: 45,
  rht1: 60,
};

// MINI_GAMES ობიექტის ტიპი განახლებულია discordLink-ის დასამატებლად
// id-ები შეესაბამება განახლებულ MiniGameType-ს (ყველა პატარა ასოთი)
export const MINI_GAMES: {
  id: MiniGameType;
  name: string;
  discordLink?: string; // <<-- დამატებულია discordLink (არასავალდებულო)
}[] = [
  { id: "vanilla", name: "Vanilla", discordLink: "https://discord.gg/sZmWtA5U6G" },
  { id: "uhc", name: "UHC", discordLink: "https://discord.gg/PgfskTrWKG" }, // id შეიცვალა "uhc"-ზე
  { id: "potpvp", name: "Pot PvP", discordLink: "https://discord.gg/WyEs2xWkJY" }, // id შეიცვალა "potpvp"-ზე
  { id: "netherite", name: "Netherite", discordLink: "https://discord.gg/ubrV4u6VVw" },
  { id: "smp", name: "SMP", discordLink: "https://discord.gg/UWcuuydrsv" },
  { id: "sword", name: "Sword", discordLink: "https://discord.gg/kB3HfKpYbR" },
  { id: "axe", name: "Axe", discordLink: "https://discord.gg/5wvQYu3WVF" },
  { id: "mace", name: "Mace", discordLink: "https://discord.gg/GDaDnFrc7k" },
  { id: "elytra", name: "Elytra", discordLink: "https://discord.gg/sH8D3Uppph" }
];

export const TIER_LABELS: Record<TierRating, {
  display: string;
  tierNumber: 1 | 2 | 3 | 4 | 5;
  isHigh: boolean;
  isRetired: boolean;
}> = {
  ht1: { display: "High Tier 1", tierNumber: 1, isHigh: true, isRetired: false },
  lt1: { display: "Low Tier 1", tierNumber: 1, isHigh: false, isRetired: false },
  ht2: { display: "High Tier 2", tierNumber: 2, isHigh: true, isRetired: false },
  lt2: { display: "Low Tier 2", tierNumber: 2, isHigh: false, isRetired: false },
  ht3: { display: "High Tier 3", tierNumber: 3, isHigh: true, isRetired: false },
  lt3: { display: "Low Tier 3", tierNumber: 3, isHigh: false, isRetired: false },
  ht4: { display: "High Tier 4", tierNumber: 4, isHigh: true, isRetired: false },
  lt4: { display: "Low Tier 4", tierNumber: 4, isHigh: false, isRetired: false },
  ht5: { display: "High Tier 5", tierNumber: 5, isHigh: true, isRetired: false },
  lt5: { display: "Low Tier 5", tierNumber: 5, isHigh: false, isRetired: false },
  rht1: { display: "Retired High Tier 1", tierNumber: 1, isHigh: true, isRetired: true },
  rlt1: { display: "Retired Low Tier 1", tierNumber: 1, isHigh: false, isRetired: true },
  rht2: { display: "Retired High Tier 2", tierNumber: 2, isHigh: true, isRetired: true },
  rlt2: { display: "Retired Low Tier 2", tierNumber: 2, isHigh: false, isRetired: true },
};