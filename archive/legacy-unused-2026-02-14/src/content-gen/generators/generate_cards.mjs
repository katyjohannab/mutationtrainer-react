import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_ROOT = path.resolve(__dirname, '..'); // src/content-gen
const OUTPUT_DIR = path.resolve(__dirname, '../../../public/data/generated');

// 1. Import The Single Source of Truth
import { ALL_VOCAB, ALL_PATTERNS } from '../../data/curriculum/index.js';
import { GRAMMAR_RULES } from '../../data/rules.js';
import { mutateWord } from '../../utils/grammar.js'; // Use the correct export 'mutateWord'

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const OUTPUT_FILE = path.join(OUTPUT_DIR, 'mynediad-v2.csv');

console.log(`Loaded ${ALL_PATTERNS.length} patterns and ${ALL_VOCAB.length} vocab items.`);


/**
 * Helper: Normalise text for CSV (escape quotes, etc is handled by PapaParse)
 */
function clean(text) {
    if (!text) return "";
    return text.toString().trim();
}

/**
 * Apply Welsh contractions (e.g. i + yr -> i'r)
 */
function applyContractions(sentence) {
    if (!sentence) return "";
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
 * Main Generator Logic
 */
function generateCards() {
  const cards = [];

  for (const pat of ALL_PATTERNS) {
    // Each pattern MUST have templates array in new schema
    if (!pat.templates || !Array.isArray(pat.templates)) {
        console.warn(`Skipping pattern ${pat.id} (no templates)`);
        continue;
    }

    for (const tmpl of pat.templates) {
      // Find slot name (e.g. "{place}") -> "place"
      const slotMatch = tmpl.cy.match(/\{(\w+)\}/);
      if (!slotMatch) continue;
      const slotName = slotMatch[1];
      
      // 1. Find Candidates for this Slot
      const constraints = pat.constraints ? pat.constraints[slotName] : null;
      
      // Filter Vocab
      const candidates = ALL_VOCAB.filter(word => {
        if (!constraints) return false;

        // Recursive constraint matcher
        function matchConstraint(obj, constraint) {
          if (typeof constraint === 'object' && constraint !== null && !Array.isArray(constraint)) {
            return Object.entries(constraint).every(([key, val]) => matchConstraint(obj[key], val));
          }
          if (Array.isArray(constraint)) {
            // Accept if any value matches (for multi-class, e.g. ["place-town", "place-city"])
            return constraint.some(val => matchConstraint(obj, val));
          }
          // Fallback: direct equality
          return obj === constraint;
        }

        return matchConstraint(word, constraints);
      });

      // 2. Generate Card for each Candidate
      for (const word of candidates) {
        
        // Identify mutation required by pattern for this slot
        const mutationType = pat.mutation || "soft"; 

        let baseWord = word.base;
        let mutatedWord;
        let finalMutationType = mutationType;
        let explanationEn = null;
        let explanationCy = null;

        // Lookup Rule Explanation
        const ruleId = pat.ruleId;
        const ruleDef = GRAMMAR_RULES[ruleId];
        
        let whyEn = ruleDef ? ruleDef.en : "Mutation rule applied.";
        let whyCy = ruleDef ? ruleDef.cy : "Rheol treiglad yn berthnasol.";

        // VOWEL EXCEPTION LOGIC:
        // Mutations generally do not apply to words starting with a vowel.
        // We do NOT seek to mutate these, but we include them as "trick" questions to test rules.
        const isVowelStart = /^[aeiouwy]/i.test(baseWord);
        if (mutationType !== "none" && isVowelStart) {
             mutatedWord = baseWord;
             finalMutationType = "none";
             
             // Construct Enhanced Explanation
             const typeName = mutationType.charAt(0).toUpperCase() + mutationType.slice(1);
             const typeNameCy = mutationType === "soft" ? "Treiglad Meddal" : 
                                mutationType === "nasal" ? "Treiglad Trwynol" :
                                mutationType === "aspirate" ? "Treiglad Llaes" : "Treiglad";

             // "Typical rule... HOWEVER, X Mutation does not apply..."
             whyEn = `${whyEn} However, ${typeName} Mutation does not apply to words starting with a vowel.`;
             whyCy = `${whyCy} Fodd bynnag, dydy'r ${typeNameCy} ddim yn berthnasol i eiriau sy'n dechrau gyda llafariad.`;
        } else {
             // Standard Mutation
             mutatedWord = mutateWord(baseWord, mutationType);
        }
        
        // Always set the answer field to the mutated form (or base for 'none')
        const answer = mutatedWord;

        // Construct Sentence
        // Replace {slot} with mutated word
        let sentenceCy = tmpl.cy.replace(`{${slotName}}`, mutatedWord);
        let sentenceEn = tmpl.en.replace(`{${slotName}}`, word.en);

        // Determines Category for Advanced Filtering

        // Determines Category for Advanced Filtering
        // Priority: Pattern Category (Grammatical) -> Semantic Class -> POS -> "General"
        let category = pat.category; 
        if (!category) {
             const semantic = word.semantic_class === "none" ? null : word.semantic_class;
             category = semantic || word.pos || "General";
        }
        
        // SPLIT SENTENCE FOR CLOZE UI
        // We need 'Before' and 'After' so the UI looks like: "Dw i'n mynd i [ _____ ] ."
        // Logic: Find the mutated word in the sentence and split around it.
        // NOTE: This assumes the template contains the mutated word EXACTLY as generated.
        
        let before = "";
        let after = "";
        
        // Use a placeholder strategy to find position safely
        const tempPlaceholder = "___MUTATION_SLOT___";
        const tempSentence = tmpl.cy.replace(`{${slotName}}`, tempPlaceholder);
        // Apply contractions to the template structure if needed (rarely affects the slot boundary unless vowel)
        // Ideally we split on the placeholder
        const parts = tempSentence.split(tempPlaceholder);
        if (parts.length === 2) {
             before = applyContractions(parts[0]); // Apply contractions to the 'before' part ("i" + "yr" -> "i'r")
             after = parts[1];
        } else {
            // Fallback: entire sentence in before (bad UI but safe)
            before = sentenceCy; 
        }

        // Push Card
        cards.push({
          id: `${pat.id}-${word.id}`,
          course: "mynediad",      // Hardcoded for now, or from pat.course
          pack: pat.pack || "unit-1",
          
          trigger: clean(pat.trigger || pat.sentenceStart || ""), 
          base: clean(baseWord),
          category: clean(category), // EXPORT CATEGORY FOR FILTERS
          
          // MAP TO CLOZE FIELDS
          before: clean(before),
          after: clean(after),

          sentence_cy: clean(sentenceCy),
          sentence_en: clean(sentenceEn),
          
          answer: clean(answer),
          mutation: finalMutationType,  // Use the calculated mutation (e.g. "none" for vowels)
          ruleId: ruleId,
          explanation_en: clean(whyEn),
          explanation_cy: clean(whyCy),
          
          // Debugging / Traceability
          source_file: "generated.csv"
        });
      }
    }
  }
  return cards;
}

// Run Generation
const generatedCards = generateCards();
console.log(`Generated ${generatedCards.length} cards.`);

// Output to CSV
const csv = Papa.unparse(generatedCards, {
    quotes: true, // Quote all fields to be safe
});

const outputPath = path.join(OUTPUT_DIR, 'mynediad-v2.csv'); 
fs.writeFileSync(outputPath, csv, 'utf8');

console.log(`Successfully wrote to ${outputPath}`);
