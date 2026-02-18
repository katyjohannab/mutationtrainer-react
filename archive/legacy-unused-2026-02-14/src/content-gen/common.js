// src/content-gen/common.js
// Shared helper functions for generation
import { mutateWord } from "../utils/grammar.js";

export function toSentenceCase(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Wrapper for the app's grammar engine
export function mutate(base, type) {
  return mutateWord(base, type);
}

// Logic for vowels (useful for simple rules like 'y' vs 'yr')
export function isVowel(char) {
  return /^[aeiouw y]/i.test(char); // w and y can be vowels in Welsh
}

// Generates a unique ID for a card
export function makeId(prefix, ...parts) {
  const safeParts = parts.map(p => 
    String(p).toLowerCase().replace(/[^a-z0-9]/g, "")
  );
  return `${prefix}-${safeParts.join("-")}`;
}
