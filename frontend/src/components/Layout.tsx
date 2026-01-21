import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  MessageCircle, 
  Smile, 
  BookOpen, 
  SlidersHorizontal, 
  LogOut,
  Menu,
  X,
  AlertCircle,
  PawPrint,
  Brain,
  Gamepad2,
  Heart,
  Github,
  Star,
  Code2,
  Sparkles,
  Sun,
  Moon,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import clsx from 'clsx';

const navItems = [
  { path: '/home', icon: BarChart3, label: 'Dashboard' },
  { path: '/chat', icon: MessageCircle, label: 'Chat with Dost' },
  { path: '/mood', icon: Smile, label: 'Mood Journal' },
  { path: '/journal', icon: BookOpen, label: 'Journaling' },
  { path: '/pet', icon: PawPrint, label: 'Wellness Pet' },
  { path: '/insights', icon: Brain, label: 'Insights' },
  { path: '/games', icon: Gamepad2, label: 'Emotion Games' },
  { path: '/coping', icon: SlidersHorizontal, label: 'Coping Tools' },
];

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 relative z-10">
      <div className="flex flex-1">
        {/* Desktop Sidebar - Fixed Position */}
        <aside className={clsx(
          "hidden md:flex flex-col w-64 fixed top-0 left-0 h-screen z-40 border-r transition-colors duration-300",
          isDark 
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700/50" 
            : "bg-gradient-to-b from-white via-white to-slate-50 border-gray-100"
        )}>
          {/* Logo */}
          <div className={clsx(
            "flex items-center justify-between px-5 py-5 border-b transition-colors",
            isDark ? "border-slate-700/50" : "border-gray-100"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <img src="/dost-logo.svg" alt="Dost AI" className="w-7 h-7 filter brightness-0 invert" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Dost AI</span>
                <p className={clsx("text-xs", isDark ? "text-slate-500" : "text-gray-400")}>Mental Wellness</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={clsx(
                "p-2 rounded-xl transition-all",
                isDark 
                  ? "bg-slate-700 hover:bg-slate-600 text-yellow-400" 
                  : "bg-gray-100 hover:bg-gray-200 text-slate-600"
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30' 
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Crisis Support & Logout */}
          <div className={clsx(
            "border-t p-4 transition-colors",
            isDark ? "border-slate-700/50 bg-gradient-to-t from-red-950/30 to-transparent" : "border-gray-100 bg-gradient-to-t from-red-50/50 to-transparent"
          )}>
            <button
              onClick={() => window.open('tel:9152987821')}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all font-medium mb-2",
                isDark ? "text-red-400 hover:bg-red-950/50" : "text-red-500 hover:bg-red-50"
              )}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Crisis Support</span>
            </button>
            <button
              onClick={handleLogout}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all font-medium",
                isDark ? "text-slate-400 hover:bg-slate-700/50" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className={clsx(
          "md:hidden fixed top-0 left-0 right-0 z-50 border-b transition-colors",
          isDark ? "bg-slate-900/95 backdrop-blur-lg border-slate-700/50" : "bg-white/95 backdrop-blur-lg border-gray-100"
        )}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <img src="/dost-logo.svg" alt="Dost AI" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <span className={clsx("text-lg font-bold", isDark ? "text-white" : "text-gray-800")}>Dost AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  isDark ? "text-yellow-400 bg-slate-800" : "text-slate-600 bg-gray-100"
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={clsx("p-2", isDark ? "text-slate-300" : "text-gray-600")}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={clsx(
              "md:hidden fixed top-14 left-0 right-0 z-40 p-4 border-b transition-colors",
              isDark ? "bg-slate-900/95 backdrop-blur-lg border-slate-700/50" : "bg-white border-gray-100"
            )}
          >
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                      isActive 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' 
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-gray-600 hover:bg-gray-50'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl w-full font-medium",
                  isDark ? "text-red-400 hover:bg-red-950/50" : "text-red-500 hover:bg-red-50"
                )}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </motion.div>
        )}

        {/* Main Content - Offset for fixed sidebar */}
        <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer - Theme Aware */}
      <footer className={clsx(
        "py-12 md:ml-64 transition-colors duration-300 border-t",
        isDark 
          ? "bg-slate-900/95 border-slate-800 text-white" 
          : "bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100 border-purple-200 text-gray-800"
      )}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/dost-logo.svg" alt="Dost AI" className="w-16 h-16" />
                <div>
                  <h3 className={clsx(
                    "text-2xl font-bold bg-clip-text text-transparent",
                    isDark 
                      ? "bg-gradient-to-r from-purple-400 to-pink-400" 
                      : "bg-gradient-to-r from-purple-600 to-pink-600"
                  )}>
                    Dost AI
                  </h3>
                  <span className={clsx("text-xs", isDark ? "text-slate-400" : "text-gray-500")}>Your Mental Wellness Companion</span>
                </div>
              </div>
              <p className={clsx("text-sm leading-relaxed mb-4", isDark ? "text-slate-300" : "text-gray-600")}>
                Dost AI is your personal AI-powered mental health companion designed to support your emotional wellbeing through 
                empathetic conversations, mood tracking, journaling, and guided coping strategies. 
                We're here for you, every step of the way. 💜
              </p>
              <div className={clsx("flex items-center gap-2 text-xs", isDark ? "text-slate-400" : "text-gray-500")}>
                <Sparkles className={clsx("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                <span>Powered by AI, Built with Care</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={clsx("font-semibold mb-4 flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
                <Heart className={clsx("w-4 h-4", isDark ? "text-pink-400" : "text-pink-600")} />
                Resources
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className={clsx(
                    "transition-colors flex items-center gap-2",
                    isDark ? "text-slate-300 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                  )}>
                    About Dost AI
                  </a>
                </li>
                <li>
                  <a href="#" className={clsx(
                    "transition-colors flex items-center gap-2",
                    isDark ? "text-slate-300 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                  )}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className={clsx(
                    "transition-colors flex items-center gap-2",
                    isDark ? "text-slate-300 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"
                  )}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="tel:9152987821" className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Crisis Helpline (24/7)
                  </a>
                </li>
              </ul>
            </div>

            {/* GitHub & Support Section */}
            <div>
              <h4 className={clsx("font-semibold mb-4 flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
                <Github className="w-4 h-4" />
                Open Source
              </h4>
              <p className={clsx("text-sm mb-4", isDark ? "text-slate-300" : "text-gray-600")}>
                Dost AI is open source! Help us make mental wellness accessible to everyone.
              </p>
              <div className="space-y-3">
                <a 
                  href="https://github.com/Vijayaa21/dost.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 w-fit"
                >
                  <Star className="w-4 h-4" />
                  Star on GitHub ⭐
                </a>
                <a 
                  href="https://github.com/Vijayaa21/dost.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all w-fit",
                    isDark 
                      ? "bg-slate-700 hover:bg-slate-600 text-white" 
                      : "bg-purple-100 hover:bg-purple-200 text-purple-800"
                  )}
                >
                  <Code2 className="w-4 h-4" />
                  Contribute
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={clsx("border-t pt-6", isDark ? "border-slate-700" : "border-purple-200")}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className={clsx("flex items-center gap-2", isDark ? "text-slate-400" : "text-gray-500")}>
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm">Made with care for your mental wellness</span>
              </div>
              
              {/* Social Media Links */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.linkedin.com/in/vijaya-mishra21/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={clsx(
                    "p-2 rounded-lg transition-all transform hover:scale-110",
                    isDark 
                      ? "bg-slate-700/50 text-blue-400 hover:bg-blue-950/50" 
                      : "bg-purple-100 text-blue-600 hover:bg-blue-100"
                  )}
                  title="Connect on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/Vijayaa21/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={clsx(
                    "p-2 rounded-lg transition-all transform hover:scale-110",
                    isDark 
                      ? "bg-slate-700/50 text-gray-300 hover:bg-slate-600" 
                      : "bg-purple-100 text-gray-700 hover:bg-gray-200"
                  )}
                  title="Follow on GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://x.com/Vijayaa_21" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={clsx(
                    "p-2 rounded-lg transition-all transform hover:scale-110",
                    isDark 
                      ? "bg-slate-700/50 text-sky-400 hover:bg-sky-950/50" 
                      : "bg-purple-100 text-sky-500 hover:bg-sky-100"
                  )}
                  title="Follow on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>

              <p className={clsx("text-xs", isDark ? "text-slate-500" : "text-gray-400")}>
                © 2026 Dost AI. All rights reserved. Your mental health companion.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
