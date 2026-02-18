
export const patterns = [
  // Patterns guide the sentence generation
  // They are distinct from the Unit Vocabulary "Box"
  
  // "Ceri dw i" structure: [NAME] dw i
  {
    id: "pattern-u1-name-dw-i",
    unit: 1,
    description: "Introducing oneself: [Name] dw i",
    structure: [
      { type: "slot", filter: { semantic_class: "person", unit: 1 } }, // Or potentially a wildcard name slot
      { type: "text", value: "dw i" }
    ]
  },

  // "Pwy dych chi?" - Fixed phrase / Question
  {
    id: "pattern-u1-pwy-dych-chi",
    unit: 1,
    description: "Asking who someone is",
    structure: [
      { type: "text", value: "Pwy dych chi?" }
    ]
  },

  // "Sut dych chi?" - Fixed phrase / Question
  {
    id: "pattern-u1-sut-dych-chi",
    unit: 1,
    description: "Asking how someone is (Chi)",
    structure: [
      { type: "text", value: "Sut dych chi?" }
    ]
  },

  // "Sut wyt ti?" - Fixed phrase / Question
  {
    id: "pattern-u1-sut-wyt-ti",
    unit: 1,
    description: "Asking how someone is (Ti)",
    structure: [
      { type: "text", value: "Sut wyt ti?" }
    ]
  },

  // "Ble dych chi'n byw?" - Question
  {
    id: "pattern-u1-ble-dych-chin-byw",
    unit: 1,
    description: "Asking where someone lives (Chi)",
    structure: [
      { type: "text", value: "Ble dych chi'n byw?" }
    ]
  },
  {
    id: "pattern-u1-ble-rwyt-tin-byw",
    unit: 1,
    description: "Asking where someone lives (Ti)",
    structure: [
      { type: "text", value: "Ble rwyt ti'n byw?" }
    ]
  },

  // "Dw i'n [verb] [object]" - Generic Declarative Statement
  // Examples: "Dw i'n gyrru Fiesta", "Dw i'n gwylio Strictly"
  // Note: Since 'Strictly' and 'Fiesta' aren't in Dictionary, we use generic Noun slots.
  {
    id: "pattern-u1-dwin-verb-noun",
    unit: 1,
    description: "Statement: Dw i'n [verb] [noun]",
    structure: [
      { type: "text", value: "Dw i'n" },
      { type: "slot", filter: { pos: "verbnoun", unit: 1 } },
      // Optional: Add a noun slot here if appropriate verbnouns exist (darllen/gwylio/gyrru)
      // For now, simple S-V-O is clearer.
      { type: "slot", filter: { pos: "noun", unit: 1 } }
    ]
  },

  // "Dw i'n darllen y [noun]" - Specific 'The' constuction
  {
    id: "pattern-u1-dwin-darllen-y",
    unit: 1,
    description: "Statement: Dw i'n darllen y [noun]",
    structure: [
      { type: "text", value: "Dw i'n darllen y" },
      { type: "slot", filter: { pos: "noun", unit: 1 } }
    ]
  },

  // "Paned?" / "Ie, plîs" - Short Dialogue
  {
    id: "pattern-u1-paned-response",
    unit: 1,
    description: "Short Q&A: Paned? ... Ie, plîs.",
    structure: [
      { type: "text", value: "Paned? Ie, plîs." }
    ]
  },

  // "Bore da" / "Prynhawn da" - Adjective Noun pairs or fixed greetings
  {
    id: "pattern-u1-greeting-morning",
    unit: 1,
    description: "Morning Greeting",
    structure: [
      { type: "text", value: "Bore da" }
    ]
  },
  {
    id: "pattern-u1-greeting-afternoon",
    unit: 1,
    description: "Afternoon Greeting",
    structure: [
      { type: "text", value: "Prynhawn da" }
    ]
  },
  {
    id: "pattern-u1-greeting-evening",
    unit: 1,
    description: "Evening Greeting",
    structure: [
      { type: "text", value: "Noswaith dda" }
    ]
  }
];

// No mutation triggers in Unit 1
export const mutationTriggers = [];

