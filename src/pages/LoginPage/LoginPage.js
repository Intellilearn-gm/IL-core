import React, { useEffect } from 'react';
import { useOCAuth } from '@opencampus/ocid-connect-js';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const { isInitialized, authState, ocAuth } = useOCAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && authState.isAuthenticated) {
      // If there's a 'from' location, redirect there, otherwise to dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isInitialized, authState.isAuthenticated, navigate, location.state]);

  const handleLogin = async () => {
    if (!ocAuth) {
      console.error("ocAuth object not available for login.");
      // Potentially show an error message to the user
      return;
    }
    try {
      // Store the current path to redirect back after login if needed,
      // though our /auth/callback will now always go to dashboard.
      // This is more for if the redirect flow itself could be configured
      // to return to a specific dynamic path.
      // For now, state for signInWithRedirect might not be strictly necessary
      // for this particular 'from' behavior, as /auth/callback controls final redirect.
      await ocAuth.signInWithRedirect({ state: 'opencampus-login-attempt' });
    } catch (error) {
      console.error('OCID Login initiation error:', error);
      // Display error to user on the login page
    }
  };

  if (!isInitialized) {
    return (
      <div className="login-page-container">
        <div className="login-status">Initializing authentication...</div>
      </div>
    );
  }

  // If already authenticated, this component will redirect via useEffect.
  // So, we only render the login button if not authenticated.
  if (authState.isAuthenticated) {
    return (
        <div className="login-page-container">
            <div className="login-status">Redirecting...</div>
        </div>
    ); // Or null, or a loading indicator while redirecting
  }


  return (
    <div className="login-page-container">
      <div className="login-box">
        <h1>Welcome to the IntelliLearn!</h1>
        <p>Please log in with your OpenCampus ID to continue.</p>
        {authState.error && (
          <div className="login-error-message">
            Error: {authState.error.message || 'An unknown error occurred during login.'}
          </div>
        )}
        <button onClick={handleLogin} className="ocid-login-button-page" disabled={!ocAuth}>
          { !ocAuth ? 'Initializing...' : 'Login with OCID' }
        </button>
      </div>
    </div>
  );
};

export default LoginPage;