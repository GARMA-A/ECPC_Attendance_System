import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }
  const ICPCLogo = () => (
    <svg
      className="h-8 w-8 text-cyan-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m8.66-14.66l-.7.7M4.04 19.96l-.7.7M21 12h-1m-16 0H3m14.66 8.66l-.7-.7M4.04 4.04l-.7-.7"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12c-1.657 0-3-1.79-3-4s1.343-4 3-4 3 1.79 3 4-1.343 4-3 4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12c-3.314 0-6 1.79-6 4s2.686 4 6 4 6-1.79 6-4-2.686-4-6-4z"
      />
    </svg>
  );

  return (
    // Main container is now relative to position the background
    <div className="relative min-h-screen overflow-hidden bg-slate-900">

      {/* 1. Animated Background */}
      {/* This div holds the gradient and the floating icons */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 animate-gradient-slow">
        <ul className="animated-icons">
          <li>{'{ }'}</li>
          <li>{'</>'}</li>
          <li>{'Σ'}</li>
          <li>{'💡'}</li>
          <li>{'ƒ(x)'}</li>
          <li>{'[ ]'}</li>
          <li>{'λ'}</li>
          <li>{'#'}</li>
          <li>{'//'}</li>
          <li>{'Graph'}</li>
        </ul>
      </div>

      {/* 2. Glassmorphism Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-800/70 backdrop-blur-lg border-b border-slate-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">

              {/* Upgraded Logo/Title Link */}
              <Link to="/" className="flex items-center gap-3 group">
                <ICPCLogo />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap group-hover:scale-105 transition-transform">
                  QR Attendance
                </span>
              </Link>

              {/* Upgraded Nav Links with Animated Underline */}
              {user.role === 'student' && (
                <>
                  <Link
                    to="/"
                    className="relative group px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <span>{t('dashboard')}</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  </Link>
                  <Link
                    to="/scan"
                    className="relative group px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <span>{t('scanQR')}</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  </Link>
                </>
              )}
              {user.role === 'instructor' && (
                <Link
                  to="/"
                  className="relative group px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <span>{t('dashboard')}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/"
                  className="relative group px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <span>{t('adminPanel')}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                </Link>
              )}
            </div>

            {/* Right side of Navbar */}
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              <LanguageToggle />
              <span className="hidden sm:inline text-sm text-slate-300">
                {user.name}
              </span>
              {/* Upgraded Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs sm:text-sm font-semibold 
                           rounded-lg shadow-lg hover:shadow-red-500/50
                           hover:scale-105 active:scale-95 
                           transition-all duration-300 ease-in-out"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Main Content Area as a Floating Glass Panel */}
      {/* This is now a glass panel itself. The content inside {children} 
        will appear to float over the animated background.
      */}
      <main className="max-w-7xl mx-auto my-6 sm:my-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/50">
          {children}
        </div>
      </main>
    </div>
  );
}
