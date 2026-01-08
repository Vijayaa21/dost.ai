import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import MoodDashboard from './pages/MoodDashboard';
import Journal from './pages/Journal';
import CopingToolkit from './pages/CopingToolkit';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { isAuthenticated, user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading spinner while checking auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/chat" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/chat" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/chat" />} />
        
        {/* Onboarding */}
        <Route 
          path="/onboarding" 
          element={
            <PrivateRoute>
              {user?.onboarding_completed ? <Navigate to="/chat" /> : <Onboarding />}
            </PrivateRoute>
          } 
        />
        
        {/* Protected routes with layout */}
        <Route 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/chat" element={<Chat />} />
          <Route path="/mood" element={<MoodDashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/coping" element={<CopingToolkit />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
