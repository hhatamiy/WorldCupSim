import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_MATCHES } from '../data/matchSchedule';
import './FixturesPage.css';

// Team name mapping from simple names to full names with emojis
const TEAM_NAME_MAP = {
  'Mexico': 'Mexico 🇲🇽',
  'South Africa': 'South Africa 🇿🇦',
  'South Korea': 'South Korea 🇰🇷',
  'Czechia': 'Czechia 🇨🇿',
  'Canada': 'Canada 🇨🇦',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina 🇧🇦',
  'Qatar': 'Qatar 🇶🇦',
  'Switzerland': 'Switzerland 🇨🇭',
  'Brazil': 'Brazil 🇧🇷',
  'Morocco': 'Morocco 🇲🇦',
  'Haiti': 'Haiti 🇭🇹',
  'Scotland': 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'United States': 'United States 🇺🇸',
  'USA': 'United States 🇺🇸',
  'Paraguay': 'Paraguay 🇵🇾',
  'Australia': 'Australia 🇦🇺',
  'Turkey': 'Turkey 🇹🇷',
  'Germany': 'Germany 🇩🇪',
  'Curaçao': 'Curaçao 🇨🇼',
  'Ivory Coast': 'Ivory Coast 🇨🇮',
  'Côte d\'Ivoire': 'Ivory Coast 🇨🇮',
  'Ecuador': 'Ecuador 🇪🇨',
  'Netherlands': 'Netherlands 🇳🇱',
  'Japan': 'Japan 🇯🇵',
  'Sweden': 'Sweden 🇸🇪',
  'Tunisia': 'Tunisia 🇹🇳',
  'Belgium': 'Belgium 🇧🇪',
  'Egypt': 'Egypt 🇪🇬',
  'Iran': 'Iran 🇮🇷',
  'New Zealand': 'New Zealand 🇳🇿',
  'Spain': 'Spain 🇪🇸',
  'Cape Verde': 'Cape Verde 🇨🇻',
  'Saudi Arabia': 'Saudi Arabia 🇸🇦',
  'Uruguay': 'Uruguay 🇺🇾',
  'France': 'France 🇫🇷',
  'Senegal': 'Senegal 🇸🇳',
  'Iraq': 'Iraq 🇮🇶',
  'Norway': 'Norway 🇳🇴',
  'Argentina': 'Argentina 🇦🇷',
  'Algeria': 'Algeria 🇩🇿',
  'Austria': 'Austria 🇦🇹',
  'Jordan': 'Jordan 🇯🇴',
  'Portugal': 'Portugal 🇵🇹',
  'DR Congo': 'DR Congo 🇨🇩',
  'Uzbekistan': 'Uzbekistan 🇺🇿',
  'Colombia': 'Colombia 🇨🇴',
  'England': 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croatia': 'Croatia 🇭🇷',
  'Ghana': 'Ghana 🇬🇭',
  'Panama': 'Panama 🇵🇦'
};

// Helper function to extract country name (remove emoji)
function extractCountryName(teamString) {
  if (!teamString) return '';
  let cleaned = teamString
    .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '')
    .replace(/🏴[󠁁-󠁿]*/gu, '')
    .trim();
  return cleaned;
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

// Helper to convert simple team name to full name with emoji
function getFullTeamName(simpleName) {
  if (!simpleName) return '';
  
  // Replace placeholder playoff/path winners with confirmed qualified teams
  const QUALIFIED_PLACEHOLDER_MAP = {
    'UEFA Path A winner': 'Bosnia and Herzegovina 🇧🇦',
    'UEFA Path B winner': 'Sweden 🇸🇪',
    'UEFA Path C winner': 'Turkey 🇹🇷',
    'UEFA Path D winner': 'Czechia 🇨🇿',
    'IC Path 1 winner': 'DR Congo 🇨🇩',
    'IC Path 2 winner': 'Iraq 🇮🇶',
  };
  if (QUALIFIED_PLACEHOLDER_MAP[simpleName]) {
    return QUALIFIED_PLACEHOLDER_MAP[simpleName];
  }

  // Handle placeholder teams with appropriate emojis
  if (simpleName.includes('UEFA Path')) {
    return `🇪🇺 ${simpleName}`;
  }
  if (simpleName.includes('IC Path')) {
    return `🌎 ${simpleName}`;
  }
  if (simpleName.includes('winner') && !simpleName.includes('UEFA') && !simpleName.includes('IC')) {
    // Generic winner, check context or default to UEFA
    if (simpleName.includes('UEFA')) {
      return `🇪🇺 ${simpleName}`;
    }
    return `🌎 ${simpleName}`;
  }
  return TEAM_NAME_MAP[simpleName] || simpleName;
}

