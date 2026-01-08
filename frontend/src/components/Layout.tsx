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
  { path: '/coping', icon: SlidersHorizontal, label: 'Coping Tools' },
];

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Dost AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
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
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
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

      {/* Main Content */}
      <main className="flex-1 md:ml-0 mt-14 md:mt-0 h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
