import React, { useState, useEffect } from "react";
import { api } from "../api/api";

// ── Constants (Schedule.jsx-тэй нийцүүлсэн) ──────────────────────────────────
const WEEK_DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
const DAY_SHORT = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const DAY_IDX   = { "Даваа": 0, "Мягмар": 1, "Лхагва": 2, "Пүрэв": 3, "Баасан": 4, "Бямба": 5, "Ням": 6 };
const MN_MONTHS = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];
const LEVEL_ACCENT = { "Анхан шат": "orange", "Дунд шат": "blue", "Ахисан шат": "purple" };

const accentCls = {
  orange: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-400",
            badge: "bg-orange-500/20 text-orange-300 border-orange-500/30", dot: "bg-orange-500",
            ring: "ring-orange-500/50", activeFlt: "bg-orange-500 text-white" },
  blue:   { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",
            badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",   dot: "bg-blue-500",
            ring: "ring-blue-500/50",   activeFlt: "bg-blue-500 text-white"   },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400",
            badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", dot: "bg-purple-500",
            ring: "ring-purple-500/50", activeFlt: "bg-purple-500 text-white" },
};

const STATUS_CFG = {
  pending:  { label: "Хүлээгдэж буй", cls: "bg-amber-500/10  text-amber-400  border-amber-500/20"  },
  approved: { label: "Зөвшөөрөгдсөн", cls: "bg-green-500/10  text-green-400  border-green-500/20"  },
  rejected: { label: "Татгалзсан",    cls: "bg-red-500/10    text-red-400    border-red-500/20"    },
};

const inputCls = `w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white
  placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1
  focus:ring-orange-500/30 transition text-sm`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getUpcomingDates(dayOfWeek, count = 5) {
  const targetIdx = DAY_IDX[dayOfWeek];
  const dates = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let d = new Date(today); dates.length < count; d.setDate(d.getDate() + 1)) {
    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    if (idx === targetIdx) dates.push(new Date(d).toISOString().split("T")[0]);
  }
  return dates;
}

function fmtDateShort(iso) {
  const d = new Date(iso);
  return `${MN_MONTHS[d.getMonth()]} сарын ${d.getDate()} (${DAY_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]})`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}/${MN_MONTHS[d.getMonth()]} сарын ${d.getDate()}`;
}

// ── Session card (Schedule.jsx-тэй ижил загвар) ───────────────────────────────
function SessionCard({ s, isSelected, hasLeave, onClick }) {
  const a = accentCls[s.accent] || accentCls.orange;
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-xl border px-2 py-2 transition-all
        ${isSelected
          ? `${a.bg} ${a.border} ring-2 ${a.ring}`
          : `${a.bg} ${a.border} hover:brightness-125`}`}>
      <p className={`text-[10px] font-bold ${a.text}`}>{s.start}–{s.end}</p>
      <p className="text-white text-[10px] font-semibold leading-tight mt-0.5">{s.group}</p>
      <p className="text-gray-500 text-[9px] mt-0.5 truncate">📍 {s.location || "—"}</p>
      {hasLeave && (
        <div className="mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-[9px] text-amber-400">Чөлөөтэй</span>
        </div>
      )}
    </button>
  );
}

