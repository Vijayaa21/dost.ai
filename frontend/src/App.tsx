import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import AnimatedBackground from './components/AnimatedBackground';

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
const JoinGame = lazy(() => import('./pages/JoinGame'));

function LoadingScreen({ label = 'Preparing your space' }: { label?: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'radial-gradient(1200px 800px at 10% -10%, #fff0e4 0%, #fff7eb 55%, #fdf3ed 100%)' }}
    >
      <div className="w-full max-w-md rounded-3xl border border-[#f2ded4] bg-white/80 shadow-lg px-6 py-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#d97c6f] to-[#c86b60] shadow-md" />
        <p className="text-sm uppercase tracking-[0.3em] text-[#b38377]">Dost AI</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#5c3d36]">{label}</h2>
        <div className="mt-5 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-[#d99f8f]"
              style={{ animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out` }}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-[#8d6a60]">Gentle moments are loading...</p>
      </div>
    </div>
  );
}

// Loading fallback component
function PageLoader() {
  return <LoadingScreen label="Loading your next step" />;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated, user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading spinner while checking auth state
  if (!isInitialized) {
    return <LoadingScreen label="Warming up your dashboard" />;
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
            <Route path="/games/join" element={<JoinGame />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;