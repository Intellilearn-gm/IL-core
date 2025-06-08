import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { OCConnect } from '@opencampus/ocid-connect-js'; // Import the library's provider

const root = ReactDOM.createRoot(document.getElementById('root'));

// Configuration for OCConnect
// Ensure REACT_APP_OCID_CLIENT_ID is set in your .env file
// For sandbox, client ID isn't strictly required by the SDK docs but good practice to have it for eventual live mode.
const ocidOpts = {
  clientId: process.env.REACT_APP_OCID_CLIENT_ID || 'SANDBOX_CLIENT_ID_PLACEHOLDER', // Provide a placeholder if not set for sandbox
  redirectUri: `${window.location.origin}/auth/callback`, // Matches the route we'll create
  // referralCode: 'YOUR_REFERRAL_CODE', // Optional
  // storageType: 'cookie', // Optional, defaults to localStorage
};

// Determine sandboxMode (e.g., based on environment variable or always true for dev)
const sandboxMode = process.env.NODE_ENV !== 'production';
if (!process.env.REACT_APP_OCID_CLIENT_ID && !sandboxMode) {
    console.warn("REACT_APP_OCID_CLIENT_ID is not set, but not in sandbox mode. This might cause issues in live environment.");
} else if (!process.env.REACT_APP_OCID_CLIENT_ID && sandboxMode) {
    console.info("REACT_APP_OCID_CLIENT_ID is not set. Running in sandbox mode with placeholder Client ID. This is okay for sandbox testing.");
}


root.render(
  <React.StrictMode>
    <OCConnect opts={ocidOpts} sandboxMode={sandboxMode}>
      <App />
    </OCConnect>
  </React.StrictMode>
);

reportWebVitals();