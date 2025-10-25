export default function SessionCard({
  session,
  selectedSession,
  startQRRotation,
  t,
}) {
  return (
    <div
      key={session.id}
      className="border border-slate-700 bg-slate-800 sm:bg-slate-900 rounded-lg p-4 hover:bg-slate-700 transition-colors"
    >
      <div className="flex justify-between items-center w-full">
        <div className="w-1/2 overflow-hidden break-words">
          <h3 className="font-semibold text-slate-200">{session.name}</h3>
          <p className="text-sm text-slate-300">{session.courseName}</p>
          <p className="text-xs text-slate-400">
            {new Date(session.date).toLocaleString()}
          </p>
          <p className="text-xs text-cyan-400 font-medium">
            Attendance: {session._count.attendances}
          </p>
        </div>

        <div className="w-1/2 flex justify-end">
          <button
            onClick={() => startQRRotation(session.id)}
            disabled={selectedSession === session.id}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedSession === session.id ? "Active" : t("showQR")}
          </button>
        </div>
      </div>
    </div>
  );
}
