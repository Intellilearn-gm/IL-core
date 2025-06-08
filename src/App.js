import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ArcheryGamePage from './features/ArcheryGame/ArcheryGamePage';
import DAODungeonGamePage from './features/DAODungeonGame/DAODungeonGamePage';
import BlockMinerGamePage from './features/BlockMinerGame/BlockMinerGamePage';
import OpenCampusCodeQuestPage from './features/OpenCampusCodeQuest/OpenCampusCodeQuestPage';
import AuthCallbackPage from './features/Auth/AuthCallbackPage'; // New redirect page
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/game/archery" element={<ArcheryGamePage />} />
            <Route path="/game/dao-dungeon" element={<DAODungeonGamePage />} />
            <Route path="/game/block-miner" element={<BlockMinerGamePage />} />
            <Route path="/game/code-quest" element={<OpenCampusCodeQuestPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} /> {/* New Route for OCID Redirect */}
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;