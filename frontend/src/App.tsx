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
  const { isAuthenticated, user } = useAuthStore();

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
