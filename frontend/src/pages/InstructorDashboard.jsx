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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {t("dashboard")} - {t("instructor")}
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/50"
          >
            {t("createSession")}
          </button>
        </div>

        {/* Create Session Form */}
        {showCreateForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              {t("createSession")}
            </h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("sessionName")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("courseName")}
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("sessionDate")}
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50"
                >
                  {t("submit")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 border border-slate-600 transition-all"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QR Display */}
        {selectedSession && qrData && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-400">{t("showQR")}</h2>
              <button
                onClick={stopQRRotation}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-red-500/50"
              >
                {t("close")}
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={qrData.qrCode}
                alt="QR Code"
                className="w-96 h-96 border-4 border-cyan-500 rounded-lg shadow-lg shadow-cyan-500/30"
              />
              <p className="mt-4 text-sm text-slate-300">
                Expires in: {qrData.expiresIn} seconds
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Auto-refreshes every 4 minutes
              </p>
            </div>
          </div>
        )}

        {/* Live Attendance */}
        {selectedSession && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-400">
                {t("liveAttendance")}
              </h2>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-lg font-semibold text-green-400">
                  {attendances.length} {t("studentsPresent")}
                </span>
                <button
                  onClick={() => exportCSV(selectedSession)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50"
                >
                  {t("exportCSV")}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      {t("name")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      {t("username")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      {t("group")}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                        {att.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {att.user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {att.user.groupName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
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
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            {t("sessions")}
          </h2>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-slate-700 bg-slate-900 rounded-lg p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-200">
                      {session.name}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {session.courseName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(session.date).toLocaleString()}
                    </p>
                    <p className="text-xs text-cyan-400 font-medium">
                      Attendance: {session._count.attendances}
                    </p>
                  </div>
                  <button
                    onClick={() => startQRRotation(session.id)}
                    disabled={selectedSession === session.id}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
