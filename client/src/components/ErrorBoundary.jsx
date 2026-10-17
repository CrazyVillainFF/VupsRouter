import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Refresh, WarningAmber } from '@mui/icons-material';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('VupsRouter UI Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
          <Box
            className="glass-panel"
            sx={{
              p: 6,
              maxWidth: 600,
              mx: 'auto',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <WarningAmber sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              Router Execution Notice
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              An interface anomaly occurred while rendering this view. Your session and saved conversations remain secure.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleReload}
              sx={{ px: 4, py: 1.2 }}
            >
              Reload Interface
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
