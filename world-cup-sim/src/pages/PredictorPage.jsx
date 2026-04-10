import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoundOf32Matchups } from '../utils/knockoutAlgorithm';
import api from '../api/api';
import { getGroupMatchInfo, getKnockoutMatchInfo, getKnockoutMatchInfoById } from '../data/matchSchedule';
import './PredictorPage.css';

const PREDICTOR_STATE_VERSION = 2;

// Team alternatives mapping for unqualified teams
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
  if (!teamName) return false;
  
  // Direct key lookup
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

// Helper function to get country flag gradient colors
function _getCountryGradient(teamString) {
  const countryName = extractCountryName(teamString);
  
  // Map country names to their flag color gradients
  const flagColors = {
    'Mexico': 'linear-gradient(135deg, rgba(0, 99, 65, 0.7), rgba(206, 17, 38, 0.7))', // Green to Red
    'South Africa': 'linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 255, 0, 0.7), rgba(0, 0, 0, 0.7), rgba(0, 128, 0, 0.7))', // Red, Yellow, Black, Green
    'South Korea': 'linear-gradient(135deg, rgba(0, 0, 128, 0.7), rgba(255, 255, 255, 0.7), rgba(255, 0, 0, 0.7))', // Blue, White, Red
    'Denmark': 'linear-gradient(135deg, rgba(198, 12, 48, 0.7), rgba(255, 255, 255, 0.7))', // Red and White
    'Czechia': 'linear-gradient(135deg, rgba(17, 69, 126, 0.7), rgba(255, 255, 255, 0.7), rgba(214, 48, 49, 0.7))', // Blue, White, Red
    'Canada': 'linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 255, 255, 0.7))', // Red and White
    'Italy': 'linear-gradient(90deg, rgba(0, 146, 70, 0.7), rgba(255, 255, 255, 0.7), rgba(206, 43, 55, 0.7))', // Green, White, Red
    'Bosnia and Herzegovina': 'linear-gradient(135deg, rgba(0, 61, 165, 0.7), rgba(255, 215, 0, 0.7))', // Blue and Yellow
    'Qatar': 'linear-gradient(135deg, rgba(138, 21, 56, 0.7), rgba(255, 255, 255, 0.7))', // Maroon and White
    'Switzerland': 'linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 255, 255, 0.7))', // Red and White
    'Brazil': 'linear-gradient(135deg, rgba(0, 149, 69, 0.7), rgba(254, 223, 0, 0.7), rgba(0, 39, 118, 0.7))', // Green, Yellow, Blue
    'Morocco': 'linear-gradient(135deg, rgba(193, 39, 45, 0.7), rgba(0, 98, 60, 0.7))', // Red and Green
    'Haiti': 'linear-gradient(90deg, rgba(0, 32, 91, 0.7), rgba(214, 40, 40, 0.7))', // Blue and Red
    'Scotland': 'linear-gradient(135deg, rgba(0, 102, 204, 0.7), rgba(255, 255, 255, 0.7))', // Blue and White
    'United States': 'linear-gradient(90deg, rgba(187, 19, 62, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 38, 100, 0.7))', // Red, White, Blue
    'Paraguay': 'linear-gradient(135deg, rgba(213, 43, 30, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 56, 168, 0.7))', // Red, White, Blue
    'Australia': 'linear-gradient(135deg, rgba(0, 51, 102, 0.7), rgba(255, 204, 0, 0.7), rgba(0, 102, 204, 0.7))', // Blue, Gold, Blue
    'Turkey': 'linear-gradient(135deg, rgba(227, 10, 23, 0.7), rgba(255, 255, 255, 0.7))', // Red and White
    'Germany': 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(221, 0, 0, 0.7), rgba(255, 206, 0, 0.7))', // Black, Red, Gold
    'Curaçao': 'linear-gradient(135deg, rgba(0, 102, 204, 0.7), rgba(255, 255, 255, 0.7), rgba(255, 215, 0, 0.7))', // Blue, White, Gold
    'Ivory Coast': 'linear-gradient(90deg, rgba(252, 209, 22, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 158, 96, 0.7))', // Orange, White, Green
    'Ecuador': 'linear-gradient(135deg, rgba(255, 221, 0, 0.7), rgba(0, 122, 51, 0.7), rgba(237, 28, 36, 0.7))', // Yellow, Green, Red
    'Netherlands': 'linear-gradient(90deg, rgba(174, 28, 40, 0.7), rgba(255, 255, 255, 0.7), rgba(33, 70, 139, 0.7))', // Red, White, Blue
    'Japan': 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(188, 0, 45, 0.7))', // White and Red
    'Ukraine': 'linear-gradient(90deg, rgba(0, 87, 183, 0.7), rgba(255, 215, 0, 0.7))', // Blue and Yellow
    'Sweden': 'linear-gradient(135deg, rgba(0, 87, 183, 0.7), rgba(255, 215, 0, 0.7))', // Blue and Yellow
    'Tunisia': 'linear-gradient(135deg, rgba(231, 0, 19, 0.7), rgba(255, 255, 255, 0.7))', // Red and White
    'Belgium': 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(237, 41, 57, 0.7), rgba(250, 224, 66, 0.7))', // Black, Red, Yellow
    'Egypt': 'linear-gradient(90deg, rgba(206, 17, 38, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0.7))', // Red, White, Black
    'Iran': 'linear-gradient(135deg, rgba(218, 0, 21, 0.7), rgba(255, 255, 255, 0.7), rgba(35, 159, 64, 0.7))', // Red, White, Green
    'New Zealand': 'linear-gradient(135deg, rgba(0, 0, 128, 0.7), rgba(255, 255, 255, 0.7), rgba(255, 0, 0, 0.7))', // Blue, White, Red
    'Spain': 'linear-gradient(90deg, rgba(170, 21, 27, 0.7), rgba(255, 255, 255, 0.7), rgba(255, 209, 0, 0.7))', // Red, White, Yellow
    'Cape Verde': 'linear-gradient(90deg, rgba(0, 102, 204, 0.7), rgba(255, 255, 255, 0.7), rgba(255, 215, 0, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 102, 204, 0.7), rgba(255, 215, 0, 0.7))', // Blue, White, Gold stripes
    'Saudi Arabia': 'linear-gradient(135deg, rgba(0, 98, 64, 0.7), rgba(255, 255, 255, 0.7))', // Green and White
    'Uruguay': 'linear-gradient(90deg, rgba(0, 56, 168, 0.7), rgba(255, 255, 255, 0.7))', // Blue and White
    'France': 'linear-gradient(90deg, rgba(0, 35, 149, 0.7), rgba(255, 255, 255, 0.7), rgba(237, 41, 57, 0.7))', // Blue, White, Red
    'Senegal': 'linear-gradient(90deg, rgba(0, 158, 96, 0.7), rgba(252, 209, 22, 0.7), rgba(237, 28, 36, 0.7))', // Green, Yellow, Red
    'Iraq': 'linear-gradient(90deg, rgba(206, 17, 38, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0.7))', // Red, White, Black
    'Norway': 'linear-gradient(135deg, rgba(186, 12, 47, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 32, 91, 0.7))', // Red, White, Blue
    'Argentina': 'linear-gradient(90deg, rgba(116, 172, 223, 0.7), rgba(255, 255, 255, 0.7))', // Light Blue and White
    'Algeria': 'linear-gradient(90deg, rgba(206, 17, 38, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 102, 51, 0.7))', // Red, White, Green
    'Austria': 'linear-gradient(90deg, rgba(237, 41, 57, 0.7), rgba(255, 255, 255, 0.7), rgba(237, 41, 57, 0.7))', // Red, White, Red
    'Jordan': 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 102, 51, 0.7), rgba(206, 17, 38, 0.7))', // Black, White, Green, Red
    'Portugal': 'linear-gradient(90deg, rgba(0, 102, 0, 0.7), rgba(255, 0, 0, 0.7))', // Green and Red
    'DR Congo': 'linear-gradient(135deg, rgba(0, 122, 94, 0.7), rgba(255, 209, 0, 0.7), rgba(220, 20, 60, 0.7))', // Blue, Yellow, Red
    'Uzbekistan': 'linear-gradient(90deg, rgba(0, 132, 61, 0.7), rgba(255, 255, 255, 0.7), rgba(255, 209, 0, 0.7), rgba(0, 132, 61, 0.7))', // Green, White, Gold
    'Colombia': 'linear-gradient(90deg, rgba(252, 209, 22, 0.7), rgba(0, 56, 168, 0.7), rgba(206, 17, 38, 0.7))', // Yellow, Blue, Red
    'England': 'linear-gradient(90deg, rgba(207, 20, 43, 0.7), rgba(255, 255, 255, 0.7))', // Red and White
    'Croatia': 'linear-gradient(90deg, rgba(206, 17, 38, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 71, 171, 0.7))', // Red, White, Blue
    'Ghana': 'linear-gradient(90deg, rgba(206, 17, 38, 0.7), rgba(255, 215, 0, 0.7), rgba(0, 122, 94, 0.7))', // Red, Gold, Green
    'Panama': 'linear-gradient(135deg, rgba(218, 37, 29, 0.7), rgba(255, 255, 255, 0.7), rgba(0, 76, 151, 0.7))', // Red, White, Blue
  };
  
  // Return the gradient for the country, or a default gradient if not found
  return flagColors[countryName] || 'linear-gradient(135deg, rgba(100, 100, 100, 0.5), rgba(150, 150, 150, 0.5))';
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

function PredictorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('predictorState');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If the saved state is from an older version (e.g. before qualifiers were confirmed),
        // discard it so we don't show outdated placeholder/playoff teams.
        if (parsed?.version !== PREDICTOR_STATE_VERSION) {
          return {
            groups: initializeGroups(),
            thirdPlaceTeams: [],
            selectedThirdPlaceGroups: new Set(),
            knockoutBracket: null,
            champion: null,
            currentView: location.state?.view || 'groups'
          };
        }
        return {
          groups: parsed.groups || initializeGroups(),
          thirdPlaceTeams: parsed.thirdPlaceTeams || [],
          selectedThirdPlaceGroups: parsed.selectedThirdPlaceGroups ? new Set(parsed.selectedThirdPlaceGroups) : new Set(),
          knockoutBracket: parsed.knockoutBracket || null,
          champion: parsed.champion || null,
          currentView: parsed.currentView || 'groups'
        };
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
    return {
      groups: initializeGroups(),
      thirdPlaceTeams: [],
      selectedThirdPlaceGroups: new Set(),
      knockoutBracket: null,
      champion: null,
      currentView: location.state?.view || 'groups'
    };
  };

  const savedState = loadSavedState();
  // Prioritize location.state.view when navigating back, otherwise use saved view
  const initialView = location.state?.view || savedState.currentView;
  const [groups, setGroups] = useState(savedState.groups);
  const [thirdPlaceTeams, setThirdPlaceTeams] = useState(savedState.thirdPlaceTeams);
  const [selectedThirdPlaceGroups, setSelectedThirdPlaceGroups] = useState(savedState.selectedThirdPlaceGroups);
  const [knockoutBracket, setKnockoutBracket] = useState(savedState.knockoutBracket);
  const [champion, setChampion] = useState(savedState.champion);
  const [draggedTeam, setDraggedTeam] = useState(null);
  const [currentView, setCurrentView] = useState(initialView);
  const [groupWinnerProbs, setGroupWinnerProbs] = useState({});
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [touchedTeam, setTouchedTeam] = useState(null);
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
      
      // We need to create a Date object that represents this time in the match timezone
      // Strategy: Create date in UTC, then find the UTC time that corresponds to our target time in match timezone
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

  // Save timezone preference to localStorage
  useEffect(() => {
    localStorage.setItem('timezonePreference', useLocalTimezone.toString());
  }, [useLocalTimezone]);

  // Helper function to parse date string correctly (avoid UTC timezone issues)
  const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone issues
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      version: PREDICTOR_STATE_VERSION,
      groups,
      thirdPlaceTeams,
      selectedThirdPlaceGroups: Array.from(selectedThirdPlaceGroups),
      knockoutBracket,
      champion,
      currentView
    };
    localStorage.setItem('predictorState', JSON.stringify(stateToSave));
  }, [groups, thirdPlaceTeams, selectedThirdPlaceGroups, knockoutBracket, champion, currentView]);

  // Fetch group winner probabilities when groups are loaded
  useEffect(() => {
    const fetchGroupWinnerProbs = async () => {
      const probs = {};
      const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      
      for (const groupName of groupNames) {
        if (groups[groupName] && groups[groupName].teams.length === 4) {
          try {
            const teamNames = groups[groupName].teams.map(team => team.name);
            const response = await api.get('/api/betting/group-winner', {
              params: {
                groupName: groupName,
                teams: JSON.stringify(teamNames),
              },
            });
            probs[groupName] = response.data.probabilities;
          } catch (error) {
            console.error(`Error fetching group winner probabilities for Group ${groupName}:`, error);
          }
        }
      }
      
      setGroupWinnerProbs(probs);
    };

    fetchGroupWinnerProbs();
  }, [groups]);


  const handleReset = () => {
    setGroups(initializeGroups());
    setThirdPlaceTeams([]);
    setSelectedThirdPlaceGroups(new Set());
    setKnockoutBracket(null);
    setChampion(null);
    setCurrentView('groups');
    // Clear localStorage
    localStorage.removeItem('predictorState');
  };

  // Drag and drop handlers for group stage
  const handleDragStart = (e, groupName, teamIndex) => {
    setDraggedTeam({ groupName, teamIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetGroupName) => {
    e.preventDefault();
    // Only allow drop if it's within the same group
    if (draggedTeam && draggedTeam.groupName === targetGroupName) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDrop = (e, targetGroupName, targetTeamIndex) => {
    e.preventDefault();
    
    if (!draggedTeam) return;

    // Only allow drops within the same group
    if (draggedTeam.groupName !== targetGroupName) {
      setDraggedTeam(null);
      return;
    }

    const newGroups = { ...groups };
    const sourceGroup = newGroups[draggedTeam.groupName];

    // Swap teams within the same group
    const temp = sourceGroup.teams[draggedTeam.teamIndex];
    sourceGroup.teams[draggedTeam.teamIndex] = sourceGroup.teams[targetTeamIndex];
    sourceGroup.teams[targetTeamIndex] = temp;

    setGroups(newGroups);
    setDraggedTeam(null);
    
    // Reset knockout bracket and related state when groups change
    setThirdPlaceTeams([]);
    setSelectedThirdPlaceGroups(new Set());
    setKnockoutBracket(null);
    setChampion(null);
  };

  // Handle team position swap with buttons (mobile-friendly)
  const handleSwapTeams = (groupName, index1, index2) => {
    if (index2 < 0 || index2 >= groups[groupName].teams.length) return;
    
    const newGroups = { ...groups };
    const group = newGroups[groupName];
    
    // Swap teams
    const temp = group.teams[index1];
    group.teams[index1] = group.teams[index2];
    group.teams[index2] = temp;
    
    setGroups(newGroups);
    
    // Reset knockout bracket and related state when groups change
    setThirdPlaceTeams([]);
    setSelectedThirdPlaceGroups(new Set());
    setKnockoutBracket(null);
    setChampion(null);
  };

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e, groupName, teamIndex) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchedTeam({ groupName, teamIndex });
  };

  const handleTouchMove = (e) => {
    if (!touchStartPos || !touchedTeam) return;
    
    // Prevent default scrolling while dragging
    e.preventDefault();
  };

  const handleTouchEnd = (e, targetGroupName, targetTeamIndex) => {
    if (!touchedTeam || !touchStartPos) {
      setTouchedTeam(null);
      setTouchStartPos(null);
      return;
    }

    // Only allow swaps within the same group
    if (touchedTeam.groupName !== targetGroupName) {
      setTouchedTeam(null);
      setTouchStartPos(null);
      return;
    }

    // Check if there was significant movement
    const touch = e.changedTouches[0];
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // If minimal movement, don't swap (it's just a tap)
    if (deltaY < 20) {
      setTouchedTeam(null);
      setTouchStartPos(null);
      return;
    }

    // Perform the swap
    const newGroups = { ...groups };
    const sourceGroup = newGroups[touchedTeam.groupName];

    const temp = sourceGroup.teams[touchedTeam.teamIndex];
    sourceGroup.teams[touchedTeam.teamIndex] = sourceGroup.teams[targetTeamIndex];
    sourceGroup.teams[targetTeamIndex] = temp;

    setGroups(newGroups);
    
    // Reset knockout bracket and related state when groups change
    setThirdPlaceTeams([]);
    setSelectedThirdPlaceGroups(new Set());
    setKnockoutBracket(null);
    setChampion(null);

    setTouchedTeam(null);
    setTouchStartPos(null);
  };

  // Advance teams to third place ranking
  const advanceToThirdPlace = () => {
    const groupNames = Object.keys(groups);
    const thirdPlace = groupNames.map(groupName => ({
      groupName,
      team: groups[groupName].teams[2], // 3rd position (index 2)
      points: 0,
      goalDifference: 0,
      goalsScored: 0
    }));
    setThirdPlaceTeams(thirdPlace);
    // Initialize with existing selections if any, otherwise start empty
    if (selectedThirdPlaceGroups.size === 0) {
      setSelectedThirdPlaceGroups(new Set());
    }
    setCurrentView('third-place');
  };


  // Toggle third place team selection
  const toggleThirdPlaceSelection = (groupName) => {
    const newSelected = new Set(selectedThirdPlaceGroups);
    if (newSelected.has(groupName)) {
      newSelected.delete(groupName);
    } else {
      // Only allow selecting if we have less than 8 selected
      if (newSelected.size < 8) {
        newSelected.add(groupName);
      }
    }
    setSelectedThirdPlaceGroups(newSelected);
    
    // Reset knockout bracket when selections change
    setKnockoutBracket(null);
    setChampion(null);
  };

  // Generate knockout bracket with proper FIFA matching algorithm
  const generateKnockoutBracket = () => {
    // Only proceed if exactly 8 teams are selected
    if (selectedThirdPlaceGroups.size !== 8) {
      return;
    }

    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    // Get group winners, runners-up, and selected third-place teams
    const groupWinners = {};
    const runnersUp = {};
    const selectedThird = thirdPlaceTeams.filter(item => selectedThirdPlaceGroups.has(item.groupName));
    const thirdPlaceGroups = new Set(Array.from(selectedThirdPlaceGroups));
    
    groupNames.forEach(groupName => {
      if (groups[groupName]) {
        groupWinners[groupName] = groups[groupName].teams[0].name;
        runnersUp[groupName] = groups[groupName].teams[1].name;
      }
    });

    // Determine which groups' third-place teams advanced
    const thirdPlaceMap = {};
    selectedThird.forEach(item => {
      thirdPlaceMap[item.groupName] = item.team.name;
    });

    // Use the comprehensive knockout algorithm
    // This handles all 500+ possible combinations of advancing third-place teams
    const roundOf32 = generateRoundOf32Matchups(
      thirdPlaceGroups,
      groupWinners,
      runnersUp,
      thirdPlaceMap
    );

    const roundOf16 = Array(8).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    const quarterfinals = Array(4).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    const semifinals = Array(2).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    const final = [{
      team1: null,
      team2: null,
      winner: null
    }];

    const thirdPlacePlayoff = [{
      team1: null,
      team2: null,
      winner: null
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

  // Clear all subsequent rounds that depend on a changed matchup
  const clearSubsequentRounds = (newBracket, side, roundIndex, matchupIndex, clearCurrentWinner = false) => {
    if (side === 'final') {
      // Clear champion if final is affected
      setChampion(null);
      return;
    }
    
    if (side === 'thirdPlacePlayoff') {
      // Third place playoff doesn't have subsequent rounds
      return;
    }
    
    // Optionally clear the current matchup's winner (for deselection)
    if (clearCurrentWinner) {
      const currentMatchup = newBracket[side][roundIndex][matchupIndex];
      currentMatchup.winner = null;
    }
    
    const nextRoundIndex = roundIndex + 1;
    
    // If this is the semifinal, clear final and third place playoff
    if (nextRoundIndex >= newBracket[side].length) {
      const finalMatchup = newBracket.final[0];
      const finalPosition = side === 'left' ? 'team1' : 'team2';
      finalMatchup[finalPosition] = null;
      finalMatchup.winner = null;
      
      if (newBracket.thirdPlacePlayoff) {
        const thirdPlaceMatchup = newBracket.thirdPlacePlayoff[0];
        const thirdPlacePosition = side === 'left' ? 'team1' : 'team2';
        thirdPlaceMatchup[thirdPlacePosition] = null;
        thirdPlaceMatchup.winner = null;
      }
      
      setChampion(null);
      return;
    }
    
    // Clear the next round matchup that depends on this one
    const nextMatchupIndex = Math.floor(matchupIndex / 2);
    const nextMatchup = newBracket[side][nextRoundIndex][nextMatchupIndex];
    const positionInNextMatchup = matchupIndex % 2 === 0 ? 'team1' : 'team2';
    
    // Clear the team in the next matchup
    nextMatchup[positionInNextMatchup] = null;
    nextMatchup.winner = null;
    
    // Recursively clear subsequent rounds
    clearSubsequentRounds(newBracket, side, nextRoundIndex, nextMatchupIndex, false);
  };

  // Bracket team click handler (from previous implementation)
  const handleBracketTeamClick = (side, roundIndex, matchupIndex, teamPosition) => {
    if (!knockoutBracket) return;

    const newBracket = {
      left: knockoutBracket.left.map(round => round.map(matchup => ({ ...matchup }))),
      right: knockoutBracket.right.map(round => round.map(matchup => ({ ...matchup }))),
      final: knockoutBracket.final.map(matchup => ({ ...matchup })),
      thirdPlacePlayoff: knockoutBracket.thirdPlacePlayoff ? knockoutBracket.thirdPlacePlayoff.map(matchup => ({ ...matchup })) : [{ team1: null, team2: null, winner: null }]
    };

    let matchup;
    if (side === 'final') {
      matchup = newBracket.final[matchupIndex];
    } else if (side === 'thirdPlacePlayoff') {
      matchup = newBracket.thirdPlacePlayoff[matchupIndex];
    } else {
      matchup = newBracket[side][roundIndex][matchupIndex];
    }

    const selectedTeam = matchup[teamPosition];
    const currentWinner = matchup.winner;

    // Safety check: if selectedTeam is null, don't do anything
    if (!selectedTeam) return;

    // Handle final
    if (side === 'final') {
      if (matchup.team1 && matchup.team2) {
        if (currentWinner === selectedTeam) {
          // Deselect: clicking the current winner
          matchup.winner = null;
          setChampion(null);
        } else {
          // Swap or set winner
          matchup.winner = selectedTeam;
          setChampion(selectedTeam);
        }
      }
      setKnockoutBracket(newBracket);
      return;
    }

    // Handle third place playoff
    if (side === 'thirdPlacePlayoff') {
      if (matchup.team1 && matchup.team2) {
        if (currentWinner === selectedTeam) {
          // Deselect: clicking the current winner
          matchup.winner = null;
        } else {
          // Swap or set winner
          matchup.winner = selectedTeam;
        }
      }
      setKnockoutBracket(newBracket);
      return;
    }

    // Handle knockout rounds (Round of 32, 16, Quarterfinals, Semifinals)
    if (currentWinner === selectedTeam) {
      // Deselect: clicking the current winner
      clearSubsequentRounds(newBracket, side, roundIndex, matchupIndex, true);
    } else {
      // Swap or set winner
      matchup.winner = selectedTeam;
      
      // Clear subsequent rounds first (but don't clear current winner since we just set it)
      clearSubsequentRounds(newBracket, side, roundIndex, matchupIndex, false);
      
      // Then advance the new winner
      advanceTeamInBracket(newBracket, side, roundIndex, matchupIndex, selectedTeam);
    }

    setKnockoutBracket(newBracket);
  };

  const advanceTeamInBracket = (newBracket, side, currentRoundIndex, currentMatchupIndex, team) => {
    if (side === 'final' || side === 'thirdPlacePlayoff') return;

    const nextRoundIndex = currentRoundIndex + 1;
    
    if (nextRoundIndex >= newBracket[side].length) {
      // This is the semifinal - winners go to final, losers go to third place playoff
      const matchup = newBracket[side][currentRoundIndex][currentMatchupIndex];
      const isWinner = matchup.winner === team;
      
      if (isWinner) {
        // Winner goes to final (update even if already set)
        const finalMatchup = newBracket.final[0];
        const finalPosition = side === 'left' ? 'team1' : 'team2';
        finalMatchup[finalPosition] = team;
        
        // Loser goes to third place playoff
        const losingTeam = matchup.team1 === team ? matchup.team2 : matchup.team1;
        if (losingTeam) {
          if (!newBracket.thirdPlacePlayoff) {
            newBracket.thirdPlacePlayoff = [{ team1: null, team2: null, winner: null }];
          }
          const thirdPlaceMatchup = newBracket.thirdPlacePlayoff[0];
          const thirdPlacePosition = side === 'left' ? 'team1' : 'team2';
          thirdPlaceMatchup[thirdPlacePosition] = losingTeam;
        }
      }
    } else {
      const nextMatchupIndex = Math.floor(currentMatchupIndex / 2);
      const nextMatchup = newBracket[side][nextRoundIndex][nextMatchupIndex];
      const positionInNextMatchup = currentMatchupIndex % 2 === 0 ? 'team1' : 'team2';
      
      // Update the team in the next matchup (replace if already set)
      nextMatchup[positionInNextMatchup] = team;
    }
  };

  const isBracketTeamClickable = (side, roundIndex, matchupIndex) => {
    if (!knockoutBracket) return false;
    
    let matchup;
    if (side === 'final') {
      matchup = knockoutBracket.final[matchupIndex];
    } else if (side === 'thirdPlacePlayoff') {
      matchup = knockoutBracket.thirdPlacePlayoff ? knockoutBracket.thirdPlacePlayoff[matchupIndex] : null;
      if (!matchup) return false;
    } else {
      matchup = knockoutBracket[side][roundIndex][matchupIndex];
    }
    
    // Allow clicking when both teams exist, even if winner is already set
    if (side === 'final' || side === 'thirdPlacePlayoff') {
      return matchup.team1 && matchup.team2;
    } else if (roundIndex === 0) {
      // Round of 32: allow clicking if team exists
      return matchup.team1 || matchup.team2;
    } else {
      // Other rounds: allow clicking if both teams exist
      return matchup.team1 && matchup.team2;
    }
  };

  // Handle group card click to show all matches info (similar to SimulatorPage)
  const handleGroupClick = (groupName) => {
    const group = groups[groupName];
    
    // Generate match list from schedule using current teams
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
    
    // Reset tab and odds when opening modal
    setActiveTab('info');
    setBettingOdds(null);
    setOddsError(null);
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

  // Show match info for a group
  const _handleGroupInfoClick = (groupName) => {
    const group = groups[groupName];
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
    
    // Reset tab and odds when opening modal
    setActiveTab('info');
    setBettingOdds(null);
    setOddsError(null);
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

  // Show match info for a knockout matchup
  const handleKnockoutInfoClick = (side, roundIndex, matchupIndex) => {
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
    
    // Show match info even if teams aren't set yet
    setSelectedMatchInfo({
      team1: matchup?.team1 || null,
      team2: matchup?.team2 || null,
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


  return (
    <div className="predictor-container">
      <header className="predictor-header">
        <h1>World Cup 2026 Predictor</h1>
        <div className="header-actions">
          <button
            onClick={() => navigate('/simulator')}
            className="nav-btn"
          >
            Simulator
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
          {thirdPlaceTeams.length > 0 && (
            <button
              onClick={() => setCurrentView('third-place')}
              className={`view-btn ${currentView === 'third-place' ? 'active' : ''}`}
            >
              3rd Place Ranking
            </button>
          )}
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
            <p className="instruction-text">Drag and drop teams to swap positions (or use arrow buttons on mobile). Percentages are each team's probability of winning the group.</p>
            
            <div className="groups-grid">
              {Object.keys(groups).map((groupName) => (
                <div 
                  key={groupName} 
                  className="group-card clickable-group"
                  onClick={() => handleGroupClick(groupName)}
                  title="Click for more info"
                >
                  <h3>Group {groupName}</h3>
                  <div className="group-teams">
                    {groups[groupName].teams.map((team, index) => {
                      const teamProb = groupWinnerProbs[groupName]?.[team.name];
                      // Position-based border colors: 1-2 = green, 3 = yellow, 4 = blue
                      let positionGradient;
                      if (index === 0 || index === 1) {
                        // Top two teams: green
                        positionGradient = 'linear-gradient(135deg, rgba(0, 255, 120, 0.8), rgba(0, 200, 100, 0.8))';
                      } else if (index === 2) {
                        // Third place: yellow
                        positionGradient = 'linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 200, 0, 0.8))';
                      } else {
                        // Last place: blue (default)
                        positionGradient = 'linear-gradient(135deg, rgba(0, 200, 255, 0.8), rgba(0, 150, 255, 0.8))';
                      }
                      return (
                        <div
                          key={`${groupName}-${index}-${team.name}`}
                          className="group-team"
                          style={{
                            '--position-gradient': positionGradient
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, groupName, index)}
                          onDragOver={(e) => handleDragOver(e, groupName)}
                          onDrop={(e) => handleDrop(e, groupName, index)}
                          onTouchStart={(e) => handleTouchStart(e, groupName, index)}
                          onTouchMove={(e) => handleTouchMove(e)}
                          onTouchEnd={(e) => handleTouchEnd(e, groupName, index)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="team-swap-controls">
                            <button
                              className="swap-btn swap-up"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwapTeams(groupName, index, index - 1);
                              }}
                              disabled={index === 0}
                              title="Move up"
                              aria-label="Move team up"
                            >
                              ▲
                            </button>
                            <button
                              className="swap-btn swap-down"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwapTeams(groupName, index, index + 1);
                              }}
                              disabled={index === groups[groupName].teams.length - 1}
                              title="Move down"
                              aria-label="Move team down"
                            >
                              ▼
                            </button>
                          </div>
                          <span className="position-number">{index + 1}.</span>
                          <span className="team-name">{team.name}</span>
                          {teamProb ? (
                            <span className="group-winner-prob">
                              {(teamProb.probability * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="pot-badge">Pot {team.pot}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="action-section">
              <button onClick={advanceToThirdPlace} className="advance-btn">
                Finalize Groups & Rank 3rd Place Teams
              </button>
            </div>
          </div>
        )}

        {currentView === 'third-place' && (
          <div className="third-place-section">
            <h2>Select 8 Third Place Teams</h2>
            <p className="instruction-text">
              Click on teams to select which 8 will advance to the knockout stage. 
              {selectedThirdPlaceGroups.size > 0 && (
                <span className="selection-count"> {selectedThirdPlaceGroups.size}/8 selected</span>
              )}
            </p>
            
            <div className="third-place-grid">
              {thirdPlaceTeams.map((item) => {
                const isSelected = selectedThirdPlaceGroups.has(item.groupName);
                return (
                  <div
                    key={item.groupName}
                    className={`third-place-card ${isSelected ? 'selected' : ''} ${selectedThirdPlaceGroups.size >= 8 && !isSelected ? 'disabled' : ''}`}
                    onClick={() => toggleThirdPlaceSelection(item.groupName)}
                  >
                    <div className="team-info">
                      <span className="group-label">Group {item.groupName}</span>
                      <span className="team-name">{item.team.name}</span>
                    </div>
                    {isSelected && (
                      <div className="selection-indicator">✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="action-section">
              <button 
                onClick={generateKnockoutBracket} 
                className="advance-btn"
                disabled={selectedThirdPlaceGroups.size !== 8}
              >
                {selectedThirdPlaceGroups.size === 8 
                  ? 'Generate Knockout Bracket' 
                  : `Select ${8 - selectedThirdPlaceGroups.size} more team${8 - selectedThirdPlaceGroups.size === 1 ? '' : 's'}`}
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
                                handleKnockoutInfoClick('left', roundIndex, matchupIndex);
                              }}
                              title="Click for match info"
                            >
                              <div
                                className={`team ${!matchup.team1 ? 'empty' : ''} ${
                                  isBracketTeamClickable('left', roundIndex, matchupIndex) ? 'clickable' : ''
                                } ${matchup.winner === matchup.team1 ? 'winner' : 'loser'} ${matchup.team2 ? 'set' : 'wait'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isBracketTeamClickable('left', roundIndex, matchupIndex)) {
                                    handleBracketTeamClick('left', roundIndex, matchupIndex, 'team1');
                                  }
                                }}
                              >
                                {matchup.team1 ? getCountryCode(matchup.team1) : 'TBD'}
                              </div>
                              <div className="vs">vs</div>
                              <div
                                className={`team ${!matchup.team2 ? 'empty' : ''} ${
                                  isBracketTeamClickable('left', roundIndex, matchupIndex) ? 'clickable' : ''
                                } ${matchup.winner === matchup.team2 ? 'winner' : 'loser'} ${matchup.team2 ? 'set' : 'wait'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isBracketTeamClickable('left', roundIndex, matchupIndex)) {
                                    handleBracketTeamClick('left', roundIndex, matchupIndex, 'team2');
                                  }
                                }}
                              >
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
                        <div className="champion-name">{champion}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="round-label">Final</div>
                {knockoutBracket.final.map((matchup, matchupIndex) => (
                  <div key={matchupIndex} className="matchup-wrapper final-wrapper">
                    <div 
                      className="matchup final-matchup clickable-matchup"
                      onClick={() => {
                        handleKnockoutInfoClick('final', 0, matchupIndex);
                      }}
                      title="Click for match info"
                    >
                      <div
                        className={`team ${!matchup.team1 ? 'empty' : ''} ${
                          isBracketTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                        } ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBracketTeamClickable('final', 0, matchupIndex)) {
                            handleBracketTeamClick('final', 0, matchupIndex, 'team1');
                          }
                        }}
                      >
                        {matchup.team1 ? getFullCountryName(matchup.team1) : 'TBD'}
                      </div>
                      <div className="vs">vs</div>
                      <div
                        className={`team ${!matchup.team2 ? 'empty' : ''} ${
                          isBracketTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                        } ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBracketTeamClickable('final', 0, matchupIndex)) {
                            handleBracketTeamClick('final', 0, matchupIndex, 'team2');
                          }
                        }}
                      >
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
                            handleKnockoutInfoClick('thirdPlacePlayoff', 0, matchupIndex);
                          }}
                          title="Click for match info"
                        >
                          <div
                            className={`team ${!matchup.team1 ? 'empty' : ''} ${
                              isBracketTeamClickable('thirdPlacePlayoff', 0, matchupIndex) ? 'clickable' : ''
                            } ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isBracketTeamClickable('thirdPlacePlayoff', 0, matchupIndex)) {
                                handleBracketTeamClick('thirdPlacePlayoff', 0, matchupIndex, 'team1');
                              }
                            }}
                          >
                            {matchup.team1 ? getFullCountryName(matchup.team1) : 'TBD'}
                          </div>
                          <div className="vs">vs</div>
                          <div
                            className={`team ${!matchup.team2 ? 'empty' : ''} ${
                              isBracketTeamClickable('thirdPlacePlayoff', 0, matchupIndex) ? 'clickable' : ''
                            } ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isBracketTeamClickable('thirdPlacePlayoff', 0, matchupIndex)) {
                                handleBracketTeamClick('thirdPlacePlayoff', 0, matchupIndex, 'team2');
                              }
                            }}
                          >
                            {matchup.team2 ? getFullCountryName(matchup.team2) : 'TBD'}
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
                                  handleKnockoutInfoClick('right', roundIndex, matchupIndex);
                                }}
                                title="Click for match info"
                              >
                                <div
                                  className={`team ${!matchup.team1 ? 'empty' : ''} ${
                                    isBracketTeamClickable('right', roundIndex, matchupIndex) ? 'clickable' : ''
                                  } ${matchup.winner === matchup.team1 ? 'winner' : 'loser'} ${matchup.team2 ? 'set' : 'wait'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isBracketTeamClickable('right', roundIndex, matchupIndex)) {
                                      handleBracketTeamClick('right', roundIndex, matchupIndex, 'team1');
                                    }
                                  }}
                                >
                                  {matchup.team1 ? getCountryCode(matchup.team1) : 'TBD'}
                                </div>
                                <div className="vs">vs</div>
                                <div
                                  className={`team ${!matchup.team2 ? 'empty' : ''} ${
                                    isBracketTeamClickable('right', roundIndex, matchupIndex) ? 'clickable' : ''
                                  } ${matchup.winner === matchup.team2 ? 'winner' : 'loser'} ${matchup.team1 ? 'set' : 'wait'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isBracketTeamClickable('right', roundIndex, matchupIndex)) {
                                      handleBracketTeamClick('right', roundIndex, matchupIndex, 'team2');
                                    }
                                  }}
                                >
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

export default PredictorPage;