// Helper to format knockout stage team abbreviations
function formatKnockoutTeamAbbreviation(teamName, isKnockoutStage, roundName) {
  if (!teamName || !isKnockoutStage) return teamName;
  
  // For Round of 32 and beyond: Handle "Runner-up Group X" -> "2X"
  if (teamName.startsWith('Runner-up Group ')) {
    const group = teamName.replace('Runner-up Group ', '');
    return `2${group}`;
  }
  
  // For Round of 32 and beyond: Handle "Winner Group X" -> "1X"
  if (teamName.startsWith('Winner Group ')) {
    const group = teamName.replace('Winner Group ', '');
    return `1${group}`;
  }
  
  // For Round of 16 and beyond: Handle "Winner Match ##" -> "W##" (not "WM##")
  if (teamName.startsWith('Winner Match ')) {
    const matchNum = teamName.replace('Winner Match ', '');
    const isRo16OrLater = roundName === 'Round of 16' || roundName === 'Quarter Finals' || 
                          roundName === 'Semi Finals' || roundName === 'Third Place Playoff' || 
                          roundName === 'Final';
    if (isRo16OrLater) {
      return `W${matchNum}`;
    }
    // Shouldn't happen in Round of 32, but if it does, format it
    return `W${matchNum}`;
  }
  
  // Handle "Loser Match ##" -> "L##"
  if (teamName.startsWith('Loser Match ')) {
    const matchNum = teamName.replace('Loser Match ', '');
    return `L${matchNum}`;
  }
  
  // Handle "3rd Group X/Y/Z" - expand format: "3X/Y/Z" (allow more characters)
  if (teamName.startsWith('3rd Group ')) {
    // Extract the groups part (e.g., "A/B/C/D" or "A/B/C/D/F")
    const groupsPart = teamName.replace('3rd Group ', '');
    return `3${groupsPart}`;
  }
  
  return teamName;
}

