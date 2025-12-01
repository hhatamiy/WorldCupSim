import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

// 48 teams organized by pots
const POTS = {
  pot1: [
    'United States 🇺🇸', 'Mexico 🇲🇽', 'Canada 🇨🇦', 'Spain 🇪🇸',
    'Argentina 🇦🇷', 'France 🇫🇷', 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Brazil 🇧🇷',
    'Portugal 🇵🇹', 'Netherlands 🇳🇱', 'Belgium 🇧🇪', 'Germany 🇩🇪'
  ],
  pot2: [
    'Croatia 🇭🇷', 'Morocco 🇲🇦', 'Colombia 🇨🇴', 'Uruguay 🇺🇾',
    'Switzerland 🇨🇭', 'Japan 🇯🇵', 'Senegal 🇸🇳', 'Iran 🇮🇷',
    'South Korea 🇰🇷', 'Ecuador 🇪🇨', 'Austria 🇦🇹', 'Australia 🇦🇺'
  ],
  pot3: [
    'Norway 🇳🇴', 'Panama 🇵🇦', 'Egypt 🇪🇬', 'Algeria 🇩🇿',
    'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Paraguay 🇵🇾', 'Tunisia 🇹🇳', 'Ivory Coast 🇨🇮',
    'Uzbekistan 🇺🇿', 'Qatar 🇶🇦', 'Saudi Arabia 🇸🇦', 'South Africa 🇿🇦'
  ],
  pot4: [
    'Jordan 🇯🇴', 'Cape Verde 🇨🇻', 'Ghana 🇬🇭', 'Curaçao 🇨🇼',
    'Haiti 🇭🇹', 'New Zealand 🇳🇿', 'Italy 🇮🇹', 'Ukraine 🇺🇦',
    'Turkey 🇹🇷', 'Czech Republic 🇨🇿', 'Iraq 🇮🇶', 'DR Congo 🇨🇩'
  ]
};

function initializeGroups() {
  const groups = {};
  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  
  groupNames.forEach((groupName, index) => {
    groups[groupName] = {
      teams: [
        { name: POTS.pot1[index], pot: 1, position: 1 },
        { name: POTS.pot2[index], pot: 2, position: 2 },
        { name: POTS.pot3[index], pot: 3, position: 3 },
        { name: POTS.pot4[index], pot: 4, position: 4 }
      ]
    };
  });
  
  return groups;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(() => initializeGroups());
  const [thirdPlaceTeams, setThirdPlaceTeams] = useState([]);
  const [knockoutBracket, setKnockoutBracket] = useState(null);
  const [champion, setChampion] = useState(null);
  const [draggedTeam, setDraggedTeam] = useState(null);
  const [currentView, setCurrentView] = useState('groups'); // 'groups', 'third-place', 'bracket'

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

    // FIFA 2026 Round of 32 matching algorithm
    // Based on which groups' third-place teams advance, determine matchups
    const roundOf32 = [];

    // Helper function to get third-place team from specific group combinations
    // FIFA algorithm: returns the first qualifying third-place team from the possible groups
    // The priority order is determined by the order of groups in the possibleGroups array
    const getThirdPlace = (possibleGroups) => {
      // Check groups in the order specified (FIFA priority order)
      for (const group of possibleGroups) {
        if (thirdPlaceGroups.has(group) && thirdPlaceMap[group]) {
          return thirdPlaceMap[group];
        }
      }
      // If no third-place team from these groups advanced, return null
      return null;
    };

    // FIFA 2026 Round of 32 matchups based on the official bracket format
    // The matching depends on which groups' third-place teams advance
    // Following the pattern from the official bracket image

    // Top Quarter (Matches 1-4) - Left side, top
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

    // Second Quarter (Matches 5-8) - Left side, second
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

    // Third Quarter (Matches 9-12) - Right side, top
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

    // Fourth Quarter (Matches 13-16) - Right side, bottom
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>World Cup 2026 Simulator</h1>
        <div className="header-actions">
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
            <p className="instruction-text">Drag and drop teams to swap positions</p>
            
            <div className="groups-grid">
              {Object.keys(groups).map((groupName) => (
                <div key={groupName} className="group-card">
                  <h3>Group {groupName}</h3>
                  <div className="group-teams">
                    {groups[groupName].teams.map((team, index) => (
                      <div
                        key={index}
                        className={`group-team pot-${team.pot}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, groupName, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, groupName, index)}
                      >
                        <span className="position-number">{index + 1}.</span>
                        <span className="team-name">{team.name}</span>
                        <span className="pot-badge">Pot {team.pot}</span>
                      </div>
                    ))}
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
                <div
                  key={index}
                  className={`third-place-row ${index < 8 ? 'qualified' : 'eliminated'}`}
                >
                  <div className="rank-number">{index + 1}</div>
                  <div className="team-info">
                    <span className="group-label">Group {item.groupName}</span>
                    <span className="team-name">{item.team.name}</span>
                  </div>
                  <div className="rank-controls">
                    <button
                      onClick={() => moveThirdPlaceTeam(index, 'up')}
                      disabled={index === 0}
                      className="rank-btn"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveThirdPlaceTeam(index, 'down')}
                      disabled={index === thirdPlaceTeams.length - 1}
                      className="rank-btn"
                    >
                      ▼
                    </button>
                  </div>
                  {index === 7 && <div className="cutoff-line">Qualification Line</div>}
                </div>
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
                      <div className="round-matchups">
                        {round.map((matchup, matchupIndex) => (
                          <div key={matchupIndex} className="matchup-wrapper">
                            <div className="matchup">
                              <div
                                className={`team ${!matchup.team1 ? 'empty' : ''} ${
                                  isBracketTeamClickable('left', roundIndex, matchupIndex) ? 'clickable' : ''
                                } ${matchup.winner === matchup.team1 ? 'winner' : ''}`}
                                onClick={() => {
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
                                } ${matchup.winner === matchup.team2 ? 'winner' : ''}`}
                                onClick={() => {
                                  if (isBracketTeamClickable('left', roundIndex, matchupIndex)) {
                                    handleBracketTeamClick('left', roundIndex, matchupIndex, 'team2');
                                  }
                                }}
                              >
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
                      <div
                        className={`team ${!matchup.team1 ? 'empty' : ''} ${
                          isBracketTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                        } ${matchup.winner === matchup.team1 ? 'winner' : ''} ${
                          champion === matchup.team1 ? 'champion' : ''
                        }`}
                        onClick={() => {
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
                        onClick={() => {
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
                      <div className="round-matchups">
                        {[...round].reverse().map((matchup, reversedIndex) => {
                          const matchupIndex = round.length - 1 - reversedIndex;
                          return (
                            <div key={matchupIndex} className="matchup-wrapper">
                              {roundIndex < knockoutBracket.right.length - 1 && (
                                <div className="connector connector-left"></div>
                              )}
                              <div className="matchup">
                                <div
                                  className={`team ${!matchup.team1 ? 'empty' : ''} ${
                                    isBracketTeamClickable('right', roundIndex, matchupIndex) ? 'clickable' : ''
                                  } ${matchup.winner === matchup.team1 ? 'winner' : ''}`}
                                  onClick={() => {
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
                                  onClick={() => {
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

export default DashboardPage;
