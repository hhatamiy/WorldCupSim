import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import './BettingOddsPage.css';

// Helper function to extract country name (remove emoji)
function extractCountryName(teamString) {
  return teamString.split(/[\u{1F1E6}-\u{1F1FF}]{2}/u)[0].trim();
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

function BettingOddsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [odds, setOdds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupMatchups, setGroupMatchups] = useState([]);

  // Get team information from location state
  const { team1, team2, type, groupName, allTeams } = location.state || {};

  useEffect(() => {
    if (type === 'group' && allTeams && allTeams.length === 4) {
      fetchAllGroupMatchups();
    } else if (team1 && team2) {
      fetchBettingOdds();
    } else {
      setError('No matchup information provided');
      setLoading(false);
    }
  }, [team1, team2, type, allTeams]);

  const fetchAllGroupMatchups = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Generate all 6 possible matchups in a group (4 choose 2 = 6)
      const matchups = [];
      for (let i = 0; i < allTeams.length; i++) {
        for (let j = i + 1; j < allTeams.length; j++) {
          matchups.push({
            team1: allTeams[i],
            team2: allTeams[j],
          });
        }
      }

      // Fetch odds for each matchup in parallel
      const matchupPromises = matchups.map(async (matchup) => {
        try {
          const response = await api.get('/api/betting/odds', {
            params: {
              team1: matchup.team1,
              team2: matchup.team2,
              type: 'matchup',
            },
          });
          return {
            ...matchup,
            odds: response.data,
            hasOdds: response.data.odds && response.data.odds.length > 0,
            rankings: response.data.rankings || null,
          };
        } catch (err) {
          return {
            ...matchup,
            odds: null,
            hasOdds: false,
            error: true,
            rankings: null,
          };
        }
      });

      const matchupResults = await Promise.all(matchupPromises);
      console.log('Matchup results with rankings:', matchupResults);
      setGroupMatchups(matchupResults);
    } catch (err) {
      setError('Failed to fetch group matchups');
      console.error('Error fetching group matchups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBettingOdds = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/betting/odds', {
        params: {
          team1: team1,
          team2: team2,
          type: type || 'matchup',
        },
      });

      setOdds(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch betting odds');
      console.error('Error fetching odds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="betting-odds-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading betting odds...</p>
        </div>
      </div>
    );
  }

  if (error && !odds && groupMatchups.length === 0) {
    return (
      <div className="betting-odds-container">
        <header className="odds-header">
          <h1>Betting Odds</h1>
          <button onClick={handleBack} className="back-btn">
            ← Back
          </button>
        </header>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Render group matchups view
  if (type === 'group' && groupMatchups.length > 0) {
    return (
      <div className="betting-odds-container">
        <header className="odds-header">
          <div className="header-content">
            <h1>Group {groupName} - Betting Odds</h1>
            <p className="header-subtitle">All matchups within the group</p>
          </div>
          <button onClick={handleBack} className="back-btn">
            ← Back
          </button>
        </header>

        <div className="odds-content group-odds-content">
          <div className="group-matchups-grid">
            {groupMatchups.map((matchup, index) => (
              <div key={index} className="matchup-card">
                <div className="matchup-card-header">
                  <div className="matchup-teams-display">
                    <div className="matchup-team-name">
                      <span className="team-flag">
                        {extractCountryName(matchup.team1)}
                        {matchup.rankings?.team1 && (
                          <span className="inline-ranking"> ({formatRank(matchup.rankings.team1.rank)})</span>
                        )}
                      </span>
                    </div>
                    <div className="matchup-vs">VS</div>
                    <div className="matchup-team-name">
                      <span className="team-flag">
                        {extractCountryName(matchup.team2)}
                        {matchup.rankings?.team2 && (
                          <span className="inline-ranking"> ({formatRank(matchup.rankings.team2.rank)})</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {matchup.hasOdds && matchup.odds?.odds && matchup.odds.odds.length > 0 ? (
                  <div className="matchup-odds-content">
                    {matchup.odds.odds.slice(0, 2).map((bookmaker, bIndex) => (
                      <div key={bIndex} className="matchup-bookmaker">
                        <div className="matchup-bookmaker-name">
                          {bookmaker.title || bookmaker.name || `Bookmaker ${bIndex + 1}`}
                        </div>
                        {bookmaker.markets?.[0]?.outcomes && (
                          <div className="matchup-outcomes">
                            {bookmaker.markets[0].outcomes.map((outcome, oIndex) => (
                              <div key={oIndex} className="matchup-outcome">
                                <span className="outcome-label">
                                  {outcome.name === extractCountryName(matchup.team1) 
                                    ? extractCountryName(matchup.team1)
                                    : outcome.name === extractCountryName(matchup.team2)
                                    ? extractCountryName(matchup.team2)
                                    : outcome.name}
                                </span>
                                <span className="outcome-odds">
                                  {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="matchup-no-odds">
                    <div className="no-odds-icon">📊</div>
                    <p>Odds not available</p>
                    <p className="no-odds-note">Check back closer to match date</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render single matchup view
  return (
    <div className="betting-odds-container">
      <header className="odds-header">
        <div className="header-content">
          <h1>Betting Odds</h1>
          {groupName && <p className="header-subtitle">Group {groupName}</p>}
        </div>
        <button onClick={handleBack} className="back-btn">
          ← Back
        </button>
      </header>

      <div className="odds-content">
        <div className="matchup-header">
          <div className="team-display team1">
            <h2 className="team-name-large">{extractCountryName(odds?.team1 || team1)}</h2>
            <p className="team-name-full">{odds?.team1 || team1}</p>
            {odds?.rankings?.team1 && (
              <div className="fifa-ranking">
                <span className="ranking-label">FIFA Rank:</span>
                <span className="ranking-value">#{formatRank(odds.rankings.team1.rank)}</span>
                {odds.rankings.team1.points && (
                  <span className="ranking-points">({odds.rankings.team1.points} pts)</span>
                )}
              </div>
            )}
          </div>
          <div className="vs-divider">
            <span className="vs-text">VS</span>
          </div>
          <div className="team-display team2">
            <h2 className="team-name-large">{extractCountryName(odds?.team2 || team2)}</h2>
            <p className="team-name-full">{odds?.team2 || team2}</p>
            {odds?.rankings?.team2 && (
              <div className="fifa-ranking">
                <span className="ranking-label">FIFA Rank:</span>
                <span className="ranking-value">#{formatRank(odds.rankings.team2.rank)}</span>
                {odds.rankings.team2.points && (
                  <span className="ranking-points">({odds.rankings.team2.points} pts)</span>
                )}
              </div>
            )}
          </div>
        </div>

        {odds?.message && (
          <div className="info-message">
            <p>{odds.message}</p>
            <p className="info-note">
              Note: Betting odds may not be available for all matchups. 
              Odds are typically available closer to the actual match date.
            </p>
          </div>
        )}

        {odds?.odds && odds.odds.length > 0 ? (
          <div className="odds-section">
            <h2 className="section-title">Available Odds</h2>
            <div className="bookmakers-list">
              {odds.odds.map((bookmaker, index) => (
                <div key={index} className="bookmaker-card">
                  <h3 className="bookmaker-name">
                    {bookmaker.title || bookmaker.name || `Bookmaker ${index + 1}`}
                  </h3>
                  
                  {bookmaker.markets && bookmaker.markets.length > 0 ? (
                    <div className="markets">
                      {bookmaker.markets.map((market, marketIndex) => (
                        <div key={marketIndex} className="market">
                          <h4 className="market-title">
                            {market.key === 'h2h' ? 'Match Winner' : market.key}
                          </h4>
                          {market.outcomes && (
                            <div className="outcomes">
                              {market.outcomes.map((outcome, outcomeIndex) => (
                                <div key={outcomeIndex} className="outcome">
                                  <span className="outcome-name">{outcome.name}</span>
                                  <span className="outcome-price">
                                    {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-markets">
                      <p>No odds available from this bookmaker</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-odds-section">
            <div className="no-odds-icon">📊</div>
            <h2 className="no-odds-title">No Betting Odds Available</h2>
            <p className="no-odds-description">
              Betting odds are not currently available for this matchup. 
              Odds are typically published closer to the match date.
            </p>
          </div>
        )}

        {odds?.event && (
          <div className="event-details">
            <h3>Event Details</h3>
            <div className="event-info">
              {odds.event.commence_time && (
                <p><strong>Date:</strong> {new Date(odds.event.commence_time).toLocaleString()}</p>
              )}
              {odds.event.sport_title && (
                <p><strong>Sport:</strong> {odds.event.sport_title}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BettingOddsPage;

