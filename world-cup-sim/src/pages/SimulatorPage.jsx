import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoundOf32Matchups } from '../utils/knockoutAlgorithm';
import api from '../api/api';
import './SimulatorPage.css';

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
      const goals1 = Math.floor(Math.random() * 3) + 1; // 1-3 goals
      const goals2 = Math.floor(Math.random() * goals1); // Less than team1
      return { team1: goals1, team2: goals2, isDraw: false, isPenalties: false };
    } else if (random < adjustedTeam1Prob + adjustedTeam2Prob) {
      // Team 2 wins in regular/extra time
      const goals2 = Math.floor(Math.random() * 3) + 1;
      const goals1 = Math.floor(Math.random() * goals2);
      return { team1: goals1, team2: goals2, isDraw: false, isPenalties: false };
    } else {
      // Goes to penalties (draw after extra time)
      // Generate a realistic draw score (0-0, 1-1, 2-2)
      const drawScore = Math.floor(Math.random() * 3); // 0, 1, or 2
      
      // Generate penalty shootout score (3-5 goals each, winner has more)
      const penaltyWinner = Math.random() < team1Prob / (team1Prob + team2Prob) ? 1 : 2;
      const winnerPens = Math.floor(Math.random() * 3) + 3; // 3-5 penalties
      const loserPens = Math.floor(Math.random() * winnerPens); // Less than winner
      
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
      const goals1 = Math.floor(Math.random() * 3) + 1;
      const goals2 = Math.floor(Math.random() * goals1);
      return { team1: goals1, team2: goals2, isDraw: false };
    } else if (random < team1Prob + team2Prob) {
      // Team 2 wins
      const goals2 = Math.floor(Math.random() * 3) + 1;
      const goals1 = Math.floor(Math.random() * goals2);
      return { team1: goals1, team2: goals2, isDraw: false };
    } else {
      // Draw
      const goals = Math.floor(Math.random() * 3); // 0-2 goals each
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

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
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
  };

  // Simulate all group stage matches
  const simulateGroupStage = async () => {
    setSimulating(true);
    const newStandings = {};
    const newMatches = {};

    try {
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

        // FIFA 2026 World Cup official match order for group stage
        // Match 1: Position 1 vs Position 2
        // Match 2: Position 3 vs Position 4
        // Match 3: Position 4 vs Position 2
        // Match 4: Position 1 vs Position 3
        // Match 5: Position 4 vs Position 1
        // Match 6: Position 2 vs Position 3
        const matchOrder = [
          [0, 1], // 1 vs 2
          [2, 3], // 3 vs 4
          [3, 1], // 4 vs 2
          [0, 2], // 1 vs 3
          [3, 0], // 4 vs 1
          [1, 2]  // 2 vs 3
        ];

        // Simulate all 6 matches in FIFA's official order
        for (const [idx1, idx2] of matchOrder) {
          const team1 = teamNames[idx1];
          const team2 = teamNames[idx2];

            try {
              // Get match probabilities from API
              const response = await api.get('/api/betting/odds', {
                params: {
                  team1: team1,
                  team2: team2,
                  type: 'group',
                },
              });

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
                isDraw: score.isDraw
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
                isDraw: score.isDraw
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
      final: final
    });

    setCurrentView('bracket');
  };

  // Simulate knockout stage matches
  const simulateKnockoutStage = async () => {
    if (!knockoutBracket) return;
    
    setSimulating(true);
    setSimulatedKnockout(true);

    try {
      const newBracket = {
        left: knockoutBracket.left.map(round => round.map(matchup => ({ ...matchup }))),
        right: knockoutBracket.right.map(round => round.map(matchup => ({ ...matchup }))),
        final: knockoutBracket.final.map(matchup => ({ ...matchup }))
      };

      // Simulate Round of 32
      await simulateRound(newBracket, 'left', 0);
      await simulateRound(newBracket, 'right', 0);

      // Simulate Round of 16
      await simulateRound(newBracket, 'left', 1);
      await simulateRound(newBracket, 'right', 1);

      // Simulate Quarterfinals
      await simulateRound(newBracket, 'left', 2);
      await simulateRound(newBracket, 'right', 2);

      // Simulate Semifinals
      await simulateRound(newBracket, 'left', 3);
      await simulateRound(newBracket, 'right', 3);

      // Simulate Final
      await simulateRound(newBracket, 'final', 0);

      setKnockoutBracket(newBracket);
      if (newBracket.final[0].winner) {
        setChampion(newBracket.final[0].winner);
      }
    } catch (error) {
      console.error('Error simulating knockout stage:', error);
    } finally {
      setSimulating(false);
    }
  };

  const simulateRound = async (bracket, side, roundIndex) => {
    const round = side === 'final' ? bracket.final : bracket[side][roundIndex];
    
    for (let i = 0; i < round.length; i++) {
      const matchup = round[i];
      if (!matchup.team1 || !matchup.team2) continue;
      if (matchup.winner) continue; // Already simulated

      try {
        const response = await api.get('/api/betting/odds', {
          params: {
            team1: matchup.team1,
            team2: matchup.team2,
            type: 'matchup',
          },
        });

        const odds = response.data;
        let team1Prob = 0.5;
        let team2Prob = 0.5;

        if (odds.odds && odds.odds.length > 0) {
          const bookmaker = odds.odds[0];
          if (bookmaker.markets && bookmaker.markets.length > 0) {
            const market = bookmaker.markets[0];
            if (market.outcomes) {
              market.outcomes.forEach(outcome => {
                if (outcome.isPenalty) return;
                const outcomeName = extractCountryName(outcome.name);
                const team1Name = extractCountryName(matchup.team1);
                const team2Name = extractCountryName(matchup.team2);
                
                if (outcomeName === team1Name) {
                  team1Prob = outcome.probability || 0.5;
                } else if (outcomeName === team2Name) {
                  team2Prob = outcome.probability || 0.5;
                }
              });
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
          return;
        }

        const nextRoundIndex = roundIndex + 1;
        if (nextRoundIndex >= bracket[side].length) {
          // Advance to final
          const finalMatchup = bracket.final[0];
          const position = side === 'left' ? 'team1' : 'team2';
          if (!finalMatchup[position]) {
            finalMatchup[position] = matchup.winner;
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
          <button onClick={handleLogout} className="logout-btn">
            Logout
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
                  <div key={groupName} className="group-card">
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
                                <span className="team-name">{team.team}</span>
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
                            <span className="pot-badge">Pot {team.pot}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {simulatedGroups && matches.length > 0 && (
                      <div className="matches-section">
                        <h4>Matches</h4>
                        {matches.map((match, idx) => (
                          <div key={idx} className="match-result">
                            {match.team1} {match.score1} - {match.score2} {match.team2}
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
            
            <div className="action-section">
              <button 
                onClick={simulateKnockoutStage} 
                className="simulate-btn"
                disabled={simulating || simulatedKnockout}
              >
                {simulating ? 'Simulating...' : simulatedKnockout ? 'Knockout Stage Simulated' : 'Simulate Knockout Stage'}
              </button>
            </div>
            
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
                      <div className="round-matchups">
                        {round.map((matchup, matchupIndex) => (
                          <div key={matchupIndex} className="matchup-wrapper">
                            <div className="matchup">
                              <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner' : ''}`}>
                                {matchup.team1 || 'TBD'}
                              </div>
                              {simulatedKnockout && matchup.score1 !== null && (
                                <div className="match-score">
                                  {matchup.score1} - {matchup.score2}
                                  {matchup.isPenalties && (
                                    <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                                  )}
                                </div>
                              )}
                              <div className="vs">vs</div>
                              <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner' : ''}`}>
                                {matchup.team2 || 'TBD'}
                              </div>
                            </div>
                            {roundIndex < knockoutBracket.left.length - 1 && (
                              <div className="connector connector-right"></div>
                            )}
                          </div>
                        ))}
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
                    <div className="matchup final-matchup">
                      <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner' : ''} ${champion === matchup.team1 ? 'champion' : ''}`}>
                        {matchup.team1 || 'TBD'}
                      </div>
                      {simulatedKnockout && matchup.score1 !== null && (
                        <div className="match-score">
                          {matchup.score1} - {matchup.score2}
                          {matchup.isPenalties && (
                            <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                          )}
                        </div>
                      )}
                      <div className="vs">vs</div>
                      <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner' : ''} ${champion === matchup.team2 ? 'champion' : ''}`}>
                        {matchup.team2 || 'TBD'}
                      </div>
                    </div>
                    {matchup.winner && (
                      <div className="champion-box">
                        <div className="champion-team">{matchup.winner}</div>
                      </div>
                    )}
                  </div>
                ))}
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
                      <div className="round-matchups">
                        {[...round].reverse().map((matchup, reversedIndex) => {
                          const matchupIndex = round.length - 1 - reversedIndex;
                          return (
                            <div key={matchupIndex} className="matchup-wrapper">
                              {roundIndex < knockoutBracket.right.length - 1 && (
                                <div className="connector connector-left"></div>
                              )}
                              <div className="matchup">
                                <div className={`team ${!matchup.team1 ? 'empty' : ''} ${matchup.winner === matchup.team1 ? 'winner' : ''}`}>
                                  {matchup.team1 || 'TBD'}
                                </div>
                                {simulatedKnockout && matchup.score1 !== null && (
                                  <div className="match-score">
                                    {matchup.score1} - {matchup.score2}
                                    {matchup.isPenalties && (
                                      <span className="penalty-notation"> ({matchup.penaltyScore1}-{matchup.penaltyScore2} pens)</span>
                                    )}
                                  </div>
                                )}
                                <div className="vs">vs</div>
                                <div className={`team ${!matchup.team2 ? 'empty' : ''} ${matchup.winner === matchup.team2 ? 'winner' : ''}`}>
                                  {matchup.team2 || 'TBD'}
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

export default SimulatorPage;

