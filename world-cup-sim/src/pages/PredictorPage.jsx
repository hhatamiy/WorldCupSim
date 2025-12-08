import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
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

function PredictorPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(() => initializeGroups());
  const [thirdPlaceTeams, setThirdPlaceTeams] = useState([]);
  const [knockoutBracket, setKnockoutBracket] = useState(null);
  const [champion, setChampion] = useState(null);
  const [draggedTeam, setDraggedTeam] = useState(null);
  const [currentView, setCurrentView] = useState('groups'); // 'groups', 'third-place', 'bracket'
  const [groupWinnerProbs, setGroupWinnerProbs] = useState({});
  const [draggedThirdPlaceIndex, setDraggedThirdPlaceIndex] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const handleReset = () => {
    setGroups(initializeGroups());
    setThirdPlaceTeams([]);
    setKnockoutBracket(null);
    setChampion(null);
    setCurrentView('groups');
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
  };

  // Advance teams to third place ranking
  const advanceToThirdPlace = () => {
    const groupNames = Object.keys(groups);
    const thirdPlace = groupNames.map(groupName => ({
      groupName,
      team: groups[groupName].teams[2], // 3rd position (index 2)
      points: 0, // User will rank these
      goalDifference: 0,
      goalsScored: 0
    }));
    setThirdPlaceTeams(thirdPlace);
    setCurrentView('third-place');
  };

  // Move third place team up/down in ranking
  const moveThirdPlaceTeam = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === thirdPlaceTeams.length - 1)) {
      return;
    }

    const newThirdPlace = [...thirdPlaceTeams];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newThirdPlace[index], newThirdPlace[targetIndex]] = [newThirdPlace[targetIndex], newThirdPlace[index]];
    
    setThirdPlaceTeams(newThirdPlace);
  };

  // Drag and drop handlers for third place ranking
  const handleThirdPlaceDragStart = (e, index) => {
    setDraggedThirdPlaceIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

  const handleThirdPlaceDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleThirdPlaceDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedThirdPlaceIndex === null || draggedThirdPlaceIndex === targetIndex) {
      setDraggedThirdPlaceIndex(null);
      return;
    }

    const newThirdPlace = [...thirdPlaceTeams];
    
    // Swap teams
    [newThirdPlace[draggedThirdPlaceIndex], newThirdPlace[targetIndex]] = 
      [newThirdPlace[targetIndex], newThirdPlace[draggedThirdPlaceIndex]];
    
    setThirdPlaceTeams(newThirdPlace);
    setDraggedThirdPlaceIndex(null);
  };

  // Generate knockout bracket with proper FIFA matching algorithm
  const generateKnockoutBracket = () => {
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    // Get group winners, runners-up, and top 8 third-place teams
    const groupWinners = {};
    const runnersUp = {};
    const top8Third = thirdPlaceTeams.slice(0, 8);
    const thirdPlaceGroups = new Set(top8Third.map(item => item.groupName));
    
    groupNames.forEach(groupName => {
      if (groups[groupName]) {
        groupWinners[groupName] = groups[groupName].teams[0].name;
        runnersUp[groupName] = groups[groupName].teams[1].name;
      }
    });

    // Determine which groups' third-place teams advanced
    const thirdPlaceMap = {};
    top8Third.forEach(item => {
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

  // Bracket team click handler (from previous implementation)
  const handleBracketTeamClick = (side, roundIndex, matchupIndex, teamPosition) => {
    if (champion || !knockoutBracket) return;

    const newBracket = {
      left: knockoutBracket.left.map(round => round.map(matchup => ({ ...matchup }))),
      right: knockoutBracket.right.map(round => round.map(matchup => ({ ...matchup }))),
      final: knockoutBracket.final.map(matchup => ({ ...matchup }))
    };

    let matchup;
    if (side === 'final') {
      matchup = newBracket.final[matchupIndex];
    } else {
      matchup = newBracket[side][roundIndex][matchupIndex];
    }

    const selectedTeam = matchup[teamPosition];

    if (side === 'final') {
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
        setChampion(selectedTeam);
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
    if (side === 'final') return;

    const nextRoundIndex = currentRoundIndex + 1;
    
    if (nextRoundIndex >= newBracket[side].length) {
      const finalMatchup = newBracket.final[0];
      const position = side === 'left' ? 'team1' : 'team2';
      if (!finalMatchup[position]) {
        finalMatchup[position] = team;
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
    } else {
      matchup = knockoutBracket[side][roundIndex][matchupIndex];
    }
    
    if (side === 'final') {
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
          round: roundNames[roundIndex] || 'Final',
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
          <button onClick={handleLogout} className="logout-btn">
            Logout
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
            <h2>Rank Third Place Teams</h2>
            <p className="instruction-text">Top 8 teams will advance to the knockout stage</p>
            
            <div className="third-place-table">
              {thirdPlaceTeams.map((item, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`third-place-row ${index < 8 ? 'qualified' : 'eliminated'} ${draggedThirdPlaceIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleThirdPlaceDragStart(e, index)}
                    onDragOver={handleThirdPlaceDragOver}
                    onDrop={(e) => handleThirdPlaceDrop(e, index)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="rank-number">{index + 1}</div>
                    <div className="team-info">
                      <span className="group-label">Group {item.groupName}</span>
                      <span className="team-name">{item.team.name}</span>
                    </div>
                    <div className="rank-controls">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveThirdPlaceTeam(index, 'up');
                        }}
                        disabled={index === 0}
                        className="rank-btn"
                      >
                        ▲
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveThirdPlaceTeam(index, 'down');
                        }}
                        disabled={index === thirdPlaceTeams.length - 1}
                        className="rank-btn"
                      >
                        ▼
                      </button>
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
                        {round.map((matchup, matchupIndex) => (
                          <div key={matchupIndex} className="matchup-wrapper">
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
                                {matchup.team1 || 'TBD'}
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
                                {matchup.team2 || 'TBD'}
                              </div>
                            </div>
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
                        } ${matchup.winner === matchup.team1 ? 'winner' : ''} ${
                          champion === matchup.team1 ? 'champion' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBracketTeamClickable('final', 0, matchupIndex)) {
                            handleBracketTeamClick('final', 0, matchupIndex, 'team1');
                          }
                        }}
                      >
                        {matchup.team1 || 'TBD'}
                      </div>
                      <div className="vs">vs</div>
                      <div
                        className={`team ${!matchup.team2 ? 'empty' : ''} ${
                          isBracketTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                        } ${matchup.winner === matchup.team2 ? 'winner' : ''} ${
                          champion === matchup.team2 ? 'champion' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBracketTeamClickable('final', 0, matchupIndex)) {
                            handleBracketTeamClick('final', 0, matchupIndex, 'team2');
                          }
                        }}
                      >
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
                      <div className={`round-matchups-${roundIndex + 1}`}>
                        {[...round].reverse().map((matchup, reversedIndex) => {
                          const matchupIndex = round.length - 1 - reversedIndex;
                          return (
                            <div key={matchupIndex} className="matchup-wrapper">
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
                                  } ${matchup.winner === matchup.team1 ? 'winner' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isBracketTeamClickable('right', roundIndex, matchupIndex)) {
                                      handleBracketTeamClick('right', roundIndex, matchupIndex, 'team1');
                                    }
                                  }}
                                >
                                  {matchup.team1 || 'TBD'}
                                </div>
                                <div className="vs">vs</div>
                                <div
                                  className={`team ${!matchup.team2 ? 'empty' : ''} ${
                                    isBracketTeamClickable('right', roundIndex, matchupIndex) ? 'clickable' : ''
                                  } ${matchup.winner === matchup.team2 ? 'winner' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isBracketTeamClickable('right', roundIndex, matchupIndex)) {
                                      handleBracketTeamClick('right', roundIndex, matchupIndex, 'team2');
                                    }
                                  }}
                                >
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

export default PredictorPage;
