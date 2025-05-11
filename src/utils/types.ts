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
  lt3: 5,
  ht3: 6,
  lt2: 7,
  ht2: 8,
  lt1: 9,
  ht1: 10,
  rlt2: 7, // გაითვალისწინეთ, რომ rlt2/rht2 და rlt1/rht1 იგივე ქულებს იძლევიან, რაც lt2/ht2 და lt1/ht1. ეს შეიძლება გამიზნული იყოს.
  rht2: 8,
  rlt1: 9,
  rht1: 10,
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