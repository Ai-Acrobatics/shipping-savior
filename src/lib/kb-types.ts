// Types and constants safe for both server and client components.
// The fs/path-using loader lives in `kb.ts` (server-only).

export type KbCategory = "ftz" | "carriers" | "tariffs" | "onboarding" | "calculators";

export interface KbArticleMeta {
  title: string;
  slug: string;
  description: string;
  category: KbCategory;
  published_at: string;
  updated_at: string;
  read_time_minutes: number;
}

export const KB_CATEGORY_LABELS: Record<KbCategory, string> = {
  ftz: "Foreign Trade Zones",
  carriers: "Carriers",
  tariffs: "Tariffs & Duties",
  onboarding: "Getting Started",
  calculators: "Calculators",
};

export const KB_CATEGORY_ORDER: KbCategory[] = [
  "onboarding",
  "calculators",
  "ftz",
  "carriers",
  "tariffs",
];

export const KB_VALID_CATEGORIES: ReadonlyArray<KbCategory> = [
  "ftz",
  "carriers",
  "tariffs",
  "onboarding",
  "calculators",
];
