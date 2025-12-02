/**
 * Script to parse the CSV file and generate the lookup table
 * 
 * CSV Structure:
 * - Columns 2-13 (indices 1-12): Groups A-L showing which 8 groups' third-place teams advance
 * - Columns 14-21 (indices 13-20): Matchups showing which third-place teams play:
 *   "1A vs", "1B vs", "1D vs", "1E vs", "1G vs", "1I vs", "1K vs", "1L vs"
 * 
 * The CSV shows 8 matches where group winners play third-place teams.
 * The other 8 matches are fixed (runner-up vs runner-up or winner vs runner-up).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse CSV file and generate lookup table
 */
function parseCSVToLookupTable(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Skip header lines (lines 1-10 are headers)
  const dataLines = lines.slice(10).filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('T') && trimmed.split(',').length > 13;
  });
  
  const lookupTable = {};
  
  // Mapping from CSV matchup columns to Round of 32 match indices
  // Based on analysis of the CSV data pattern:
  // CSV columns: 1A (empty), 1B, 1D, 1E, 1G, 1I, 1K, 1L
  // These map to matches where group winners play third-place teams
  // The "1A" column is always empty and Match 12 (Winner A) is determined by priority
  const csvMatchMapping = [
    // Column 0 (1A): Always empty - Match 12 (Winner A) determined by priority rules
    { csvColIndex: 1, matchIndex: 6, winnerGroup: 'D' },   // 1B vs -> Match 7 (Winner D vs 3rd)
    { csvColIndex: 2, matchIndex: 0, winnerGroup: 'E' },    // 1D vs -> Match 1 (Winner E vs 3rd)
    { csvColIndex: 3, matchIndex: 7, winnerGroup: 'G' },   // 1E vs -> Match 8 (Winner G vs 3rd)
    { csvColIndex: 4, matchIndex: 1, winnerGroup: 'I' },   // 1G vs -> Match 2 (Winner I vs 3rd)
    { csvColIndex: 5, matchIndex: 15, winnerGroup: 'K' },  // 1I vs -> Match 16 (Winner K vs 3rd)
    { csvColIndex: 6, matchIndex: 12, winnerGroup: 'L' },  // 1K vs -> Match 13 (Winner L vs 3rd)
    { csvColIndex: 7, matchIndex: 14, winnerGroup: 'J' },  // 1L vs -> Match 15 (Winner J vs 3rd)
  ];
  
  // Fixed matches that don't depend on third-place teams
  // These are runner-up vs runner-up or winner vs runner-up matches
  const getFixedMatches = () => [
    { matchIndex: 2, team1: { type: 'runner', group: 'A' }, team2: { type: 'runner', group: 'B' } }, // Match 3
    { matchIndex: 3, team1: { type: 'winner', group: 'F' }, team2: { type: 'runner', group: 'C' } }, // Match 4
    { matchIndex: 4, team1: { type: 'runner', group: 'K' }, team2: { type: 'runner', group: 'L' } }, // Match 5
    { matchIndex: 5, team1: { type: 'winner', group: 'H' }, team2: { type: 'runner', group: 'J' } }, // Match 6
    { matchIndex: 9, team1: { type: 'runner', group: 'F' }, team2: { type: 'runner', group: 'E' } }, // Match 10
    { matchIndex: 10, team1: { type: 'runner', group: 'I' }, team2: { type: 'runner', group: 'D' } }, // Match 11
    { matchIndex: 13, team1: { type: 'runner', group: 'H' }, team2: { type: 'runner', group: 'G' } }, // Match 14
  ];
  
  // Matches that need third-place teams but aren't in CSV (determined by priority rules)
  // Match 8: Winner G vs 3rd (in CSV)
  // Match 9: Winner C vs 3rd (not in CSV, needs priority)
  // Match 15: Winner J vs 3rd (not in CSV, needs priority)
  
  dataLines.forEach((line, lineIndex) => {
    if (!line.trim()) return;
    
    // Parse CSV line (handling quoted fields)
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim());
    
    // Extract advancing groups (columns 2-13, indices 1-12)
    const advancingGroups = [];
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    for (let i = 1; i <= 12; i++) {
      if (columns[i] && columns[i].trim() && columns[i].trim() !== '') {
        advancingGroups.push(groupLetters[i - 1]);
      }
    }
    
    if (advancingGroups.length !== 8) {
      console.warn(`Row ${lineIndex + 11}: Expected 8 advancing groups, found ${advancingGroups.length}: ${advancingGroups.join(',')}`);
      return;
    }
    
    // Create lookup key (sorted)
    const lookupKey = advancingGroups.sort().join('');
    
    // Extract matchup values (columns 14-21, indices 13-20)
    const matchupValues = columns.slice(13, 21).map(v => v.trim());
    
    // Build the 16 matchups array
    const matchups = new Array(16);
    
    // Fill in fixed matches
    getFixedMatches().forEach(fixed => {
      matchups[fixed.matchIndex] = {
        team1: fixed.team1,
        team2: fixed.team2
      };
    });
    
    // Fill in matches from CSV
    csvMatchMapping.forEach(({ csvColIndex, matchIndex, winnerGroup }) => {
      const thirdPlaceValue = matchupValues[csvColIndex];
      if (thirdPlaceValue && thirdPlaceValue.startsWith('3')) {
        const thirdPlaceGroup = thirdPlaceValue.substring(1); // Extract group letter after "3"
        
        if (thirdPlaceGroup && /^[A-L]$/.test(thirdPlaceGroup)) {
          matchups[matchIndex] = {
            team1: { type: 'winner', group: winnerGroup },
            team2: { type: 'third', group: thirdPlaceGroup }
          };
        }
      }
    });
    
    // Fill in remaining third-place matches using priority rules
    // Match 9: Winner C vs 3rd (priority: C/E/F/H/I)
    const getThirdPlaceForMatch9 = () => {
      const priority = ['C', 'E', 'F', 'H', 'I'];
      for (const group of priority) {
        if (advancingGroups.includes(group)) {
          return group;
        }
      }
      return null;
    };
    
    // Match 12: Winner A vs 3rd (priority: E/H/I/J/K) - not in CSV, always determined by priority
    const getThirdPlaceForMatch12 = () => {
      const priority = ['E', 'H', 'I', 'J', 'K'];
      for (const group of priority) {
        if (advancingGroups.includes(group)) {
          return group;
        }
      }
      return null;
    };
    
    // Set Match 9 (index 8) - Winner C vs 3rd
    const match9Third = getThirdPlaceForMatch9();
    if (match9Third && !matchups[8]) {
      matchups[8] = {
        team1: { type: 'winner', group: 'C' },
        team2: { type: 'third', group: match9Third }
      };
    }
    
    // Set Match 12 (index 11) - Winner A vs 3rd (always determined by priority, not in CSV)
    const match12Third = getThirdPlaceForMatch12();
    if (match12Third && !matchups[11]) {
      matchups[11] = {
        team1: { type: 'winner', group: 'A' },
        team2: { type: 'third', group: match12Third }
      };
    }
    
    // Verify we have all 16 matches
    const validMatchups = matchups.filter(m => m !== undefined);
    if (validMatchups.length === 16) {
      lookupTable[lookupKey] = matchups;
    } else {
      console.warn(`Row ${lineIndex + 11}: Only ${validMatchups.length}/16 matchups found for key ${lookupKey}`);
      // Still add it, but mark as incomplete
      lookupTable[lookupKey] = matchups;
    }
  });
  
  return lookupTable;
}

