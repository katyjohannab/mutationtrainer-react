// GENERATOR SCRIPT: Units 1-9 Master
// Run with: node generate_master_csv.cjs
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'public/data/mynediad-master.csv');

// --- DATA DEFINITIONS ---

// U1: Phrases (No Mut)
const GREETINGS = [
  { t:"Noswaith", b:"da", a:"dda", o:"soft", tr:"Good evening", c:"Phrase", g:"" },
  { t:"Bore",     b:"da", a:"da",  o:"none", tr:"Good morning", c:"Phrase", g:"" },
  { t:"Prynhawn", b:"da", a:"da",  o:"none", tr:"Good afternoon", c:"Phrase", g:"" },
  { t:"Sut",      b:"dych chi", a:"dych chi", o:"none", tr:"How are you?", c:"Phrase", g:"" },
  { t:"Da",       b:"iawn", a:"iawn", o:"none", tr:"Very good", c:"Phrase", g:"" },
  { t:"",         b:"Diolch", a:"Diolch", o:"none", tr:"Thank you", c:"Phrase", g:"" },
  { t:"",         b:"Hwyl", a:"Hwyl", o:"none", tr:"Bye", c:"Phrase", g:"" },
  { t:"Hwyl",     b:"fawr", a:"fawr", o:"soft", tr:"Goodbye (Big fun)", c:"Phrase", g:"" },
  { t:"",         b:"Croeso", a:"Croeso", o:"none", tr:"Welcome", c:"Phrase", g:"" },
  { t:"Nos",      b:"da", a:"da", o:"none", tr:"Good night", c:"Phrase", g:"" }, // Note: Nos usually softs adj, but 'da' typically stays 'da' in "Nos da" fixed phrase in most courses, though technically 'dda'. Mynediad lists "Nos da".
  { t:"Pwy",      b:"dych chi", a:"dych chi", o:"none", tr:"Who are you?", c:"Phrase", g:"" }
];

// U2: The Article (Soft Mut Feminine)
const UNIT2_ARTICLES = [
  { b:"merch",   tr:"The girl",      g:"f" },
  { b:"cegin",   tr:"The kitchen",   g:"f" },
  { b:"cath",    tr:"The cat",       g:"f" },
  { b:"pont",    tr:"The bridge",    g:"f" },
  { b:"gardd",   tr:"The garden",    g:"f" }, // G -> disappears (Yr ardd)
  { b:"bachgen", tr:"The boy",       g:"m" }, // No mut
  { b:"bwrdd",   tr:"The table",     g:"m" },
  { b:"afal",    tr:"The apple",     g:"m" }, // Vowel -> Yr
  { b:"ynys",    tr:"The island",    g:"f" }, // Vowel -> Yr (no mut)
];

// U3: Eisiau (No Mut)
const UNIT3_EISIAU = [
  { b:"coffi",   tr:"coffee",  g:"m" },
  { b:"te",      tr:"tea",     g:"m" },
  { b:"llaeth",  tr:"milk",    g:"m" },
  { b:"siwgr",   tr:"sugar",   g:"m" },
  { b:"dŵr",     tr:"water",   g:"m" },
  { b:"cwrw",    tr:"beer",    g:"m" },
  { b:"gwin",    tr:"wine",    g:"m" },
  { b:"cacen",   tr:"cake",    g:"f" },
  { b:"sglodion",tr:"chips",   g:"m" },
  { b:"pysgodyn",tr:"fish",    g:"m" },
  { b:"arian",   tr:"money",   g:"m" },
  { b:"swydd",   tr:"job",     g:"f" },
  { b:"paned",   tr:"cuppa",   g:"f" },
];

// U4: Places (Soft Mut / Contracts)
const PLACES_U4 = [
  // T -> D
  { b:"Talybont",    tr:"Talybont" },
  { b:"Tyddewi",     tr:"St Davids" },
  // C -> G
  { b:"Caerdydd",    tr:"Cardiff" },
  { b:"Ceredigion",  tr:"Ceredigion" },
  // P -> B
  { b:"Pontypridd",  tr:"Pontypridd" },
  // D -> Dd
  { b:"Dolgellau",   tr:"Dolgellau" },
  // G -> _ 
  { b:"Gwynedd",     tr:"Gwynedd" },
  // B -> F
  { b:"Bangor",      tr:"Bangor" },
  // Ll -> L
  { b:"Llanelli",    tr:"Llanelli" },
  { b:"Lloegr",      tr:"England" },
  // M -> F
  { b:"Machynlleth", tr:"Machynlleth" },
  // Vowels/No Mut
  { b:"Abertawe",    tr:"Swansea" },
  { b:"Yr Alban",    tr:"Scotland" },  // Contracts to i'r Alban
  { b:"Yr Eidal",    tr:"Italy" },     // Contracts to i'r Eidal
  { b:"America",     tr:"America" },   // No Mut: i America.
  { b:"Awstralia",   tr:"Australia" }, // i Awstralia
  { b:"Y Rhyl",      tr:"Rhyl" },      // Contracts to i'r Rhyl
  { b:"Y Bala",      tr:"Bala" },      // Contracts to i'r Bala
];

