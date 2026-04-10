import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoundOf32Matchups } from '../utils/knockoutAlgorithm';
import api from '../api/api';
import { getGroupMatchInfo, getKnockoutMatchInfo, getKnockoutMatchInfoById } from '../data/matchSchedule';
import './SimulatorPage.css';

// Team alternatives mapping for unqualified teams (removed; qualifiers confirmed)
/* const TEAM_ALTERNATIVES = {
  'Italy 🇮🇹': ['Italy 🇮🇹', 'Northern Ireland ☘️', 'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Bosnia and Herzegovina 🇧🇦'],
  'Ukraine 🇺🇦': ['Ukraine 🇺🇦', 'Sweden 🇸🇪', 'Poland 🇵🇱', 'Albania 🇦🇱'],
  'Turkey 🇹🇷': ['Turkey 🇹🇷', 'Romania 🇷🇴', 'Slovakia 🇸🇰', 'Kosovo 🇽🇰'],
  'Denmark 🇩🇰': ['Denmark 🇩🇰', 'North Macedonia 🇲🇰', 'Czechia 🇨🇿', 'Ireland 🇮🇪'],
  'Iraq 🇮🇶': ['Iraq 🇮🇶', 'Bolivia 🇧🇴', 'Suriname 🇸🇷'],
  'DR Congo 🇨🇩': ['DR Congo 🇨🇩', 'Jamaica 🇯🇲', 'New Caledonia 🇳🇨']
}; */

/*
// Helper to check if a team has alternatives (either is a key or is in any alternatives list)
function hasAlternatives(teamName) {
  if (TEAM_ALTERNATIVES.hasOwnProperty(teamName)) {
    return true;
  }
  // Check if the team is in any of the alternative lists
  for (const alternatives of Object.values(TEAM_ALTERNATIVES)) {
    if (alternatives.includes(teamName)) {
      return true;
    }
  }
  return false;
}

// Helper to get alternatives for a team (finds the original team key if current team is an alternative)
function getAlternatives(teamName) {
  // If it's a direct key, return its alternatives
  if (TEAM_ALTERNATIVES.hasOwnProperty(teamName)) {
    return TEAM_ALTERNATIVES[teamName];
  }
  // Otherwise, find which original team this belongs to
  for (const [originalTeam, alternatives] of Object.entries(TEAM_ALTERNATIVES)) {
    if (alternatives.includes(teamName)) {
      return alternatives;
    }
  }
  return [teamName];
}
*/

