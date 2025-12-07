import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import './DrawSimulatorPage.css';

// List of qualified teams (you can expand this)
const QUALIFIED_TEAMS = [
  'Brazil', 'Argentina', 'France', 'Spain', 'Germany', 'Italy', 'England', 'Netherlands',
  'Portugal', 'Belgium', 'Uruguay', 'Croatia', 'Mexico', 'USA', 'Japan', 'South Korea',
  'Australia', 'Morocco', 'Senegal', 'Tunisia', 'Canada', 'Ecuador', 'Qatar', 'Saudi Arabia',
  'Iran', 'Cameroon', 'Ghana', 'Poland', 'Switzerland', 'Denmark', 'Serbia', 'Wales'
];

function DrawSimulatorPage() {
  const [groups, setGroups] = useState({});
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState('');
  const [drawName, setDrawName] = useState('');
  const navigate = useNavigate();

  // Initialize groups
  useEffect(() => {
    const initialGroups = {};
    for (let i = 0; i < 8; i++) {
      const groupLetter = String.fromCharCode(65 + i); // A-H
      initialGroups[groupLetter] = [];
    }
    setGroups(initialGroups);
  }, []);

  const performDraw = async () => {
    if (!drawName.trim()) {
      setError('Please enter a name for this draw');
      return;
    }

    setDrawing(true);
    setError('');

    try {
      // Call backend API to perform the draw
      const response = await api.post('/draws/simulate', {
        name: drawName,
        teams: QUALIFIED_TEAMS,
      });

      // Navigate to results page with the draw ID
      navigate(`/draw-result/${response.data.drawId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to simulate draw. Please try again.');
      setDrawing(false);
    }
  };

  return (
    <div className="draw-simulator-container">
      <header className="simulator-header">
        <h1>World Cup Draw Simulator</h1>
        <button onClick={() => navigate('/predictor')} className="back-btn">
          Back to Predictor
        </button>
      </header>

      <div className="simulator-content">
        <div className="draw-input-section">
          <div className="form-group">
            <label htmlFor="drawName">Draw Name:</label>
            <input
              type="text"
              id="drawName"
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
              placeholder="e.g., World Cup 2026 Draw #1"
              className="draw-name-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={performDraw}
            disabled={drawing}
            className="draw-button"
          >
            {drawing ? 'Drawing...' : 'Simulate Draw'}
          </button>
        </div>

        <div className="info-section">
          <h2>How it works</h2>
          <p>
            Click "Simulate Draw" to randomly draw teams into 8 groups (A-H) for the World Cup.
            Each group will contain 4 teams. The draw will be saved to your account.
          </p>
          <p className="teams-count">Total Teams: {QUALIFIED_TEAMS.length}</p>
        </div>
      </div>
    </div>
  );
}

export default DrawSimulatorPage;

