import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useOCAuth } from '@opencampus/ocid-connect-js';

const ProtectedRoute = () => {
  const { isInitialized, authState } = useOCAuth();

  if (!isInitialized) {
    // You might want to show a global loading spinner here
    // or a more specific loading indicator for the route.
    return <div>Loading authentication status...</div>;
  }

  if (!authState.isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location to redirect back after login (optional)
    // For simplicity, we'll just redirect to /login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child route (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;