import React from 'react';
import { useOCAuth } from '@opencampus/ocid-connect-js';
import './OCIDConnectButton.css';

const OCIDConnectButton = () => {
  const { isInitialized, authState, ocAuth } = useOCAuth();

  const handleLogin = async () => {
    if (!ocAuth) {
        console.error("ocAuth object not available for login.");
        return;
    }
    try {
      // The documentation uses signInWithRedirect.
      // If popup is desired, the library might have ocAuth.signInWithPopup() - check library's capabilities if needed
      await ocAuth.signInWithRedirect({ state: 'opencampus-login' }); // state is optional but good practice
    } catch (error) {
      console.error('OCID Login initiation error:', error);
      // Potentially set a local error state to display to the user
    }
  };

  const handleLogout = async () => {
    if (!ocAuth) {
        console.error("ocAuth object not available for logout.");
        return;
    }
    try {
      await ocAuth.logout({
        // Optional: specify where to return after logout
        // logoutParams: { returnTo: window.location.origin }
      });
    } catch (error) {
      console.error('OCID Logout error:', error);
    }
  };

  if (!isInitialized) {
    return <button className="ocid-btn loading" disabled>Initializing...</button>;
  }

  if (authState.error) {
    // This error in authState is usually from the redirect callback phase
    // or if the initial token validation fails.
    console.error("OCID Auth State Error:", authState.error);
    return (
        <>
            <div className="ocid-error-message">Login Error: {authState.error.message || 'Unknown error'}</div>
            <button onClick={handleLogin} className="ocid-btn login" disabled={!ocAuth}>
                Retry Login
            </button>
        </>
    );
  }

  if (authState.isAuthenticated) {
    return (
      <div className="ocid-user-info">
        <span className="ocid-user-greeting">
          Hi, {authState.idTokenPayload?.preferred_username || authState.idTokenPayload?.name || 'User'}!
        </span>
        <button onClick={handleLogout} className="ocid-btn logout" disabled={!ocAuth}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="ocid-btn login" disabled={!ocAuth}>
      Login with OCID
    </button>
  );
};

export default OCIDConnectButton;