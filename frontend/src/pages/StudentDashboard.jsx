import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import Layout from "../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getUserStats(user.id);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">{t("loading")}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("welcome")}, {stats?.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {t("group")}: {stats?.user.groupName || "N/A"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              {t("totalSessions")}
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats?.stats.totalSessions || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              {t("attendanceCount")}
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.stats.attendanceCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              {t("absenceCount")}
            </h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats?.stats.absenceCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              {t("attendanceRate")}
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.stats.attendanceRate || 0}%
            </p>
          </div>
        </div>

        {/* Weekly Breakdown Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("weeklyBreakdown")}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.weeklyBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attended" fill="#10b981" name={t("attended")} />
              <Bar dataKey="absent" fill="#ef4444" name={t("absent")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("recentAttendance")}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("sessionName")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("courseName")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentAttendances?.map((att) => (
                  <tr key={att.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.sessionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(att.scannedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
