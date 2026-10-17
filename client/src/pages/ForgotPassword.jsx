import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { EmailOutlined, ArrowBack, Send } from '@mui/icons-material';
import { authApi } from '../services/api.js';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Box className="glass-panel" sx={{ p: { xs: 4, sm: 6 } }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to="/signin"
            startIcon={<ArrowBack />}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            Back to Sign In
          </Button>
        </Box>

        <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
          PASSWORD RECOVERY
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
          Reset Your Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          Enter the email address associated with your VupsRouter account. We will issue a secure, single-use reset token.
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {submitted ? (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Check Your Inbox
            </Typography>
            <Typography variant="body2">
              If an account is associated with <strong>{email}</strong>, a recovery token has been generated. For local development, check the server terminal logs for the direct reset link.
            </Typography>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} sx={{ color: '#07080e' }} /> : <Send />}
                sx={{ py: 1.4 }}
              >
                {loading ? 'Transmitting...' : 'Dispatch Reset Token'}
              </Button>
            </Box>
          </form>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Remembered your password?{' '}
            <Link component={RouterLink} to="/signin" underline="hover" sx={{ color: '#00f0ff', fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
