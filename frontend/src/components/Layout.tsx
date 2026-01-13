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
  Heart
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        {/* Desktop Sidebar - Fixed Position */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-screen z-40">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6">
            <img src="/dost-logo.svg" alt="Dost AI" className="w-10 h-10" />
            <span className="text-xl font-bold text-gray-800">Dost AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Crisis Support & Logout */}
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={() => window.open('tel:9152987821')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-all font-medium mb-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Crisis Support</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/dost-logo.svg" alt="Dost AI" className="w-8 h-8" />
            <span className="text-lg font-bold text-gray-800">Dost AI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden fixed top-14 left-0 right-0 bg-white border-b border-gray-100 z-40 p-4"
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
                      ? 'bg-indigo-50 text-indigo-600' 
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 font-medium"
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 md:ml-64">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm">Made with care for your mental wellness</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="tel:9152987821" className="hover:text-red-500 transition-colors flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Crisis Help
              </a>
            </div>
            <p className="text-xs text-gray-400">© 2024 Dost AI. Your mental health companion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
