// backend/routes/betting.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper function to extract country name from team string (removes emoji and extra text)
function extractCountryName(teamString) {
  // Remove emoji and extra characters, get just the country name
  // Examples: "United States 🇺🇸" -> "United States", "Brazil 🇧🇷" -> "Brazil"
  return teamString.split(/[\u{1F1E6}-\u{1F1FF}]{2}/u)[0].trim();
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

// GET betting odds for a matchup using The Odds API
router.get('/odds', async (req, res) => {
  try {
    const { team1, team2, type } = req.query; // type: 'group' or 'matchup'

    if (!team1 || !team2) {
      return res.status(400).json({ message: 'Both team1 and team2 are required' });
    }

    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'THE_ODDS_API_KEY not configured in environment' });
    }

    // Extract country names from team strings
    const country1 = extractCountryName(team1);
    const country2 = extractCountryName(team2);
    
    // Normalize team names for API
    const normalizedTeam1 = normalizeTeamName(country1);
    const normalizedTeam2 = normalizeTeamName(country2);

    console.log(`Attempting to fetch odds for ${country1} vs ${country2} using The Odds API`);

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

    // If no odds found, return a mock response structure
    return res.json({
      team1: country1,
      team2: country2,
      odds: [],
      event: null,
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