function FixturesPage() {
  const navigate = useNavigate();

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

  // Helper function to format date
  const formatDate = (dateString) => {
    // Parse date string (YYYY-MM-DD) and create date in local timezone
    // Add 12 hours to ensure we're in the middle of the target day to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };


  // Organize matches by round and group by date
  const organizeMatches = () => {
    const organized = {
      'Group Stage Matchday 1': [],
      'Group Stage Matchday 2': [],
      'Group Stage Matchday 3': [],
      'Round of 32': [],
      'Round of 16': [],
      'Quarter Finals': [],
      'Semi Finals': [],
      'Third Place Playoff': [],
      'Final': []
    };

    Object.values(ALL_MATCHES).forEach(match => {
      const matchId = match.matchId;
      
      if (matchId >= 1 && matchId <= 24) {
        organized['Group Stage Matchday 1'].push(match);
      } else if (matchId >= 25 && matchId <= 48) {
        organized['Group Stage Matchday 2'].push(match);
      } else if (matchId >= 49 && matchId <= 72) {
        organized['Group Stage Matchday 3'].push(match);
      } else if (matchId >= 73 && matchId <= 88) {
        organized['Round of 32'].push(match);
      } else if (matchId >= 89 && matchId <= 96) {
        organized['Round of 16'].push(match);
      } else if (matchId >= 97 && matchId <= 100) {
        organized['Quarter Finals'].push(match);
      } else if (matchId >= 101 && matchId <= 102) {
        organized['Semi Finals'].push(match);
      } else if (matchId === 103) {
        organized['Third Place Playoff'].push(match);
      } else if (matchId === 104) {
        organized['Final'].push(match);
      }
    });

    // Sort matches within each round by date and time
    Object.keys(organized).forEach(round => {
      organized[round].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.kickoffTime}`);
        const dateB = new Date(`${b.date}T${b.kickoffTime}`);
        return dateA - dateB;
      });
    });

    return organized;
  };

  // Group matches by date for display
  const groupMatchesByDate = (matches) => {
    const grouped = {};
    matches.forEach(match => {
      const dateKey = match.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });
    return grouped;
  };

  const matchesByRound = organizeMatches();

  const roundOrder = [
    'Group Stage Matchday 1',
    'Group Stage Matchday 2',
    'Group Stage Matchday 3',
    'Round of 32',
    'Round of 16',
    'Quarter Finals',
    'Semi Finals',
    'Third Place Playoff',
    'Final'
  ];

  return (
    <div className="fixtures-container">
      <header className="fixtures-header">
        <h1>World Cup 2026 Fixtures</h1>
        <div className="header-actions">
          <button
            className="timezone-toggle-btn-header"
            onClick={() => setUseLocalTimezone(!useLocalTimezone)}
            title={useLocalTimezone ? "Show match timezone" : "Show your timezone"}
          >
            {useLocalTimezone ? '🌐' : '📍'} {useLocalTimezone ? 'Your Timezone' : 'Match Timezone'}
          </button>
          <button
            onClick={() => navigate('/predictor')}
            className="nav-btn"
          >
            Predictor
          </button>
          <button
            onClick={() => navigate('/simulator')}
            className="nav-btn"
          >
            Simulator
          </button>
        </div>
      </header>

      <div className="content-container">
        {roundOrder.map(roundName => {
          const matches = matchesByRound[roundName];
          if (matches.length === 0) return null;

          const matchesByDate = groupMatchesByDate(matches);
          const isKnockout = !roundName.startsWith('Group Stage');
          const isFinal = roundName === 'Final';
          const isSemifinal = roundName === 'Semi Finals';
          const isThirdPlace = roundName === 'Third Place Playoff';

          return (
            <div key={roundName} className={`round-section ${isKnockout ? 'knockout-section' : ''} ${isFinal ? 'final-section' : ''}`}>
              <div className="round-header">
                <h2 className="round-title">{roundName}</h2>
                <span className="match-count">{matches.length} {matches.length === 1 ? 'Match' : 'Matches'}</span>
              </div>
              {Object.keys(matchesByDate).sort().map(date => (
                <div key={date} className="date-group">
                  <h3 className="date-header">{formatDate(date)}</h3>
                  <div className={`matches-grid ${isFinal || isSemifinal || isThirdPlace ? 'important-matches' : ''}`}>
                    {matchesByDate[date].map(match => (
                      <div 
                        key={match.matchId} 
                        className={`match-card ${isFinal ? 'final-card' : ''} ${isSemifinal ? 'semifinal-card' : ''} ${isThirdPlace ? 'third-place-card' : ''}`}
                      >
                        <div className="match-card-header">
                          <div className="match-number">Match {match.matchId}</div>
                          {match.stage && match.stage.startsWith('Group') && (
                            <div className="group-badge">{match.stage}</div>
                          )}
                        </div>
                        <div className="match-teams">
                          <div className="team team-home">
                            {(() => {
                              const fullName = getFullTeamName(match.teamA);
                              // For knockout stages, format abbreviations (RGA->2A, WGC->1C, WM##->W##, etc.)
                              if (isKnockout) {
                                const formatted = formatKnockoutTeamAbbreviation(match.teamA, true, roundName);
                                // If it was formatted (changed from original), return formatted version
                                if (formatted !== match.teamA) {
                                  return formatted;
                                }
                              }
                              // For placeholder teams with emojis, return as-is
                              if (fullName.includes('Path') || fullName.includes('winner')) {
                                return fullName;
                              }
                              return getCountryCode(fullName);
                            })()}
                          </div>
                          <div className="vs-divider">
                            <span className="vs">vs</span>
                          </div>
                          <div className="team team-away">
                            {(() => {
                              const fullName = getFullTeamName(match.teamB);
                              // For knockout stages, format abbreviations (RGA->2A, WGC->1C, WM##->W##, etc.)
                              if (isKnockout) {
                                const formatted = formatKnockoutTeamAbbreviation(match.teamB, true, roundName);
                                // If it was formatted (changed from original), return formatted version
                                if (formatted !== match.teamB) {
                                  return formatted;
                                }
                              }
                              // For placeholder teams with emojis, return as-is
                              if (fullName.includes('Path') || fullName.includes('winner')) {
                                return fullName;
                              }
                              return getCountryCode(fullName);
                            })()}
                          </div>
                        </div>
                        <div className="match-info">
                          <div className="match-time-venue">
                            <div className="time-info">
                              <span className="icon">🕐</span>
                              {(() => {
                                const converted = convertToLocalTime(match.date, match.kickoffTime, match.timezone);
                                return (
                                  <span>{converted.time} {converted.timezone || ''}</span>
                                );
                              })()}
                            </div>
                            <div className="venue-info">
                              <span className="icon">📍</span>
                              <span>{match.venue.city}</span>
                            </div>
                          </div>
                          <div className="venue-name">{match.venue.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FixturesPage;

