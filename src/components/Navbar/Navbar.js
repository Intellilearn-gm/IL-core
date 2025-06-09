import React from 'react';
import { Link } from 'react-router-dom'; // This is react-router-dom's Link
import { useOCAuth } from '@opencampus/ocid-connect-js';
import './Navbar.css';
import logoSrc from '../../assets/images/logo.png'; // ENSURE THIS PATH IS CORRECT

const Navbar = () => {
  const { authState, ocAuth } = useOCAuth();

  const handleLogout = async () => {
    if (!ocAuth) {
      console.error("ocAuth object not available for logout.");
      return;
    }
    try {
      console.log(`Attempting logout with returnTo: ${window.location.origin}/login`);
      await ocAuth.logout({
        logoutParams: {
          returnTo: `${window.location.origin}/login`
        }
      });
    } catch (error) {
      console.error('OCID Logout error:', error);
    }
  };

  // If not authenticated, don't render the navbar.
  // This is a common pattern, but you might want a minimal navbar for login pages.
  // For now, sticking to the provided logic.
  if (!authState.isAuthenticated) {
    return null; 
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand"> {/* Changed to standard react-router-dom Link to homepage */}
        <img src={logoSrc} alt="IntelliLearn Logo" className="navbar-logo-img" />
        <span className="navbar-brand-text">IntelliLearn</span>
      </Link>
      <div className="navbar-links">
        {/* The authState.isAuthenticated check here is a bit redundant if the whole Navbar is hidden when not authenticated */}
        {/* However, it doesn't hurt. */}
        {authState.isAuthenticated && (
          <div className="ocid-user-info-navbar">
            <span className="navbar-user-greeting">
              Hi, {authState.idTokenPayload?.preferred_username || authState.idTokenPayload?.name || 'Learner'}!
            </span>
            <button onClick={handleLogout} className="navbar-logout-button" disabled={!ocAuth}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;