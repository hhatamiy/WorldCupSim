import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PredictorPage from './pages/PredictorPage';
import DrawSimulatorPage from './pages/DrawSimulatorPage';
import DrawResultPage from './pages/DrawResultPage';
import BettingOddsPage from './pages/BettingOddsPage';
import SimulatorPage from './pages/SimulatorPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/predictor"
          element={
            <ProtectedRoute>
              <PredictorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/draw-simulator"
          element={
            <ProtectedRoute>
              <DrawSimulatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/draw-result/:drawId"
          element={
            <ProtectedRoute>
              <DrawResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/betting-odds"
          element={
            <ProtectedRoute>
              <BettingOddsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <SimulatorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/predictor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
