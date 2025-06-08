import React from 'react';
import { LoginCallBack } from '@opencampus/ocid-connect-js'; // useOCAuth not directly needed here
import { useNavigate } from 'react-router-dom';
import './AuthCallbackPage.css';

const CustomLoadingComponent = () => {
    return <div className="auth-callback-status">Processing login... Please wait.</div>;
};

const CustomErrorComponent = () => {
    // This component receives error information via props from LoginCallBack if an error occurs.
    // For now, a generic message.
    return <div className="auth-callback-status error">Error during login. Redirecting...</div>;
};


const AuthCallbackPage = () => {
  const navigate = useNavigate();

  const loginSuccess = (/* authStateFromCallback */) => {
    // authStateFromCallback contains tokens and user info
    console.log('Login successful via callback. Navigating to dashboard.');
    navigate('/', { replace: true }); // Redirect to dashboard
  };

  const loginError = (error) => {
    console.error('Login error via callback:', error);
    // Even on error, redirect to login page where error might be displayed or user can retry
    navigate('/login', { replace: true });
  };

  return (
    <div className="auth-callback-container">
      <LoginCallBack
        errorCallback={loginError}
        successCallback={loginSuccess}
        customLoadingComponent={<CustomLoadingComponent />}
        customErrorComponent={<CustomErrorComponent />}
      />
    </div>
  );
};

export default AuthCallbackPage;