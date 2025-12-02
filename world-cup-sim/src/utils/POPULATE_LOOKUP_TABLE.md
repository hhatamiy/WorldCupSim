# How to Populate the Knockout Algorithm Lookup Table

## Overview
The FIFA 2026 World Cup has 495 possible combinations of which 8 groups' third-place teams advance to the knockout stage. Each combination results in different Round of 32 matchups according to FIFA's official rules.

## Current Status
- The algorithm structure is in place in `knockoutAlgorithm.js`
- The lookup table (`MATCHUP_LOOKUP_TABLE`) is currently empty
- The system will fall back to a simplified algorithm if a combination is not found

## Steps to Populate

### 1. Open the PDF
Open `third place possibilities.pdf` in the project root directory.

### 2. Understand the Format
For each combination of 8 advancing groups, the PDF shows:
- Which 8 groups' third-place teams advanced (e.g., A, B, C, D, E, F, G, H)
- The resulting 16 Round of 32 matchups

### 3. Add Entries to the Lookup Table
For each combination in the PDF, add an entry to `MATCHUP_LOOKUP_TABLE` in `knockoutAlgorithm.js`:

```javascript
"ABCDEFGH": [
  // Match 1
  { team1: { type: 'winner', group: 'E' }, team2: { type: 'third', group: 'A' } },
  // Match 2
  { team1: { type: 'winner', group: 'I' }, team2: { type: 'third', group: 'C' } },
  // Match 3
  { team1: { type: 'runner', group: 'A' }, team2: { type: 'runner', group: 'B' } },
  // ... continue for all 16 matches
],
```

### 4. Key Format
- **Key**: Sorted string of 8 group letters (e.g., "ABCDEFGH")
- **Value**: Array of exactly 16 matchups

### 5. Team Types
- `{ type: 'winner', group: 'X' }` - Winner of Group X
- `{ type: 'runner', group: 'X' }` - Runner-up of Group X  
- `{ type: 'third', group: 'X' }` - Third-place team from Group X

### 6. Match Order
The 16 matchups should be in this order:
1. Match 1 (Left side, top quarter)
2. Match 2 (Left side, top quarter)
3. Match 3 (Left side, top quarter)
4. Match 4 (Left side, top quarter)
5. Match 5 (Left side, second quarter)
6. Match 6 (Left side, second quarter)
7. Match 7 (Left side, second quarter)
8. Match 8 (Left side, second quarter)
9. Match 9 (Right side, top quarter)
10. Match 10 (Right side, top quarter)
11. Match 11 (Right side, top quarter)
12. Match 12 (Right side, top quarter)
13. Match 13 (Right side, bottom quarter)
14. Match 14 (Right side, bottom quarter)
15. Match 15 (Right side, bottom quarter)
16. Match 16 (Right side, bottom quarter)

## Helper Script
You can use the `getAllCombinationKeys()` function exported from `knockoutAlgorithm.js` to get all 495 possible combination keys. This can help you:
- Generate a template structure
- Verify you haven't missed any combinations
- Create a checklist for data entry

## Testing
After adding entries:
1. Test with different combinations of advancing third-place teams
2. Verify the matchups match the PDF
3. Check that all 16 matchups are generated correctly

## Notes
- The lookup table can be populated incrementally
- Missing combinations will use the fallback algorithm
- Consider automating the data entry if the PDF is in a parseable format