// ── Week view (Schedule.jsx-ын WeekView-тэй ижил бүтэц) ──────────────────────
function WeekView({ sessions, todayIdx, weekDates, weekIsoDates, leaveByKey, selectedSession, selectedDate, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10 mb-2">
          {WEEK_DAYS.map((d, i) => (
            <div key={d} className="text-center py-3 px-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{d.slice(0, 3)}</p>
              <div className={`mx-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                ${i === todayIdx ? "bg-orange-500 text-white" : "text-gray-300"}`}>
                {weekDates[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Session columns */}
        <div className="grid grid-cols-7 gap-1 min-h-[100px]">
          {WEEK_DAYS.map((_, i) => {
            const daySessions = sessions.filter(s => s.dateIdx === i);
            const isToday = i === todayIdx;
            const isoDate = weekIsoDates[i];
            return (
              <div key={i} className={`space-y-1.5 px-0.5 py-1 rounded-xl
                ${isToday ? "bg-orange-500/5 ring-1 ring-orange-500/20" : ""}`}>
                {daySessions.map(s => {
                  const hasLeave = !!leaveByKey[`${s.classId}|${isoDate}`];
                  return (
                    <SessionCard key={s.id} s={s}
                      isSelected={selectedSession?.id === s.id && selectedDate === isoDate}
                      hasLeave={hasLeave}
                      onClick={() => onSelect(s, isoDate)} />
                  );
                })}
              </div>
            );
          })}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">
            Элссэн хичээл байхгүй байна
          </div>
        )}
      </div>
    </div>
  );
}

// ── Month view (Schedule.jsx-ын MonthView-тэй ижил бүтэц) ────────────────────
function MonthView({ sessions, monthGrid, todayDate, leaveByKey, selectedSession, selectedDate, onSelect }) {
  const sessionIdxs = new Set(sessions.map(s => s.dateIdx));
  const dayNames    = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs text-gray-600 uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>
      {monthGrid.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7">
          {row.map((day, ci) => {
            const isToday    = day === todayDate;
            const hasSession = day && sessionIdxs.has(ci);
            // Check leave for this exact date
            const today  = new Date();
            const year   = today.getFullYear();
            const month  = today.getMonth();
            const isoDate = day ? new Date(year, month, day).toISOString().split("T")[0] : null;
            const sessionsInCol = sessions.filter(s => s.dateIdx === ci);
            const hasLeave = isoDate && sessionsInCol.some(s => leaveByKey[`${s.classId}|${isoDate}`]);
            const isSelected = isoDate && selectedDate === isoDate && sessionsInCol.some(s => selectedSession?.id === s.id);

            return (
              <button key={ci}
                disabled={!day || !hasSession}
                onClick={() => {
                  if (!day || !hasSession) return;
                  const s = sessions.find(s => s.dateIdx === ci);
                  if (s) onSelect(s, isoDate);
                }}
                className={`aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl m-0.5 transition-all
                  ${isToday      ? "bg-orange-500/15 ring-1 ring-orange-500/30" : ""}
                  ${day && hasSession ? "hover:bg-white/5 cursor-pointer" : "cursor-default"}
                  ${isSelected   ? "ring-2 ring-orange-500/50" : ""}`}>
                <span className={`text-sm font-semibold
                  ${day ? (isToday ? "text-orange-400" : "text-gray-300") : "text-transparent"}`}>
                  {day || "·"}
                </span>
                {day && (hasSession || hasLeave) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasSession && !hasLeave && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    {hasLeave   && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-gray-500 text-xs">Хичээл</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-gray-500 text-xs">Чөлөотэй</span>
        </div>
      </div>
    </div>
  );
}

// ── Leave form panel ──────────────────────────────────────────────────────────
function LeaveForm({ session, date, leaveByKey, onSubmit, onClose }) {
  const [reason,     setReason]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const a = accentCls[session.accent] || accentCls.orange;

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Шалтгааг оруулна уу"); return; }
    const key = `${session.classId}|${date}`;
    if (leaveByKey[key]) { setError("Энэ өдрийн чөлөөний хүсэлт аль хэдийн илгээгдсэн байна"); return; }
    setSubmitting(true); setError("");
    try {
      await onSubmit({ classId: session.classId, date, reason });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${a.border} ${a.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${a.text} mb-1`}>
            {session.group} · {session.day} бүр
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span>🕘 {session.start}–{session.end}</span>
            {session.location && <span>📍 {session.location}</span>}
            {session.coach    && <span>👤 {session.coach}</span>}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Session details */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 bg-black/20">
          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Цаг</p>
          <p className="text-white font-semibold text-sm">{session.start}–{session.end}</p>
        </div>
        <div className="rounded-xl px-4 py-3 bg-black/20">
          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Байршил</p>
          <p className="text-white font-semibold text-sm truncate">📍 {session.location || "—"}</p>
        </div>
        <div className="rounded-xl px-4 py-3 bg-black/20">
          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Чөлөо авах өдөр</p>
          <p className="text-white font-semibold text-sm">{date ? fmtDateShort(date) : "—"}</p>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
          Чөлөо авах шалтгаан *
        </label>
        <textarea rows={3} value={reason}
          onChange={e => { setReason(e.target.value); setError(""); }}
          placeholder="Чөлөо авах болсон шалтгаанаа дэлгэрэнгүй бичнэ үү..."
          className={`${inputCls} resize-none`} />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={submitting}
          className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                     hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
          {submitting && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          {submitting ? "Илгээж байна..." : "Илгээх"}
        </button>
        <button onClick={onClose}
          className="px-5 py-2.5 border border-white/10 text-gray-400 text-sm font-medium
                     rounded-xl hover:border-white/20 transition">
          Цуцлах
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function LeaveRequest({ user }) {
  const [sessions,      setSessions]      = useState([]);
  const [leaveList,     setLeaveList]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [calView,       setCalView]       = useState("week");
  const [selectedSess,  setSelectedSess]  = useState(null);
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [cancellingId,  setCancellingId]  = useState(null);

  const fetchAll = async () => {
    try {
      const [schData, leaveData] = await Promise.all([
        api.get("/schedule/enrolled"),
        api.get("/leave"),
      ]);
      const mapped = (Array.isArray(schData) ? schData : []).map(s => ({
        id:       s.scheduleId,
        classId:  s.classId,
        dateIdx:  DAY_IDX[s.dayOfWeek] ?? 0,
        day:      s.dayOfWeek,
        start:    s.startTime,
        end:      s.endTime,
        location: s.location || "",
        coach:    [s.coachLastName, s.coachFirstName].filter(Boolean).join(" "),
        group:    s.level,
        accent:   LEVEL_ACCENT[s.level] || "orange",
      }));
      setSessions(mapped);
      setLeaveList(Array.isArray(leaveData) ? leaveData : []);
    } catch {
      setSessions([]); setLeaveList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Quick lookup: "classId|date" → leave record
  const leaveByKey = {};
  leaveList.forEach(lr => {
    const date = lr.date?.split("T")[0] || lr.date;
    leaveByKey[`${lr.classId}|${date}`] = lr;
  });

  // Current week dates
  const today     = new Date();
  const todayIdx  = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayDate = today.getDate();
  const monday    = new Date(today); monday.setDate(today.getDate() - todayIdx);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d.getDate();
  });
  const weekIsoDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d.toISOString().split("T")[0];
  });
  const monthLabel = `${today.getFullYear()} оны ${MN_MONTHS[today.getMonth()]} сар`;

  // Month grid
  const firstDay    = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const cells       = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const monthGrid   = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const handleSessionSelect = (s, date) => {
    if (selectedSess?.id === s.id && selectedDate === date) {
      setSelectedSess(null); setSelectedDate(null);
    } else {
      setSelectedSess(s); setSelectedDate(date);
    }
  };

  const handleSubmit = async (payload) => {
    await api.post("/leave", payload);
    await fetchAll();
    setSelectedSess(null); setSelectedDate(null);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Чөлөөний хүсэлтийг цуцлах уу?")) return;
    setCancellingId(id);
    try {
      await api.delete(`/leave/${id}`);
      await fetchAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Header */}
      <section className="bg-[#0d0d0d] border-b border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/25 rounded-2xl
                          flex items-center justify-center font-bold text-orange-400 text-lg shrink-0">
            {user?.profileImage
              ? <img src={user.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
              : initials || "U"}
          </div>
          <div>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
              Сайн байна уу, {user?.firstName}!
            </p>
            <h1 className="text-2xl font-extrabold text-white">
              Чөлөөний <span className="text-orange-500">хүсэлт</span>
            </h1>
            <p className="text-gray-500 text-sm">{monthLabel} · Хичээлийн хуваарьтай харьцуулан чөлөо авна уу</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Section 1: Schedule calendar ────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-orange-500 shrink-0" />
            <h2 className="text-white font-bold text-base">Хүсэлт илгээх</h2>
            <span className="text-gray-600 text-xs">Хичээлийн тухайн өдрийг дарж чөлөо авна уу</span>
          </div>

          {/* Calendar card — Schedule.jsx-тэй ижил загвар */}
          <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
            {/* Calendar header */}
            <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-white font-bold">Хичээлийн хуваарь</h3>
                <p className="text-gray-600 text-xs mt-0.5">{monthLabel} · Хичээл дарж чөлөо авна уу</p>
              </div>
              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                {[{ key: "week", label: "7 хоногийн" }, { key: "month", label: "Сарын" }].map(t => (
                  <button key={t.key} onClick={() => { setCalView(t.key); setSelectedSess(null); setSelectedDate(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${calView === t.key ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-white"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="text-center py-10 text-gray-600 text-sm">Уншиж байна...</div>
              ) : (
                <>
                  {calView === "week" && (
                    <WeekView
                      sessions={sessions}
                      todayIdx={todayIdx}
                      weekDates={weekDates}
                      weekIsoDates={weekIsoDates}
                      leaveByKey={leaveByKey}
                      selectedSession={selectedSess}
                      selectedDate={selectedDate}
                      onSelect={handleSessionSelect}
                    />
                  )}
                  {calView === "month" && (
                    <MonthView
                      sessions={sessions}
                      monthGrid={monthGrid}
                      todayDate={todayDate}
                      leaveByKey={leaveByKey}
                      selectedSession={selectedSess}
                      selectedDate={selectedDate}
                      onSelect={handleSessionSelect}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Leave form — appears when session is selected */}
          {selectedSess && selectedDate && (
            <LeaveForm
              session={selectedSess}
              date={selectedDate}
              leaveByKey={leaveByKey}
              onSubmit={handleSubmit}
              onClose={() => { setSelectedSess(null); setSelectedDate(null); }}
            />
          )}
        </div>

        {/* ── Section 2: Leave history ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-orange-500 shrink-0" />
            <h2 className="text-white font-bold text-base">Илгээсэн хүсэлтүүд</h2>
            <span className="text-gray-600 text-xs">{leaveList.length} нийт</span>
          </div>

          <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
            {leaveList.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-gray-600 text-sm">Илгээсэн хүсэлт байхгүй байна</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {leaveList.map(lr => {
                  const a    = accentCls[LEVEL_ACCENT[lr.level] || "orange"];
                  const sc   = STATUS_CFG[lr.status] || STATUS_CFG.pending;
                  const date = lr.date?.split("T")[0] || lr.date;

                  return (
                    <div key={lr.id} className="px-5 py-4 flex items-start gap-4">
                      {/* Date block */}
                      <div className={`shrink-0 rounded-xl border px-3 py-2 text-center min-w-[52px] ${a.bg} ${a.border}`}>
                        <p className={`text-[10px] font-medium ${a.text}`}>
                          {date ? MN_MONTHS[new Date(date).getMonth()] : ""}
                        </p>
                        <p className="text-white font-extrabold text-lg leading-none">
                          {date ? new Date(date).getDate() : "—"}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${a.badge}`}>
                            {lr.level}
                          </span>
                          <span className="text-white font-medium text-sm">{lr.className}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>🕘 {lr.startTime}–{lr.endTime}</span>
                          {lr.location && <span>📍 {lr.location}</span>}
                        </div>
                        {lr.reason && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">💬 {lr.reason}</p>
                        )}
                        <p className="text-gray-700 text-[10px] mt-1">{fmtDate(lr.createdAt)}</p>
                      </div>

                      {/* Status + cancel */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                          {sc.label}
                        </span>
                        {lr.status === "pending" && (
                          <button onClick={() => handleCancel(lr.id)} disabled={cancellingId === lr.id}
                            className="text-[10px] text-gray-600 hover:text-red-400 transition disabled:opacity-50">
                            {cancellingId === lr.id ? "..." : "Цуцлах"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LeaveRequest;
