import React from 'react';
import { Link } from 'react-router-dom'; // useNavigate is no longer needed here
import { useOCAuth } from '@opencampus/ocid-connect-js';
import './Navbar.css';

const Navbar = () => {
  const { authState, ocAuth } = useOCAuth();
  // const navigate = useNavigate(); // REMOVE THIS LINE

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
        // If the above doesn't work, and the JS docs are more accurate for this specific method:
        // returnUrl: `${window.location.origin}/login`
      });
      // After this call, the SDK should clear its local state.
      // The useOCAuth hook will update, authState.isAuthenticated becomes false.
      // ProtectedRoute will then redirect to /login if the user was on a protected page.
      // If the user was on a public page (not possible in current setup after login), they'd stay there
      // but the UI would reflect logout.

    } catch (error) {
      console.error('OCID Logout error:', error);
      // If a critical error occurs, the user might still be "logged in" locally.
      // Handling this robustly without a "force clear local SDK state" method is hard.
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Game Arcade
      </Link>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        {authState.isAuthenticated && (
          <div className="ocid-user-info-navbar">
            <span className="navbar-user-greeting">
              Hi, {authState.idTokenPayload?.preferred_username || authState.idTokenPayload?.name || 'Player'}!
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