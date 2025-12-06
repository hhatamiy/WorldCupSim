// backend/routes/betting.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper function to extract country name from team string (removes emoji and extra text)
function extractCountryName(teamString) {
  if (!teamString) return '';
  
  // Remove all flag emojis (including complex ones like England/Scotland)
  // This regex handles both simple flag emojis and complex regional indicator sequences
  let cleaned = teamString
    .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '') // Simple flag emojis
    .replace(/🏴[󠁁-󠁿]*/gu, '') // Regional flags (England, Scotland, Wales)
    .trim();
  
  return cleaned;
}

// Hardcoded FIFA Rankings (as of November 20, 2025)
const FIFA_RANKINGS = {
  'Spain': { rank: 1, points: 1877.18 },
  'Argentina': { rank: 2, points: 1873.33 },
  'France': { rank: 3, points: 1870 },
  'England': { rank: 4, points: 1834.12 },
  'Brazil': { rank: 5, points: 1760.46 },
  'Portugal': { rank: 6, points: 1760.38 },
  'Netherlands': { rank: 7, points: 1756.27 },
  'Belgium': { rank: 8, points: 1730.71 },
  'Germany': { rank: 9, points: 1724.15 },
  'Croatia': { rank: 10, points: 1716.88 },
  'Morocco': { rank: 11, points: 1713.12 },
  'Italy': { rank: 12, points: 1702.06 },
  'Colombia': { rank: 13, points: 1701.3 },
  'USA': { rank: 14, points: 1681.88 },
  'United States': { rank: 14, points: 1681.88 },
  'Mexico': { rank: 15, points: 1675.75 },
  'Uruguay': { rank: 16, points: 1672.62 },
  'Switzerland': { rank: 17, points: 1654.69 },
  'Japan': { rank: 18, points: 1650.12 },
  'Senegal': { rank: 19, points: 1648.07 },
  'IR Iran': { rank: 20, points: 1617.02 },
  'Iran': { rank: 20, points: 1617.02 },
  'Denmark': { rank: 21, points: 1616.75 },
  'Türkiye': { rank: 25, points: 1582.69 },
  'Turkey': { rank: 25, points: 1582.69 },
  'Ukraine': { rank: 28, points: 1557.47 },
  'Italy': { rank: 12, points: 1702.06 },
  'Iraq': { rank: 58, points: 1438.92 },
  'Korea Republic': { rank: 22, points: 1599.45 },
  'South Korea': { rank: 22, points: 1599.45 },
  'Ecuador': { rank: 23, points: 1591.73 },
  'Austria': { rank: 24, points: 1585.51 },
  'Türkiye': { rank: 25, points: 1582.69 },
  'Turkey': { rank: 25, points: 1582.69 },
  'Australia': { rank: 26, points: 1574.01 },
  'Canada': { rank: 27, points: 1559.15 },
  'Ukraine': { rank: 28, points: 1557.47 },
  'Norway': { rank: 29, points: 1553.14 },
  'Panama': { rank: 30, points: 1540.43 },
  'Poland': { rank: 31, points: 1532.04 },
  'Wales': { rank: 32, points: 1529.71 },
  'Russia': { rank: 33, points: 1524.52 },
  'Egypt': { rank: 34, points: 1520.68 },
  'Algeria': { rank: 35, points: 1516.37 },
  'Scotland': { rank: 36, points: 1506.77 },
  'Serbia': { rank: 37, points: 1506.34 },
  'Nigeria': { rank: 38, points: 1502.46 },
  'Paraguay': { rank: 39, points: 1501.5 },
  'Tunisia': { rank: 40, points: 1497.13 },
  'Hungary': { rank: 41, points: 1496.29 },
  'Côte d\'Ivoire': { rank: 42, points: 1489.59 },
  'Ivory Coast': { rank: 42, points: 1489.59 },
  'Sweden': { rank: 43, points: 1487.13 },
  'Czechia': { rank: 44, points: 1487 },
  'Czech Republic': { rank: 44, points: 1487 },
  'Slovakia': { rank: 45, points: 1485.65 },
  'Greece': { rank: 46, points: 1480.38 },
  'Romania': { rank: 47, points: 1465.78 },
  'Venezuela': { rank: 48, points: 1465.22 },
  'Costa Rica': { rank: 49, points: 1464.24 },
  'Uzbekistan': { rank: 50, points: 1462.03 },
  'Qatar': { rank: 51, points: 1461.6 },
  'Peru': { rank: 52, points: 1459.57 },
  'Chile': { rank: 53, points: 1457.84 },
  'Mali': { rank: 54, points: 1455.03 },
  'Slovenia': { rank: 55, points: 1447.31 },
  'Congo DR': { rank: 56, points: 1442.5 },
  'DR Congo': { rank: 56, points: 1442.5 },
  'Cameroon': { rank: 57, points: 1440.43 },
  'Iraq': { rank: 58, points: 1438.92 },
  'Republic of Ireland': { rank: 59, points: 1436.04 },
  'Ireland': { rank: 59, points: 1436.04 },
  'Saudi Arabia': { rank: 60, points: 1428.74 },
  'South Africa': { rank: 61, points: 1426.73 },
  'Burkina Faso': { rank: 62, points: 1404.81 },
  'Albania': { rank: 63, points: 1401.07 },
  'Honduras': { rank: 64, points: 1379.54 },
  'North Macedonia': { rank: 65, points: 1378.57 },
  'Jordan': { rank: 66, points: 1377.66 },
  'United Arab Emirates': { rank: 67, points: 1369.71 },
  'Cabo Verde': { rank: 68, points: 1367.95 },
  'Cape Verde': { rank: 68, points: 1367.95 },
  'Northern Ireland': { rank: 69, points: 1366.02 },
  'Jamaica': { rank: 70, points: 1362.46 },
  'Bosnia and Herzegovina': { rank: 71, points: 1362.37 },
  'Ghana': { rank: 72, points: 1351.09 },
  'Georgia': { rank: 73, points: 1347.88 },
  'Iceland': { rank: 74, points: 1344.72 },
  'Finland': { rank: 75, points: 1341.81 },
  'Bolivia': { rank: 76, points: 1329.56 },
  'Israel': { rank: 77, points: 1328.14 },
  'Gabon': { rank: 78, points: 1321.25 },
  'Oman': { rank: 79, points: 1312.45 },
  'Kosovo': { rank: 80, points: 1308.84 },
  'Guinea': { rank: 81, points: 1307.05 },
  'Curaçao': { rank: 82, points: 1302.7 },
  'Curaçao': { rank: 82, points: 1302.7 },
  'Montenegro': { rank: 83, points: 1297.09 },
  'Haiti': { rank: 84, points: 1294.49 },
  'Uganda': { rank: 85, points: 1288.01 },
  'New Zealand': { rank: 86, points: 1279.25 },
  'Syria': { rank: 87, points: 1278.1 },
  'Bulgaria': { rank: 88, points: 1272.19 },
  'Angola': { rank: 89, points: 1271.54 },
  'Zambia': { rank: 90, points: 1260.06 },
  'Bahrain': { rank: 91, points: 1258.68 },
  'Benin': { rank: 92, points: 1255.72 },
  'China PR': { rank: 93, points: 1249.06 },
  'China': { rank: 93, points: 1249.06 },
  'Guatemala': { rank: 94, points: 1245.77 },
  'Thailand': { rank: 95, points: 1243.27 },
  'Palestine': { rank: 96, points: 1230.55 },
  'Equatorial Guinea': { rank: 97, points: 1229.09 },
  'Trinidad and Tobago': { rank: 98, points: 1227.32 },
  'Belarus': { rank: 99, points: 1227.09 },
  'El Salvador': { rank: 100, points: 1226.65 },
};