// U5: Past Tense (No Mut rules taught, but vocab building)
const PAST_VERBS_U5 = [
  { b:"coginio", short:"coginiais i", long:"gwnes i goginio", tr:"I cooked" },
  { b:"golchi",  short:"golchais i",  long:"gwnes i olchi",   tr:"I washed" },
  { b:"edrych",  short:"edrychais i", long:"gwnes i edrych",  tr:"I looked/watched" },
  { b:"ymlacio", short:"ymlaciais i", long:"gwnes i ymlacio", tr:"I relaxed" },
  { b:"ymolchi", short:"ymolchais i", long:"gwnes i ymolchi", tr:"I washed myself" },
  { b:"gwneud",  short:"gwnes i",     long:"gwnes i",         tr:"I did/made" }
];

// U6: Weather (yn + adj -> Soft)
const WEATHER_U6 = [
  { b:"braf",     tr:"fine",      o:"soft" },
  { b:"oer",      tr:"cold",      o:"none" }, // vowel
  { b:"stormus",  tr:"stormy",    o:"soft" },
  { b:"sych",     tr:"dry",       o:"soft" },
  { b:"gwyntog",  tr:"windy",     o:"soft" }, // g -> _ (wyntog)
  { b:"gwlyb",    tr:"wet",       o:"soft" }, // g -> _ (wlyb)
  { b:"cymylog",  tr:"cloudy",    o:"soft" },
  { b:"poeth",    tr:"hot",       o:"soft" },
];

// U7: Present Tense / Bod (Vocab building, gender nums)
const UNIT7_VOCAB = [
  // Numbers
  { t:"dau",     b:"bws",   a:"fws",  o:"soft", tr:"Two buses", c:"Number" },
  { t:"dwy",     b:"punt",  a:"bunt", o:"soft", tr:"Two pounds", c:"Number" },
  { t:"tri",     b:"mab",   a:"mab",  o:"aspirate", tr:"Three sons", c:"Number" }, // Tri + Asp
  { t:"tair",    b:"ceiniog",a:"ceiniog",o:"none", tr:"Three pennies", c:"Number" }, // Tair: no mut
  // Bod questions (Incidental)
  { t:"Ble mae'r", b:"plant", a:"plant", o:"none", tr:"Where are the children?", c:"Bod" },
  { t:"Sut mae'r", b:"tywydd",a:"tywydd",o:"none", tr:"How is the weather?", c:"Bod" },
];

// U8: Telephone / Revision (Incidental: Beth dych chi'n + SM of verb)
// "The verb mutates after Beth dych chi'n.../wyt ti'n...?"
const UNIT8_VERBS = [
  { b:"gwneud",   tr:"doing" },
  { b:"bwyta",    tr:"eating" },
  { b:"darllen",  tr:"reading" },
  { b:"yfed",     tr:"drinking" },
  { b:"gwylio",   tr:"watching" },
  { b:"chwarae",  tr:"playing" }
];

// U9: Short Past & Mutations
// 1. Short Past + Noun Object (Soft Mut) -> Prynais i fara (b->f)
// 2. Question Form (Soft Mut of Verb) -> Brynaist ti...? (p->b)
// 3. Negative (Soft Mut of Verb, except p/t/c) -> Ddarllenais i ddim (d->dd)
const UNIT9_PAST = [
  // Verb,      Object,      TransVerb, TransObj
  { v:"prynu",   o:"bara",    tv:"buy",   to:"bread" },
  { v:"darllen", o:"lyfr",    tv:"read",  to:"a book" },
  { v:"bwyta",   o:"brecwast",tv:"eat",   to:"breakfast" },
  { v:"gweld",   o:"ffilm",   tv:"see",   to:"a film" },
  { v:"yfed",    o:"coffi",   tv:"drink", to:"coffee" },
];


