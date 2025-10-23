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
        <h1 className="text-3xl font-bold text-gray-800">{t("admin")}</h1>

        {/* Tabs */}
        <div className="flex space-x-4 rtl:space-x-reverse border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("users")}
            className={`px-4 py-2 font-medium ${selectedTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
              }`}
          >
            {t("users")}
          </button>
          <button
            onClick={() => setSelectedTab("attendance")}
            className={`px-4 py-2 font-medium ${selectedTab === "attendance"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
              }`}
          >
            {t("attendanceRecords")}
          </button>
          <button
            onClick={() => setSelectedTab("sessions")}
            className={`px-4 py-2 font-medium ${selectedTab === "sessions"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
              }`}
          >
            {t("sessions")}
          </button>
        </div>

        {/* Users Tab */}
        {selectedTab === "users" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t("name")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t("username")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t("group")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    Attendances
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "instructor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                      >
                        {t(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.groupName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      Session
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((att) => (
                    <tr key={att.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {att.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {att.user.name} ({att.user.username})
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {att.session.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(att.scannedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteAttendance(att.id)}
                          className="text-red-600 hover:text-red-900"
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
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {selectedTab === "sessions" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t("sessionName")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t("courseName")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    Attendances
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.creator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
