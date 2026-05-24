import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { accentCls, groupAccent, DAY_IDX, MemberAvatar } from "./shared";

export default function AttendanceTab({ initialSessionId: initialScheduleId }) {
  const [schedules,          setSchedules]          = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(initialScheduleId || null);
  const [sessionId,          setSessionId]          = useState(null);
  const [sessionInfo,        setSessionInfo]        = useState(null);
  const [members,            setMembers]            = useState([]);
  const [attendance,         setAttendance]         = useState({});
  const [loading,            setLoading]            = useState(false);
  const [saving,             setSaving]             = useState(false);
  const [saved,              setSaved]              = useState(false);
  const [loadError,          setLoadError]          = useState(null);

  useEffect(() => {
    api.get("/schedule/my")
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setSchedules(list);
        if (!initialScheduleId && list.length > 0) {
          const today    = new Date();
          const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
          const def = list.find(s => DAY_IDX[s.dayOfWeek] === todayIdx) || list[0];
          setSelectedScheduleId(def.scheduleId);
        }
      })
      .catch(() => setSchedules([]));
  }, []);

  useEffect(() => {
    if (!selectedScheduleId) return;
    setLoading(true);
    setAttendance({});
    setSaved(false);
    setSessionId(null);
    setSessionInfo(null);
    setMembers([]);
    setLoadError(null);

    api.post("/sessions", { scheduleId: selectedScheduleId })
      .then(({ sessionId: sid }) => {
        setSessionId(sid);
        return api.get(`/sessions/${sid}/members`);
      })
      .then(({ session, members: mlist }) => {
        setSessionInfo(session);
        const list = Array.isArray(mlist) ? mlist : [];
        setMembers(list);
        const pre = {};
        list.forEach(m => { if (m.status) pre[m.id] = m.status; });
        setAttendance(pre);
      })
      .catch(err => { setSessionId(null); setMembers([]); setLoadError(err.message); })
      .finally(() => setLoading(false));
  }, [selectedScheduleId]);

  const mark = (memberId, status) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      await api.post(`/sessions/${sessionId}/attendance`, { attendance });
      setSaved(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusBtn = (memberId, status, label, colors) => {
    const active = attendance[memberId] === status;
    return (
      <button onClick={() => mark(memberId, status)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${active ? colors.active : colors.idle}`}>
        {label}
      </button>
    );
  };

  const markedCount  = Object.keys(attendance).length;
  const currentSched = schedules.find(s => s.scheduleId === selectedScheduleId);
  const schedAccent  = currentSched ? (groupAccent[currentSched.level] || "orange") : "orange";

  return (
    <div className="space-y-5">
      <div className="bg-[#151515] rounded-2xl border border-white/5 p-5">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Тренинг сонгох</p>
        <div className="flex flex-wrap gap-2">
          {schedules.length === 0 && (
            <p className="text-gray-600 text-sm">Хуваарь байхгүй байна</p>
          )}
          {schedules.map(s => {
            const a      = accentCls[groupAccent[s.level] || "orange"];
            const active = selectedScheduleId === s.scheduleId;
            return (
              <button key={s.scheduleId}
                onClick={() => setSelectedScheduleId(s.scheduleId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all
                  ${active ? `${a.bg} ${a.border} ${a.text}` : "bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/10 hover:text-white"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                <span className="font-medium">{s.level}</span>
                <span className="text-gray-600 text-xs">{s.dayOfWeek} {s.startTime}</span>
              </button>
            );
          })}
        </div>
      </div>

      {sessionInfo && (
        <div className={`rounded-2xl border p-4 flex items-center gap-4 ${accentCls[schedAccent].border} ${accentCls[schedAccent].bg}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentCls[schedAccent].text}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div className="flex-1">
            <p className={`font-bold text-sm ${accentCls[schedAccent].text}`}>{sessionInfo.level} · {sessionInfo.className}</p>
            <p className="text-gray-500 text-xs flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>{sessionInfo.startTime}–{sessionInfo.endTime}</span>
              <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{sessionInfo.location || "—"}</span>
              · {sessionInfo.date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">{markedCount}<span className="text-gray-600 text-sm font-normal">/{members.length}</span></p>
            <p className="text-gray-600 text-xs">бүртгэгдсэн</p>
          </div>
        </div>
      )}

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-orange-500" />
            <h3 className="text-white font-bold">Ирц бүртгэх</h3>
          </div>
          {saved && (
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-semibold">
              ✓ Хадгалагдлаа
            </span>
          )}
        </div>

        <div className="divide-y divide-white/5">
          {loading && <div className="text-center py-10 text-gray-600 text-sm">Уншиж байна...</div>}
          {!loading && loadError && (
            <div className="text-center py-10 text-red-400 text-sm">{loadError}</div>
          )}
          {!loading && !loadError && members.length === 0 && selectedScheduleId && (
            <div className="text-center py-10 text-gray-600 text-sm">Энэ бүлэгт гишүүн байхгүй байна</div>
          )}
          {members.map(m => {
            const memForAvatar = { ...m, group: currentSched?.level || "Анхан шат" };
            return (
              <div key={m.id} className="px-5 py-3.5 flex items-center gap-4">
                <MemberAvatar m={memForAvatar} size="sm" />
                <p className="text-white font-medium text-sm flex-1">{m.lastName}. {m.firstName}</p>
                {m.hasApprovedLeave ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                   bg-teal-500/15 text-teal-400 border border-teal-500/25">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Чөлөөтэй
                  </span>
                ) : (
                  <div className="flex gap-1.5 flex-wrap">
                    {statusBtn(m.id, "present", "Ирсэн",    { active: "bg-green-500 text-white", idle: "bg-green-500/10 text-green-400 hover:bg-green-500/20" })}
                    {statusBtn(m.id, "late",    "Хоцорсон", { active: "bg-amber-500 text-white",  idle: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" })}
                    {statusBtn(m.id, "absent",  "Тасалсан", { active: "bg-red-500 text-white",    idle: "bg-red-500/10 text-red-400 hover:bg-red-500/20" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-white/5">
          <button onClick={handleSave}
            disabled={markedCount === 0 || saving || !sessionId}
            className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                       hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>}
            {saving ? "Хадгалж байна..." : `Хадгалах (${markedCount}/${members.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
