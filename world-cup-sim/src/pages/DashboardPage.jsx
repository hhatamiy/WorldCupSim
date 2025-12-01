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
    // Round 1: 32 teams -> 16 matchups
    const round1 = [];
    for (let i = 0; i < 32; i += 2) {
      round1.push({
        team1: INITIAL_TEAMS[i],
        team2: INITIAL_TEAMS[i + 1],
        winner: null
      });
    }

    // Round 2: 16 teams -> 8 matchups (empty initially)
    const round2 = Array(8).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Round 3 (Quarterfinals): 8 teams -> 4 matchups
    const round3 = Array(4).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Round 4 (Semifinals): 4 teams -> 2 matchups
    const round4 = Array(2).fill(null).map(() => ({
      team1: null,
      team2: null,
      winner: null
    }));

    // Round 5 (Final): 2 teams -> 1 matchup
    const round5 = [{
      team1: null,
      team2: null,
      winner: null
    }];

    return [round1, round2, round3, round4, round5];
}

function DashboardPage() {
  const navigate = useNavigate();
  const [bracket, setBracket] = useState(() => initializeBracket());
  const [champion, setChampion] = useState(null);

  const handleTeamClick = (roundIndex, matchupIndex, teamPosition) => {
    if (champion) return; // Don't allow changes after champion is determined

    const newBracket = bracket.map(round => round.map(matchup => ({ ...matchup })));
    const matchup = newBracket[roundIndex][matchupIndex];
    const selectedTeam = matchup[teamPosition];

    // Check if opponent is determined
    if (roundIndex === 0) {
      // Round 1: opponent is always determined
      matchup.winner = selectedTeam;
      advanceTeam(newBracket, roundIndex, matchupIndex, selectedTeam);
    } else {
      // Other rounds: check if both teams are present
      if (matchup.team1 && matchup.team2) {
        matchup.winner = selectedTeam;
        
        // If this is the final round, set champion
        if (roundIndex === 4) {
          setChampion(selectedTeam);
        } else {
          advanceTeam(newBracket, roundIndex, matchupIndex, selectedTeam);
        }
      }
    }

    setBracket(newBracket);
  };

  const advanceTeam = (newBracket, currentRoundIndex, currentMatchupIndex, team) => {
    if (currentRoundIndex >= newBracket.length - 1) return;

    const nextRoundIndex = currentRoundIndex + 1;
    const nextMatchupIndex = Math.floor(currentMatchupIndex / 2);
    const nextMatchup = newBracket[nextRoundIndex][nextMatchupIndex];

    // Determine position in next matchup (0 for first half, 1 for second half)
    const positionInNextMatchup = currentMatchupIndex % 2 === 0 ? 'team1' : 'team2';
    
    if (!nextMatchup[positionInNextMatchup]) {
      nextMatchup[positionInNextMatchup] = team;
    }
  };

  const isTeamClickable = (roundIndex, matchupIndex) => {
    if (champion) return false;
    
    const matchup = bracket[roundIndex][matchupIndex];
    
    if (roundIndex === 0) {
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

        <div className="bracket">
          {bracket.map((round, roundIndex) => (
            <div key={roundIndex} className={`round round-${roundIndex + 1}`}>
              <div className="round-label">
                {roundIndex === 0 && 'Round of 32'}
                {roundIndex === 1 && 'Round of 16'}
                {roundIndex === 2 && 'Quarterfinals'}
                {roundIndex === 3 && 'Semifinals'}
                {roundIndex === 4 && 'Final'}
              </div>
              {round.map((matchup, matchupIndex) => (
                <div key={matchupIndex} className="matchup">
                  <div
                    className={`team ${!matchup.team1 ? 'empty' : ''} ${
                      isTeamClickable(roundIndex, matchupIndex) ? 'clickable' : ''
                    } ${matchup.winner === matchup.team1 ? 'winner' : ''} ${
                      champion === matchup.team1 ? 'champion' : ''
                    }`}
                    onClick={() => {
                      if (isTeamClickable(roundIndex, matchupIndex)) {
                        handleTeamClick(roundIndex, matchupIndex, 'team1');
                      }
                    }}
                  >
                    {matchup.team1 || 'TBD'}
                  </div>
                  <div className="vs">vs</div>
                  <div
                    className={`team ${!matchup.team2 ? 'empty' : ''} ${
                      isTeamClickable(roundIndex, matchupIndex) ? 'clickable' : ''
                    } ${matchup.winner === matchup.team2 ? 'winner' : ''} ${
                      champion === matchup.team2 ? 'champion' : ''
                    }`}
                    onClick={() => {
                      if (isTeamClickable(roundIndex, matchupIndex)) {
                        handleTeamClick(roundIndex, matchupIndex, 'team2');
                      }
                    }}
                  >
                    {matchup.team2 || 'TBD'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
