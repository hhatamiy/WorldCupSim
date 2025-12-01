import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

// 32 teams with emojis - mix of qualified and temporary teams
const INITIAL_TEAMS = [
  'USA 🇺🇸', 'Canada 🇨🇦', 'Mexico 🇲🇽', 'Argentina 🇦🇷',
  'Brazil 🇧🇷', 'Colombia 🇨🇴', 'Ecuador 🇪🇨', 'Paraguay 🇵🇾',
  'Uruguay 🇺🇾', 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France 🇫🇷', 'Germany 🇩🇪',
  'Spain 🇪🇸', 'Italy 🇮🇹', 'Portugal 🇵🇹', 'Netherlands 🇳🇱',
  'Belgium 🇧🇪', 'Croatia 🇭🇷', 'Switzerland 🇨🇭', 'Austria 🇦🇹',
  'Japan 🇯🇵', 'South Korea 🇰🇷', 'Australia 🇦🇺', 'Saudi Arabia 🇸🇦',
  'Morocco 🇲🇦', 'Senegal 🇸🇳', 'Egypt 🇪🇬', 'Ghana 🇬🇭',
  'Nigeria 🇳🇬', 'Cameroon 🇨🇲', 'Tunisia 🇹🇳', 'Algeria 🇩🇿'
];

function initializeBracket() {
    // Split teams into left and right halves
    const leftHalf = INITIAL_TEAMS.slice(0, 16);
    const rightHalf = INITIAL_TEAMS.slice(16, 32);

    // Left half: Round 1 (8 matchups)
    const leftRound1 = [];
    for (let i = 0; i < 16; i += 2) {
      leftRound1.push({
        team1: leftHalf[i],
        team2: leftHalf[i + 1],
        winner: null
      });
    }

    // Right half: Round 1 (8 matchups)
    const rightRound1 = [];
    for (let i = 0; i < 16; i += 2) {
      rightRound1.push({
        team1: rightHalf[i],
        team2: rightHalf[i + 1],
        winner: null
      });
    }

    // Left half: Round 2 (4 matchups)
    const leftRound2 = Array(4).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Right half: Round 2 (4 matchups)
    const rightRound2 = Array(4).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Left half: Round 3 (2 matchups)
    const leftRound3 = Array(2).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Right half: Round 3 (2 matchups)
    const rightRound3 = Array(2).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Left half: Round 4 (1 matchup)
    const leftRound4 = [{
      team1: null,
      team2: null,
      winner: null
    }];

    // Right half: Round 4 (1 matchup)
    const rightRound4 = [{
      team1: null,
      team2: null,
      winner: null
    }];

    // Final: 1 matchup
    const final = [{
      team1: null,
      team2: null,
      winner: null
    }];

    return {
      left: [leftRound1, leftRound2, leftRound3, leftRound4],
      right: [rightRound1, rightRound2, rightRound3, rightRound4],
      final: final
    };
}