// Helper function to get FIFA ranking (hardcoded, no API)
function getFIFARanking(countryName) {
  // Normalize country name for lookup
  const normalized = countryName.trim();
  
  // Try direct lookup first
  if (FIFA_RANKINGS[normalized]) {
    return {
      rank: FIFA_RANKINGS[normalized].rank,
      country: normalized,
      points: FIFA_RANKINGS[normalized].points,
    };
  }
  
  // Try case-insensitive lookup
  const lowerName = normalized.toLowerCase();
  for (const [key, value] of Object.entries(FIFA_RANKINGS)) {
    if (key.toLowerCase() === lowerName) {
      return {
        rank: value.rank,
        country: key,
        points: value.points,
      };
    }
  }
  
  console.log(`FIFA ranking not found for: ${countryName}`);
  return null;
}

// Map country names to common API team names (The Odds API uses standard country names)
const TEAM_NAME_MAP = {
  'United States': 'USA',
  'South Korea': 'South Korea',
  'DR Congo': 'Congo DR',
  'Czech Republic': 'Czech Republic',
  // Add more mappings as needed
};

function normalizeTeamName(countryName) {
  return TEAM_NAME_MAP[countryName] || countryName;
}

// Monte Carlo simulation to calculate group winner probabilities
function simulateGroupWinner(groupTeams, numSimulations = 10000) {
  // Get rankings for all teams in the group
  const teamRankings = groupTeams.map(teamName => {
    const countryName = extractCountryName(teamName);
    const ranking = getFIFARanking(countryName);
    return {
      name: teamName,
      countryName: countryName,
      points: ranking?.points || 1500, // Default to 1500 if no ranking
      rank: ranking?.rank || null
    };
  });

  // Simulate group stage (each team plays 3 matches)
  const results = {};
  teamRankings.forEach(team => {
    results[team.name] = {
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      goalDifference: 0
    };
  });

  // Run simulations
  for (let sim = 0; sim < numSimulations; sim++) {
    // Reset for each simulation
    const simResults = {};
    teamRankings.forEach(team => {
      simResults[team.name] = {
        points: 0,
        goalDifference: 0
      };
    });

    // Simulate all 6 matches in the group
    for (let i = 0; i < teamRankings.length; i++) {
      for (let j = i + 1; j < teamRankings.length; j++) {
        const team1 = teamRankings[i];
        const team2 = teamRankings[j];
        
        const matchOdds = simulateMatchOdds(team1.points, team2.points, 1, false);
        if (!matchOdds) continue;

        const random = Math.random();
        if (random < matchOdds.team1.probability) {
          // Team 1 wins
          simResults[team1.name].points += 3;
          simResults[team1.name].goalDifference += Math.floor(Math.random() * 3) + 1;
          simResults[team2.name].goalDifference -= Math.floor(Math.random() * 3) + 1;
        } else if (random < matchOdds.team1.probability + matchOdds.team2.probability) {
          // Team 2 wins
          simResults[team2.name].points += 3;
          simResults[team2.name].goalDifference += Math.floor(Math.random() * 3) + 1;
          simResults[team1.name].goalDifference -= Math.floor(Math.random() * 3) + 1;
        } else {
          // Draw
          simResults[team1.name].points += 1;
          simResults[team2.name].points += 1;
        }
      }
    }

    // Determine group winner (highest points, then goal difference)
    let winner = null;
    let maxPoints = -1;
    let maxGD = -1000;

    teamRankings.forEach(team => {
      if (simResults[team.name].points > maxPoints || 
          (simResults[team.name].points === maxPoints && simResults[team.name].goalDifference > maxGD)) {
        maxPoints = simResults[team.name].points;
        maxGD = simResults[team.name].goalDifference;
        winner = team.name;
      }
    });

    if (winner) {
      results[winner].wins++;
    }
  }

  // Calculate probabilities
  const groupWinnerProbs = {};
  teamRankings.forEach(team => {
    const prob = results[team.name].wins / numSimulations;
    groupWinnerProbs[team.name] = {
      probability: prob,
      odds: probabilityToAmericanOdds(prob),
      rank: teamRankings.find(t => t.name === team.name)?.rank
    };
  });

  return groupWinnerProbs;
}