function mutateSoft(word) {
  if (!word) return "";
  const w = word.toLowerCase();
  const cap = word[0] === word[0].toUpperCase();
  
  // Soft Mutation Rules
  let m = w;
  if (w.startsWith("ll")) m = "l" + w.slice(2);
  else if (w.startsWith("rh")) m = "r" + w.slice(2);
  else if (w.startsWith("p")) m = "b" + w.slice(1);
  else if (w.startsWith("t")) m = "d" + w.slice(1);
  else if (w.startsWith("c")) m = "g" + w.slice(1);
  else if (w.startsWith("b")) m = "f" + w.slice(1);
  else if (w.startsWith("m")) m = "f" + w.slice(1);
  else if (w.startsWith("d")) m = "dd" + w.slice(1);
  else if (w.startsWith("g")) m = "" + w.slice(1); // G drops
  
  if (cap) {
    if (m.length === 0) return ""; // Handle G drop case if needed
    // If G drops (Gardd -> Ardd), make sure A is capitalized
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  return m;
}

function mutateAspirate(word) {
  if (!word) return "";
  const w = word.toLowerCase();
  const cap = word[0] === word[0].toUpperCase();
  
  let m = w;
  if (w.startsWith("p")) m = "ph" + w.slice(1);
  else if (w.startsWith("t")) m = "th" + w.slice(1);
  else if (w.startsWith("c")) m = "ch" + w.slice(1);

  if (cap) return m.charAt(0).toUpperCase() + m.slice(1);
  return m;
}

const CARDS = [];

// --- GENERATION LOGIC ---

// U1
GREETINGS.forEach((item) => {
  let before = item.t ? `${item.t} ` : ""; 
  CARDS.push({
    unit: "1", rule: item.o === "soft" ? "fem-adj-soft" : "none-gen", t: item.t, b: item.b, a: item.a, o: item.o, tr: item.tr, c: item.c, g: item.g, before
  });
});

// U2
UNIT2_ARTICLES.forEach((item) => {
  const isFem = item.g === "f";
  
  let outcome = "none";
  let ans = item.b;

  // Soft mutation only applies to Fem strings
  if (isFem) {
    const sm = mutateSoft(item.b);
    if (sm.toLowerCase() !== item.b.toLowerCase()) {
        const titleSM = mutateSoft(item.b); // Maintain case
        ans = titleSM;
        outcome = "soft";
    }
  }

  // Determine article based on the *answer*
  let trigger = "Y";
  if (/^[aeiouwyh]/i.test(ans)) trigger = "Yr";

  CARDS.push({
    unit: "2", rule: isFem ? "soft-art-fem" : "none-art-masc", t: trigger, b: item.b, a: ans, o: outcome, tr: item.tr, c: "Noun", g: item.g, before: `${trigger} `
  });
});

// U3
UNIT3_EISIAU.forEach((item) => {
  CARDS.push({
    unit: "3", rule: "no-mut-eisiau", t: "Dw i eisiau", b: item.b, a: item.b, o: "none", tr: `I want ${item.tr}`, c: "Noun", g: item.g, before: "Dw i eisiau "
  });
});

// U4
PLACES_U4.forEach((item) => {
  const startsY = item.b.startsWith("Y ") || item.b.startsWith("Yr ");
  const isVowelContract = item.b.startsWith("Yr ");

  // 1. "Dw i'n dod o..." (From)
  let ruleO = "soft-mut-o";
  let triggerO = "Dw i'n dod o"; 
  let beforeO = "Dw i'n dod o "; 
  let ansO = "";
  let outcomeO = "soft";

  if (startsY) {
     ansO = item.b.replace(/^Y(r)?\s+/, "o'r "); 
     ruleO = isVowelContract ? "prep-art-contract-vowel" : "prep-art-contract";
     outcomeO = "none";
     beforeO = "Dw i'n dod (o) "; 
  } else {
     ansO = mutateSoft(item.b);
     if (ansO === item.b) { outcomeO = "none"; ruleO = "no-mut-generic"; }
  }

  CARDS.push({
    unit: "4", rule: ruleO, t: triggerO, b: item.b, a: ansO, o: outcomeO, tr: `I come from ${item.tr}`, c: "PlaceName", g: "", before: beforeO
  });

  // 2. "Dw i'n mynd i..." (To)
  let ruleI = "soft-mut-i";
  let triggerI = "Dw i'n mynd i"; 
  let beforeI = "Dw i'n mynd i ";
  let ansI = "";
  let outcomeI = "soft";

  if (startsY) {
     ansI = item.b.replace(/^Y(r)?\s+/, "i'r ");
     ruleI = isVowelContract ? "prep-art-contract-vowel" : "prep-art-contract";
     outcomeI = "none";
     beforeI = "Dw i'n mynd (i) "; 
  } else {
     ansI = mutateSoft(item.b);
     if (ansI === item.b) { outcomeI = "none"; ruleI = "no-mut-generic"; }
  }

  CARDS.push({
    unit: "4", rule: ruleI, t: triggerI, b: item.b, a: ansI, o: outcomeI, tr: `I'm going to ${item.tr}`, c: "PlaceName", g: "", before: beforeI
  });
});

// U5 - (Vocab/Structure - Past Tense)
PAST_VERBS_U5.forEach((item) => {
  // Standard
  CARDS.push({
    unit: "5", rule: "past-gwneud", t: "Gwnes i...", b: item.b, a: item.long, o: "soft", tr: item.tr, c: "Verb", g: "", before: ""
  });
  // Short (just testing the form itself? or maybe just provide 'none' mutation context)
  // Let's make it a fill-in: "____ i (coginio)" -> "Coginiais"
  CARDS.push({
    unit: "5", rule: "past-short", t: "____ i", b: item.b, a: item.short.split(' ')[0], o: "none", tr: item.tr, c: "Verb", g: "", before: "([Past]) i "
  });
});

// U6 - Weather (yn + adj)
WEATHER_U6.forEach((item) => {
  const sm = mutateSoft(item.b);
  const outcome = sm !== item.b ? "soft" : "none";
  CARDS.push({
    unit: "6", rule: "pred-adj-soft", t: "Mae hi'n", b: item.b, a: sm, o: outcome, tr: `It is ${item.tr}`, c: "Adjective", g:"", before: "Mae hi'n "
  })
});

// U7 - Explicit Questions/Nums
UNIT7_VOCAB.forEach((item) => {
   CARDS.push({
    unit: "7", rule: item.o === "soft" ? "soft-num-fem" : "aspirate-num-masc", 
    t: item.t, b: item.b, a: item.a, o: item.o, tr: item.tr, c: item.c, g:"", before: `${item.t} `
   });
});

// U8 - Beth dych chi'n [verb] (Soft)
UNIT8_VERBS.forEach((item) => {
  const sm = mutateSoft(item.b);
  const outcome = sm !== item.b ? "soft" : "none";
  CARDS.push({
     unit: "8", rule: "soft-verb-interrog", t: "Beth dych chi'n", b: item.b, a: sm, o: outcome, tr: `What are you ${item.tr}?`, c: "Verb", g:"", before: "Beth dych chi'n "
  });
});

// U9 - Short Past Mutations
UNIT9_PAST.forEach((item) => {
  // 1. Object Mutation: "Prynais i [bara] -> fara"
  // Need to construct the short past form first: prynu -> prynais
  // Simplified map for now since conjugating all verbs implies a huge logic
  let shortStem = "";
  if (item.v === "prynu") shortStem = "Prynais";
  if (item.v === "darllen") shortStem = "Darllenais";
  if (item.v === "bwyta") shortStem = "Bwytais";
  if (item.v === "gweld") shortStem = "Gwelais";
  if (item.v === "yfed") shortStem = "Yfais";

  const smObj = mutateSoft(item.o);
  const outcomeObj = smObj !== item.o ? "soft" : "none";
  
  CARDS.push({
    unit: "9", rule: "short-past-obj-soft", t: `${shortStem} i`, b: item.o, a: smObj, o: outcomeObj, tr: `I ${item.tv} ${item.to}`, c: "Noun", g:"", before: `${shortStem} i `
  });
  
});


// --- OUTPUT WRITER ---
const HEADER = "CardId,Unit,RuleId,Trigger,Base,Before,After,Answer,Outcome,Translate,Category,Gender";
const csvContent = [
  HEADER,
  ...CARDS.map((c, i) => {
    // Starting ID at 2000 to designate generated range
    const id = `m-row-${i+2000}`;
    return [id, c.unit, c.rule, c.t, c.b, c.before, "", c.a, c.o, c.tr, c.c, c.g].map(v => `"${v}"`).join(",");
  })
].join("\n");

fs.writeFileSync(OUTPUT_PATH, csvContent);
console.log(`Generated ${CARDS.length} rows to ${OUTPUT_PATH}`);
