import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, CheckCircle, ArrowForward } from '@mui/icons-material';
import { authApi } from '../services/api.js';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Missing password reset token in URL.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({ token, password });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Box className="glass-panel" sx={{ p: { xs: 4, sm: 6 } }}>
        <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
          SECURITY UPDATE
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
          Create New Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Enter and confirm your new secure password below.
        </Typography>

        {!token && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            No password reset token detected in the URL. Please request a new recovery link.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ mb: 3, borderRadius: 2 }}>
            Password updated successfully! Redirecting to sign in...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success || !token}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success || !token}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || success || !token}
              endIcon={loading ? <CircularProgress size={20} sx={{ color: '#07080e' }} /> : <ArrowForward />}
              sx={{ py: 1.4, mt: 1 }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link component={RouterLink} to="/signin" underline="hover" sx={{ color: '#00f0ff', fontSize: '0.9rem' }}>
            Back to Sign In
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
