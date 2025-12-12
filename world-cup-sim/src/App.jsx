import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PredictorPage from './pages/PredictorPage';
import DrawSimulatorPage from './pages/DrawSimulatorPage';
import DrawResultPage from './pages/DrawResultPage';
import BettingOddsPage from './pages/BettingOddsPage';
import SimulatorPage from './pages/SimulatorPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/predictor" element={<PredictorPage />} />
        <Route path="/draw-simulator" element={<DrawSimulatorPage />} />
        <Route path="/draw-result/:drawId" element={<DrawResultPage />} />
        <Route path="/betting-odds" element={<BettingOddsPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/" element={<Navigate to="/predictor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
