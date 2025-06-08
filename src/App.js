import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ArcheryGamePage from './games/ArcheryGame/ArcheryGamePage';
import DAODungeonGamePage from './games/DAODungeonGame/DAODungeonGamePage';
import BlockMinerGamePage from './games/BlockMinerGame/BlockMinerGamePage';
import OpenCampusCodeQuestPage from './games/OpenCampusCodeQuest/OpenCampusCodeQuestPage';
import AuthCallbackPage from './features/Auth/AuthCallbackPage';
import LoginPage from './pages/LoginPage/LoginPage'; // Import Login Page
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Import ProtectedRoute
import { useOCAuth } from '@opencampus/ocid-connect-js'; // To check auth state for Navbar display

import './App.css';

function App() {
  const { isInitialized, authState } = useOCAuth(); // Get auth state for conditional Navbar rendering

  // Wait for OCID SDK to initialize before rendering routes that depend on auth state
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
        Initializing Application...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Conditionally render Navbar if authenticated, or customize Navbar for login page */}
        {/* For simplicity, let's always show Navbar but it can be conditional */}
        {authState.isAuthenticated && <Navbar />}
        
        <main className="app-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/game/archery" element={<ArcheryGamePage />} />
              <Route path="/game/dao-dungeon" element={<DAODungeonGamePage />} />
              <Route path="/game/block-miner" element={<BlockMinerGamePage />} />
              <Route path="/game/code-quest" element={<OpenCampusCodeQuestPage />} />
              {/* Add other protected game routes here */}
            </Route>
            
            {/* Fallback for any other route - redirect to login or dashboard based on auth */}
            <Route path="*" element={<Navigate to={authState.isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;