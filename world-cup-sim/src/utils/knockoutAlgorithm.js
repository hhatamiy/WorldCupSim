/**
 * FIFA 2026 World Cup Knockout Stage Algorithm
 * 
 * This file contains the algorithm for generating Round of 32 matchups
 * based on which 8 groups' third-place teams advance.
 * 
 * There are 495 different possible combinations, and each combination
 * results in different matchups according to FIFA's official rules.
 * 
 * The lookup table is generated from possibilities.csv using parseCSVToLookup.js
 */

import MATCHUP_LOOKUP_TABLE_DATA from './matchupLookupTable.js';

/**
 * Lookup table mapping combinations of advancing third-place groups to Round of 32 matchups
 * 
 * Key format: Sorted string of 8 group letters (e.g., "ABCDEFGH")
 * Value: Array of 16 matchups for Round of 32
 * 
 * Generated from possibilities.csv - contains all 495 combinations
 */
const MATCHUP_LOOKUP_TABLE = MATCHUP_LOOKUP_TABLE_DATA;

/**
 * Generate all possible combinations of 8 groups from 12 groups
 * This is a helper function to generate keys for the lookup table
 */
function generateAllCombinations() {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const combinations = [];
  
  function combine(start, combo) {
    if (combo.length === 8) {
      combinations.push([...combo].sort().join(''));
      return;
    }
    for (let i = start; i < groups.length; i++) {
      combo.push(groups[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  
  combine(0, []);
  return combinations;
}

/**
 * Get the lookup key from a set of advancing third-place groups
 */
function getLookupKey(advancingGroups) {
  return Array.from(advancingGroups).sort().join('');
}

/**
 * Fallback algorithm using the simplified priority-based approach
 * This is used when a combination is not found in the lookup table
 */
function generateMatchupsFallback(advancingGroups, groupWinners, runnersUp, thirdPlaceMap) {
  const roundOf32 = [];
  
  const getThirdPlace = (possibleGroups) => {
    for (const group of possibleGroups) {
      if (advancingGroups.has(group) && thirdPlaceMap[group]) {
        return thirdPlaceMap[group];
      }
    }
    return null;
  };

  // Match 1: Winner Group E vs 3rd (A/B/C/D/F)
  roundOf32.push({
    team1: groupWinners['E'] || 'TBD',
    team2: getThirdPlace(['A', 'B', 'C', 'D', 'F']) || 'TBD',
    winner: null
  });

  // Match 2: Winner Group I vs 3rd (C/D/F/G/H)
  roundOf32.push({
    team1: groupWinners['I'] || 'TBD',
    team2: getThirdPlace(['C', 'D', 'F', 'G', 'H']) || 'TBD',
    winner: null
  });

  // Match 3: Runner-up Group A vs Runner-up Group B
  roundOf32.push({
    team1: runnersUp['A'] || 'TBD',
    team2: runnersUp['B'] || 'TBD',
    winner: null
  });

  // Match 4: Winner Group F vs Runner-up Group C
  roundOf32.push({
    team1: groupWinners['F'] || 'TBD',
    team2: runnersUp['C'] || 'TBD',
    winner: null
  });

  // Match 5: Runner-up Group K vs Runner-up Group L
  roundOf32.push({
    team1: runnersUp['K'] || 'TBD',
    team2: runnersUp['L'] || 'TBD',
    winner: null
  });

  // Match 6: Winner Group H vs Runner-up Group J
  roundOf32.push({
    team1: groupWinners['H'] || 'TBD',
    team2: runnersUp['J'] || 'TBD',
    winner: null
  });

  // Match 7: Winner Group D vs 3rd (B/E/F/I/J)
  roundOf32.push({
    team1: groupWinners['D'] || 'TBD',
    team2: getThirdPlace(['B', 'E', 'F', 'I', 'J']) || 'TBD',
    winner: null
  });

  // Match 8: Winner Group G vs 3rd (A/E/H/I/J)
  roundOf32.push({
    team1: groupWinners['G'] || 'TBD',
    team2: getThirdPlace(['A', 'E', 'H', 'I', 'J']) || 'TBD',
    winner: null
  });

  // Match 9: Winner Group C vs 3rd (C/E/F/H/I)
  roundOf32.push({
    team1: groupWinners['C'] || 'TBD',
    team2: getThirdPlace(['C', 'E', 'F', 'H', 'I']) || 'TBD',
    winner: null
  });

  // Match 10: Runner-up Group F vs Runner-up Group E
  roundOf32.push({
    team1: runnersUp['F'] || 'TBD',
    team2: runnersUp['E'] || 'TBD',
    winner: null
  });

  // Match 11: Runner-up Group I vs Runner-up Group D
  roundOf32.push({
    team1: runnersUp['I'] || 'TBD',
    team2: runnersUp['D'] || 'TBD',
    winner: null
  });

  // Match 12: Winner Group A vs 3rd (E/H/I/J/K)
  roundOf32.push({
    team1: groupWinners['A'] || 'TBD',
    team2: getThirdPlace(['E', 'H', 'I', 'J', 'K']) || 'TBD',
    winner: null
  });

  // Match 13: Winner Group L vs 3rd (C/E/F/H/I)
  roundOf32.push({
    team1: groupWinners['L'] || 'TBD',
    team2: getThirdPlace(['C', 'E', 'F', 'H', 'I']) || 'TBD',
    winner: null
  });

  // Match 14: Runner-up Group H vs Runner-up Group G
  roundOf32.push({
    team1: runnersUp['H'] || 'TBD',
    team2: runnersUp['G'] || 'TBD',
    winner: null
  });

  // Match 15: Winner Group J vs 3rd (E/F/G/I/J)
  roundOf32.push({
    team1: groupWinners['J'] || 'TBD',
    team2: getThirdPlace(['E', 'F', 'G', 'I', 'J']) || 'TBD',
    winner: null
  });

  // Match 16: Winner Group K vs 3rd (D/E/I/J/L)
  roundOf32.push({
    team1: groupWinners['K'] || 'TBD',
    team2: getThirdPlace(['D', 'E', 'I', 'J', 'L']) || 'TBD',
    winner: null
  });

  return roundOf32;
}

/**
 * Main function to generate Round of 32 matchups
 * 
 * @param {Set<string>} advancingGroups - Set of group letters whose third-place teams advanced
 * @param {Object} groupWinners - Map of group letter to winner team name
 * @param {Object} runnersUp - Map of group letter to runner-up team name
 * @param {Object} thirdPlaceMap - Map of group letter to third-place team name
 * @returns {Array} Array of 16 matchups for Round of 32
 */
export function generateRoundOf32Matchups(advancingGroups, groupWinners, runnersUp, thirdPlaceMap) {
  const lookupKey = getLookupKey(advancingGroups);
  
  // Check if we have a specific matchup table entry for this combination
  if (MATCHUP_LOOKUP_TABLE[lookupKey]) {
    const matchupSpecs = MATCHUP_LOOKUP_TABLE[lookupKey];
    
    return matchupSpecs.map(spec => {
      const getTeam = (teamSpec) => {
        if (teamSpec.type === 'winner') {
          return groupWinners[teamSpec.group] || 'TBD';
        } else if (teamSpec.type === 'runner') {
          return runnersUp[teamSpec.group] || 'TBD';
        } else if (teamSpec.type === 'third') {
          return thirdPlaceMap[teamSpec.group] || 'TBD';
        }
        return 'TBD';
      };
      
      return {
        team1: getTeam(spec.team1),
        team2: getTeam(spec.team2),
        winner: null
      };
    });
  }
  
  // Fallback to simplified algorithm if lookup table doesn't have this combination
  console.warn(`No lookup table entry for combination: ${lookupKey}. Using fallback algorithm.`);
  return generateMatchupsFallback(advancingGroups, groupWinners, runnersUp, thirdPlaceMap);
}

/**
 * Helper function to get all possible combination keys
 * Useful for generating the lookup table structure
 */
export function getAllCombinationKeys() {
  return generateAllCombinations();
}

/**
 * Get the total number of possible combinations
 */
export function getTotalCombinations() {
  // C(12,8) = 495 combinations
  return 495;
}

