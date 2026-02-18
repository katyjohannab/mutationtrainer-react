export const mynediadPatterns = [
  
  // --- UNIT 2 (Hoffi) ---
  {
    id: "pat-hoffi-noun",
    course: "mynediad",
    pack: "unit-2",
    sentenceStart: "Dw i'n hoffi",
    mutation: "none",
    ruleId: "none-verbnoun-obj",
    slotType: "noun",
    enTemplate: "I like {word}",
    limitToVocabUnits: [1, 2]
  },
  {
    id: "pat-hoffi-vn",
    course: "mynediad",
    pack: "unit-2",
    sentenceStart: "Dw i'n hoffi",
    mutation: "none",
    ruleId: "pat-hoffi-vn",
    slotType: "verbnoun",
    enTemplate: "I like {word}",
    limitToVocabUnits: [1, 2]
  },

  // --- UNIT 3 (Eisiau) ---
  {
    id: "pat-eisiau-noun",
    course: "mynediad",
    pack: "unit-3",
    sentenceStart: "Dw i eisiau",
    mutation: "none",
    ruleId: "none-verbnoun-obj",
    slotType: "noun",
    enTemplate: "I want {word}",
    limitToVocabUnits: [1, 2, 3]
  },

  // --- UNIT 4 (Going To - Soft) ---
  {
    id: "pat-mynd-i",
    course: "mynediad",
    pack: "unit-4",
    sentenceStart: "Dw i'n mynd i",
    mutation: "soft",
    ruleId: "soft-prep-i",
    slotType: "place",
    limitToVocabUnits: [1, 2, 3, 4],
    enTemplate: "I am going to {word}"
  },
  {
    id: "pat-dod-o",
    course: "mynediad",
    pack: "unit-4",
    sentenceStart: "Dw i'n dod o",
    mutation: "soft",
    ruleId: "soft-prep-o",
    slotType: "place",
    enTemplate: "I come from {word}"
  },

  // --- UNIT 5 (Past Tense - Soft) ---
  {
    id: "pat-gwnes-i-noun",
    course: "mynediad",
    pack: "unit-5",
    sentenceStart: "Gwnes i",
    mutation: "soft",
    ruleId: "soft-verb-short-subj",
    slotType: "noun",
    enTemplate: "I made {word}"
  },
  {
    id: "pat-wnest-ti",
    course: "mynediad",
    pack: "unit-5",
    sentenceStart: "Wnest ti",
    mutation: "soft",
    ruleId: "soft-verb-short-subj",
    slotType: "noun",
    enTemplate: "Did you make {word}?"
  },

  // --- UNIT 14 (Nasal Places) ---
  {
    id: "pat-byw-yn",
    course: "mynediad",
    pack: "unit-14",
    sentenceStart: "Dw i'n byw yn",
    mutation: "nasal",
    ruleId: "nasal-prep-yn",
    slotType: "place",
    enTemplate: "I live in {word}"
  },
  {
    id: "pat-gweithio-yn",
    course: "mynediad",
    pack: "unit-14",
    sentenceStart: "Dw i'n gweithio yn",
    mutation: "nasal",
    ruleId: "nasal-prep-yn",
    slotType: "place",
    enTemplate: "I work in {word}"
  },

  // --- UNIT 16 (Aspirate) ---
  {
    id: "pat-poss-ei-fem",
    course: "mynediad",
    pack: "unit-16",
    sentenceStart: "Dyma ei", 
    mutation: "aspirate",
    ruleId: "aspirate-poss-ei",
    slotType: "noun",
    enTemplate: "Here is her {word}"
  }
];
