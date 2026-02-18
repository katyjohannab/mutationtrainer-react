import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Papa from 'papaparse';
import { mutateWord } from '../utils/grammar.js';
import { GRAMMAR_RULES } from '../data/rules.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CURRICULUM_DIR = path.resolve(__dirname, '../data/curriculum');
const DICT_DIR = path.join(CURRICULUM_DIR, 'dictionary');
const PATTERN_DIR = path.join(CURRICULUM_DIR, 'patterns');
const OUTPUT_DIR = path.resolve(__dirname, '../../public/data/generated');

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function loadModules(dir) {
    const items = [];
    if (!fs.existsSync(dir)) return items;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const fileUrl = pathToFileURL(fullPath).href;
        console.log(`Loading ${file}...`);
        try {
            const module = await import(fileUrl);
            // Assume module exports an array or object. 
            // We look for the first export that is an array, or just specific names.
            // Our files export named constants like 'places', 'patterns'.
            // Let's grab all arrays from exports.
            for (const key in module) {
                // strict check: only load 'patterns' or 'vocab' arrays, or check content
                // Easier: Just check if the key is 'patterns' or 'vocab' or the array contents are objects.
                // But for now, let's just filter for 'patterns' export in the patterns directory.
                if (key === 'patterns' && Array.isArray(module[key])) {
                    items.push(...module[key]);
                }
                // Fallback for dictionary files which might be named 'idioms', 'nouns' etc?
                // Actually dictionary files export e.g. 'unit1_vocab'.
                // Let's check if the first item is an object with 'structure' (for patterns) or 'id' (for dictionary).
                else if (Array.isArray(module[key]) && module[key].length > 0) {
                     const first = module[key][0];
                     if (first && typeof first === 'object' && !Array.isArray(first)) {
                         // It's an array of objects.
                         // Check if this is likely what we want.
                         // If we are loading patterns, we want objects with 'structure'.
                         // If we are loading dictionary, we want objects with 'id', 'pos'.
                         // But wait, the 'mutationTriggers' array contains strings.
                         if (typeof first === 'string') {
                             // Skip arrays of strings (like mutationTriggers)
                             continue;
                         }
                         items.push(...module[key]);
                     }
                }
            }
        } catch (e) {
            console.error(`Error loading ${file}:`, e);
        }
    }
    return items;
}

function applyContractions(text) {
    if (!text) return text;
    let s = text;
    
    // Prepositions + Definite Article (y / yr) -> 'r
    // Case insensitive? Usually lower case in sentences.
    const replacements = [
        { pattern: /\bi\s+(y|yr)\b/gi, replacement: "i'r" },
        { pattern: /\bo\s+(y|yr)\b/gi, replacement: "o'r" },
        { pattern: /\ba\s+(y|yr)\b/gi, replacement: "a'r" },
        { pattern: /\bâ\s+(y|yr)\b/gi, replacement: "â'r" },
        { pattern: /\bgyda\s+(y|yr)\b/gi, replacement: "gyda'r" },
        { pattern: /\btua\s+(y|yr)\b/gi, replacement: "tua'r" },
        { pattern: /\bmeun\s+(y|yr)\b/gi, replacement: "mewn" }, // correction: mewn y -> mewn? No, 'yn y'.
    ];

    replacements.forEach(r => {
        s = s.replace(r.pattern, r.replacement);
    });

    return s;
}

function generateStats(cards) {
    console.log(`Generated ${cards.length} cards.`);
    const units = {};
    cards.forEach(c => {
        const u = c.category || 'Unknown';
        units[u] = (units[u] || 0) + 1;
    });
    console.table(units);
}

