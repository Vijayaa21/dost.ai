import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme, getCardClass, getInputClass } from '../context/ThemeContext';
import Logo from '../components/Logo';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      navigate('/chat');
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <div className={getCardClass(isDark, "rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden")}> 
          <div className="grid lg:grid-cols-2 relative">
            {/* Vertical glowing divider */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-purple-500 transform -translate-x-1/2" style={{
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.8), 0 0 30px rgba(168, 85, 247, 0.4)'
            }} />
            
            {/* Illustration / Brand side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:flex flex-col items-center justify-between p-12 text-center relative"
            >
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <Logo size="lg" />
                <div>
                  <p className={isDark ? "text-slate-300" : "text-gray-600"}>Login to continue your journey with our platform.</p>
                </div>
              </div>
              
              <div className={isDark ? "text-xs text-slate-400" : "text-xs text-gray-500"}>
                © 2026 Dost AI — <Link to="#" className="hover:text-purple-400 transition-colors">Privacy</Link> · <Link to="#" className="hover:text-purple-400 transition-colors">Terms</Link> · <Link to="#" className="hover:text-purple-400 transition-colors">Contact</Link>
              </div>
            </motion.div>

            {/* Form side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-center p-12"
            >
            <h2 className={isDark ? "text-3xl font-bold text-center text-white mb-2" : "text-3xl font-bold text-gray-900 mb-2"}>Welcome Back!</h2>


              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className={isDark ? "block text-sm font-semibold text-slate-300 mb-2" : "block text-sm font-semibold text-gray-700 mb-2"}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={getInputClass(isDark, "w-full") + " px-4 py-3.5 rounded-xl"}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className={isDark ? "block text-sm font-semibold text-slate-300 mb-2" : "block text-sm font-semibold text-gray-700 mb-2"}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={getInputClass(isDark, "w-full pr-12") + " px-4 py-3.5 rounded-xl"}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-6 rounded-xl font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className={isDark ? "text-slate-400 text-sm" : "text-gray-600 text-sm"}>
                  Don't have an account? <Link to="/register" className="text-purple-500 hover:text-purple-600 font-medium">Sign Up</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
