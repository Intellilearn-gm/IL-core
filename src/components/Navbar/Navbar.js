import React from 'react';
import { Link } from 'react-router-dom';
import OCIDConnectButton from '../../features/Auth/OCIDConnectButton';
import './Navbar.css';
// No longer need: import { useAuth } from '../../features/Auth/AuthContext';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Game Arcade
      </Link>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        {/* If you need user info here, you'd use useOCAuth hook directly in Navbar */}
        {/* Example:
        const { authState } = useOCAuth();
        ...
        {authState.isAuthenticated && <span>Hi, {authState.idTokenPayload?.preferred_username}</span>}
        */}
        <OCIDConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;