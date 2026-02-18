// src/data/rules.js

export const GRAMMAR_RULES = {
  // --- PREPOSITIONS (Soft) ---
  "soft-prep-general": {
    en: "Common prepositions (am, ar, at, gan, dros, drwy, wrth, dan, heb, hyd i, o) cause a **Soft Mutation**.",
    cy: "Mae'r arddodiaid cyffredin (am, ar, at, gan, dros, drwy, wrth, dan, heb, hyd i, o) yn achosi **Treiglad Meddal**."
  },
  "soft-prep-i": {
    en: "The preposition **'i'** (to) causes a **Soft Mutation**.",
    cy: "Mae'r arddodiad **'i'** yn achosi **Treiglad Meddal**."
  },
  "soft-prep-o": {
    en: "The preposition **'o'** (from) causes a **Soft Mutation**.",
    cy: "Mae'r arddodiad **'o'** yn achosi **Treiglad Meddal**."
  },

  // --- PREPOSITIONS (Nasal) ---
  "nasal-prep-general": {
    en: "This preposition causes a **Nasal Mutation** on the word that follows it.",
    cy: "Mae'r arddodiad hwn yn achosi **Treiglad Trwynol** ar y gair sy'n dilyn."
  },
  "nasal-prep-yn": {
    en: "Place names commonly undergo a **Nasal Mutation** after **'yn'** (meaning 'in').",
    cy: "Mae enwau lleoedd yn aml yn treiglo'n **Drwynol** ar ôl **'yn'** ('mewn')."
  },

  // --- EXCEPTIONS (Blocked/Contracted) ---
  "none-prep-contract": {
    en: "The preposition combines with the article (**i + y = i'r**, **o + y = o'r**). The mutation is blocked.",
    cy: "Mae'r arddodiad yn cyfuno gyda'r fannod (**i + y = i'r**, **o + y = o'r**). Mae'r treiglad yn cael ei rwystro."
  },
  "none-prep-contract-vowel": {
    en: "The preposition combines with the article before a vowel (**i + yr = i'r**, **o + yr = o'r**). The mutation is blocked.",
    cy: "Mae'r arddodiad yn cyfuno gyda'r fannod o flaen llafariad (**i + yr = i'r**, **o + yr = o'r**). Mae'r treiglad yn cael ei rwystro."
  },
  "none-prep-contract-i": {
    en: "The preposition **'i'** typically causes a Soft Mutation. Here, it combines with the article (**i** + **yr** = **i'r**), and the noun following 'the' does not mutate.",
    cy: "Mae'r arddodiad **'i'** fel arfer yn achosi Treiglad Meddal. Yma, mae'n cyfuno gyda'r fannod (**i** + **yr** = **i'r**), ac nid yw'r enw yn treiglo."
  },

  // --- POSSESSIVES ---
  "soft-poss-dy": {
    en: "The possessive pronoun **'dy'** (your) causes a **Soft Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'dy'** yn achosi **Treiglad Meddal**."
  },
  "soft-poss-general": {
    en: "The possessive pronouns **'dy'** (your) and **'ei'** (his) cause a **Soft Mutation**.",
    cy: "Mae'r rhagenwau meddiannol **'dy'** ac **'ei'** (gwrywaidd) yn achosi **Treiglad Meddal**."
  },
  "nasal-poss-fy": {
    en: "The possessive pronoun **'fy'** (my) causes a **Nasal Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'fy'** yn achosi **Treiglad Trwynol**."
  },
  "aspirate-poss-ei": {
    en: "The possessive pronoun **'ei'** (her) causes an **Aspirate Mutation**.",
    cy: "Mae'r rhagenw meddiannol **'ei'** (benywaidd) yn achosi **Treiglad Llaes**."
  },

  // --- FEMININE NOUNS ---
  "soft-adj-fem": {
    en: "A feminine singular noun causes a **Soft Mutation** on the adjective that follows it.",
    cy: "Mae enw benywaidd unigol yn achosi **Treiglad Meddal** ar yr ansoddair sy'n dilyn."
  },
  "soft-art-fem": {
    en: "A singular feminine noun causes a **Soft Mutation** after the article **'y'**.",
    cy: "Mae enw benywaidd unigol yn treiglo'n **Feddal** ar ôl y fannod **'y'**."
  },

  // --- NUMBERS ---
  "soft-num-dwy": {
    en: "Feminine nouns undergo a **Soft Mutation** after the number **'dwy'** (two).",
    cy: "Mae enwau benywaidd yn treiglo'n **Feddal** ar ôl y rhif **'dwy'**."
  },
  "soft-num-general": {
    en: "The numbers **'dau'**, **'dwy'**, and **'ail'** cause a **Soft Mutation**.",
    cy: "Mae'r rhifau **'dau'**, **'dwy'**, ac **'ail'** yn achosi **Treiglad Meddal**."
  },
  "aspirate-num-general": {
    en: "The numbers **'tri'** (three) and **'chwe'** (six) cause an **Aspirate Mutation**.",
    cy: "Mae'r rhifau **'tri'** a **'chwe'** yn achosi **Treiglad Llaes**."
  },

  // --- VERBAL / QUESTIONS / NEGATIVES ---
  "soft-quest-direct": {
    en: "A **Soft Mutation** occurs at the start of a direct question (verb-first questions, e.g. *Welaist ti...?*).",
    cy: "Mae **Treiglad Meddal** yn digwydd ar ddechrau cwestiwn uniongyrchol (e.e. *Welaist ti...?*)."
  },
  "soft-verb-short-subj": {
    en: "The object of a short-form verb (e.g. *Gwnes i...*) undergoes a **Soft Mutation**.",
    cy: "Mae gwrthrych berf ar ffurf fer (e.e. *Gwnes i...*) yn treiglo'n **Feddal**."
  },
  "soft-verb-quest-word": {
    en: "Question words like *pwy, beth, faint* cause a **Soft Mutation** in verb questions.",
    cy: "Mae geiriau cwestiwn fel *pwy, beth, faint* yn achosi **Treiglad Meddal** mewn cwestiynau berfol."
  },
  "soft-verb-neg": {
    en: "In negative sentences, verified verbs starting with B, D, G, Ll, M, Rh undergo a **Soft Mutation** (the Soft part of Mixed Mutation).",
    cy: "Mewn brawddegau negyddol, mae berfau sy'n dechrau gyda B, D, G, Ll, M, Rh yn treiglo'n **Feddal** (y rhan Feddal o Dreiglad Cymysg)."
  },
  "aspirate-verb-neg-cmd": {
    en: "Negative commands with **'Paid â'** / **'Peidiwch â'** cause an **Aspirate Mutation**.",
    cy: "Mae gorchmynion negyddol gyda **'Paid â'** / **'Peidiwch â'** yn achosi **Treiglad Llaes**."
  },

  // --- PARTICLES / CONJUNCTIONS ---
  "soft-part-yn": {
    en: "Nouns and adjectives undergo a **Soft Mutation** after **'yn'** (in a descriptive sense).",
    cy: "Mae enwau ac ansoddeiriau yn treiglo'n **Feddal** ar ôl **'yn'** (traethiadol)."
  },
  "soft-bod-yn-adj": {
    en: "After **bod + yn**, adjectives take a **Soft Mutation** (e.g. *da -> dda*).",
    cy: "Ar ôl **bod + yn**, mae ansoddeiriau'n cymryd **Treiglad Meddal** (e.e. *da -> dda*)."
  },
  "none-bod-yn-verbnoun": {
    en: "After **bod + yn**, a verbnoun stays in base form (no mutation).",
    cy: "Ar ôl **bod + yn**, mae berfenw'n aros yn y ffurf sylfaenol (dim treiglad)."
  },
  "aspirate-conj-neu": {
    en: "The conjunction **'neu'** (or) causes an **Aspirate Mutation**.",
    cy: "Mae'r cysylltair **'neu'** yn achosi **Treiglad Llaes**."
  },

  // --- EXCEPTIONS (Nil Cases) ---
  "none-art-masc": {
    en: "Masculine nouns **do not mutate** after the article **'y'**. (e.g., Y Ci).",
    cy: "Dyw enwau gwrywaidd **ddim yn treiglo** ar ôl y fannod **'y'**. (e.e. Y Ci)."
  },
  "none-art-vowel": {
    en: "Feminine nouns starting with a **vowel** do not mutate after **'yr'**.",
    cy: "Dyw enwau benywaidd sy'n dechrau gyda **llafariad** ddim yn treiglo ar ôl **'yr'**."
  },
  "none-general-yn": {
    en: "There is no mutation when using 'bod' + 'yn' structure (e.g. Dw i'n gweld).",
    cy: "Does dim treiglad wrth ddefnyddio 'bod' + 'yn' (e.e. Dw i'n gweld)."
  },

  // --- MISC / RECOGNITION ---
  "nasal-misc-recog": {
    en: "In Mynediad, you may see Nasal Mutation after *gyda, â, tua, ei (her)* or in negatives (recognition only).",
    cy: "Yn Mynediad, gallwch weld Treiglad Trwynol ar ôl *gyda, â, tua, ei (hi)* neu mewn brawddegau negyddol."
  },
  "none-misc-general": {
    en: "There is no mutation here.",
    cy: "Does dim treiglad yma."
  },
  "none-art-plural": {
    en: "Plural nouns **do not mutate** after the article **'y'**.",
    cy: "Dyw enwau lluosog **ddim yn treiglo** ar ôl y fannod **'y'**."
  },
  "none-verb-eisiau": {
    en: "The word **'eisiau'** (to want) is followed directly by the noun. There is **no mutation**.",
    cy: "Mae'r gair **'eisiau'** yn cael ei ddilyn yn syth gan yr enw. Does **dim treiglad**."
  },

  // --- PREFIXES ---
  "soft-pref-cyn": {
    en: "The prefix **'cyn-'** (former/ex-) causes a **Soft Mutation**.",
    cy: "Mae'r rhagddodiad **'cyn-'** yn achosi **Treiglad Meddal**."
  },
  "soft-pref-uwch": {
    en: "The prefix **'uwch-'** (higher/super-) causes a **Soft Mutation**.",
    cy: "Mae'r rhagddodiad **'uwch-'** yn achosi **Treiglad Meddal**."
  },
  "soft-pref-is": {
    en: "The prefix **'is-'** (lower/sub-) causes a **Soft Mutation**.",
    cy: "Mae'r rhagddodiad **'is-'** yn achosi **Treiglad Meddal**."
  },
  "soft-pref-dirprwy": {
    en: "The title **'dirprwy'** (deputy) causes a **Soft Mutation** on the following noun.",
    cy: "Mae'r teitl **'dirprwy'** yn achosi **Treiglad Meddal** ar yr enw sy'n dilyn."
  },
  "soft-pref-af": {
    en: "The negative prefix **'af-'** (un-, dis-) causes a **Soft Mutation**.",
    cy: "Mae'r rhagddodiad negyddol **'af-'** yn achosi **Treiglad Meddal**."
  },
  "soft-pref-go": {
    en: "The prefix **'go-'** (rather, somewhat) causes a **Soft Mutation**.",
    cy: "Mae'r rhagddodiad **'go-'** yn achosi **Treiglad Meddal**."
  },
  "soft-pref-gor": {
    en: "The prefix **'gor-'** (over, too much) causes a **Soft Mutation**.",
    cy: "Mae'r rhagddodiad **'gor-'** yn achosi **Treiglad Meddal**."
  },

  // --- PREFIXES & MIXED (ADDED) ---
  "mixed-mutation-neg": {
    en: "Negative particles (ni, na, oni) cause a **Mixed Mutation** (Aspirate for C, P, T; Soft for B, D, G, Ll, M, Rh).",
    cy: "Mae geiriau gwadu (ni, na, oni) yn achosi **Treiglad Cymysg** (Llaes i C, P, T; Meddal i B, D, G, Ll, M, Rh)."
  },
  "soft-prefix-af": {
    en: "The negative prefix 'af-' causes a **Soft Mutation** on the root word (e.g. af + llwyddiannus = aflwyddiannus).",
    cy: "Mae'r rhagddodiad negyddol 'af-' yn achosi **Treiglad Meddal** ar y gairôn (e.e. af + llwyddiannus = aflwyddiannus)."
  },
  "soft-prefix-di": {
    en: "The prefix 'di-' (usually meaning without/less) causes a **Soft Mutation** on the root word.",
    cy: "Mae'r rhagddodiad 'di-' (heb) yn achosi **Treiglad Meddal** ar y gairôn."
  },
  "nasal-prefix-an": {
    en: "The prefix 'an-' (un-/non-) generally causes a **Nasal Mutation**, particularly on words starting with C, P, T.",
    cy: "Mae'r rhagddodiad 'an-' yn fel arfer yn achosi **Treiglad Trwynol**, yn enwedig ar eiriau sy'n dechrau gyda C, P, T."
  },

  // --- EXCEPTIONS & LIMITATIONS ---
  "none-vowel-soft": {
    en: "Soft Mutation does not apply to words beginning with a vowel (except occasionally for 'g' which disappears).",
    cy: "Dydy Treiglad Meddal ddim yn berthnasol i eiriau sy'n dechrau gyda llafariad (ac eithrio 'g' sy'n diflannu)."
  },
  "none-vowel-aspirate": {
    en: "Aspirate Mutation does not apply to words beginning with a vowel.",
    cy: "Dydy Treiglad Llaes ddim yn berthnasol i eiriau sy'n dechrau gyda llafariad."
  },
  "none-vowel-nasal": {
    en: "Nasal Mutation does not apply to words beginning with a vowel.",
    cy: "Dydy Treiglad Trwynol ddim yn berthnasol i eiriau sy'n dechrau gyda llafariad."
  }
};