function DashboardPage() {
  const navigate = useNavigate();
  const [bracket, setBracket] = useState(() => initializeBracket());
  const [champion, setChampion] = useState(null);

  const handleTeamClick = (side, roundIndex, matchupIndex, teamPosition) => {
    if (champion) return; // Don't allow changes after champion is determined

    const newBracket = {
      left: bracket.left.map(round => round.map(matchup => ({ ...matchup }))),
      right: bracket.right.map(round => round.map(matchup => ({ ...matchup }))),
      final: bracket.final.map(matchup => ({ ...matchup }))
    };

    let matchup;
    if (side === 'final') {
      matchup = newBracket.final[matchupIndex];
    } else {
      matchup = newBracket[side][roundIndex][matchupIndex];
    }

    const selectedTeam = matchup[teamPosition];

    // Check if opponent is determined
    if (side === 'final') {
      // Final: check if both teams are present
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
        setChampion(selectedTeam);
      }
    } else if (roundIndex === 0) {
      // Round 1: opponent is always determined
      matchup.winner = selectedTeam;
      advanceTeam(newBracket, side, roundIndex, matchupIndex, selectedTeam);
    } else {
      // Other rounds: check if both teams are present
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
        advanceTeam(newBracket, side, roundIndex, matchupIndex, selectedTeam);
      }
    }

    setBracket(newBracket);
  };

  const advanceTeam = (newBracket, side, currentRoundIndex, currentMatchupIndex, team) => {
    if (side === 'final') return;

    const nextRoundIndex = currentRoundIndex + 1;
    
    // If this is the last round of a side, advance to final
    if (nextRoundIndex >= newBracket[side].length) {
      const finalMatchup = newBracket.final[0];
      const position = side === 'left' ? 'team1' : 'team2';
      if (!finalMatchup[position]) {
        finalMatchup[position] = team;
      }
    } else {
      const nextMatchupIndex = Math.floor(currentMatchupIndex / 2);
      const nextMatchup = newBracket[side][nextRoundIndex][nextMatchupIndex];
      
      // Determine position in next matchup (0 for first half, 1 for second half)
      const positionInNextMatchup = currentMatchupIndex % 2 === 0 ? 'team1' : 'team2';
      
      if (!nextMatchup[positionInNextMatchup]) {
        nextMatchup[positionInNextMatchup] = team;
      }
    }
  };

  const isTeamClickable = (side, roundIndex, matchupIndex) => {
    if (champion) return false;
    
    let matchup;
    if (side === 'final') {
      matchup = bracket.final[matchupIndex];
    } else {
      matchup = bracket[side][roundIndex][matchupIndex];
    }
    
    if (side === 'final') {
      return matchup.team1 && matchup.team2 && matchup.winner === null;
    } else if (roundIndex === 0) {
      // Round 1: always clickable
      return matchup.winner === null;
    } else {
      // Other rounds: clickable only if both teams are present and no winner yet
      return matchup.team1 && matchup.team2 && matchup.winner === null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const handleReset = () => {
    setBracket(initializeBracket());
    setChampion(null);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>World Cup 2026 Bracket</h1>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            Reset Bracket
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="bracket-container">
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
            {bracket.left.map((round, roundIndex) => (
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
                            isTeamClickable('left', roundIndex, matchupIndex) ? 'clickable' : ''
                          } ${matchup.winner === matchup.team1 ? 'winner' : ''}`}
                          onClick={() => {
                            if (isTeamClickable('left', roundIndex, matchupIndex)) {
                              handleTeamClick('left', roundIndex, matchupIndex, 'team1');
                            }
                          }}
                        >
                          {matchup.team1 || 'TBD'}
                        </div>
                        <div className="vs">vs</div>
                        <div
                          className={`team ${!matchup.team2 ? 'empty' : ''} ${
                            isTeamClickable('left', roundIndex, matchupIndex) ? 'clickable' : ''
                          } ${matchup.winner === matchup.team2 ? 'winner' : ''}`}
                          onClick={() => {
                            if (isTeamClickable('left', roundIndex, matchupIndex)) {
                              handleTeamClick('left', roundIndex, matchupIndex, 'team2');
                            }
                          }}
                        >
                          {matchup.team2 || 'TBD'}
                        </div>
                      </div>
                      {roundIndex < bracket.left.length - 1 && (
                        <div className="connector connector-right"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Final (Center) */}
          <div className="bracket-center">
            <div className="round-label">Final</div>
            {bracket.final.map((matchup, matchupIndex) => (
              <div key={matchupIndex} className="matchup-wrapper final-wrapper">
                <div className="matchup final-matchup">
                  <div
                    className={`team ${!matchup.team1 ? 'empty' : ''} ${
                      isTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                    } ${matchup.winner === matchup.team1 ? 'winner' : ''} ${
                      champion === matchup.team1 ? 'champion' : ''
                    }`}
                    onClick={() => {
                      if (isTeamClickable('final', 0, matchupIndex)) {
                        handleTeamClick('final', 0, matchupIndex, 'team1');
                      }
                    }}
                  >
                    {matchup.team1 || 'TBD'}
                  </div>
                  <div className="vs">vs</div>
                  <div
                    className={`team ${!matchup.team2 ? 'empty' : ''} ${
                      isTeamClickable('final', 0, matchupIndex) ? 'clickable' : ''
                    } ${matchup.winner === matchup.team2 ? 'winner' : ''} ${
                      champion === matchup.team2 ? 'champion' : ''
                    }`}
                    onClick={() => {
                      if (isTeamClickable('final', 0, matchupIndex)) {
                        handleTeamClick('final', 0, matchupIndex, 'team2');
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

          {/* Right Half - Reversed to face center */}
          <div className="bracket-half bracket-right">
            {[...bracket.right].reverse().map((round, reversedRoundIndex) => {
              const roundIndex = bracket.right.length - 1 - reversedRoundIndex;
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
                          {roundIndex < bracket.right.length - 1 && (
                            <div className="connector connector-left"></div>
                          )}
                          <div className="matchup">
                            <div
                              className={`team ${!matchup.team1 ? 'empty' : ''} ${
                                isTeamClickable('right', roundIndex, matchupIndex) ? 'clickable' : ''
                              } ${matchup.winner === matchup.team1 ? 'winner' : ''}`}
                              onClick={() => {
                                if (isTeamClickable('right', roundIndex, matchupIndex)) {
                                  handleTeamClick('right', roundIndex, matchupIndex, 'team1');
                                }
                              }}
                            >
                              {matchup.team1 || 'TBD'}
                            </div>
                            <div className="vs">vs</div>
                            <div
                              className={`team ${!matchup.team2 ? 'empty' : ''} ${
                                isTeamClickable('right', roundIndex, matchupIndex) ? 'clickable' : ''
                              } ${matchup.winner === matchup.team2 ? 'winner' : ''}`}
                              onClick={() => {
                                if (isTeamClickable('right', roundIndex, matchupIndex)) {
                                  handleTeamClick('right', roundIndex, matchupIndex, 'team2');
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
    </div>
  );
}

export default DashboardPage;
