import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import './DrawResultPage.css';

function DrawResultPage() {
  const { drawId } = useParams();
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDraw();
  }, [drawId]);

  const fetchDraw = async () => {
    try {
      const response = await api.get(`/draws/${drawId}`);
      setDraw(response.data);
    } catch (err) {
      setError('Failed to fetch draw. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="draw-result-container">
        <div className="loading">Loading draw results...</div>
      </div>
    );
  }

  if (error || !draw) {
    return (
      <div className="draw-result-container">
        <div className="error-message">{error || 'Draw not found'}</div>
        <button onClick={handleBack} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Organize teams into groups (assuming draw.groups is an object with group letters as keys)
  const groups = draw.groups || {};

  return (
    <div className="draw-result-container">
      <header className="result-header">
        <h1>{draw.name || 'Draw Results'}</h1>
        <button onClick={handleBack} className="back-btn">
          Back to Dashboard
        </button>
      </header>

      <div className="result-content">
        <div className="draw-info">
          <p className="draw-date">
            Created: {new Date(draw.createdAt || draw.date).toLocaleString()}
          </p>
        </div>

        <div className="groups-display">
          {Object.keys(groups).length === 0 ? (
            <div className="no-groups">
              <p>No groups found in this draw.</p>
            </div>
          ) : (
            Object.entries(groups).map(([groupLetter, teams]) => (
              <div key={groupLetter} className="group-card">
                <h2 className="group-title">Group {groupLetter}</h2>
                <div className="teams-list">
                  {teams && teams.length > 0 ? (
                    teams.map((team, index) => (
                      <div key={index} className="team-item">
                        <span className="team-rank">{index + 1}</span>
                        <span className="team-name">{team}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-teams">No teams assigned</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fallback display if groups structure is different */}
        {Object.keys(groups).length === 0 && draw.teams && (
          <div className="teams-display">
            <h2>Teams in Draw</h2>
            <div className="teams-list">
              {draw.teams.map((team, index) => (
                <div key={index} className="team-item">
                  {team}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawResultPage;

