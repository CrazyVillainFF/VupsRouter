import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Box, CircularProgress } from '@mui/material';

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress sx={{ color: '#00f0ff' }} size={40} />
      </Box>
    );
  }

  if (isAuthenticated) {
    const redirect = searchParams.get('redirect') || '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
