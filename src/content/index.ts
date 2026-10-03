import type { ReactNode } from "react";
import { slides as brojeviDo20 } from "./brojevi-do-20";

export type DeckSlide = { name: string; node: ReactNode; prompts: string[] };

// Ključ je vrednost kolone booklets.deck. Nova knjižica = novi fajl u src/content + red ovde.
export const decks: Record<string, DeckSlide[]> = {
  "brojevi-i-kolicine-do-20": brojeviDo20,
};
