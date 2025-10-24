import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import Layout from "../components/Layout";

export default function AdminPanel() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedTab, setSelectedTab] = useState("users");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    loadData();
  }, [selectedTab, pagination.page]);

  const loadData = async () => {
    try {
      if (selectedTab === "users") {
        const data = await api.getUsers();
        setUsers(data.users);
      } else if (selectedTab === "attendance") {
        const data = await api.getAllAttendance(pagination.page);
        setAttendances(data.attendances);
        setPagination(data.pagination);
      } else if (selectedTab === "sessions") {
        const data = await api.getSessions();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      await api.deleteAttendance(id);
      loadData();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t("admin")}</h1>

        {/* Tabs */}
        <div className="flex space-x-4 rtl:space-x-reverse border-b border-slate-700">
          <button
            onClick={() => setSelectedTab("users")}
            className={`px-4 py-2 font-medium transition-colors ${selectedTab === "users"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-300"
              }`}
          >
            {t("users")}
          </button>
          <button
            onClick={() => setSelectedTab("attendance")}
            className={`px-4 py-2 font-medium transition-colors ${selectedTab === "attendance"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-300"
              }`}
          >
            {t("attendanceRecords")}
          </button>
          <button
            onClick={() => setSelectedTab("sessions")}
            className={`px-4 py-2 font-medium transition-colors ${selectedTab === "sessions"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-300"
              }`}
          >
            {t("sessions")}
          </button>
        </div>

        {/* Users Tab */}
        {selectedTab === "users" && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {t("name")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {t("username")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {t("group")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Attendances
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "admin"
                          ? "bg-red-900 text-red-200 border border-red-700"
                          : user.role === "instructor"
                            ? "bg-blue-900 text-blue-200 border border-blue-700"
                            : "bg-green-900 text-green-200 border border-green-700"
                          }`}
                      >
                        {t(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {user.groupName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {user._count.attendances}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attendance Tab */}
        {selectedTab === "attendance" && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {att.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                        {att.user.name} ({att.user.username})
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {att.session.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(att.scannedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteAttendance(att.id)}
                          className="text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          {t("delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-300 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {selectedTab === "sessions" && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {t("sessionName")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {t("courseName")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Attendances
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {session.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-200">
                      {session.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {session.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(session.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {session.creator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {session._count.attendances}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
