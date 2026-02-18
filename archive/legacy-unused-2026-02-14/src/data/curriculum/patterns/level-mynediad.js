// src/data/curriculum/patterns/level-mynediad.js

export const patterns = [
  // UNIT 3: Eisiau Pattern (No Yn, No Mutation)
  {
    id: "pattern-eisiau-basic",
    unit: 3,
    structure: [
      { type: "text", value: "Dych chi eisiau", en: "Do you want" },
      { type: "slot", valid_pos: ["noun"], mutation: null }
    ]
  },

  // UNIT 4: Mynd i (Going to) - Soft Mutation
  {
    id: "pattern-mynd-i-soft",
    unit: 4,
    ruleId: "soft-prep-i",
    dialect: ["s"],
    structure: [
      { type: "text", value: "Dw i'n mynd i", en: "I am going to" },
      { 
        type: "slot", 
        valid_semantic: ["place"], 
        mutation: "soft"
      }
    ]
  },
  
  // UNIT 4: Bwyta yn (Eating in) - Nasal Mutation
  {
    id: "pattern-bwyta-yn-nasal",
    unit: 4,
    ruleId: "nasal-prep-yn",
    structure: [
      { type: "text", value: "Dw i'n bwyta yn", en: "I am eating in" },
      { 
        type: "slot", 
        valid_semantic: ["place"], 
        mutation: "nasal" 
      }
    ]
  }
];
