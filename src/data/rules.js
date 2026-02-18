// src/data/rules.js

export const GRAMMAR_RULES = {
  "prep-soft": {
    en: "This preposition causes a **Soft Mutation** on the word that follows it.",
    cy: "Mae'r arddodiad hwn yn achosi **Treiglad Meddal** ar y gair sy'n dilyn."
  },
  "prep-nasal": {
    en: "This preposition causes a **Nasal Mutation** on the word that follows it.",
    cy: "Mae'r arddodiad hwn yn achosi **Treiglad Trwynol** ar y gair sy'n dilyn."
  },
  "prep-art-contract": {
    en: "The preposition combines with the article (**i + y = i'r**, **o + y = o'r**). The mutation is blocked.",
    cy: "Mae'r arddodiad yn cyfuno gyda'r fannod (**i + y = i'r**, **o + y = o'r**). Mae'r treiglad yn cael ei rwystro."
  },
  "prep-art-contract-vowel": {
    en: "The preposition combines with the article before a vowel (**i + yr = i'r**, **o + yr = o'r**). The mutation is blocked.",
    cy: "Mae'r arddodiad yn cyfuno gyda'r fannod o flaen llafariad (**i + yr = i'r**, **o + yr = o'r**). Mae'r treiglad yn cael ei rwystro."
  },
  "prep-art-contract-i": {
    en: "The preposition **'i'** typically causes a Soft Mutation. Here, it combines with the article (**i** + **yr** = **i'r**), and the noun following 'the' does not mutate.",
    cy: "Mae'r arddodiad **'i'** fel arfer yn achosi Treiglad Meddal. Yma, mae'n cyfuno gyda'r fannod (**i** + **yr** = **i'r**), ac nid yw'r enw yn treiglo."
  },
  "poss-dy-soft": {
    en: "The possessive pronoun **'dy'** (your) causes a **Soft Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'dy'** yn achosi **Treiglad Meddal**."
  },
  "poss-fy-nasal": {
    en: "The possessive pronoun **'fy'** (my) causes a **Nasal Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'fy'** yn achosi **Treiglad Trwynol**."
  },
  "fem-adj-soft": {
    en: "A feminine singular noun causes a **Soft Mutation** on the adjective that follows it.",
    cy: "Mae enw benywaidd unigol yn achosi **Treiglad Meddal** ar yr ansoddair sy'n dilyn."
  },
  "num-fem-soft": {
    en: "Feminine nouns undergo a **Soft Mutation** after the number **'dwy'** (two).",
    cy: "Mae enwau benywaidd yn treiglo'n **Feddal** ar ôl y rhif **'dwy'**."
  },

  /* --- MYNEDIAD (South): TREIGLAD MEDDAL (Soft Mutation) --- */
  "soft-prep": {
    en: "Common prepositions (am, ar, at, gan, dros, drwy, wrth, dan, heb, hyd i, o) cause a **Soft Mutation**.",
    cy: "Mae'r arddodiaid cyffredin (am, ar, at, gan, dros, drwy, wrth, dan, heb, hyd i, o) yn achosi **Treiglad Meddal**."
  },
  "soft-quest-direct": {
    en: "A **Soft Mutation** occurs at the start of a direct question (verb-first questions, e.g. *Welaist ti...?*).",
    cy: "Mae **Treiglad Meddal** yn digwydd ar ddechrau cwestiwn uniongyrchol (e.e. *Welaist ti...?*)."
  },
  "soft-neg": {
    en: "A **Soft Mutation** generally implies a negative sentence starting with 'D' (except T, C, P).",
    cy: "Mae **Treiglad Meddal** fel arfer yn dynodi brawddeg negyddol sy'n dechrau gyda 'D' (ac eithrio T, C, P)."
  },
  "soft-quest-word": {
    en: "Question words like *pwy, beth, faint* cause a **Soft Mutation** in verb questions.",
    cy: "Mae geiriau cwestiwn fel *pwy, beth, faint* yn achosi **Treiglad Meddal** mewn cwestiynau berfol."
  },
  "soft-art-fem": {
    en: "A singular feminine noun causes a **Soft Mutation** after the article **'y'**.",
    cy: "Mae enw benywaidd unigol yn treiglo'n **Feddal** ar ôl y fannod **'y'**."
  },
  "soft-adj-fem": {
    en: "An adjective undergoes a **Soft Mutation** when following a singular feminine noun.",
    cy: "Mae ansoddair yn treiglo'n **Feddal** ar ôl enw benywaidd unigol."
  },
  "soft-yn-pred": {
    en: "Nouns and adjectives undergo a **Soft Mutation** after **'yn'** (in a descriptive sense).",
    cy: "Mae enwau ac ansoddeiriau yn treiglo'n **Feddal** ar ôl **'yn'** (traethiadol)."
  },
  "soft-num": {
    en: "The numbers **'dau'**, **'dwy'**, and **'ail'** cause a **Soft Mutation**.",
    cy: "Mae'r rhifau **'dau'**, **'dwy'**, ac **'ail'** yn achosi **Treiglad Meddal**."
  },
  "soft-poss": {
    en: "The possessive pronouns **'dy'** (your) and **'ei'** (his) cause a **Soft Mutation**.",
    cy: "Mae'r rhagenwau meddiannol **'dy'** ac **'ei'** (gwrywaidd) yn achosi **Treiglad Meddal**."
  },
  "soft-mut-o": {
    en: "The preposition **'o'** (from) causes a **Soft Mutation**.",
    cy: "Mae'r arddodiad **'o'** yn achosi **Treiglad Meddal**."
  },
  "soft-mut-i": {
    en: "The preposition **'i'** (to) causes a **Soft Mutation**.",
    cy: "Mae'r arddodiad **'i'** yn achosi **Treiglad Meddal**."
  },

  /* --- MYNEDIAD (South): TREIGLAD TRWYNOL (Nasal Mutation) --- */
  "nasal-yn": {
    en: "Place names commonly undergo a **Nasal Mutation** after **'yn'** (meaning 'in').",
    cy: "Mae enwau lleoedd yn aml yn treiglo'n **Drwynol** ar ôl **'yn'** ('mewn')."
  },
  "nasal-fy": {
    en: "The possessive pronoun **'fy'** (my) causes a **Nasal Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'fy'** yn achosi **Treiglad Trwynol**."
  },
  "nasal-recog": {
    en: "In Mynediad, you may see Nasal Mutation after *gyda, â, tua, ei (her)* or in negatives (recognition only).",
    cy: "Yn Mynediad, gallwch weld Treiglad Trwynol ar ôl *gyda, â, tua, ei (hi)* neu mewn brawddegau negyddol."
  },

  /* --- MYNEDIAD (South): TREIGLAD LLAES (Aspirate Mutation) --- */
  "asp-num": {
    en: "The numbers **'tri'** (three) and **'chwe'** (six) cause an **Aspirate Mutation**.",
    cy: "Mae'r rhifau **'tri'** a **'chwe'** yn achosi **Treiglad Llaes**."
  },
  "asp-neu": {
    en: "The conjunction **'neu'** (or) causes an **Aspirate Mutation**.",
    cy: "Mae'r cysylltair **'neu'** yn achosi **Treiglad Llaes**."
  },
  "asp-cmd-neg": {
    en: "Negative commands with **'Paid â'** / **'Peidiwch â'** cause an **Aspirate Mutation**.",
    cy: "Mae gorchmynion negyddol gyda **'Paid â'** / **'Peidiwch â'** yn achosi **Treiglad Llaes**."
  },
  "asp-ei-fem": {
    en: "The possessive pronoun **'ei'** (her) causes an **Aspirate Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'ei'** (benywaidd) yn achosi **Treiglad Llaes**."
  },

  /* --- NO MUTATION (Strategies) --- */
  "none-art-masc": {
    en: "Masculine nouns **do not mutate** after the article **'y'**.",
    cy: "Dyw enwau gwrywaidd **ddim yn treiglo** ar ôl y fannod **'y'**."
  },
  "none-art-plural": {
    en: "Plural nouns **do not mutate** after the article **'y'**.",
    cy: "Dyw enwau lluosog **ddim yn treiglo** ar ôl y fannod **'y'**."
  },
  "no-mut-eisiau": {
    en: "The word **'eisiau'** (to want) is followed directly by the noun. There is **no mutation**.",
    cy: "Mae'r gair **'eisiau'** yn cael ei ddilyn yn syth gan yr enw. Does **dim treiglad**."
  },
  "no-mut-generic": {
    en: "There is no mutation here.",
    cy: "Does dim treiglad yma."
  },
  "none-gen": {
    en: "This word does not mutate in this context.",
    cy: "Dyw'r gair hwn ddim yn treiglo yn y cyd-destun hwn."
  }
};
