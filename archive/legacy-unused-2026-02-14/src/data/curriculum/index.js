// src/data/curriculum/index.js
// Aggregator for all Curriculum Data
// This file serves as the Single Source of Truth for the Generator.

import { unit1_vocab, unit1_patterns } from './dictionary/unit1-south.js';
import { unit2_vocab, unit2_patterns } from './dictionary/unit2-south.js';

// Combine all VOCAB
export const ALL_VOCAB = [
  ...(unit1_vocab || []),
  ...(unit2_vocab || [])
];

// Combine all PATTERNS
// Note: Unit 2 patterns might currently be in the legacy mynediad-patterns.js file
// until we migrate them. For now, we only have Unit 1 patterns in the new format.
export const ALL_PATTERNS = [
  ...(unit1_patterns || []),
  ...(unit2_patterns || [])
];
