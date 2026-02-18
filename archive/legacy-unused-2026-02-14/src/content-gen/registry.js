// src/content-gen/registry.js
/**
 * THE VOCABULARY REGISTRY
 * 
 * Central hub for all vocabulary used in the generators.
 * Now points to the single Consolidated Vocab file from the Mynediad export.
 */

import { mynediadVocab } from './vocab/mynediad-vocab.js';

// Master dictionary of all known words
const ALL_VOCAB = [
  ...mynediadVocab
];

/**
 * Get vocabulary available up to a specific point in the course.
 * @param {Object} criteria
 * @param {number} criteria.maxUnit - The current unit (e.g., 4). Returns words from Units 1-4.
 * @param {string[]} criteria.types - Optional: ['noun', 'adj', 'phrase']
 * @returns {Array} List of vocab objects
 */
export function getAvailableVocab({ maxUnit, types }) {
  return ALL_VOCAB.filter(item => {
    // 1. Check Level
    if (item.unit > maxUnit) return false;
    
    // 2. Check Type
    if (types && !types.includes(item.type)) return false;
    
    return true;
  });
}
