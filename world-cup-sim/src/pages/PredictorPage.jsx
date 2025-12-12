import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoundOf32Matchups } from '../utils/knockoutAlgorithm';
import api from '../api/api';
import './PredictorPage.css';

// Actual FIFA World Cup 2026 Groups (as drawn)
function initializeGroups() {
  const groups = {
    A: {
      teams: [
        { name: 'Mexico 🇲🇽', pot: 1, position: 1 },
        { name: 'South Africa 🇿🇦', pot: 2, position: 2 },
        { name: 'South Korea 🇰🇷', pot: 3, position: 3 },
        { name: 'Denmark 🇩🇰', pot: 4, position: 4 }
      ]
    },
    B: {
      teams: [
        { name: 'Canada 🇨🇦', pot: 1, position: 1 },
        { name: 'Italy 🇮🇹', pot: 2, position: 2 },
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
        { name: 'Ukraine 🇺🇦', pot: 3, position: 3 },
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
    const parentRoundMatchups = totalMatchupsInRound * 2; // Previous round has 2x matchups
    const topPadding = 20;
    const availableHeight = containerHeight - (topPadding * 2);
    const parentSpacing = availableHeight / (parentRoundMatchups - 1);
    
    // This matchup comes from parent matchups at indices (2*matchupIndex) and (2*matchupIndex + 1)
    const parent1Top = topPadding + (parentSpacing * (2 * matchupIndex));
    const parent2Top = topPadding + (parentSpacing * (2 * matchupIndex + 1));
    
    // Return the average - this positions the matchup between its two parents
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
    'Cape Verde': 'CPV'
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetGroupName, targetTeamIndex) => {
    e.preventDefault();
    
    if (!draggedTeam) return;

    const newGroups = { ...groups };
    const sourceGroup = newGroups[draggedTeam.groupName];
    const targetGroup = newGroups[targetGroupName];

    // Swap teams
    const temp = sourceGroup.teams[draggedTeam.teamIndex];
    sourceGroup.teams[draggedTeam.teamIndex] = targetGroup.teams[targetTeamIndex];
    targetGroup.teams[targetTeamIndex] = temp;

    setGroups(newGroups);
    setDraggedTeam(null);
    
    // Reset knockout bracket and related state when groups change
    setThirdPlaceTeams([]);
    setSelectedThirdPlaceGroups(new Set());
    setKnockoutBracket(null);
    setChampion(null);
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

  // Bracket team click handler (from previous implementation)
  const handleBracketTeamClick = (side, roundIndex, matchupIndex, teamPosition) => {
    if (champion || !knockoutBracket) return;

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

    if (side === 'final') {
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
        setChampion(selectedTeam);
      }
    } else if (side === 'thirdPlacePlayoff') {
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
      }
    } else if (roundIndex === 0) {
      matchup.winner = selectedTeam;
      advanceTeamInBracket(newBracket, side, roundIndex, matchupIndex, selectedTeam);
    } else {
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
        advanceTeamInBracket(newBracket, side, roundIndex, matchupIndex, selectedTeam);
      }
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
        // Winner goes to final
        const finalMatchup = newBracket.final[0];
        const finalPosition = side === 'left' ? 'team1' : 'team2';
        if (!finalMatchup[finalPosition]) {
          finalMatchup[finalPosition] = team;
        }
        
        // Loser goes to third place playoff
        const losingTeam = matchup.team1 === team ? matchup.team2 : matchup.team1;
        if (losingTeam) {
          if (!newBracket.thirdPlacePlayoff) {
            newBracket.thirdPlacePlayoff = [{ team1: null, team2: null, winner: null }];
          }
          const thirdPlaceMatchup = newBracket.thirdPlacePlayoff[0];
          const thirdPlacePosition = side === 'left' ? 'team1' : 'team2';
          if (!thirdPlaceMatchup[thirdPlacePosition]) {
            thirdPlaceMatchup[thirdPlacePosition] = losingTeam;
          }
        }
      }
    } else {
      const nextMatchupIndex = Math.floor(currentMatchupIndex / 2);
      const nextMatchup = newBracket[side][nextRoundIndex][nextMatchupIndex];
      const positionInNextMatchup = currentMatchupIndex % 2 === 0 ? 'team1' : 'team2';
      
      if (!nextMatchup[positionInNextMatchup]) {
        nextMatchup[positionInNextMatchup] = team;
      }
    }
  };

  const isBracketTeamClickable = (side, roundIndex, matchupIndex) => {
    if (champion || !knockoutBracket) return false;
    
    let matchup;
    if (side === 'final') {
      matchup = knockoutBracket.final[matchupIndex];
    } else if (side === 'thirdPlacePlayoff') {
      matchup = knockoutBracket.thirdPlacePlayoff ? knockoutBracket.thirdPlacePlayoff[matchupIndex] : null;
      if (!matchup) return false;
    } else {
      matchup = knockoutBracket[side][roundIndex][matchupIndex];
    }
    
    if (side === 'final' || side === 'thirdPlacePlayoff') {
      return matchup.team1 && matchup.team2 && matchup.winner === null;
    } else if (roundIndex === 0) {
      return matchup.winner === null;
    } else {
      return matchup.team1 && matchup.team2 && matchup.winner === null;
    }
  };

  // Navigate to betting odds page for a group
  const handleGroupClick = (groupName) => {
    const groupTeams = groups[groupName].teams;
    if (groupTeams.length === 4) {
      // Pass all teams to show all 6 matchups in the group
      navigate('/betting-odds', {
        state: {
          type: 'group',
          groupName: groupName,
          allTeams: groupTeams.map(team => team.name),
          returnPath: '/predictor',
          returnView: 'groups',
        },
      });
    }
  };

  // Navigate to betting odds page for a knockout matchup
  const handleMatchupClick = (side, roundIndex, matchupIndex) => {
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

    if (matchup.team1 && matchup.team2) {
      const roundNames = {
        0: 'Round of 32',
        1: 'Round of 16',
        2: 'Quarterfinals',
        3: 'Semifinals',
      };
      
      navigate('/betting-odds', {
        state: {
          team1: matchup.team1,
          team2: matchup.team2,
          type: 'matchup',
          round: side === 'thirdPlacePlayoff' ? 'Third Place Playoff' : (roundNames[roundIndex] || 'Final'),
          returnPath: '/predictor',
          returnView: 'bracket',
        },
      });
    }
  };


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
            <p className="instruction-text">Drag and drop teams to swap positions. Percentages are each team's probability of winning the group.</p>
            
            <div className="groups-grid">
              {Object.keys(groups).map((groupName) => (
                <div 
                  key={groupName} 
                  className="group-card clickable-group"
                  onClick={() => handleGroupClick(groupName)}
                  title="Click to view betting odds for this group"
                >
                  <h3>Group {groupName}</h3>
                  <div className="group-teams">
                    {groups[groupName].teams.map((team, index) => {
                      const teamProb = groupWinnerProbs[groupName]?.[team.name];
                      return (
                        <div
                          key={index}
                          className={`group-team pos-${index + 1}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, groupName, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, groupName, index)}
                          onClick={(e) => e.stopPropagation()}
                        >
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
            
            {champion && (
              <div className="champion-announcement">
                <div className="champion-effect">
                  <h2>🏆 CHAMPION 🏆</h2>
                  <div className="champion-name">{champion}</div>
                </div>
              </div>
            )}

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
                              className={`matchup ${matchup.team1 && matchup.team2 ? 'clickable-matchup' : ''}`}
                              onClick={() => {
                                if (matchup.team1 && matchup.team2) {
                                  handleMatchupClick('left', roundIndex, matchupIndex);
                                }
                              }}
                              title={matchup.team1 && matchup.team2 ? "Click to view betting odds" : ""}
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
                <div className="round-label">Final</div>
                {knockoutBracket.final.map((matchup, matchupIndex) => (
                  <div key={matchupIndex} className="matchup-wrapper final-wrapper">
                    <div 
                      className={`matchup final-matchup ${matchup.team1 && matchup.team2 ? 'clickable-matchup' : ''}`}
                      onClick={() => {
                        if (matchup.team1 && matchup.team2) {
                          handleMatchupClick('final', 0, matchupIndex);
                        }
                      }}
                      title={matchup.team1 && matchup.team2 ? "Click to view betting odds" : ""}
                    >
                      <div
                        className={`team ${!matchup.team1 ? 'empty' : ''} ${
                          isBracketTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                        } ${matchup.winner === matchup.team1 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team2 ? 'wait' : ''} ${
                          champion === matchup.team1 ? 'champion' : ''
                        }`}
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
                        } ${matchup.winner === matchup.team2 ? 'winner set' : matchup.winner ? 'loser set' : matchup.team1 ? 'wait' : ''} ${
                          champion === matchup.team2 ? 'champion' : ''
                        }`}
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
                          className={`matchup third-place-matchup ${matchup.team1 && matchup.team2 ? 'clickable-matchup' : ''}`}
                          onClick={() => {
                            if (matchup.team1 && matchup.team2) {
                              handleMatchupClick('thirdPlacePlayoff', 0, matchupIndex);
                            }
                          }}
                          title={matchup.team1 && matchup.team2 ? "Click to view betting odds" : ""}
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
                                className={`matchup ${matchup.team1 && matchup.team2 ? 'clickable-matchup' : ''}`}
                                onClick={() => {
                                  if (matchup.team1 && matchup.team2) {
                                    handleMatchupClick('right', roundIndex, matchupIndex);
                                  }
                                }}
                                title={matchup.team1 && matchup.team2 ? "Click to view betting odds" : ""}
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
    </div>
  );
}

export default PredictorPage;
