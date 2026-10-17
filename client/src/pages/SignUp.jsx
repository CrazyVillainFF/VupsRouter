import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Link,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined, PersonOutlined, ArrowForward, CheckCircle } from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext.js';

function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: 'None', color: 'error' };
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  if (score <= 25) return { score, label: 'Weak (8+ characters needed)', color: 'error' };
  if (score <= 50) return { score, label: 'Fair (add numbers or uppercase)', color: 'warning' };
  if (score <= 75) return { score, label: 'Good (add special symbol)', color: 'info' };
  return { score: 100, label: 'Strong', color: 'success' };
}

export const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || formData.name.length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!formData.agreeTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Protocol to proceed.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (res.success) {
        setSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Account creation failed.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Box
        className="glass-panel"
        sx={{
          p: { xs: 4, sm: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow accent */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
            GET STARTED
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Unlock seamless AI routing, personal chats, and verified model discovery.
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ mb: 3, borderRadius: 2 }}>
            Account verified successfully! Initializing AI workspace...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              name="name"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange}
              disabled={loading || success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={handleChange}
              disabled={loading || success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />

            <Box>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={formData.password}
                onChange={handleChange}
                disabled={loading || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="Toggle password visibility">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {formData.password && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Strength: {strength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    color={strength.color}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              )}
            </Box>

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" aria-label="Toggle confirm password visibility">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  color="primary"
                  disabled={loading || success}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I accept the{' '}
                  <Link component={RouterLink} to="/about" underline="hover" sx={{ color: '#00f0ff' }}>
                    Terms of Routing
                  </Link>{' '}
                  and Privacy Protocol.
                </Typography>
              }
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || success}
              endIcon={loading ? <CircularProgress size={20} sx={{ color: '#07080e' }} /> : <ArrowForward />}
              sx={{ py: 1.4, mt: 1 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/signin" underline="hover" sx={{ color: '#00f0ff', fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
