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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900">
      <nav className="bg-slate-800 border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                QR Attendance
              </Link>
              {user.role === "student" && (
                <>
                  <Link
                    to="/"
                    className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                  >
                    {t("dashboard")}
                  </Link>
                  <Link
                    to="/scan"
                    className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                  >
                    {t("scanQR")}
                  </Link>
                </>
              )}
              {user.role === "instructor" && (
                <Link
                  to="/"
                  className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                >
                  {t("dashboard")}
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  to="/"
                  className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                >
                  {t("adminPanel")}
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              <LanguageToggle />
              <span className="hidden sm:inline text-sm text-slate-300">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-red-500/50"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