// Helper function to convert probability to American odds
function probabilityToAmericanOdds(probability) {
  if (probability <= 0 || probability >= 1) return null;
  if (probability >= 0.5) {
    return Math.round((probability / (1 - probability)) * -100);
  } else {
    return Math.round(((1 - probability) / probability) * 100);
  }
}

// Monte Carlo simulation to generate betting odds
function simulateMatchOdds(team1Points, team2Points, numSimulations = 10000, isKnockout = false) {
  if (!team1Points || !team2Points) {
    return null;
  }

  // Convert FIFA points to Elo-style rating (normalize to reasonable range)
  // FIFA points range roughly from ~800 to ~1900, we'll use them directly
  const rating1 = team1Points;
  const rating2 = team2Points;
  
  // Calculate expected score using Elo formula
  // Expected score = 1 / (1 + 10^((opponent_rating - own_rating) / 400))
  const expectedScore1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expectedScore2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));
  
  if (isKnockout) {
    // Knockout stage: no draws, but include penalty shootout probabilities
    // Probability of going to penalties (extra time draw)
    const ratingDiff = Math.abs(rating1 - rating2);
    const penaltyProbability = Math.max(0.10, 0.25 - (ratingDiff / 2000)); // 10-25% chance of penalties
    
    // Run Monte Carlo simulation for knockout
    let team1WinsRegulation = 0;
    let team2WinsRegulation = 0;
    let goesToPenalties = 0;
    let team1WinsPenalties = 0;
    let team2WinsPenalties = 0;
    
    for (let i = 0; i < numSimulations; i++) {
      const random = Math.random();
      
      if (random < expectedScore1 * (1 - penaltyProbability)) {
        // Team 1 wins in regulation
        team1WinsRegulation++;
      } else if (random < (expectedScore1 * (1 - penaltyProbability)) + (expectedScore2 * (1 - penaltyProbability))) {
        // Team 2 wins in regulation
        team2WinsRegulation++;
      } else {
        // Goes to penalties
        goesToPenalties++;
        // Penalty shootout is more random but still favors stronger team slightly
        const penaltyProb1 = 0.4 + (expectedScore1 - 0.5) * 0.2; // 30-50% range based on strength
        if (Math.random() < penaltyProb1) {
          team1WinsPenalties++;
        } else {
          team2WinsPenalties++;
        }
      }
    }
    
    const probTeam1Regulation = team1WinsRegulation / numSimulations;
    const probTeam2Regulation = team2WinsRegulation / numSimulations;
    const probPenalties = goesToPenalties / numSimulations;
    const probTeam1Penalties = team1WinsPenalties / numSimulations;
    const probTeam2Penalties = team2WinsPenalties / numSimulations;
    
    // Total win probabilities (regulation + penalties)
    const probTeam1Total = probTeam1Regulation + probTeam1Penalties;
    const probTeam2Total = probTeam2Regulation + probTeam2Penalties;
    
    return {
      team1: {
        name: 'Team 1',
        probability: probTeam1Total,
        odds: probabilityToAmericanOdds(probTeam1Total)
      },
      team2: {
        name: 'Team 2',
        probability: probTeam2Total,
        odds: probabilityToAmericanOdds(probTeam2Total)
      },
      team1Penalties: {
        name: 'Team 1 (Penalties)',
        probability: probTeam1Penalties,
        odds: probabilityToAmericanOdds(probTeam1Penalties / (probPenalties || 0.01)) // Conditional probability
      },
      team2Penalties: {
        name: 'Team 2 (Penalties)',
        probability: probTeam2Penalties,
        odds: probabilityToAmericanOdds(probTeam2Penalties / (probPenalties || 0.01)) // Conditional probability
      },
      penaltyProbability: probPenalties,
      isKnockout: true
    };
  } else {
    // Group stage: includes draws (unchanged)
    const ratingDiff = Math.abs(rating1 - rating2);
    const drawProbability = Math.max(0.15, 0.30 - (ratingDiff / 2000)); // 15-30% draw probability
    
    // Adjust win probabilities to account for draws
    const adjustedWinProb1 = expectedScore1 * (1 - drawProbability);
    const adjustedWinProb2 = expectedScore2 * (1 - drawProbability);
    
    // Run Monte Carlo simulation
    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;
    
    for (let i = 0; i < numSimulations; i++) {
      const random = Math.random();
      
      if (random < adjustedWinProb1) {
        team1Wins++;
      } else if (random < adjustedWinProb1 + adjustedWinProb2) {
        team2Wins++;
      } else {
        draws++;
      }
    }
    
    // Calculate probabilities from simulation results
    const probTeam1 = team1Wins / numSimulations;
    const probTeam2 = team2Wins / numSimulations;
    const probDraw = draws / numSimulations;
    
    return {
      team1: {
        name: 'Team 1',
        probability: probTeam1,
        odds: probabilityToAmericanOdds(probTeam1)
      },
      team2: {
        name: 'Team 2',
        probability: probTeam2,
        odds: probabilityToAmericanOdds(probTeam2)
      },
      draw: {
        name: 'Draw',
        probability: probDraw,
        odds: probabilityToAmericanOdds(probDraw)
      },
      isKnockout: false
    };
  }
}

