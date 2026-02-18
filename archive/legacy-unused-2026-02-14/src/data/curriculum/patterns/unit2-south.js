export const patterns = [
  // --- UNIT 2 PATTERNS (Templates from Text) ---

  // 1. "Dw i'n hoffi [thing]"
  {
    id: "pattern-u2-dwin-hoffi-noun",
    unit: 2,
    description: { en: "I like [thing]", cy: "Dw i'n hoffi [peth]" },
    structure: [
      { type: "text", value: "Dw i'n hoffi" },
      { type: "slot", filter: { pos: "noun" } } // Removed unit:2 constraint to allow all previous nouns
    ]
  },
  {
    id: "pattern-u2-dwin-lico-noun",
    unit: 2,
    description: { en: "I like [thing] (lico)", cy: "Dw i'n lico [peth]" },
    structure: [
      { type: "text", value: "Dw i'n lico" },
      { type: "slot", filter: { pos: "noun" } }
    ]
  },

  // 2. "Wyt ti'n hoffi [thing]?"
  {
    id: "pattern-u2-wytti-hoffi-noun",
    unit: 2,
    description: { en: "Do you like [thing]?", cy: "Wyt ti'n hoffi [peth]?" },
    structure: [
      { type: "text", value: "Wyt ti'n hoffi" },
      { type: "slot", filter: { pos: "noun" } },
      { type: "text", value: "?" }
    ]
  },

  // 3. "Dw i ddim yn hoffi [thing]"
  {
    id: "pattern-u2-dwin-ddim-hoffi-noun",
    unit: 2,
    description: { en: "I don't like [thing]", cy: "Dw i ddim yn hoffi [peth]" },
    structure: [
      { type: "text", value: "Dw i ddim yn hoffi" },
      { type: "slot", filter: { pos: "noun" } }
    ]
  },

  // 4. "Dyn ni'n [verb]" (We are...)
  {
    id: "pattern-u2-dynni-vn",
    unit: 2,
    description: { en: "We are [verb]ing", cy: "'Dyn ni'n [berfenw]" },
    structure: [
      { type: "text", value: "'Dyn ni'n" },
      { type: "slot", filter: { pos: "verbnoun", unit: 2 } }
    ]
  },

  // 5. "Dych chi'n [verb]" (You pl/polite are...)
  {
    id: "pattern-u2-dychchi-vn",
    unit: 2,
    description: { en: "You are [verb]ing", cy: "Dych chi'n [berfenw]" },
    structure: [
      { type: "text", value: "Dych chi'n" },
      { type: "slot", filter: { pos: "verbnoun", unit: 2 } }
    ]
  },

  // 6. "Ble dych chi'n [verb]?"
  {
    id: "pattern-u2-ble-dychchi-vn",
    unit: 2,
    description: { en: "Where do you [verb]?", cy: "Ble dych chi'n [berfenw]?" },
    structure: [
      { type: "text", value: "Ble dych chi'n" },
      { type: "slot", filter: { pos: "verbnoun", unit: 2 }, exclusion: ["bod", "hoffi", "lico"] }, // Filter stative verbs if needed
      { type: "text", value: "?" }
    ]
  },

  // 7. "Beth dych chi'n gwneud?"
  {
    id: "pattern-u2-beth-dych-chi-wneud",
    unit: 2,
    description: { en: "What are you doing?", cy: "Beth dych chi'n wneud?" },
    structure: [
      { type: "text", value: "Beth dych chi'n wneud?" }
    ]
  },

  // --- GRAMMAR DRILLS (Article Rules) ---
  // Implicitly taught via Red/Blue coding in text
  
  // 8. The + Feminine Noun -> Soft Mutation (e.g., Y Gath)
  {
    id: "pattern-u2-art-fem",
    unit: 2,
    ruleId: "soft-art-fem",
    description: { en: "The [Feminine Noun] (Mutates)", cy: "Y [Enw Benywaidd] (Treiglo)" },
    structure: [
      { type: "text", value: "y" }, // Builder handles 'yr' check? Or use slot helper? assuming builder is simple for now.
      { type: "slot", filter: { pos: "noun", gender: "f" }, mutation: "soft" } // Removed unit:2
    ]
  },

  // 9. The + Masculine Noun -> No Mutation (e.g., Y Ci)
  {
    id: "pattern-u2-art-masc-nil",
    unit: 2,
    ruleId: "none-art-masc",
    description: { en: "The [Masculine Noun] (No Mutation)", cy: "Y [Enw Gwrywaidd] (Dim Treiglad)" },
    structure: [
      { type: "text", value: "y" },
      { type: "slot", filter: { pos: "noun", gender: "m" } } // Removed unit:2
    ]
  }
];

export const mutationTriggers = [
    "soft-art-fem",
    "none-art-masc"
];
