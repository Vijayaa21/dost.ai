import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const MoodDashboard = lazy(() => import('./pages/MoodDashboard'));
const Journal = lazy(() => import('./pages/Journal'));
const CopingToolkit = lazy(() => import('./pages/CopingToolkit'));
const Settings = lazy(() => import('./pages/Settings'));
const Pet = lazy(() => import('./pages/Pet'));
const Insights = lazy(() => import('./pages/Insights'));
const EmotionGames = lazy(() => import('./pages/EmotionGames'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-3 text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/home" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/home" />} />
          
          {/* Onboarding */}
          <Route 
            path="/onboarding" 
            element={
              <PrivateRoute>
                {user?.onboarding_completed ? <Navigate to="/home" /> : <Onboarding />}
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
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/mood" element={<MoodDashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/coping" element={<CopingToolkit />} />
            <Route path="/pet" element={<Pet />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/games" element={<EmotionGames />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