// Soccer sport keys in The Odds API
const SOCCER_SPORT_KEYS = [
  'soccer_fifa_world_cup',           // FIFA World Cup
  'soccer_fifa_world_cup_qualifier', // World Cup Qualifiers
  'soccer_epl',                      // English Premier League
  'soccer_spain_la_liga',            // La Liga
  'soccer_germany_bundesliga',       // Bundesliga
  'soccer_italy_serie_a',            // Serie A
  'soccer_france_ligue_one',         // Ligue 1
  'soccer_uefa_champs_league',       // Champions League
  'soccer_uefa_europa_league',       // Europa League
  'soccer_usa_mls',                  // MLS
  'soccer_mexico_ligamx',            // Liga MX
];

// GET group winner probabilities
router.get('/group-winner', async (req, res) => {
  try {
    const { groupName, teams } = req.query;

    if (!teams) {
      return res.status(400).json({ message: 'Teams array is required' });
    }

    const teamArray = JSON.parse(teams);
    if (!Array.isArray(teamArray) || teamArray.length !== 4) {
      return res.status(400).json({ message: 'Must provide exactly 4 teams' });
    }

    const groupWinnerProbs = simulateGroupWinner(teamArray);
    
    return res.json({
      groupName: groupName,
      probabilities: groupWinnerProbs
    });
  } catch (error) {
    console.error('Error calculating group winner probabilities:', error);
    res.status(500).json({ 
      message: 'Failed to calculate group winner probabilities', 
      error: error.message 
    });
  }
});

