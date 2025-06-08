import React from 'react';
import { LoginCallBack, useOCAuth } from '@opencampus/ocid-connect-js';
import { useNavigate } from 'react-router-dom';
import './AuthCallbackPage.css'; // Optional: for styling loading/error messages

// Custom components as per documentation, can be simple for now
const CustomLoadingComponent = () => {
    return <div className="auth-callback-status">Processing login... Please wait.</div>;
};

// Updated CustomErrorComponent to correctly use useOCAuth if needed inside
const CustomErrorComponent = () => {
    // If you need authState details here, wrap LoginCallBack or this component in another
    // component that calls useOCAuth and passes props.
    // For now, let's keep it simple or assume error details are handled by errorCallback.
    // const { authState } = useOCAuth(); // This would cause an error if CustomErrorComponent is directly used
                                        // by LoginCallBack if LoginCallBack itself doesn't provide context
                                        // or if it's not a child of OCConnect directly.
                                        // The errorCallback will receive the error object.
    return <div className="auth-callback-status error">Error during login. Please try again.</div>;
};


const AuthCallbackPage = () => {
  const navigate = useNavigate();

  const loginSuccess = (authState) => {
    console.log('Login successful via callback:', authState);
    // You can store parts of authState (like idToken, accessToken) if needed,
    // but useOCAuth hook will provide them throughout the app.
    navigate('/'); // Redirect to home page or dashboard after successful login
  };

  const loginError = (error) => {
    console.error('Login error via callback:', error);
    // Handle error display or navigation to an error page
    // For now, let's navigate back to home, the error might be shown by button or global state
    navigate('/');
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