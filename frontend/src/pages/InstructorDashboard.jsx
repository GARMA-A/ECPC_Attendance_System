import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import Layout from "../components/Layout";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    courseName: "",
    date: new Date().toISOString().slice(0, 16),
  });
  const qrIntervalRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    return () => {
      if (qrIntervalRef.current) {
        clearInterval(qrIntervalRef.current);
      }
    };
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await api.createSession(formData);
      setShowCreateForm(false);
      setFormData({
        name: "",
        courseName: "",
        date: new Date().toISOString().slice(0, 16),
      });
      loadSessions();
    } catch (error) {
      alert("Failed to create session: " + error.message);
    }
  };

  const startQRRotation = async (sessionId) => {
    setSelectedSession(sessionId);

    // Initial QR generation
    await generateQR(sessionId);

    // Auto-refresh QR every 4 minutes (before 5-minute expiry)
    qrIntervalRef.current = setInterval(() => {
      generateQR(sessionId);
    }, 4 * 60 * 1000);

    // Load attendance
    loadAttendance(sessionId);

    // Refresh attendance every 5 seconds
    const attendanceInterval = setInterval(() => {
      if (selectedSession === sessionId) {
        loadAttendance(sessionId);
      }
    }, 5000);

    return () => clearInterval(attendanceInterval);
  };

  const generateQR = async (sessionId) => {
    try {
      const data = await api.getSessionQR(sessionId);
      setQrData(data);
    } catch (error) {
      console.error("Failed to generate QR:", error);
    }
  };

  const loadAttendance = async (sessionId) => {
    try {
      const data = await api.getSessionAttendance(sessionId);
      setAttendances(data.attendances);
    } catch (error) {
      console.error("Failed to load attendance:", error);
    }
  };

  const stopQRRotation = () => {
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
      qrIntervalRef.current = null;
    }
    setSelectedSession(null);
    setQrData(null);
    setAttendances([]);
  };

  const exportCSV = (sessionId) => {
    api.getSessionAttendance(sessionId, "csv");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {t("dashboard")} - {t("instructor")}
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("createSession")}
          </button>
        </div>

        {/* Create Session Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t("createSession")}
            </h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("sessionName")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("courseName")}
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("sessionDate")}
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t("submit")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QR Display */}
        {selectedSession && qrData && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t("showQR")}</h2>
              <button
                onClick={stopQRRotation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t("close")}
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={qrData.qrCode}
                alt="QR Code"
                className="w-96 h-96 border-4 border-gray-300 rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-600">
                Expires in: {qrData.expiresIn} seconds
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Auto-refreshes every 4 minutes
              </p>
            </div>
          </div>
        )}

        {/* Live Attendance */}
        {selectedSession && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {t("liveAttendance")}
              </h2>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-lg font-semibold text-green-600">
                  {attendances.length} {t("studentsPresent")}
                </span>
                <button
                  onClick={() => exportCSV(selectedSession)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t("exportCSV")}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      {t("name")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      {t("username")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      {t("group")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((att) => (
                    <tr key={att.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {att.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {att.user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {att.user.groupName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(att.scannedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("sessions")}
          </h2>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {session.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session.courseName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.date).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Attendance: {session._count.attendances}
                    </p>
                  </div>
                  <button
                    onClick={() => startQRRotation(session.id)}
                    disabled={selectedSession === session.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedSession === session.id ? "Active" : t("showQR")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
