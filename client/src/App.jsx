import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import { CustomThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/PublicOnlyRoute.jsx';

import { Home } from './pages/Home.jsx';
import { SignUp } from './pages/SignUp.jsx';
import { SignIn } from './pages/SignIn.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';
import { ResetPassword } from './pages/ResetPassword.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { ChatWorkspace } from './pages/ChatWorkspace.jsx';
import { ModelExplorer } from './pages/ModelExplorer.jsx';
import { ModelCompare } from './pages/ModelCompare.jsx';
import { Providers } from './pages/Providers.jsx';
import { Settings } from './pages/Settings.jsx';
import { About } from './pages/About.jsx';
import { NotFound } from './pages/NotFound.jsx';

function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isHome && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<ModelExplorer />} />
          <Route path="/models/:modelId" element={<ModelExplorer />} />
          <Route path="/compare" element={<ModelCompare />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/about" element={<About />} />

          <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
          <Route path="/signin" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/chat" element={<ChatWorkspace />} />
          <Route path="/chat/:conversationId" element={<ChatWorkspace />} />
          <Route path="/chats" element={<ChatWorkspace />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      {!isHome && <Footer />}
    </Box>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
