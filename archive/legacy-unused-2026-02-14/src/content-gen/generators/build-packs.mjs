import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(__dirname, '../../../public/data/generated');

// Import your Source Data here
// For now, these files might be empty or basic, but the script needs to import them.
// We will iterate through the pattern files found in patterns/ dir.
import { mynediadPatterns } from '../patterns/mynediad-patterns.js';
import { mynediadVocab } from '../vocab/mynediad-vocab.js';

import { mutateWord } from '../../utils/grammar.js';

// Dictionary of ALL patterns and vocab combined
const ALL_PATTERNS = [...mynediadPatterns];
const ALL_VOCAB = [...mynediadVocab];

/**
 * 1. Helper: Contraction Logic
 * Applies standard spoken Welsh contractions.
 */
function applyContractions(sentence) {
  return sentence
    // i + y -> i'r
    .replace(/\bi\s+yr\b/gi, "i'r")
    .replace(/\bi\s+y\b/gi, "i'r")
    // o + y -> o'r
    .replace(/\bo\s+yr\b/gi, "o'r")
    .replace(/\bo\s+y\b/gi, "o'r")
    // a + y -> a'r (and the)
    .replace(/\ba\s+yr\b/gi, "a'r")
    .replace(/\ba\s+y\b/gi, "a'r")
    // â + y -> â'r (with the)
    .replace(/\bâ\s+yr\b/gi, "â'r")
    .replace(/\bâ\s+y\b/gi, "â'r")
    .replace(/\s+/g, " ").trim();
}

/**
 * 2. Helper: Detect Determiner
 * Handles "Yr Eidal" vs "Eidal"
 */
function splitDet(phrase) {
  // Check for common determiners at start
  const match = phrase.match(/^(yr|y|'r)\s+(.+)$/i);
  if (match) {
    return { det: match[1], rest: match[2] };
  }
  return { det: "", rest: phrase };
}

/**
 * 3. The Builder Function
 */
function generateCards() {
  const cards = [];

  console.log(`Processing ${ALL_PATTERNS.length} patterns...`);

  for (const pat of ALL_PATTERNS) {
    // 1. Filter Vocab
    const candidates = ALL_VOCAB.filter(word => {
      // Type Check
      if (pat.slotType) {
        // Strict match on specific 'semantic_class' OR generic 'type'
        // e.g. slotType 'place' matches type='place' OR semantic_class='place'
        const matchesType = word.type === pat.slotType;
        const matchesSemantic = word.semantic_class === pat.slotType;
        
        if (!matchesType && !matchesSemantic) return false;
      }

      // Unit/Complexity Check (if pattern has limit)
      if (pat.limitToVocabUnits) {
        if (!pat.limitToVocabUnits.includes(word.unit)) return false;
      }
      return true;
    });

    // 2. Build Card for each Candidate
    for (const word of candidates) {
      let mutationKind = pat.mutation || "none";
      let basePhrase = word.base; // "Yr Eidal" or "coffi"
      let mutatedPhrase = basePhrase;

      // Mutation Logic
      const { det, rest } = splitDet(basePhrase);
      
      if (det) {
        // Special Case: Words with determiners (Yr Eidal)
        // Usually, the mutation hits the determiner.
        // But "Yr" does not soft mutate.
        // However, if the pattern is "i" (to) + "Yr Eidal", they contract to "i'r Eidal".
        // The mutation is effectively "blocked" or "absorbed" by the determiner logic.
        
        // We set mutation output to 'none' visually for the user? 
        // Or we rely on the contraction logic.
        // Let's assume for Mynediad level, we don't mutate 'Yr'.
        mutationKind = "none"; 
        mutatedPhrase = basePhrase;
      } else {
        // Standard Case: "Bangor" -> "Fangor"
        // But wait! Place names like "Bangor" usually mutate. 
        // "Caerdydd" -> "Gaerdydd".
        mutatedPhrase = mutateWord(basePhrase, mutationKind);
      }

      // 3. Construct Sentence
      const rawSent = `${pat.sentenceStart} ${mutatedPhrase}`;
      const cleanSent = applyContractions(rawSent);

      // 4. Determine Answer
      // The "Answer" should be the mutated word/phrase the user needs to type.
      // If the user types "i'r Eidal", the "answer" part depends on the prompt.
      // E.e. Prompt: "Dw i'n mynd i ..." + "Yr Eidal"
      // Expected: "i'r Eidal" or just "r Eidal"?
      // Standard App Architecture: 
      //  before: "Dw i'n mynd i"
      //  answer: "Fangor"
      // But for "i'r Eidal", "Dw i'n mynd" + "i'r Eidal"?
      
      // Let's stick to the App's convention:
      // The 'trigger' is usually the last word of 'before'.
      // But contraction merges trigger + answer.
      // Example: "Dw i'n mynd i" + "Yr Eidal" -> "Dw i'n mynd i'r Eidal"
      
      let finalBefore = pat.sentenceStart;
      let finalAnswer = mutatedPhrase;

      // Smart split for contractions
      if (cleanSent !== rawSent) {
          // If contraction happened (i + yr -> i'r), we need to adjust the split.
          // e.g. "Dw i'n mynd i'r Eidal"
          // We want the user to type "i'r Eidal"? Or just "Eidal"?
          // Typically in this app, 'before' is static.
          // If 'before' changes due to contraction, we must update it.
          
          // Heuristic: If pattern ends in 'i' and we contracted to "i'r", 
          // we might want to shift the 'i' into the answer?
          // OR, update 'before' to be "Dw i'n mynd" and answer "i'r Eidal".
          // This is complex. 
          
          // Robust Solution:
          // 'before': "Dw i'n mynd "
          // 'answer': "i'r Eidal" (if they type the whole phrase)
          // OR
          // 'before': "Dw i'n mynd i'r "
          // 'answer': "Eidal" (User just types noun)
          
          // Let's try to detect if the trigger (last word of prefix) got merged.
          const trigger = pat.sentenceStart.split(" ").pop(); // "i"
          if (cleanSent.includes(`${trigger}'r`)) {
             // e.g. "i'r" exists.
             // We'll set 'before' to the part BEFORE the trigger.
             const cutPoint = cleanSent.lastIndexOf(trigger + "'r");
             finalBefore = cleanSent.substring(0, cutPoint).trim(); // "Dw i'n mynd"
             finalAnswer = cleanSent.substring(cutPoint).trim();    // "i'r Eidal"
          } else {
             finalBefore = cleanSent.replace(mutatedPhrase, "").trim();
          }
      }

      cards.push({
        cardId: `${pat.id}-${word.base.replace(/\s+/g,'-')}`,
        family: pat.course || "general",
        category: pat.pack, // This connects to courses.js
        
        trigger: pat.sentenceStart.split(" ").slice(-1)[0],
        base: word.base,
        
        before: finalBefore,
        after: "", // Use empty unless pattern provides suffix
        
        outcome: mutationKind,
        answer: finalAnswer,
        
        translate: word.en,
        translateSent: pat.enTemplate.replace("{word}", word.en),
        ruleId: pat.ruleId
      });
    }
  }

  // Write Output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const csv = Papa.unparse(cards, { quotes: true });
  const outFile = path.join(OUTPUT_DIR, 'mynediad-v1.csv');
  fs.writeFileSync(outFile, csv);
  console.log(`✅ Generated ${cards.length} cards to ${outFile}`);
}

generateCards();