/**
 * Generate JavaScript code for the lookup table
 */
function generateLookupTableCode(lookupTable) {
  let code = '/**\n';
  code += ' * FIFA 2026 Round of 32 Matchup Lookup Table\n';
  code += ' * Generated from possibilities.csv\n';
  code += ' * Key: Sorted string of 8 advancing group letters (e.g., "ABCDEFGH")\n';
  code += ' * Value: Array of 16 matchups in Round of 32 order\n';
  code += ' */\n\n';
  code += 'const MATCHUP_LOOKUP_TABLE = {\n';
  
  const keys = Object.keys(lookupTable).sort();
  keys.forEach((key, index) => {
    code += `  "${key}": [\n`;
    const matchups = lookupTable[key];
    matchups.forEach((matchup, matchIndex) => {
      if (matchup) {
        code += `    { team1: { type: '${matchup.team1.type}', group: '${matchup.team1.group}' }, team2: { type: '${matchup.team2.type}', group: '${matchup.team2.group}' } }`;
      } else {
        code += `    null // Missing matchup ${matchIndex + 1}`;
      }
      if (matchIndex < matchups.length - 1) {
        code += ',';
      }
      code += '\n';
    });
    code += '  ]';
    if (index < keys.length - 1) {
      code += ',';
    }
    code += '\n';
  });
  
  code += '};\n\n';
  code += 'export default MATCHUP_LOOKUP_TABLE;\n';
  
  return code;
}

// Main execution (when run as script)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1] && import.meta.url.endsWith(process.argv[1]);

if (isMainModule || process.argv[1]?.includes('parseCSVToLookup')) {
  const csvPath = path.join(process.cwd(), 'possibilities.csv');
  console.log('Parsing CSV file:', csvPath);
  
  try {
    const lookupTable = parseCSVToLookupTable(csvPath);
    console.log(`Generated lookup table with ${Object.keys(lookupTable).length} entries`);
    
    const code = generateLookupTableCode(lookupTable);
    const outputPath = path.join(process.cwd(), 'world-cup-sim/src/utils/matchupLookupTable.js');
    
    fs.writeFileSync(outputPath, code, 'utf-8');
    console.log('Lookup table written to:', outputPath);
    console.log('File size:', (code.length / 1024).toFixed(2), 'KB');
  } catch (error) {
    console.error('Error parsing CSV:', error);
    process.exit(1);
  }
}

export { parseCSVToLookupTable, generateLookupTableCode };
