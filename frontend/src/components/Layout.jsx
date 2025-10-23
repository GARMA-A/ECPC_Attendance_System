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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="text-xl font-bold text-blue-600">
                QR Attendance
              </Link>

              {user.role === "student" && (
                <>
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    {t("dashboard")}
                  </Link>
                  <Link
                    to="/scan"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    {t("scanQR")}
                  </Link>
                </>
              )}

              {user.role === "instructor" && (
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  {t("dashboard")}
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  {t("adminPanel")}
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <LanguageToggle />
              <span className="text-sm text-gray-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
