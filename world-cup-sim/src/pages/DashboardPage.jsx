import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import './DashboardPage.css';

function DashboardPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const response = await api.get('/draws');
      setDraws(response.data);
    } catch (err) {
      setError('Failed to fetch draws. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const handleNewDraw = () => {
    navigate('/draw-simulator');
  };

  const handleViewDraw = (drawId) => {
    navigate(`/draw-result/${drawId}`);
  };

  const handleDeleteDraw = async (drawId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this draw?')) {
      try {
        await api.delete(`/draws/${drawId}`);
        fetchDraws(); // Refresh the list
      } catch (err) {
        alert('Failed to delete draw. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>World Cup Draw Simulator</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button onClick={handleNewDraw} className="new-draw-btn">
            Create New Draw
          </button>
        </div>

        <div className="draws-section">
          <h2>Your Past Draws</h2>
          
          {loading ? (
            <div className="loading">Loading your draws...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : draws.length === 0 ? (
            <div className="no-draws">
              <p>You haven't created any draws yet.</p>
              <p>Click "Create New Draw" to get started!</p>
            </div>
          ) : (
            <div className="draws-grid">
              {draws.map((draw) => (
                <div
                  key={draw._id || draw.id}
                  className="draw-card"
                  onClick={() => handleViewDraw(draw._id || draw.id)}
                >
                  <div className="draw-card-header">
                    <h3>{draw.name || `Draw #${draw._id || draw.id}`}</h3>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteDraw(draw._id || draw.id, e)}
                    >
                      ×
                    </button>
                  </div>
                  <p className="draw-date">
                    Created: {new Date(draw.createdAt || draw.date).toLocaleDateString()}
                  </p>
                  {draw.completed && (
                    <span className="completed-badge">Completed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