// GET betting odds for a matchup (API DISABLED - returns placeholder data with FIFA rankings)
router.get('/odds', async (req, res) => {
  try {
    const { team1, team2, type } = req.query; // type: 'group' or 'matchup'

    if (!team1 || !team2) {
      return res.status(400).json({ message: 'Both team1 and team2 are required' });
    }

    // Extract country names from team strings
    const country1 = extractCountryName(team1);
    const country2 = extractCountryName(team2);

    console.log(`Getting odds for ${country1} vs ${country2} (API disabled - placeholder data)`);

    // Get FIFA rankings for both teams (hardcoded, no API)
    const ranking1 = getFIFARanking(country1);
    const ranking2 = getFIFARanking(country2);

    console.log(`FIFA Rankings: ${country1} - ${ranking1?.rank || 'N/A'}, ${country2} - ${ranking2?.rank || 'N/A'}`);

    // Determine if this is a knockout stage match
    const isKnockout = type === 'matchup' || type === 'knockout';

    // Generate Monte Carlo simulation odds if we have rankings
    let simulatedOdds = null;
    let bookmakers = [];
    
    if (ranking1 && ranking2 && ranking1.points && ranking2.points) {
      simulatedOdds = simulateMatchOdds(ranking1.points, ranking2.points, 10000, isKnockout);
      
      if (simulatedOdds) {
        // Single bookmaker - Monte Carlo Sportsbook
        const outcomes = [];
        
        if (simulatedOdds.isKnockout) {
          // Knockout stage: show win probabilities and penalty probabilities
          outcomes.push(
            {
              name: country1,
              price: simulatedOdds.team1.odds,
              probability: simulatedOdds.team1.probability
            },
            {
              name: country2,
              price: simulatedOdds.team2.odds,
              probability: simulatedOdds.team2.probability
            },
            {
              name: `${country1} (Penalties)`,
              price: simulatedOdds.team1Penalties.odds,
              probability: simulatedOdds.team1Penalties.probability,
              isPenalty: true
            },
            {
              name: `${country2} (Penalties)`,
              price: simulatedOdds.team2Penalties.odds,
              probability: simulatedOdds.team2Penalties.probability,
              isPenalty: true
            }
          );
        } else {
          // Group stage: show win probabilities and draw
          outcomes.push(
            {
              name: country1,
              price: simulatedOdds.team1.odds,
              probability: simulatedOdds.team1.probability
            },
            {
              name: 'Draw',
              price: simulatedOdds.draw.odds,
              probability: simulatedOdds.draw.probability
            },
            {
              name: country2,
              price: simulatedOdds.team2.odds,
              probability: simulatedOdds.team2.probability
            }
          );
        }
        
        bookmakers = [{
          title: 'Monte Carlo Sportsbook',
          name: 'Monte Carlo Sportsbook',
          markets: [{
            key: 'h2h',
            outcomes: outcomes
          }],
          isKnockout: simulatedOdds.isKnockout,
          penaltyProbability: simulatedOdds.penaltyProbability
        }];
      }
    }

    // Return data with Monte Carlo simulated odds
    return res.json({
      team1: country1,
      team2: country2,
      odds: bookmakers,
      event: null,
      rankings: {
        team1: ranking1,
        team2: ranking2,
      },
      simulatedOdds: simulatedOdds, // Include raw simulation data
      message: bookmakers.length > 0 ? null : 'Unable to generate odds - missing team rankings',
      mock: false,
    });

    /* DISABLED - API QUOTA REACHED
    let matchFound = false;
    let allEvents = [];
    
    // Try different soccer leagues/competitions to find the matchup
    for (const sportKey of SOCCER_SPORT_KEYS) {
      try {
        // The Odds API endpoint: https://api.the-odds-api.com/v4/sports/{sport}/odds
        const apiUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`;
        
        console.log(`Trying The Odds API for sport: ${sportKey}`);
        
        const response = await axios.get(apiUrl, {
          params: {
            apiKey: apiKey,
            regions: 'us,uk,eu',  // Multiple regions for more bookmakers
            markets: 'h2h,spreads,totals',  // Common betting markets
            oddsFormat: 'american',  // American odds format (+150, -200, etc.)
          },
          timeout: 10000,
        });

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Found ${response.data.length} events for ${sportKey}`);
          allEvents.push(...response.data);
          
          // Filter for matches involving our teams
          const matchingEvents = response.data.filter(event => {
            const homeTeam = (event.home_team || '').toLowerCase();
            const awayTeam = (event.away_team || '').toLowerCase();
            const team1Lower = normalizedTeam1.toLowerCase();
            const team2Lower = normalizedTeam2.toLowerCase();
            const country1Lower = country1.toLowerCase();
            const country2Lower = country2.toLowerCase();
            
            // Check if both teams are in this matchup
            const hasTeam1 = homeTeam.includes(team1Lower) || awayTeam.includes(team1Lower) ||
                            homeTeam.includes(country1Lower) || awayTeam.includes(country1Lower);
            
            const hasTeam2 = homeTeam.includes(team2Lower) || awayTeam.includes(team2Lower) ||
                            homeTeam.includes(country2Lower) || awayTeam.includes(country2Lower);
            
            return hasTeam1 && hasTeam2;
          });

          if (matchingEvents.length > 0) {
            const event = matchingEvents[0];
            console.log(`Match found: ${event.home_team} vs ${event.away_team}`);
            
            return res.json({
              team1: country1,
              team2: country2,
              odds: event.bookmakers || [],
              event: {
                id: event.id,
                sport_key: event.sport_key,
                sport_title: event.sport_title,
                commence_time: event.commence_time,
                home_team: event.home_team,
                away_team: event.away_team,
              },
              rankings: {
                team1: ranking1,
                team2: ranking2,
              },
              message: (event.bookmakers && event.bookmakers.length > 0) ? null : 'Game found but no bookmakers available',
            });
          }
        }
      } catch (apiError) {
        // Log error but continue trying other sport keys
        if (apiError.response) {
          console.log(`The Odds API error for ${sportKey}:`, {
            status: apiError.response.status,
            statusText: apiError.response.statusText,
            message: apiError.response.data?.message
          });
          
          // If it's a 401, the API key is invalid
          if (apiError.response.status === 401) {
            return res.status(401).json({
              message: 'Invalid API key',
              error: 'Authentication failed with The Odds API',
              hint: 'Please check your THE_ODDS_API_KEY in main.env. Get a free key at https://the-odds-api.com/',
              apiResponse: apiError.response.data
            });
          }
          
          // If it's a 429, we've hit rate limit
          if (apiError.response.status === 429) {
            return res.status(429).json({
              message: 'API rate limit exceeded',
              error: 'Too many requests to The Odds API',
              hint: 'Please wait a moment before trying again. Check your remaining requests at https://the-odds-api.com/',
            });
          }
        } else {
          console.log(`The Odds API error for ${sportKey}:`, apiError.message);
        }
        
        // Continue to next sport key
        continue;
      }
    }

    // If no exact match found, log all available events for debugging
    if (allEvents.length > 0) {
      console.log(`No exact match found. Available events:`, 
        allEvents.slice(0, 5).map(e => `${e.home_team} vs ${e.away_team}`).join(', ')
      );
    }

    // DISABLED - API QUOTA REACHED
    // If no odds found, return a mock response structure (but still include rankings)
    return res.json({
      team1: country1,
      team2: country2,
      odds: [],
      event: null,
      rankings: {
        team1: ranking1,
        team2: ranking2,
      },
      message: `No betting odds available for ${country1} vs ${country2}. The match may not be scheduled yet or may not be covered by The Odds API.`,
      mock: true,
      debug: {
        totalEventsFound: allEvents.length,
        sampleEvents: allEvents.slice(0, 3).map(e => ({
          home: e.home_team,
          away: e.away_team,
          sport: e.sport_title
        }))
      }
    });
    */ // End of disabled API code

  } catch (error) {
    console.error('Error fetching betting odds:', error);
    res.status(500).json({ 
      message: 'Failed to fetch betting odds', 
      error: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

export default router;