function buildCard(pattern, word, slot) {
    // Construct the sentences
    let cySentence = "";
    let enSentence = "";
    let mutationType = slot.mutation || "none";
    
    // Calculate answer (mutated word)
    const baseWord = word.base;
    let mutatedWord = mutateWord(baseWord, mutationType);
    
    // Handle gender-specific adjustments if needed? 
    // Current simple builder assumes fixed text fits all.
    // If pattern has strict gender rules, we might need more logic.
    // Spec assumes 'text' + 'slot'.
    
    let beforeText = "";
    let afterText = "";
    
    // Assemble sentence parts
    let slotFound = false;
    
    for (const part of pattern.structure) {
        if (part.type === 'text') {
            const val = part.value || "";
            const valEn = part.en || "";
            
            if (!slotFound) {
                beforeText += (beforeText ? " " : "") + val;
            } else {
                afterText += (afterText ? " " : "") + val;
            }
            
            cySentence += (cySentence ? " " : "") + val;
            enSentence += (enSentence ? " " : "") + valEn;
        } else if (part.type === 'slot') {
            slotFound = true;
            // Add the word to the sentences
            cySentence += (cySentence ? " " : "") + mutatedWord;
            
            // For english, we use the word translation
            // If the word has 'en', use it.
            const wordEn = word.en || baseWord;
            
            // If the english fragment for the word needs an article "a/the", the dictionary usually contains it or not?
            // "coff" -> "coffee". "y dre" -> "the town".
            // So we just append.
            enSentence += (enSentence ? " " : "") + wordEn;
        }
    }
    
    // Get Rule info
    const rule = GRAMMAR_RULES[pattern.ruleId];
    const ruleEn = rule ? rule.en : "Mutation rule explanation missing.";
    const ruleCy = rule ? rule.cy : "Eglurhad treiglad ar goll.";
    
    // Final Polish
    beforeText = applyContractions(beforeText);
    afterText = applyContractions(afterText);
    
    return {
        cardId: `${pattern.id}-${word.id}`,
        family: pattern.id,       // Grouping by pattern
        category: `Unit ${pattern.unit}`, // Grouping by Unit
        unit: pattern.unit,       // Explicit Unit column for filtering
        trigger: pattern.ruleId,  // Maybe use rule ID as trigger column content? Or the trigger text?
                                  // Legacy uses trigger text (e.g. "i").
                                  // Here we'll use the Rule ID for strictness, or infer trigger words?
                                  // Let's use Rule ID to be precise.
        base: baseWord,
        before: beforeText,
        after: afterText,
        answer: mutatedWord,
        outcome: mutatedWord,     // Legacy field
        translate: word.en,
        translateSent: enSentence,
        why: ruleEn,
        whyCym: ruleCy,
        __source: "generated"
    };
}

async function main() {
    console.log("Starting Content Builder...");
    
    // Load pillars
    const dictionary = await loadModules(DICT_DIR);
    console.log(`Dictionary size: ${dictionary.length} words`);
    
    const patterns = await loadModules(PATTERN_DIR);
    console.log(`Pattern bank size: ${patterns.length} patterns`);
    
    const cards = [];
    
    // Build loop
    for (const pat of patterns) {
        // Find the slot definition in the pattern
        // Assumption: Single slot for now (per spec examples)
        const slot = pat.structure.find(p => p.type === 'slot');
        
        if (!slot) {
            console.warn(`Pattern ${pat.id} has no slot. Skipping.`);
            continue;
        }
        
        // Filter dictionary
        const candidates = dictionary.filter(word => {
            const f = slot.filter || {};

            // 1. Chronological Integrity (Word Unit <= Pattern Unit)
            // Default rule: Words cannot be from future units relative to the pattern.
            // But if filter.unit is specified, it overrides (enforcing exact match).
            if (f.unit) {
                if (word.unit !== f.unit) return false;
            } else {
                if ((word.unit || 999) > (pat.unit || 999)) return false;
            }

            // 2. Part of Speech (POS)
            // Support both old schema (slot.valid_pos) and new (slot.filter.pos)
            if (f.pos) {
                 if (word.pos !== f.pos) return false;
            } else if (slot.valid_pos && slot.valid_pos.length > 0) {
                 if (!slot.valid_pos.includes(word.pos)) return false;
            }

            // 3. Gender (New: essential for mutations)
            if (f.gender) {
                if (word.gender !== f.gender) return false;
            }

            // 4. Semantics
            // Support both schemas
            if (f.semantic) { // singular 'semantic' in some legacy?
                 if (word.semantic_class !== f.semantic) return false;
            }
            if (slot.valid_semantic && slot.valid_semantic.length > 0) {
                if (!slot.valid_semantic.includes(word.semantic_class)) return false;
            }

            // 5. Exclusions (New)
            if (slot.exclusion && slot.exclusion.includes(word.base)) return false;
            if (f.exclusion && f.exclusion.includes(word.base)) return false;
            
            // 6. Dialect Compatibility
            if (pat.dialect && pat.dialect.length > 0 && word.dialect && word.dialect.length > 0) {
                 const intersection = pat.dialect.filter(d => word.dialect.includes(d));
                 if (intersection.length === 0) return false;
            }
            
            return true;
        });
        
        console.log(`Pattern ${pat.id}: Found ${candidates.length} candidates.`);
        
        for (const word of candidates) {
            cards.push(buildCard(pat, word, slot));
        }
    }
    
    generateStats(cards);
    
    // Write CSV
    const csv = Papa.unparse(cards);
    const outFile = path.join(OUTPUT_DIR, 'generated.csv');
    fs.writeFileSync(outFile, csv);
    console.log(`Written to ${outFile}`);
}

main().catch(console.error);
