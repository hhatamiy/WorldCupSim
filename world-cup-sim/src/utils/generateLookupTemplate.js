/**
 * Helper script to generate a template structure for the lookup table
 * 
 * Run this in Node.js to generate a template with all 495 combinations
 * Usage: node generateLookupTemplate.js > lookupTemplate.js
 */

import { getAllCombinationKeys } from './knockoutAlgorithm.js';

const combinations = getAllCombinationKeys();

console.log('// Template for MATCHUP_LOOKUP_TABLE');
console.log('// Copy this structure and fill in the matchups from the PDF');
console.log('const MATCHUP_LOOKUP_TABLE = {');

combinations.forEach((key, index) => {
  console.log(`  // Combination ${index + 1} of 495`);
  console.log(`  "${key}": [`);
  console.log('    // TODO: Fill in 16 matchups from PDF');
  console.log('    // Format: { team1: { type: "winner"|"runner"|"third", group: "X" }, team2: { ... } }');
  for (let i = 1; i <= 16; i++) {
    console.log(`    // Match ${i}`);
    console.log(`    { team1: { type: 'TBD', group: 'TBD' }, team2: { type: 'TBD', group: 'TBD' } },`);
  }
  if (index < combinations.length - 1) {
    console.log('  ],');
  } else {
    console.log('  ]');
  }
  console.log('');
});

console.log('};');