// Actual FIFA World Cup 2026 Groups (as drawn)
function initializeGroups() {
  const groups = {
    A: {
      teams: [
        { name: 'Mexico 🇲🇽', pot: 1, position: 1 },
        { name: 'South Africa 🇿🇦', pot: 2, position: 2 },
        { name: 'South Korea 🇰🇷', pot: 3, position: 3 },
        { name: 'Czechia 🇨🇿', pot: 4, position: 4 }
      ]
    },
    B: {
      teams: [
        { name: 'Canada 🇨🇦', pot: 1, position: 1 },
        { name: 'Bosnia and Herzegovina 🇧🇦', pot: 2, position: 2 },
        { name: 'Qatar 🇶🇦', pot: 3, position: 3 },
        { name: 'Switzerland 🇨🇭', pot: 4, position: 4 }
      ]
    },
    C: {
      teams: [
        { name: 'Brazil 🇧🇷', pot: 1, position: 1 },
        { name: 'Morocco 🇲🇦', pot: 2, position: 2 },
        { name: 'Haiti 🇭🇹', pot: 3, position: 3 },
        { name: 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', pot: 4, position: 4 }
      ]
    },
    D: {
      teams: [
        { name: 'United States 🇺🇸', pot: 1, position: 1 },
        { name: 'Paraguay 🇵🇾', pot: 2, position: 2 },
        { name: 'Australia 🇦🇺', pot: 3, position: 3 },
        { name: 'Turkey 🇹🇷', pot: 4, position: 4 }
      ]
    },
    E: {
      teams: [
        { name: 'Germany 🇩🇪', pot: 1, position: 1 },
        { name: 'Curaçao 🇨🇼', pot: 2, position: 2 },
        { name: 'Ivory Coast 🇨🇮', pot: 3, position: 3 },
        { name: 'Ecuador 🇪🇨', pot: 4, position: 4 }
      ]
    },
    F: {
      teams: [
        { name: 'Netherlands 🇳🇱', pot: 1, position: 1 },
        { name: 'Japan 🇯🇵', pot: 2, position: 2 },
        { name: 'Sweden 🇸🇪', pot: 3, position: 3 },
        { name: 'Tunisia 🇹🇳', pot: 4, position: 4 }
      ]
    },
    G: {
      teams: [
        { name: 'Belgium 🇧🇪', pot: 1, position: 1 },
        { name: 'Egypt 🇪🇬', pot: 2, position: 2 },
        { name: 'Iran 🇮🇷', pot: 3, position: 3 },
        { name: 'New Zealand 🇳🇿', pot: 4, position: 4 }
      ]
    },
    H: {
      teams: [
        { name: 'Spain 🇪🇸', pot: 1, position: 1 },
        { name: 'Cape Verde 🇨🇻', pot: 2, position: 2 },
        { name: 'Saudi Arabia 🇸🇦', pot: 3, position: 3 },
        { name: 'Uruguay 🇺🇾', pot: 4, position: 4 }
      ]
    },
    I: {
      teams: [
        { name: 'France 🇫🇷', pot: 1, position: 1 },
        { name: 'Senegal 🇸🇳', pot: 2, position: 2 },
        { name: 'Iraq 🇮🇶', pot: 3, position: 3 },
        { name: 'Norway 🇳🇴', pot: 4, position: 4 }
      ]
    },
    J: {
      teams: [
        { name: 'Argentina 🇦🇷', pot: 1, position: 1 },
        { name: 'Algeria 🇩🇿', pot: 2, position: 2 },
        { name: 'Austria 🇦🇹', pot: 3, position: 3 },
        { name: 'Jordan 🇯🇴', pot: 4, position: 4 }
      ]
    },
    K: {
      teams: [
        { name: 'Portugal 🇵🇹', pot: 1, position: 1 },
        { name: 'DR Congo 🇨🇩', pot: 2, position: 2 },
        { name: 'Uzbekistan 🇺🇿', pot: 3, position: 3 },
        { name: 'Colombia 🇨🇴', pot: 4, position: 4 }
      ]
    },
    L: {
      teams: [
        { name: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', pot: 1, position: 1 },
        { name: 'Croatia 🇭🇷', pot: 2, position: 2 },
        { name: 'Ghana 🇬🇭', pot: 3, position: 3 },
        { name: 'Panama 🇵🇦', pot: 4, position: 4 }
      ]
    }
  };
  
  return groups;
}

// Helper function to extract country name (remove emoji)
function extractCountryName(teamString) {
  if (!teamString) return '';
  let cleaned = teamString
    .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '')
    .replace(/🏴[󠁁-󠁿]*/gu, '')
    .trim();
  return cleaned;
}

// Helper function to extract flag emoji from team string
function extractFlag(teamString) {
  if (!teamString) return '';
  
  // Extract flag emoji (country flags or special flags like Scotland)
  const flagMatch = teamString.match(/[\u{1F1E6}-\u{1F1FF}]{2}|🏴[󠁁-󠁿]*/gu);
  return flagMatch ? flagMatch[0] : '';
}

// Helper function to format rank with proper ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
function formatRank(rank) {
  if (!rank || rank === null || rank === undefined) return '';
  
  const num = parseInt(rank);
  if (isNaN(num)) return rank;
  
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  // Special cases for 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }
  
  // Regular cases
  if (lastDigit === 1) return `${num}st`;
  if (lastDigit === 2) return `${num}nd`;
  if (lastDigit === 3) return `${num}rd`;
  return `${num}th`;
}

// Helper function to get full country name with flag (for final match)
function getFullCountryName(teamString) {
  if (!teamString) return '';
  // Return as-is (already includes flag emoji)
  return teamString;
}

// Calculate the top position for a matchup based on its round and index
// Each matchup should be positioned at the average Y position of its two parent matchups
function calculateMatchupTop(roundIndex, matchupIndex, totalMatchupsInRound, containerHeight = 1200) {
  if (roundIndex === 0) {
    // Round of 32: evenly space all matchups from top with more padding
    // Use a larger container height and add padding at top
    const topPadding = 20;
    const availableHeight = containerHeight - (topPadding * 2);
    const spacing = availableHeight / (totalMatchupsInRound - 1);
    return topPadding + (spacing * matchupIndex);
  } else {
    // For subsequent rounds, calculate based on parent matchups from previous round
    // Recursively get the actual positions of the parent matchups to ensure exact alignment
    const parentRoundMatchups = totalMatchupsInRound * 2; // Previous round has 2x matchups
    const parentRoundIndex = roundIndex - 1;
    
    // This matchup comes from parent matchups at indices (2*matchupIndex) and (2*matchupIndex + 1)
    const parent1Top = calculateMatchupTop(parentRoundIndex, 2 * matchupIndex, parentRoundMatchups, containerHeight);
    const parent2Top = calculateMatchupTop(parentRoundIndex, 2 * matchupIndex + 1, parentRoundMatchups, containerHeight);
    
    // Return the average - this positions the matchup exactly between its two parents
    return (parent1Top + parent2Top) / 2;
  }
}

// Helper function to get 3-letter country code for UI display (keeps flag emoji)
function getCountryCode(teamString) {
  if (!teamString) return '';
  
  // Extract flag emoji (country flags or special flags like Scotland)
  const flagMatch = teamString.match(/[\u{1F1E6}-\u{1F1FF}]{2}|🏴[󠁁-󠁿]*/gu);
  const flag = flagMatch ? flagMatch[0] : '';
  
  // Extract country name
  const countryName = extractCountryName(teamString);
  
  // Special cases for multi-word country names
  const specialCases = {
    'United States': 'USA',
    'DR Congo': 'DRC',
    'New Zealand': 'NZL',
    'South Africa': 'RSA',
    'South Korea': 'KOR',
    'Saudi Arabia': 'KSA',
    'Ivory Coast': 'CIV',
    'Cape Verde': 'CPV',
    'Bosnia and Herzegovina': 'BIH'
  };
  
  // Check if it's a special case
  if (specialCases[countryName]) {
    return flag ? `${flag} ${specialCases[countryName]}` : specialCases[countryName];
  }
  
  // For other multi-word names, use first letter of each word (up to 3 words)
  const words = countryName.split(/\s+/);
  let code;
  if (words.length > 1) {
    // Multi-word: use first letter of each word
    code = words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
    // Pad to 3 characters if needed
    if (code.length < 3 && words[0].length > 1) {
      code = (code + words[0].substring(1, 4 - code.length)).toUpperCase().substring(0, 3);
    }
  } else {
    // Single word: use first 3 letters
    code = countryName.substring(0, 3).toUpperCase();
  }
  
  // Return flag + code
  return flag ? `${flag} ${code}` : code;
}

// Generate a realistic number of goals with weighted probability
// Based on World Cup statistics: average ~2.7 goals/match, 70-80% have 0-3 total goals
// 4+ goals in 20-30%, 5+ goals rare, 6+ very rare, 7+ extremely rare, 10+ <0.1%
function generateGoals(isWinner = false, probStrength = 0.5) {
  const rand = Math.random();
  
  if (isWinner) {
    // Winner's goals - mostly 1-2 goals, occasionally 3, rarely 4+
    // Stronger teams (higher probStrength) slightly more likely to score more
    const strengthBonus = (probStrength - 0.5) * 0.1; // Small bonus for stronger teams
    
    if (rand < 0.45) return 1;  // 45% chance of 1 goal
    if (rand < 0.80) return 2;  // 35% chance of 2 goals (most common)
    if (rand < 0.95) return 3;  // 15% chance of 3 goals
    if (rand < 0.99 + strengthBonus) return 4;  // 4% chance of 4 goals
    if (rand < 0.999) return 5;  // 0.9% chance of 5 goals (very rare)
    return 6; // 0.1% chance of 6+ goals (extremely rare, like Germany 7-1 Brazil)
  } else {
    // Loser's goals - mostly 0-1 goals, occasionally 2, rarely 3+
    if (rand < 0.50) return 0;  // 50% chance of 0 goals (clean sheet)
    if (rand < 0.85) return 1;  // 35% chance of 1 goal
    if (rand < 0.97) return 2;  // 12% chance of 2 goals
    if (rand < 0.995) return 3; // 2.5% chance of 3 goals (rare)
    return 4; // 0.5% chance of 4+ goals (very rare)
  }
}

// Cap total goals to prevent unrealistic high-scoring matches
// Based on World Cup stats: 7+ total goals should be very rare (<1%), 8+ extremely rare
function capTotalGoals(goals1, goals2, maxTotal = 7) {
  const total = goals1 + goals2;
  if (total <= maxTotal) {
    return { goals1, goals2 };
  }
  
  // If total exceeds max, proportionally reduce both scores while maintaining winner
  const ratio = maxTotal / total;
  const newGoals1 = Math.max(1, Math.round(goals1 * ratio));
  const newGoals2 = Math.max(0, Math.round(goals2 * ratio));
  
  // Ensure winner still wins
  if (goals1 > goals2) {
    return { goals1: Math.max(newGoals1, newGoals2 + 1), goals2: newGoals2 };
  } else {
    return { goals1: newGoals1, goals2: Math.max(newGoals2, newGoals1 + 1) };
  }
}

// Generate a realistic score based on probabilities
function generateScore(team1Prob, team2Prob, drawProb, isKnockout = false) {
  const random = Math.random();
  
  if (isKnockout) {
    // Knockout: Allow 15-20% chance of going to penalties
    const penaltyChance = 0.15 + Math.random() * 0.05; // 15-20% chance
    
    // Adjust probabilities to account for penalties
    const adjustedTeam1Prob = team1Prob * (1 - penaltyChance);
    const adjustedTeam2Prob = team2Prob * (1 - penaltyChance);
    
    if (random < adjustedTeam1Prob) {
      // Team 1 wins in regular/extra time
      const goals1 = generateGoals(true, team1Prob);
      const goals2 = generateGoals(false, team2Prob);
      // Ensure team1 actually wins
      let actualGoals2 = goals2 >= goals1 ? goals1 - 1 : goals2;
      // Cap total goals to prevent unrealistic scores
      const capped = capTotalGoals(goals1, actualGoals2, 7);
      return { team1: capped.goals1, team2: Math.max(0, capped.goals2), isDraw: false, isPenalties: false };
    } else if (random < adjustedTeam1Prob + adjustedTeam2Prob) {
      // Team 2 wins in regular/extra time
      const goals2 = generateGoals(true, team2Prob);
      const goals1 = generateGoals(false, team1Prob);
      // Ensure team2 actually wins
      let actualGoals1 = goals1 >= goals2 ? goals2 - 1 : goals1;
      // Cap total goals to prevent unrealistic scores
      const capped = capTotalGoals(actualGoals1, goals2, 7);
      return { team1: Math.max(0, capped.goals1), team2: capped.goals2, isDraw: false, isPenalties: false };
    } else {
      // Goes to penalties (draw after extra time)
      // Generate a realistic draw score (0-0, 1-1, 2-2, rarely 3-3)
      const drawRand = Math.random();
      const drawScore = drawRand < 0.40 ? 0 : drawRand < 0.70 ? 1 : drawRand < 0.90 ? 2 : 3;
      
      // Generate realistic penalty shootout score
      // Penalty shootouts alternate, and the maximum difference is limited
      // Common scores: 3-2, 4-3, 5-4, 4-2, 5-3, 3-1, 4-1, 3-0 (very rare)
      const penaltyWinner = Math.random() < team1Prob / (team1Prob + team2Prob) ? 1 : 2;
      
      // Generate realistic penalty shootout result
      // Most shootouts are close (3-2, 4-3, 5-4), some have moderate differences (4-2, 5-3)
      // Large differences (3-1, 4-1, 3-0) are rare
      const shootoutRand = Math.random();
      let winnerPens, loserPens;
      
      if (shootoutRand < 0.35) {
        // Close shootout: 3-2 (most common)
        winnerPens = 3;
        loserPens = 2;
      } else if (shootoutRand < 0.55) {
        // Close shootout: 4-3
        winnerPens = 4;
        loserPens = 3;
      } else if (shootoutRand < 0.70) {
        // Close shootout: 5-4
        winnerPens = 5;
        loserPens = 4;
      } else if (shootoutRand < 0.82) {
        // Moderate difference: 4-2
        winnerPens = 4;
        loserPens = 2;
      } else if (shootoutRand < 0.90) {
        // Moderate difference: 5-3
        winnerPens = 5;
        loserPens = 3;
      } else if (shootoutRand < 0.96) {
        // Larger difference: 3-1
        winnerPens = 3;
        loserPens = 1;
      } else if (shootoutRand < 0.99) {
        // Larger difference: 4-1
        winnerPens = 4;
        loserPens = 1;
      } else {
        // Very rare: 3-0 (one team misses all first 3)
        winnerPens = 3;
        loserPens = 0;
      }
      
      return { 
        team1: drawScore, 
        team2: drawScore, 
        isDraw: true, 
        isPenalties: true, 
        penaltyWinner,
        penaltyScore1: penaltyWinner === 1 ? winnerPens : loserPens,
        penaltyScore2: penaltyWinner === 2 ? winnerPens : loserPens
      };
    }
  } else {
    // Group stage: can have draws
    if (random < team1Prob) {
      // Team 1 wins
      const goals1 = generateGoals(true, team1Prob);
      const goals2 = generateGoals(false, team2Prob);
      // Ensure team1 actually wins
      let actualGoals2 = goals2 >= goals1 ? goals1 - 1 : goals2;
      // Cap total goals to prevent unrealistic scores
      const capped = capTotalGoals(goals1, actualGoals2, 7);
      return { team1: capped.goals1, team2: Math.max(0, capped.goals2), isDraw: false };
    } else if (random < team1Prob + team2Prob) {
      // Team 2 wins
      const goals2 = generateGoals(true, team2Prob);
      const goals1 = generateGoals(false, team1Prob);
      // Ensure team2 actually wins
      let actualGoals1 = goals1 >= goals2 ? goals2 - 1 : goals1;
      // Cap total goals to prevent unrealistic scores
      const capped = capTotalGoals(actualGoals1, goals2, 7);
      return { team1: Math.max(0, capped.goals1), team2: capped.goals2, isDraw: false };
    } else {
      // Draw - both teams score the same
      const drawRand = Math.random();
      // Draws are usually low scoring: 0-0, 1-1, 2-2, rarely 3-3 or higher
      // Cap draws at 3-3 to keep total realistic (6 goals max for draws)
      let goals;
      if (drawRand < 0.35) goals = 0;
      else if (drawRand < 0.65) goals = 1;
      else if (drawRand < 0.85) goals = 2;
      else if (drawRand < 0.97) goals = 3;
      else goals = 3; // Cap at 3-3 (very rare, but 4-4 would be 8 total which is too high)
      
      return { team1: goals, team2: goals, isDraw: true };
    }
  }
}

function SimulatorPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(() => initializeGroups());
  const [groupStandings, setGroupStandings] = useState({});
  const [groupMatches, setGroupMatches] = useState({});
  const [thirdPlaceTeams, setThirdPlaceTeams] = useState([]);
  const [knockoutBracket, setKnockoutBracket] = useState(null);
  const [champion, setChampion] = useState(null);
  const [currentView, setCurrentView] = useState('groups');
  const [simulating, setSimulating] = useState(false);
  const [simulatedGroups, setSimulatedGroups] = useState(false);
  const [simulatedKnockout, setSimulatedKnockout] = useState(false);
  const [currentSimulatingStage, setCurrentSimulatingStage] = useState(null); // Track current stage being simulated
  const [selectedMatchInfo, setSelectedMatchInfo] = useState(null); // For match info modal
  const [activeTab, setActiveTab] = useState('info'); // Track current tab: 'info' or 'odds'
  const [bettingOdds, setBettingOdds] = useState(null); // Store fetched odds data
  const [oddsLoading, setOddsLoading] = useState(false); // Loading state for odds
  const [oddsError, setOddsError] = useState(null); // Error state for odds

  // Timezone preference state - load from localStorage or default to false (show match timezone)
  const [useLocalTimezone, setUseLocalTimezone] = useState(() => {
    const saved = localStorage.getItem('timezonePreference');
    return saved === 'true';
  });

  // Get user's timezone
  const getUserTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'America/New_York'; // Fallback
    }
  };

  // Map timezone abbreviations to IANA timezone identifiers
  const getTimezoneId = (abbrev) => {
    const timezoneMap = {
      'ET': 'America/New_York',      // Eastern Time
      'CT': 'America/Chicago',       // Central Time
      'PT': 'America/Los_Angeles',   // Pacific Time
      'MT': 'America/Denver'         // Mountain Time (if used)
    };
    return timezoneMap[abbrev] || 'America/New_York';
  };

  // Get timezone abbreviation from IANA identifier
  const getTimezoneAbbrev = (ianaId) => {
    const abbrevMap = {
      'America/New_York': 'ET',
      'America/Chicago': 'CT',
      'America/Los_Angeles': 'PT',
      'America/Denver': 'MT'
    };
    return abbrevMap[ianaId] || '';
  };

  // Convert time from match timezone to user's local timezone
  const convertToLocalTime = (dateString, kickoffTime, matchTimezone) => {
    if (!dateString || !matchTimezone || !useLocalTimezone) {
      return { time: kickoffTime, timezone: matchTimezone || '' };
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const [hours, minutes] = kickoffTime.split(':').map(Number);
      
      const matchTzId = getTimezoneId(matchTimezone);
      const userTzId = getUserTimezone();
      
      // Create a date string representing the match time
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      
      // Create a date object - we'll use a trick: create it as UTC, then adjust
      const testDate = new Date(`${dateStr}Z`);
      
      // Format this UTC date in match timezone to see what time it represents there
      const matchFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: matchTzId,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      let matchTimeStr = matchFormatter.format(testDate);
      let matchTimeParts = matchTimeStr.match(/(\d{1,2}):(\d{2})/);
      if (!matchTimeParts) {
        return { time: kickoffTime, timezone: matchTimezone || '' };
      }
      
      let currentMatchHour = parseInt(matchTimeParts[1]);
      let currentMatchMin = parseInt(matchTimeParts[2]);
      let currentMatchMinutes = currentMatchHour * 60 + currentMatchMin;
      let targetMatchMinutes = hours * 60 + minutes;
      
      // Calculate how many minutes to adjust
      let adjustmentMinutes = targetMatchMinutes - currentMatchMinutes;
      
      // Handle day boundaries
      if (adjustmentMinutes > 720) {
        adjustmentMinutes -= 1440; // Go back a day
      } else if (adjustmentMinutes < -720) {
        adjustmentMinutes += 1440; // Go forward a day
      }
      
      // Adjust the UTC date
      const adjustedDate = new Date(testDate.getTime() + adjustmentMinutes * 60000);
      
      // Format in user's timezone
      const userFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTzId,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const userTimeStr = userFormatter.format(adjustedDate);
      const userTimeParts = userTimeStr.match(/(\d{1,2}):(\d{2})/);
      
      if (userTimeParts) {
        const userHour = parseInt(userTimeParts[1]);
        const userMin = parseInt(userTimeParts[2]);
        return { 
          time: `${String(userHour).padStart(2, '0')}:${String(userMin).padStart(2, '0')}`, 
          timezone: getTimezoneAbbrev(userTzId)
        };
      }
    } catch (error) {
      console.error('Error converting timezone:', error);
    }
    
    return { time: kickoffTime, timezone: matchTimezone || '' };
  };

  // Save timezone preference to localStorage
  useEffect(() => {
    localStorage.setItem('timezonePreference', useLocalTimezone.toString());
  }, [useLocalTimezone]);

  // Helper function to parse date string correctly (avoid UTC timezone issues)
  const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone issues
  };

  const handleReset = () => {
    setGroups(initializeGroups());
    setGroupStandings({});
    setGroupMatches({});
    setThirdPlaceTeams([]);
    setKnockoutBracket(null);
    setChampion(null);
    setCurrentView('groups');
    setSimulatedGroups(false);
    setSimulatedKnockout(false);
    setCurrentSimulatingStage(null);
    setSelectedMatchInfo(null);
  };

  // Handle match click in group stage
  const handleMatchClick = (groupName, matchIndex, match) => {
    // Calculate overall match number if not already set
    const overallMatchNumber = match.matchNumber || getOverallMatchNumber(groupName, match.matchNumberInGroup || (matchIndex + 1));
    
    setSelectedMatchInfo({
      team1: match.team1,
      team2: match.team2,
      score1: match.score1,
      score2: match.score2,
      isDraw: match.isDraw,
      venue: match.venue,
      date: match.date,
      kickoffTime: match.kickoffTime,
      stage: `Group ${groupName}`,
      matchNumber: overallMatchNumber
    });
  };

  // Calculate overall match number for group stage matches
  // Maps group letter and match position (1-6) to actual match number from CSV
  const GROUP_MATCH_MAPPING = {
    'A': [1, 2, 25, 28, 53, 54],
    'B': [3, 8, 26, 27, 51, 52],
    'C': [5, 7, 29, 30, 49, 50],
    'D': [4, 6, 31, 32, 59, 60],
    'E': [9, 10, 33, 34, 55, 56],
    'F': [11, 12, 35, 36, 57, 58],
    'G': [15, 16, 39, 40, 63, 64],
    'H': [13, 14, 37, 38, 65, 66],
    'I': [17, 18, 41, 42, 61, 62],
    'J': [19, 20, 43, 44, 69, 70],
    'K': [23, 24, 47, 48, 71, 72],
    'L': [21, 22, 45, 46, 67, 68]
  };

  const getOverallMatchNumber = (groupName, matchNumberInGroup) => {
    if (!GROUP_MATCH_MAPPING[groupName] || matchNumberInGroup < 1 || matchNumberInGroup > 6) {
      return matchNumberInGroup;
    }
    return GROUP_MATCH_MAPPING[groupName][matchNumberInGroup - 1];
  };

  // Handle group card click to show all matches info
  const handleGroupCardClick = (groupName) => {
    const simulatedMatches = groupMatches[groupName] || [];
    const group = groups[groupName];
    
    // If matches have been simulated, use those
    if (simulatedMatches.length > 0) {
      // Sort matches by date and time (earliest first)
      const sortedMatches = [...simulatedMatches].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.kickoffTime}`);
        const dateB = new Date(`${b.date}T${b.kickoffTime}`);
        return dateA - dateB;
      });
      
      setSelectedMatchInfo({
        stage: `Group ${groupName}`,
        allMatches: sortedMatches
      });
    } else {
      // Before simulation, generate match list from schedule using current teams
      const teamNames = group.teams.map(t => t.name);
      const matchOrder = [
        [0, 1], // Match 1: Position 1 vs Position 2
        [2, 3], // Match 2: Position 3 vs Position 4
        [3, 1], // Match 3: Position 4 vs Position 2
        [0, 2], // Match 4: Position 1 vs Position 3
        [3, 0], // Match 5: Position 4 vs Position 1
        [1, 2]  // Match 6: Position 2 vs Position 3
      ];
      
      const scheduledMatches = matchOrder.map(([idx1, idx2], matchIdx) => {
        const matchNumberInGroup = matchIdx + 1;
        const overallMatchNumber = getOverallMatchNumber(groupName, matchNumberInGroup);
        const matchInfo = getGroupMatchInfo(`Group ${groupName}`, matchNumberInGroup);
        
        return {
          team1: teamNames[idx1],
          team2: teamNames[idx2],
          score1: null,
          score2: null,
          isDraw: null,
          venue: matchInfo.venue,
          date: matchInfo.date,
          kickoffTime: matchInfo.kickoffTime,
          timezone: matchInfo.timezone,
          matchNumber: overallMatchNumber,
          matchNumberInGroup: matchNumberInGroup
        };
      });
      
      // Sort matches by date and time (earliest first)
      scheduledMatches.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.kickoffTime}`);
        const dateB = new Date(`${b.date}T${b.kickoffTime}`);
        return dateA - dateB;
      });
      
      setSelectedMatchInfo({
        stage: `Group ${groupName}`,
        allMatches: scheduledMatches
      });
    }
  };

  // Get match ID based on bracket position
  const getMatchIdFromBracketPosition = (side, roundIndex, matchupIndex) => {
    if (side === 'final') {
      return 104; // Final is match 104
    } else if (side === 'thirdPlacePlayoff') {
      return 103; // Third Place is match 103
    }
    
    // Round of 32: left (73-80), right (81-88)
    // Round of 16: left (89-92), right (93-96)
    // Quarterfinals: left (97-98), right (99-100)
    // Semifinals: left (101), right (102)
    
    const matchIdMap = {
      'left': {
        0: 73 + matchupIndex,      // Round of 32: 73-80
        1: 89 + matchupIndex,      // Round of 16: 89-92
        2: 97 + matchupIndex,      // Quarterfinals: 97-98
        3: 101                     // Semifinals: 101
      },
      'right': {
        0: 81 + matchupIndex,      // Round of 32: 81-88
        1: 93 + matchupIndex,      // Round of 16: 93-96
        2: 99 + matchupIndex,      // Quarterfinals: 99-100
        3: 102                     // Semifinals: 102
      }
    };
    
    return matchIdMap[side]?.[roundIndex] || null;
  };

  // Fetch betting odds for a matchup
  const fetchMatchOdds = async (team1, team2) => {
    // Don't fetch if teams aren't set
    if (!team1 || !team2 || team1 === 'TBD' || team2 === 'TBD') {
      setBettingOdds(null);
      setOddsError('Teams must be set to view odds');
      setOddsLoading(false);
      return;
    }

    try {
      setOddsLoading(true);
      setOddsError(null);
      
      // Determine if this is a group stage match or knockout match
      const isGroupMatch = selectedMatchInfo?.stage?.startsWith('Group');
      const matchType = isGroupMatch ? 'group' : 'matchup';
      
      const response = await api.get('/api/betting/odds', {
        params: {
          team1: team1,
          team2: team2,
          type: matchType,
        },
      });

      setBettingOdds(response.data);
    } catch (err) {
      setOddsError(err.response?.data?.message || 'Failed to fetch betting odds');
      setBettingOdds(null);
      console.error('Error fetching odds:', err);
    } finally {
      setOddsLoading(false);
    }
  };

  // Handle knockout matchup click
  const handleKnockoutMatchupClick = (side, roundIndex, matchupIndex) => {
    if (!knockoutBracket) return;
    
    let matchup;
    if (side === 'final') {
      matchup = knockoutBracket.final[matchupIndex];
    } else if (side === 'thirdPlacePlayoff') {
      matchup = knockoutBracket.thirdPlacePlayoff ? knockoutBracket.thirdPlacePlayoff[matchupIndex] : null;
      if (!matchup) return;
    } else {
      matchup = knockoutBracket[side][roundIndex][matchupIndex];
    }

    const roundNames = {
      0: 'Round of 32',
      1: 'Round of 16',
      2: 'Quarterfinals',
      3: 'Semifinals',
    };
    
    const stageName = side === 'final' ? 'Final' : 
                     side === 'thirdPlacePlayoff' ? 'Third Place' : 
                     roundNames[roundIndex] || 'Round of 32';
    
    // Get match info from schedule using match ID
    const matchId = getMatchIdFromBracketPosition(side, roundIndex, matchupIndex);
    const matchInfo = matchId ? getKnockoutMatchInfoById(matchId) : getKnockoutMatchInfo(stageName, matchupIndex);
    
    // Show match info even if teams aren't set yet (before simulation)
    setSelectedMatchInfo({
      team1: matchup?.team1 || null,
      team2: matchup?.team2 || null,
      score1: matchup?.score1 || null,
      score2: matchup?.score2 || null,
      isPenalties: matchup?.isPenalties || false,
      penaltyScore1: matchup?.penaltyScore1 || null,
      penaltyScore2: matchup?.penaltyScore2 || null,
      winner: matchup?.winner || null,
      venue: matchInfo.venue,
      date: matchInfo.date,
      kickoffTime: matchInfo.kickoffTime,
      timezone: matchInfo.timezone || null,
      stage: stageName,
      matchId: matchInfo.matchId,
      description: matchInfo.description
    });
    
    // Reset tab and odds when opening modal
    setActiveTab('info');
    setBettingOdds(null);
    setOddsError(null);
  };

  // Fetch odds when switching to odds tab
  useEffect(() => {
    if (activeTab === 'odds' && selectedMatchInfo) {
      fetchMatchOdds(selectedMatchInfo.team1, selectedMatchInfo.team2);
    }
  }, [activeTab, selectedMatchInfo]);

  // Simulate all group stage matches
  const simulateGroupStage = async () => {
    setSimulating(true);
    const newStandings = {};
    const newMatches = {};

    try {
      // OPTIMIZATION: Fetch all odds in parallel first (instead of sequentially)
      console.log('[SIMULATION] Fetching all match odds in parallel...');
      const startTime = Date.now();
      
      const allMatchRequests = [];
      const matchMetadata = [];
      
      for (const groupName of Object.keys(groups)) {
        const group = groups[groupName];
        const teamNames = group.teams.map(t => t.name);
        
        const matchOrder = [
          [0, 1], // 1 vs 2
          [2, 3], // 3 vs 4
          [3, 1], // 4 vs 2
          [0, 2], // 1 vs 3
          [3, 0], // 4 vs 1
          [1, 2]  // 2 vs 3
        ];
        
        for (let matchIdx = 0; matchIdx < matchOrder.length; matchIdx++) {
          const [idx1, idx2] = matchOrder[matchIdx];
          const team1 = teamNames[idx1];
          const team2 = teamNames[idx2];
          
          matchMetadata.push({ groupName, team1, team2, matchIdx, teamNames });
          allMatchRequests.push(
            api.get('/api/betting/odds', {
              params: { team1, team2, type: 'group' }
            }).catch(err => {
              console.error(`Error fetching odds for ${team1} vs ${team2}:`, err);
              return null; // Return null on error to continue
            })
          );
        }
      }
      
      // Fetch all odds in parallel
      const allOddsResponses = await Promise.all(allMatchRequests);
      const fetchTime = Date.now() - startTime;
      console.log(`[SIMULATION] Fetched ${allOddsResponses.length} match odds in ${fetchTime}ms (parallel)`);
      
      // Now process all matches with pre-fetched odds
      let matchIndex = 0;
      for (const groupName of Object.keys(groups)) {
        const group = groups[groupName];
        const teamNames = group.teams.map(t => t.name);
        
        // Initialize standings for this group
        const standings = {};
        teamNames.forEach(team => {
          standings[team] = {
            team: team,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
          };
        });

        const matches = [];

        const matchOrder = [
          [0, 1], // 1 vs 2
          [2, 3], // 3 vs 4
          [3, 1], // 4 vs 2
          [0, 2], // 1 vs 3
          [3, 0], // 4 vs 1
          [1, 2]  // 2 vs 3
        ];

        // Process all 6 matches in FIFA's official order
        for (let matchIdx = 0; matchIdx < matchOrder.length; matchIdx++) {
          const [idx1, idx2] = matchOrder[matchIdx];
          const team1 = teamNames[idx1];
          const team2 = teamNames[idx2];
          const matchNumberInGroup = matchIdx + 1;
          const overallMatchNumber = getOverallMatchNumber(groupName, matchNumberInGroup);
          
          // Get match info from official schedule
          const matchInfo = getGroupMatchInfo(`Group ${groupName}`, matchNumberInGroup);

            try {
              // Use pre-fetched odds response
              const response = allOddsResponses[matchIndex++];
              if (!response) {
                throw new Error('No odds response available');
              }

              const odds = response.data;
              let team1Prob = 0.33;
              let team2Prob = 0.33;
              let drawProb = 0.34;

              // Extract probabilities from simulated odds
              if (odds.odds && odds.odds.length > 0) {
                const bookmaker = odds.odds[0];
                if (bookmaker.markets && bookmaker.markets.length > 0) {
                  const market = bookmaker.markets[0];
                  if (market.outcomes) {
                    market.outcomes.forEach(outcome => {
                      if (outcome.isPenalty) return;
                      const outcomeName = extractCountryName(outcome.name);
                      const team1Name = extractCountryName(team1);
                      const team2Name = extractCountryName(team2);
                      
                      if (outcomeName === team1Name) {
                        team1Prob = outcome.probability || 0.33;
                      } else if (outcomeName === team2Name) {
                        team2Prob = outcome.probability || 0.33;
                      } else if (outcome.name === 'Draw' || outcome.name === 'draw') {
                        drawProb = outcome.probability || 0.34;
                      }
                    });
                  }
                }
              }

              // Normalize probabilities
              const total = team1Prob + team2Prob + drawProb;
              if (total > 0) {
                team1Prob /= total;
                team2Prob /= total;
                drawProb /= total;
              }

              // Generate score
              const score = generateScore(team1Prob, team2Prob, drawProb, false);

              // Update standings
              standings[team1].played++;
              standings[team2].played++;
              standings[team1].goalsFor += score.team1;
              standings[team1].goalsAgainst += score.team2;
              standings[team2].goalsFor += score.team2;
              standings[team2].goalsAgainst += score.team1;

              if (score.isDraw) {
                standings[team1].draws++;
                standings[team2].draws++;
                standings[team1].points += 1;
                standings[team2].points += 1;
              } else if (score.team1 > score.team2) {
                standings[team1].wins++;
                standings[team2].losses++;
                standings[team1].points += 3;
              } else {
                standings[team2].wins++;
                standings[team1].losses++;
                standings[team2].points += 3;
              }

              matches.push({
                team1,
                team2,
                score1: score.team1,
                score2: score.team2,
                isDraw: score.isDraw,
                venue: matchInfo.venue,
                date: matchInfo.date,
                kickoffTime: matchInfo.kickoffTime,
                timezone: matchInfo.timezone,
                matchNumber: overallMatchNumber,
                matchNumberInGroup: matchNumberInGroup
              });
            } catch (error) {
              console.error(`Error simulating match ${team1} vs ${team2}:`, error);
              // Use default probabilities if API fails
              const score = generateScore(0.33, 0.33, 0.34, false);
              
              // Update standings even on error
              standings[team1].played++;
              standings[team2].played++;
              standings[team1].goalsFor += score.team1;
              standings[team1].goalsAgainst += score.team2;
              standings[team2].goalsFor += score.team2;
              standings[team2].goalsAgainst += score.team1;

              if (score.isDraw) {
                standings[team1].draws++;
                standings[team2].draws++;
                standings[team1].points += 1;
                standings[team2].points += 1;
              } else if (score.team1 > score.team2) {
                standings[team1].wins++;
                standings[team2].losses++;
                standings[team1].points += 3;
              } else {
                standings[team2].wins++;
                standings[team1].losses++;
                standings[team2].points += 3;
              }

              matches.push({
                team1,
                team2,
                score1: score.team1,
                score2: score.team2,
                isDraw: score.isDraw,
                venue: matchInfo.venue,
                date: matchInfo.date,
                kickoffTime: matchInfo.kickoffTime,
                timezone: matchInfo.timezone,
                matchNumber: overallMatchNumber,
                matchNumberInGroup: matchNumberInGroup
              });
            }
          }

        // Calculate goal differences
        Object.keys(standings).forEach(team => {
          standings[team].goalDifference = standings[team].goalsFor - standings[team].goalsAgainst;
        });

        // Sort standings: points, then goal difference, then goals for
        const sortedStandings = Object.values(standings).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });

        newStandings[groupName] = sortedStandings;
        newMatches[groupName] = matches;
      }

      setGroupStandings(newStandings);
      setGroupMatches(newMatches);
      setSimulatedGroups(true);

      // Calculate third place rankings (but don't navigate away)
      advanceToThirdPlace(newStandings, false);
    } catch (error) {
      console.error('Error simulating group stage:', error);
    } finally {
      setSimulating(false);
    }
  };

  // Advance teams to third place ranking
  const advanceToThirdPlace = (standings = groupStandings, navigateAway = true) => {
    const groupNames = Object.keys(groups);
    const thirdPlace = groupNames.map(groupName => {
      const groupStanding = standings[groupName];
      if (!groupStanding || groupStanding.length < 3) {
        return {
          groupName,
          team: groups[groupName].teams[2],
          points: 0,
          goalDifference: 0,
          goalsScored: 0
        };
      }
      const thirdPlaceTeam = groupStanding[2];
      return {
        groupName,
        team: { name: thirdPlaceTeam.team },
        points: thirdPlaceTeam.points,
        goalDifference: thirdPlaceTeam.goalDifference,
        goalsScored: thirdPlaceTeam.goalsFor
      };
    });

    // Sort by points, then goal difference, then goals scored
    thirdPlace.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsScored - a.goalsScored;
    });

    setThirdPlaceTeams(thirdPlace);
    if (navigateAway) {
      setCurrentView('third-place');
    }
  };

  // Generate knockout bracket
  const generateKnockoutBracket = () => {
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    const groupWinners = {};
    const runnersUp = {};
    const top8Third = thirdPlaceTeams.slice(0, 8);
    const thirdPlaceGroups = new Set(top8Third.map(item => item.groupName));
    
    groupNames.forEach(groupName => {
      if (groups[groupName] && groupStandings[groupName]) {
        const standings = groupStandings[groupName];
        if (standings.length >= 2) {
          groupWinners[groupName] = standings[0].team;
          runnersUp[groupName] = standings[1].team;
        }
      }
    });

    const thirdPlaceMap = {};
    top8Third.forEach(item => {
      thirdPlaceMap[item.groupName] = item.team.name;
    });

    const roundOf32 = generateRoundOf32Matchups(
      thirdPlaceGroups,
      groupWinners,
      runnersUp,
      thirdPlaceMap
    );

    const roundOf16 = Array(8).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null,
      score1: null,
      score2: null
    }));

    const quarterfinals = Array(4).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null,
      score1: null,
      score2: null
    }));

    const semifinals = Array(2).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null,
      score1: null,
      score2: null
    }));

    const final = [{
      team1: null,
      team2: null,
      winner: null,
      score1: null,
      score2: null
    }];

    const thirdPlacePlayoff = [{
      team1: null,
      team2: null,
      winner: null,
      score1: null,
      score2: null
    }];

    setKnockoutBracket({
      left: [
        roundOf32.slice(0, 8),
        roundOf16.slice(0, 4),
        quarterfinals.slice(0, 2),
        semifinals.slice(0, 1)
      ],
      right: [
        roundOf32.slice(8, 16),
        roundOf16.slice(4, 8),
        quarterfinals.slice(2, 4),
        semifinals.slice(1, 2)
      ],
      final: final,
      thirdPlacePlayoff: thirdPlacePlayoff
    });

    setCurrentView('bracket');
  };

  // Helper function to add smooth delay between stages
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Simulate knockout stage matches with smooth stage-by-stage progression
  const simulateKnockoutStage = async () => {
    if (!knockoutBracket) return;
    
    setSimulating(true);
    setSimulatedKnockout(true);

    try {
      const newBracket = {
        left: knockoutBracket.left.map(round => round.map(matchup => ({ ...matchup }))),
        right: knockoutBracket.right.map(round => round.map(matchup => ({ ...matchup }))),
        final: knockoutBracket.final.map(matchup => ({ ...matchup })),
        thirdPlacePlayoff: knockoutBracket.thirdPlacePlayoff ? knockoutBracket.thirdPlacePlayoff.map(matchup => ({ ...matchup })) : [{ team1: null, team2: null, winner: null, score1: null, score2: null }]
      };

      // Stage 1: Simulate Round of 32
      setCurrentSimulatingStage('Round of 32');
      await simulateRound(newBracket, 'left', 0);
      await simulateRound(newBracket, 'right', 0);
      setKnockoutBracket({ ...newBracket }); // Update UI after Round of 32
      await delay(800); // Smooth transition delay

      // Stage 2: Simulate Round of 16
      setCurrentSimulatingStage('Round of 16');
      await simulateRound(newBracket, 'left', 1);
      await simulateRound(newBracket, 'right', 1);
      setKnockoutBracket({ ...newBracket }); // Update UI after Round of 16
      await delay(800); // Smooth transition delay

      // Stage 3: Simulate Quarterfinals
      setCurrentSimulatingStage('Quarterfinals');
      await simulateRound(newBracket, 'left', 2);
      await simulateRound(newBracket, 'right', 2);
      setKnockoutBracket({ ...newBracket }); // Update UI after Quarterfinals
      await delay(800); // Smooth transition delay

      // Stage 4: Simulate Semifinals
      setCurrentSimulatingStage('Semifinals');
      await simulateRound(newBracket, 'left', 3);
      await simulateRound(newBracket, 'right', 3);
      setKnockoutBracket({ ...newBracket }); // Update UI after Semifinals
      await delay(800); // Smooth transition delay

      // Stage 5: Simulate Third Place Playoff (if applicable)
      if (newBracket.thirdPlacePlayoff && newBracket.thirdPlacePlayoff[0].team1 && newBracket.thirdPlacePlayoff[0].team2) {
        setCurrentSimulatingStage('Third Place');
        await simulateRound(newBracket, 'thirdPlacePlayoff', 0);
        setKnockoutBracket({ ...newBracket });
        await delay(600); // Shorter delay for third place
      }

      // Stage 6: Simulate Final
      setCurrentSimulatingStage('Final');
      await simulateRound(newBracket, 'final', 0);
      setKnockoutBracket({ ...newBracket }); // Final update
      
      if (newBracket.final[0].winner) {
        setChampion(newBracket.final[0].winner);
      }
      
      setCurrentSimulatingStage(null); // Clear stage indicator
    } catch (error) {
      console.error('Error simulating knockout stage:', error);
      setCurrentSimulatingStage(null);
    } finally {
      setSimulating(false);
    }
  };

  const simulateRound = async (bracket, side, roundIndex) => {
    const round = side === 'final' ? bracket.final : (side === 'thirdPlacePlayoff' ? bracket.thirdPlacePlayoff : bracket[side][roundIndex]);
    
    // Determine stage name for match info lookup
    let stageName = '';
    if (side === 'final') {
      stageName = 'Final';
    } else if (side === 'thirdPlacePlayoff') {
      stageName = 'Third Place';
    } else {
      const roundNames = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals'];
      stageName = roundNames[roundIndex] || 'Round of 32';
    }
    
    // OPTIMIZATION: Fetch all odds for this round in parallel (like group stage)
    console.log(`[KNOCKOUT] Fetching odds for ${stageName} (${round.length} matches) in parallel...`);
    const oddsRequests = [];
    const matchMetadata = [];
    
    for (let i = 0; i < round.length; i++) {
      const matchup = round[i];
      if (!matchup.team1 || !matchup.team2 || matchup.winner) {
        oddsRequests.push(Promise.resolve(null)); // Skip if teams not set or already simulated
        matchMetadata.push({ skip: true });
        continue;
      }
      
      const cleanTeam1 = extractCountryName(matchup.team1);
      const cleanTeam2 = extractCountryName(matchup.team2);
      
      matchMetadata.push({ 
        matchup, 
        cleanTeam1, 
        cleanTeam2,
        index: i,
        skip: false
      });
      
      oddsRequests.push(
        api.get('/api/betting/odds', {
          params: {
            team1: cleanTeam1,
            team2: cleanTeam2,
            type: 'matchup',
          },
        }).catch(err => {
          console.error(`Error fetching odds for ${cleanTeam1} vs ${cleanTeam2}:`, err);
          return null;
        })
      );
    }
    
    // Fetch all odds in parallel
    const allOddsResponses = await Promise.all(oddsRequests);
    console.log(`[KNOCKOUT] Fetched ${allOddsResponses.length} odds responses for ${stageName}`);
    
    // Now process all matches with pre-fetched odds
    for (let i = 0; i < round.length; i++) {
      const metadata = matchMetadata[i];
      if (metadata.skip) continue;
      
      const matchup = metadata.matchup;
      const response = allOddsResponses[i];
      
      // Get match info from schedule
      const matchInfo = getKnockoutMatchInfo(stageName);

      try {
        let team1Prob = 0.5;
        let team2Prob = 0.5;

        if (response && response.data) {
          const odds = response.data;
          if (odds.odds && odds.odds.length > 0) {
            const bookmaker = odds.odds[0];
            if (bookmaker.markets && bookmaker.markets.length > 0) {
              const market = bookmaker.markets[0];
              if (market.outcomes) {
                market.outcomes.forEach(outcome => {
                  if (outcome.isPenalty) return;
                  const outcomeName = extractCountryName(outcome.name);
                  
                  if (outcomeName === metadata.cleanTeam1) {
                    team1Prob = outcome.probability || 0.5;
                  } else if (outcomeName === metadata.cleanTeam2) {
                    team2Prob = outcome.probability || 0.5;
                  }
                });
              }
            }
          }
        }

        const total = team1Prob + team2Prob;
        if (total > 0) {
          team1Prob /= total;
          team2Prob /= total;
        }

        const score = generateScore(team1Prob, team2Prob, 0, true);
        
        matchup.score1 = score.team1;
        matchup.score2 = score.team2;
        matchup.isPenalties = score.isPenalties;
        
        // Add match info
        matchup.venue = matchInfo.venue;
        matchup.date = matchInfo.date;
        matchup.kickoffTime = matchInfo.kickoffTime;
        
        if (score.isPenalties) {
          matchup.penaltyScore1 = score.penaltyScore1;
          matchup.penaltyScore2 = score.penaltyScore2;
          matchup.winner = score.penaltyWinner === 1 ? matchup.team1 : matchup.team2;
        } else if (score.team1 > score.team2) {
          matchup.winner = matchup.team1;
        } else {
          matchup.winner = matchup.team2;
        }

        // Advance winner to next round
        if (side === 'final') {
          // Final winner is the champion
          continue;
        }

        if (side === 'thirdPlacePlayoff') {
          // Third place playoff winner is determined, no advancement needed
          continue;
        }

        const nextRoundIndex = roundIndex + 1;
        if (nextRoundIndex >= bracket[side].length) {
          // This is the semifinal - winners go to final, losers go to third place playoff
          // Winner goes to final
          const finalMatchup = bracket.final[0];
          const finalPosition = side === 'left' ? 'team1' : 'team2';
          if (!finalMatchup[finalPosition]) {
            finalMatchup[finalPosition] = matchup.winner;
          }
          
          // Loser goes to third place playoff
          const losingTeam = matchup.team1 === matchup.winner ? matchup.team2 : matchup.team1;
          if (losingTeam) {
            if (!bracket.thirdPlacePlayoff) {
              bracket.thirdPlacePlayoff = [{ team1: null, team2: null, winner: null, score1: null, score2: null }];
            }
            const thirdPlaceMatchup = bracket.thirdPlacePlayoff[0];
            const thirdPlacePosition = side === 'left' ? 'team1' : 'team2';
            if (!thirdPlaceMatchup[thirdPlacePosition]) {
              thirdPlaceMatchup[thirdPlacePosition] = losingTeam;
            }
          }
        } else {
          const nextMatchupIndex = Math.floor(i / 2);
          const nextMatchup = bracket[side][nextRoundIndex][nextMatchupIndex];
          const positionInNextMatchup = i % 2 === 0 ? 'team1' : 'team2';
          if (!nextMatchup[positionInNextMatchup]) {
            nextMatchup[positionInNextMatchup] = matchup.winner;
          }
        }
      } catch (error) {
        console.error(`Error simulating matchup:`, error);
        // Default: team1 wins
        matchup.score1 = 1;
        matchup.score2 = 0;
        matchup.winner = matchup.team1;
        
        // Still need to advance winner even on error
        if (side !== 'final' && side !== 'thirdPlacePlayoff') {
          const nextRoundIndex = roundIndex + 1;
          if (nextRoundIndex >= bracket[side].length) {
            const finalMatchup = bracket.final[0];
            const finalPosition = side === 'left' ? 'team1' : 'team2';
            if (!finalMatchup[finalPosition]) {
              finalMatchup[finalPosition] = matchup.winner;
            }
            const losingTeam = matchup.team2;
            if (losingTeam) {
              if (!bracket.thirdPlacePlayoff) {
                bracket.thirdPlacePlayoff = [{ team1: null, team2: null, winner: null, score1: null, score2: null }];
              }
              const thirdPlaceMatchup = bracket.thirdPlacePlayoff[0];
              const thirdPlacePosition = side === 'left' ? 'team1' : 'team2';
              if (!thirdPlaceMatchup[thirdPlacePosition]) {
                thirdPlaceMatchup[thirdPlacePosition] = losingTeam;
              }
            }
          } else {
            const nextMatchupIndex = Math.floor(i / 2);
            const nextMatchup = bracket[side][nextRoundIndex][nextMatchupIndex];
            const positionInNextMatchup = i % 2 === 0 ? 'team1' : 'team2';
            if (!nextMatchup[positionInNextMatchup]) {
              nextMatchup[positionInNextMatchup] = matchup.winner;
            }
          }
        }
      }
    }
  };

  // Determine which teams are qualified
  const getQualifiedTeams = () => {
    const qualified = new Set();
    Object.keys(groupStandings).forEach(groupName => {
      const standings = groupStandings[groupName];
      if (standings.length >= 2) {
        qualified.add(standings[0].team); // Winner
        qualified.add(standings[1].team); // Runner-up
      }
    });
    // Add top 8 third place teams
    thirdPlaceTeams.slice(0, 8).forEach(item => {
      qualified.add(item.team.name);
    });
    return qualified;
  };

  const qualifiedTeams = getQualifiedTeams();

  return (
    <div className="simulator-container">
      <header className="simulator-header">
        <h1>World Cup 2026 Simulator</h1>
        <div className="header-actions">
          <button
            onClick={() => navigate('/predictor')}
            className="nav-btn"
          >
            Predictor
          </button>
          <button
            onClick={() => navigate('/fixtures')}
            className="nav-btn"
          >
            Fixtures
          </button>
          <button
            onClick={() => setCurrentView('groups')}
            className={`view-btn ${currentView === 'groups' ? 'active' : ''}`}
          >
            Group Stage
          </button>
          {knockoutBracket && (
            <button
              onClick={() => setCurrentView('bracket')}
              className={`view-btn ${currentView === 'bracket' ? 'active' : ''}`}
            >
              Knockout Bracket
            </button>
          )}
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>
      </header>

      <div className="content-container">
        {currentView === 'groups' && (
          <div className="groups-section">
            <h2>Group Stage</h2>
            <p className="instruction-text">
              {simulatedGroups 
                ? 'Group stage has been simulated. Qualified teams are highlighted in green.'
                : 'Click "Simulate Group Stage" to simulate all matches and calculate standings.'}
            </p>
            
            <div className="action-section">
              <button 
                onClick={simulateGroupStage} 
                className="simulate-btn"
                disabled={simulating}
              >
                {simulating ? 'Simulating...' : 'Simulate Group Stage'}
              </button>
            </div>

            <div className="groups-grid">
              {Object.keys(groups).map((groupName) => {
                const standings = groupStandings[groupName] || groups[groupName].teams.map((t, idx) => ({
                  team: t.name,
                  position: idx + 1
                }));
                const matches = groupMatches[groupName] || [];

                return (
                  <div 
                    key={groupName} 
                    className="group-card clickable-group"
                    onClick={() => handleGroupCardClick(groupName)}
                    title="Click for more info"
                  >
                    <h3>Group {groupName}</h3>
                    {simulatedGroups && standings.length > 0 && (
                      <div className="standings-table">
                        <div className="standings-header">
                          <div>Team</div>
                          <div>P</div>
                          <div>W</div>
                          <div>D</div>
                          <div>L</div>
                          <div>GF</div>
                          <div>GA</div>
                          <div>GD</div>
                          <div>Pts</div>
                        </div>
                        {standings.map((team, index) => {
                          const isQualified = qualifiedTeams.has(team.team);
                          return (
                            <div
                              key={index}
                              className={`standings-row ${isQualified ? 'qualified' : ''}`}
                            >
                              <div className="team-cell">
                                <span className="position-number">{index + 1}.</span>
                                <span className="team-name">{getCountryCode(team.team)}</span>
                              </div>
                              <div>{team.played || 0}</div>
                              <div>{team.wins || 0}</div>
                              <div>{team.draws || 0}</div>
                              <div>{team.losses || 0}</div>
                              <div>{team.goalsFor || 0}</div>
                              <div>{team.goalsAgainst || 0}</div>
                              <div>{team.goalDifference >= 0 ? '+' : ''}{team.goalDifference || 0}</div>
                              <div className="points-cell">{team.points || 0}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!simulatedGroups && (
                      <div className="group-teams">
                        {groups[groupName].teams.map((team, index) => (
                          <div key={index} className={`group-team pot-${team.pot}`}>
                            <span className="position-number">{index + 1}.</span>
                            <span className="team-name">{team.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {simulatedGroups && matches.length > 0 && (
                      <div className="matches-section">
                        <h4>Matches</h4>
                        {matches.map((match, idx) => (
                          <div 
                            key={idx} 
                            className="match-result clickable-match"
                            onClick={() => handleMatchClick(groupName, idx, match)}
                            title="Click for more info"
                          >
                            {getCountryCode(match.team1)} {match.score1 ?? 0} - {match.score2 ?? 0} {getCountryCode(match.team2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Third Place Rankings - shown at bottom of group stage when simulated */}
            {simulatedGroups && thirdPlaceTeams.length > 0 && (
              <div className="third-place-section-inline">
                <h2>Third Place Teams Ranking</h2>
                <p className="instruction-text">Top 8 teams will advance to the knockout stage</p>
                
                <div className="third-place-table">
                  {thirdPlaceTeams.map((item, index) => (
                    <React.Fragment key={index}>
                      <div
                        className={`third-place-row ${index < 8 ? 'qualified' : 'eliminated'}`}
                      >
                        <div className="rank-number">{index + 1}</div>
                        <div className="team-info">
                          <span className="group-label">Group {item.groupName}</span>
                          <span className="team-name">{item.team.name}</span>
                        </div>
                        <div className="team-stats">
                          <div className="stat-item">
                            <span className="stat-label">Pts:</span>
                            <span className="stat-value">{item.points}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">GD:</span>
                            <span className="stat-value">{item.goalDifference >= 0 ? '+' : ''}{item.goalDifference}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">GF:</span>
                            <span className="stat-value">{item.goalsScored}</span>
                          </div>
                        </div>
                      </div>
                      {index === 7 && (
                        <div className="qualification-separator">
                          <div className="separator-line"></div>
                          <div className="separator-label">Qualification Line</div>
                          <div className="separator-line"></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="action-section">
                  <button onClick={generateKnockoutBracket} className="advance-btn">
                    Generate Knockout Bracket
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'third-place' && (
          <div className="third-place-section">
            <h2>Rank Third Place Teams</h2>
            <p className="instruction-text">Top 8 teams will advance to the knockout stage</p>
            
            <div className="third-place-table">
              {thirdPlaceTeams.map((item, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`third-place-row ${index < 8 ? 'qualified' : 'eliminated'}`}
                  >
                    <div className="rank-number">{index + 1}</div>
                    <div className="team-info">
                      <span className="group-label">Group {item.groupName}</span>
                      <span className="team-name">{item.team.name}</span>
                    </div>
                    <div className="team-stats">
                      <div className="stat-item">
                        <span className="stat-label">Pts:</span>
                        <span className="stat-value">{item.points}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">GD:</span>
                        <span className="stat-value">{item.goalDifference >= 0 ? '+' : ''}{item.goalDifference}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">GF:</span>
                        <span className="stat-value">{item.goalsScored}</span>
                      </div>
                    </div>
                  </div>
                  {index === 7 && (
                    <div className="qualification-separator">
                      <div className="separator-line"></div>
                      <div className="separator-label">Qualification Line</div>
                      <div className="separator-line"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="action-section">
              <button onClick={generateKnockoutBracket} className="advance-btn">
                Generate Knockout Bracket
              </button>
            </div>
          </div>
        )}

        {currentView === 'bracket' && knockoutBracket && (
          <div className="bracket-section">
            <h2>Knockout Stage</h2>

            <div className="bracket-tree">
              {/* Left Half */}
              <div className="bracket-half bracket-left">
                {[...knockoutBracket.left].reverse().map((round, reversedRoundIndex) => {
                  const roundIndex = knockoutBracket.left.length - 1 - reversedRoundIndex;
                  return (
                    <div key={roundIndex} className={`round round-${roundIndex + 1}`}>
                      <div className="round-label">
                        {roundIndex === 0 && 'Round of 32'}
                        {roundIndex === 1 && 'Round of 16'}
                        {roundIndex === 2 && 'Quarterfinals'}
                        {roundIndex === 3 && 'Semifinals'}
                      </div>
                      <div className={`round-matchups-${roundIndex + 1}`}>
                        {round.map((matchup, matchupIndex) => {
                          const topPosition = calculateMatchupTop(roundIndex, matchupIndex, round.length);
                          return (
                          <div 
                            key={matchupIndex} 
                            className="matchup-wrapper"
                            style={{ position: 'absolute', top: `${topPosition}px` }}
                          >
                            <div 
                              className="matchup clickable-matchup"
                              onClick={() => {
                                handleKnockoutMatchupClick('left', roundIndex, matchupIndex);
                              }}
                              title="Click for more info"
                            >
                              <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''}`}>
                                {matchup.team1 ? getCountryCode(matchup.team1) : 'TBD'}
                              </div>
                              {simulatedKnockout && matchup.score1 !== null && matchup.score1 !== undefined && matchup.score2 !== null && matchup.score2 !== undefined ? (
                                <div className="match-score">
                                  {matchup.score1 ?? 0} - {matchup.score2 ?? 0}
                                  {matchup.isPenalties && 
                                   matchup.penaltyScore1 !== null && 
                                   matchup.penaltyScore1 !== undefined &&
                                   matchup.penaltyScore2 !== null && 
                                   matchup.penaltyScore2 !== undefined && (
                                    <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                                  )}
                                </div>
                              ) : (
                                <div className="vs">vs</div>
                              )}
                              <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''}`}>
                                {matchup.team2 ? getCountryCode(matchup.team2) : 'TBD'}
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Final (Center) */}
              <div className="bracket-center">
                <div className="champion-announcement-wrapper" style={{ minHeight: champion ? 'auto' : '0px', marginBottom: champion ? '15px' : '0px' }}>
                  {champion && (
                    <div className="champion-announcement">
                      <div className="champion-effect">
                        <h2>🏆 CHAMPION 🏆</h2>
                        <div className="champion-name">{getFullCountryName(champion)}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="simulate-knockout-button" style={{ marginBottom: '15px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {currentSimulatingStage && (
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '0.95em',
                      fontWeight: '600',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      width: '100%',
                      maxWidth: '300px'
                    }}>
                      Simulating {currentSimulatingStage}...
                    </div>
                  )}
                  <button 
                    onClick={simulateKnockoutStage} 
                    className="simulate-btn"
                    disabled={simulating || simulatedKnockout}
                  >
                    {simulating ? 'Simulating...' : simulatedKnockout ? 'Knockout Stage Simulated' : 'Simulate Knockout Stage'}
                  </button>
                </div>
                <div className="round-label">Final</div>
                {knockoutBracket.final.map((matchup, matchupIndex) => (
                  <div key={matchupIndex} className="matchup-wrapper final-wrapper">
                    <div 
                      className="matchup final-matchup clickable-matchup"
                      onClick={() => {
                        handleKnockoutMatchupClick('final', 0, matchupIndex);
                      }}
                      title="Click for more info"
                    >
                      <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''} ${champion === matchup.team1 ? 'champion' : ''}`}>
                        {matchup.team1 ? getFullCountryName(matchup.team1) : 'TBD'}
                      </div>
                      {simulatedKnockout && matchup.score1 !== null && matchup.score1 !== undefined && matchup.score2 !== null && matchup.score2 !== undefined ? (
                        <div className="match-score">
                          {matchup.score1 ?? 0} - {matchup.score2 ?? 0}
                          {matchup.isPenalties && 
                           matchup.penaltyScore1 !== null && 
                           matchup.penaltyScore1 !== undefined &&
                           matchup.penaltyScore2 !== null && 
                           matchup.penaltyScore2 !== undefined && (
                            <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                          )}
                        </div>
                      ) : (
                        <div className="vs">vs</div>
                      )}
                      <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''} ${champion === matchup.team2 ? 'champion' : ''}`}>
                        {matchup.team2 ? getFullCountryName(matchup.team2) : 'TBD'}
                      </div>
                    </div>
                    {matchup.winner && (
                      <div className="champion-box">
                        <div className="champion-team">{getFullCountryName(matchup.winner)}</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Third Place Playoff */}
                {knockoutBracket.thirdPlacePlayoff && knockoutBracket.thirdPlacePlayoff.length > 0 && (
                  <div className="third-place-playoff-wrapper">
                    <div className="round-label">3rd Place</div>
                    {knockoutBracket.thirdPlacePlayoff.map((matchup, matchupIndex) => (
                      <div key={matchupIndex} className="matchup-wrapper third-place-wrapper">
                        <div 
                          className="matchup third-place-matchup clickable-matchup"
                          onClick={() => {
                            handleKnockoutMatchupClick('thirdPlacePlayoff', 0, matchupIndex);
                          }}
                          title="Click for more info"
                        >
                          <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''}`}>
                            {matchup.team1 || 'TBD'}
                          </div>
                          {simulatedKnockout && matchup.score1 !== null && matchup.score1 !== undefined && matchup.score2 !== null && matchup.score2 !== undefined ? (
                            <div className="match-score">
                              {matchup.score1 ?? 0} - {matchup.score2 ?? 0}
                              {matchup.isPenalties && 
                               matchup.penaltyScore1 !== null && 
                               matchup.penaltyScore1 !== undefined &&
                               matchup.penaltyScore2 !== null && 
                               matchup.penaltyScore2 !== undefined && (
                                <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                              )}
                            </div>
                          ) : (
                            <div className="vs">vs</div>
                          )}
                          <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''}`}>
                            {matchup.team2 || 'TBD'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Half */}
              <div className="bracket-half bracket-right">
                {[...knockoutBracket.right].reverse().map((round, reversedRoundIndex) => {
                  const roundIndex = knockoutBracket.right.length - 1 - reversedRoundIndex;
                  return (
                    <div key={roundIndex} className={`round round-${roundIndex + 1}`}>
                      <div className="round-label">
                        {roundIndex === 0 && 'Round of 32'}
                        {roundIndex === 1 && 'Round of 16'}
                        {roundIndex === 2 && 'Quarterfinals'}
                        {roundIndex === 3 && 'Semifinals'}
                      </div>
                      <div className={`round-matchups-${roundIndex + 1}`}>
                        {[...round].reverse().map((matchup, reversedIndex) => {
                          const matchupIndex = round.length - 1 - reversedIndex;
                          const topPosition = calculateMatchupTop(roundIndex, matchupIndex, round.length);
                          return (
                            <div 
                              key={matchupIndex} 
                              className="matchup-wrapper"
                              style={{ position: 'absolute', top: `${topPosition}px` }}
                            >
                              <div 
                                className="matchup clickable-matchup"
                                onClick={() => {
                                  handleKnockoutMatchupClick('right', roundIndex, matchupIndex);
                                }}
                                title="Click for more info"
                              >
                                <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''}`}>
                                  {matchup.team1 ? getCountryCode(matchup.team1) : 'TBD'}
                                </div>
                                {simulatedKnockout && matchup.score1 !== null && matchup.score1 !== undefined && matchup.score2 !== null && matchup.score2 !== undefined ? (
                                  <div className="match-score">
                                    {matchup.score1 ?? 0} - {matchup.score2 ?? 0}
                                    {matchup.isPenalties && 
                                     matchup.penaltyScore1 !== null && 
                                     matchup.penaltyScore1 !== undefined &&
                                     matchup.penaltyScore2 !== null && 
                                     matchup.penaltyScore2 !== undefined && (
                                      <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="vs">vs</div>
                                )}
                                <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''}`}>
                                  {matchup.team2 ? getCountryCode(matchup.team2) : 'TBD'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match Info Modal */}
      {selectedMatchInfo && (
        <div className="match-info-modal-overlay" onClick={() => {
          setSelectedMatchInfo(null);
          setActiveTab('info');
          setBettingOdds(null);
          setOddsError(null);
        }}>
          <div className="match-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="match-info-modal-close" onClick={() => {
              setSelectedMatchInfo(null);
              setActiveTab('info');
              setBettingOdds(null);
              setOddsError(null);
            }}>×</button>
            <h3>{selectedMatchInfo.allMatches ? `${selectedMatchInfo.stage} - All Matches` : 'Match Details'}</h3>
            
            {/* Tabs - Only show for single match (not group view) */}
            {!selectedMatchInfo.allMatches && (
              <div className="match-info-tabs">
                <button
                  className={`match-info-tab ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Match Info
                </button>
                <button
                  className={`match-info-tab ${activeTab === 'odds' ? 'active' : ''}`}
                  onClick={() => setActiveTab('odds')}
                >
                  Betting Odds
                </button>
              </div>
            )}
            
            <div className="match-info-content">
              {selectedMatchInfo.allMatches ? (
                // Show all matches in the group
                <div className="all-matches-list">
                  {selectedMatchInfo.allMatches.map((match, idx) => (
                    <div key={idx} className="match-item" onClick={() => {
                      setSelectedMatchInfo({
                        team1: match.team1,
                        team2: match.team2,
                        score1: match.score1,
                        score2: match.score2,
                        isDraw: match.isDraw,
                        venue: match.venue,
                        date: match.date,
                        kickoffTime: match.kickoffTime,
                        timezone: match.timezone,
                        stage: selectedMatchInfo.stage,
                        matchNumber: match.matchNumber
                      });
                      setActiveTab('info');
                      setBettingOdds(null);
                      setOddsError(null);
                    }}>
                      <div className="match-item-header">
                        <span className="match-number">Match {match.matchNumber || match.matchNumberInGroup}</span>
                        <span className="match-teams">
                          {getCountryCode(match.team1)} vs {getCountryCode(match.team2)}
                        </span>
                      </div>
                      <div className="match-item-details">
                        {match.venue && (
                          <span>{match.venue.name}, {match.venue.city}</span>
                        )}
                        {match.date && match.kickoffTime && (() => {
                          const converted = convertToLocalTime(match.date, match.kickoffTime, match.timezone);
                          return (
                            <span className="kickoff-time-display">
                              {parseDateString(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                              <button
                                className="timezone-toggle-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUseLocalTimezone(!useLocalTimezone);
                                }}
                                title={useLocalTimezone ? "Show match timezone" : "Show your timezone"}
                              >
                                {useLocalTimezone ? '🌐' : '📍'}
                              </button>
                              {' '}{converted.time}{converted.timezone ? ` ${converted.timezone}` : ''}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'info' ? (
                // Show single match details (Match Info tab)
                <>
                  <div className="match-info-teams">
                    <div className="match-info-team">
                      {selectedMatchInfo.team1 ? getFullCountryName(selectedMatchInfo.team1) : 'TBD'}
                    </div>
                    <div className="match-info-vs">vs</div>
                    <div className="match-info-team">
                      {selectedMatchInfo.team2 ? getFullCountryName(selectedMatchInfo.team2) : 'TBD'}
                    </div>
                  </div>
                  
                  {(selectedMatchInfo.score1 !== null && selectedMatchInfo.score1 !== undefined) && 
                   (selectedMatchInfo.score2 !== null && selectedMatchInfo.score2 !== undefined) && (
                    <div className="match-info-score">
                      Score: {selectedMatchInfo.score1 ?? 0} - {selectedMatchInfo.score2 ?? 0}
                      {selectedMatchInfo.isPenalties && 
                       selectedMatchInfo.penaltyScore1 !== null && 
                       selectedMatchInfo.penaltyScore1 !== undefined &&
                       selectedMatchInfo.penaltyScore2 !== null && 
                       selectedMatchInfo.penaltyScore2 !== undefined && (
                        <span className="penalty-notation"> ({selectedMatchInfo.penaltyScore1}-{selectedMatchInfo.penaltyScore2} pens)</span>
                      )}
                    </div>
                  )}
                  
                  {selectedMatchInfo.winner && (
                    <div className="match-info-winner">
                      Winner: {getFullCountryName(selectedMatchInfo.winner)}
                    </div>
                  )}
                  
                  <div className="match-info-details">
                    {(selectedMatchInfo.matchId || selectedMatchInfo.matchNumber) && (
                      <div className="match-info-item">
                        <span className="match-info-label">Match Number:</span>
                        <span className="match-info-value">
                          {selectedMatchInfo.matchId || selectedMatchInfo.matchNumber}
                        </span>
                      </div>
                    )}
                    <div className="match-info-item">
                      <span className="match-info-label">Stage:</span>
                      <span className="match-info-value">{selectedMatchInfo.stage}</span>
                    </div>
                    {selectedMatchInfo.venue && (
                      <>
                        <div className="match-info-item">
                          <span className="match-info-label">Venue:</span>
                          <span className="match-info-value">{selectedMatchInfo.venue.name}</span>
                        </div>
                        <div className="match-info-item">
                          <span className="match-info-label">City:</span>
                          <span className="match-info-value">{selectedMatchInfo.venue.city}</span>
                        </div>
                      </>
                    )}
                    {selectedMatchInfo.date && (
                      <div className="match-info-item">
                        <span className="match-info-label">Date:</span>
                        <span className="match-info-value">
                          {parseDateString(selectedMatchInfo.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                    {selectedMatchInfo.kickoffTime && selectedMatchInfo.date && (() => {
                      const converted = convertToLocalTime(selectedMatchInfo.date, selectedMatchInfo.kickoffTime, selectedMatchInfo.timezone);
                      return (
                        <div className="match-info-item">
                          <span className="match-info-label">Kickoff Time:</span>
                          <span className="match-info-value">
                            <button
                              className="timezone-toggle-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUseLocalTimezone(!useLocalTimezone);
                              }}
                              title={useLocalTimezone ? "Show match timezone" : "Show your timezone"}
                            >
                              {useLocalTimezone ? '🌐' : '📍'}
                            </button>
                            {' '}{converted.time}{converted.timezone ? ` ${converted.timezone}` : ''}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </>
              ) : (
                // Show betting odds (Betting Odds tab)
                <div className="match-odds-content">
                  {oddsLoading ? (
                    <div className="odds-loading">
                      <div className="loading-spinner-small">
                        <div className="spinner"></div>
                      </div>
                      <p>Loading betting odds...</p>
                    </div>
                  ) : oddsError || !bettingOdds || !bettingOdds.odds || bettingOdds.odds.length === 0 ? (
                    <div className="no-odds-section">
                      <div className="no-odds-icon">📊</div>
                      <h3 className="no-odds-title">Odds not available</h3>
                      <p className="no-odds-description">
                        {oddsError || 'Betting odds are not currently available for this matchup. Odds are typically published closer to the match date.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="matchup-header-modal">
                        <div className="team-display-modal team1">
                          <h4 className="team-name-modal">
                            {extractFlag(bettingOdds?.team1 || selectedMatchInfo.team1)} {extractCountryName(bettingOdds?.team1 || selectedMatchInfo.team1)}
                          </h4>
                          {bettingOdds?.rankings?.team1?.rank && (
                            <div className="fifa-ranking-modal">
                              <span className="ranking-label">FIFA Rank:</span>
                              <span className="ranking-value">#{formatRank(bettingOdds.rankings.team1.rank)}</span>
                              {bettingOdds.rankings.team1.points && (
                                <span className="ranking-points">({bettingOdds.rankings.team1.points} pts)</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="vs-divider-modal">
                          <span className="vs-text">VS</span>
                        </div>
                        <div className="team-display-modal team2">
                          <h4 className="team-name-modal">
                            {extractFlag(bettingOdds?.team2 || selectedMatchInfo.team2)} {extractCountryName(bettingOdds?.team2 || selectedMatchInfo.team2)}
                          </h4>
                          {bettingOdds?.rankings?.team2?.rank && (
                            <div className="fifa-ranking-modal">
                              <span className="ranking-label">FIFA Rank:</span>
                              <span className="ranking-value">#{formatRank(bettingOdds.rankings.team2.rank)}</span>
                              {bettingOdds.rankings.team2.points && (
                                <span className="ranking-points">({bettingOdds.rankings.team2.points} pts)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="odds-section-modal">
                        <h4 className="section-title-modal">Available Odds</h4>
                        <div className="bookmakers-list-modal">
                          {bettingOdds.odds.slice(0, 2).map((bookmaker, index) => (
                            <div key={index} className="bookmaker-card-modal">
                              <h5 className="bookmaker-name-modal">
                                {bookmaker.title || bookmaker.name || `Bookmaker ${index + 1}`}
                              </h5>
                              
                              {bookmaker.markets && bookmaker.markets.length > 0 ? (
                                <div className="markets-modal">
                                  {bookmaker.markets.map((market, marketIndex) => (
                                    <div key={marketIndex} className="market-modal">
                                      <h6 className="market-title-modal">
                                        {market.key === 'h2h' ? 'Match Winner' : market.key}
                                      </h6>
                                      {market.outcomes && (() => {
                                        // Determine if this is a group stage match
                                        const isGroupMatch = selectedMatchInfo?.stage?.startsWith('Group');
                                        
                                        // Filter outcomes (exclude penalties for main display)
                                        let displayOutcomes = market.outcomes.filter(outcome => !outcome.isPenalty);
                                        
                                        // For group matches, sort outcomes: Team A, Draw, Team B
                                        if (isGroupMatch && displayOutcomes.length > 0) {
                                          const team1Name = extractCountryName(bettingOdds?.team1 || selectedMatchInfo?.team1 || '');
                                          const team2Name = extractCountryName(bettingOdds?.team2 || selectedMatchInfo?.team2 || '');
                                          
                                          // Helper function to get priority: Team A = 0, Draw = 1, Team B = 2
                                          const getPriority = (name) => {
                                            const cleanName = extractCountryName(name);
                                            if (cleanName.toLowerCase() === 'draw') return 1;
                                            if (cleanName === team1Name) return 0;
                                            if (cleanName === team2Name) return 2;
                                            return 3; // Unknown, put at end
                                          };
                                          
                                          displayOutcomes.sort((a, b) => {
                                            const aPriority = getPriority(a.name);
                                            const bPriority = getPriority(b.name);
                                            return aPriority - bPriority;
                                          });
                                        }
                                        
                                        return (
                                          <div className="outcomes-modal">
                                            {displayOutcomes.map((outcome, outcomeIndex) => (
                                              <div key={outcomeIndex} className="outcome-modal">
                                                <div className="outcome-left-modal">
                                                  <span className="outcome-name-modal">
                                                    {isGroupMatch && extractCountryName(outcome.name).toLowerCase() === 'draw' 
                                                      ? 'Draw' 
                                                      : outcome.name}
                                                  </span>
                                                  {outcome.probability !== undefined && (
                                                    <span className="outcome-probability-modal">
                                                      {(outcome.probability * 100).toFixed(1)}%
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="outcome-price-modal">
                                                  {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                                                </span>
                                              </div>
                                            ))}
                                            {/* Show penalty probabilities only for knockout matches */}
                                            {bookmaker.isKnockout && market.outcomes.filter(o => o.isPenalty).length > 0 && (
                                              <div className="penalty-section-modal">
                                                <div className="penalty-header-modal">
                                                <span className="penalty-label-modal">Penalty Shootout Probabilities</span>
                                                {bookmaker.penaltyProbability !== undefined && (
                                                  <span className="penalty-chance-modal">
                                                    {(bookmaker.penaltyProbability * 100).toFixed(1)}% chance
                                                  </span>
                                                )}
                                              </div>
                                              {market.outcomes
                                                .filter(outcome => outcome.isPenalty)
                                                .map((outcome, outcomeIndex) => (
                                                  <div key={`penalty-${outcomeIndex}`} className="outcome-modal penalty-outcome-modal">
                                                    <div className="outcome-left-modal">
                                                      <span className="outcome-name-modal">{outcome.name}</span>
                                                      {outcome.probability !== undefined && (
                                                        <span className="outcome-probability-modal">
                                                          {(outcome.probability * 100).toFixed(1)}%
                                                        </span>
                                                      )}
                                                    </div>
                                                    <span className="outcome-price-modal">
                                                      {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                                                    </span>
                                                  </div>
                                                ))}
                                            </div>
                                          )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="no-markets-modal">
                                  <p>No odds available from this bookmaker</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimulatorPage;

