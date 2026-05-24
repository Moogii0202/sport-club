import React, { useState, useEffect } from "react";
import { api } from "../api/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const WEEK_DAYS    = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
const DAY_IDX      = { "Даваа": 0, "Мягмар": 1, "Лхагва": 2, "Пүрэв": 3, "Баасан": 4, "Бямба": 5, "Ням": 6 };
const MN_MONTHS    = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];
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
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function toMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function parseLocal(iso) {
  if (!iso) return null;
  if (iso instanceof Date) {
    // pg may return Date objects — use UTC parts since pg stores dates as UTC midnight
    return new Date(iso.getUTCFullYear(), iso.getUTCMonth(), iso.getUTCDate());
  }
  const s = String(iso).trim();
  // ISO timestamp e.g. "2026-05-19T00:00:00.000Z" → use UTC date parts
  if (s.length > 10 && (s.endsWith("Z") || s.includes("+"))) {
    const d = new Date(s);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  // Plain date string "YYYY-MM-DD"
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m2) return null;
  return new Date(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
}
function fmtDateShort(iso) {
  const d = parseLocal(iso);
  if (!d) return "—";
  return `${MN_MONTHS[d.getMonth()]} сарын ${d.getDate()}`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = parseLocal(iso);
  if (!d) return "—";
  return `${d.getFullYear()}/${MN_MONTHS[d.getMonth()]} сарын ${d.getDate()}`;
}

// ── Session card (TrainCardFull style, clickable) ─────────────────────────────
function LeaveSessionCard({ s, date, isSelected, hasLeave, isPending, isPast, onClick }) {
  const a    = accentCls[s.accent] || accentCls.orange;
  const mins = toMin(s.end) - toMin(s.start);
  const initials = s.coach ? s.coach.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <button onClick={isPast ? undefined : onClick} disabled={isPast}
      className={`w-full text-left flex rounded-2xl overflow-hidden transition-all
        ${isPast ? "opacity-40 cursor-not-allowed" : isSelected ? `ring-2 ${a.ring}` : "opacity-90 hover:opacity-100"}`}>
      <div className={`w-2 shrink-0 ${hasLeave ? "bg-green-500" : isPending ? "bg-amber-400" : a.dot}`} />
      <div className={`flex-1 border border-l-0 border-white/10 rounded-r-2xl px-4 py-3.5
        ${isSelected ? a.bg : "bg-[#1c1c1c]"}`}>
        {/* Top: coach avatar + name | date */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
              border ${a.border} ${a.bg} ${a.text}`}>
              {initials}
            </div>
            <span className="font-bold text-base leading-tight truncate text-white">{s.coach}</span>
          </div>
          {date && (
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-400 text-xs font-semibold tabular-nums">{date}</span>
            </div>
          )}
        </div>
        {/* Session label */}
        <p className={`text-xs font-semibold mb-3 ${a.text}`}>
          {"Хичээл · "}{s.group}
        </p>
        {/* Time connector */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-extrabold tabular-nums text-white">{s.start}</span>
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${a.bg} ${a.text} ${a.border}`}>
              {mins} мин
            </span>
            <div className="w-full flex items-center gap-0.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${a.dot}`} />
              <div className="flex-1 border-t border-dashed border-white/20" />
              <svg className={`w-3.5 h-3.5 shrink-0 ${a.text}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-extrabold tabular-nums text-white">{s.end}</span>
        </div>
        {/* Location + badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-500 text-xs truncate">{s.location}</span>
          </div>
          {isPast && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-600 border border-white/10 font-bold shrink-0">
              ӨНГӨРСӨН
            </span>
          )}
          {!isPast && hasLeave && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-bold shrink-0">
              ЧӨЛӨӨТЭЙ
            </span>
          )}
          {!isPast && isPending && !hasLeave && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold shrink-0">
              ХҮЛЭЭГДЭЖ БАЙНА
            </span>
          )}
          {!isPast && isSelected && !hasLeave && !isPending && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${a.badge}`}>
              СОНГОСОН
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Week view ─────────────────────────────────────────────────────────────────
function WeekView({ sessions, todayIso, weekDates, weekIsoDates, weekOffset, weekLabel,
                    leaveByKey, pendingByKey, selectedSession, selectedDate, onSelect, onPrev, onNext }) {
  const todayDayIdx = weekIsoDates.indexOf(todayIso);
  const [selDay, setSelDay] = useState(() => todayDayIdx >= 0 ? todayDayIdx : 0);

  useEffect(() => {
    setSelDay(todayDayIdx >= 0 ? todayDayIdx : 0);
  }, [weekOffset]);

  const colIso      = weekIsoDates[selDay];
  const daySessions = sessions
    .filter(s => s.dateIdx === selDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  const now         = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                     border border-white/10 text-gray-400 hover:text-white transition shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-sm">{weekLabel}</span>
        <button onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                     border border-white/10 text-gray-400 hover:text-white transition shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day selector strip */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {WEEK_DAYS.map((d, i) => {
          const isSelected = i === selDay;
          const isToday    = weekIsoDates[i] === todayIso;
          const hasSess    = sessions.some(s => s.dateIdx === i);
          const hasLeave   = hasSess && sessions.filter(s => s.dateIdx === i)
                               .some(s => leaveByKey[`${s.classId}|${weekIsoDates[i]}`]);
          const hasPending = !hasLeave && hasSess && sessions.filter(s => s.dateIdx === i)
                               .some(s => pendingByKey[`${s.classId}|${weekIsoDates[i]}`]);
          return (
            <button key={i} onClick={() => setSelDay(i)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all
                ${isSelected ? "bg-white shadow-lg" : "hover:bg-white/5"}`}>
              <span className={`text-[10px] font-semibold uppercase tracking-wide
                ${isSelected ? "text-gray-500" : "text-gray-600"}`}>
                {d.slice(0, 2)}
              </span>
              <span className={`text-base font-extrabold mt-0.5
                ${isSelected ? "text-black" : isToday ? "text-orange-400" : "text-gray-300"}`}>
                {weekDates[i].getDate()}
              </span>
              {hasSess && (
                <div className="flex gap-0.5 mt-1">
                  <span className={`w-1 h-1 rounded-full
                    ${isSelected ? "bg-gray-400" : hasLeave ? "bg-green-500" : hasPending ? "bg-amber-400" : "bg-orange-500"}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Session list */}
      {daySessions.length === 0 ? (
        <div className="text-center py-10">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <p className="text-gray-600 text-sm">Хичээл байхгүй</p>
        </div>
      ) : (
        <div className="space-y-3">
          {daySessions.map(s => {
            const hasLeave  = !!leaveByKey[`${s.classId}|${colIso}`];
            const isPending = !hasLeave && !!pendingByKey[`${s.classId}|${colIso}`];
            const isSel     = selectedSession?.id === s.id && selectedDate === colIso;
            const isPast    = colIso < todayIso ||
                              (colIso === todayIso && toMin(s.start) <= currentMins);
            return (
              <LeaveSessionCard key={s.id} s={s} date={colIso} isSelected={isSel}
                hasLeave={hasLeave} isPending={isPending} isPast={isPast}
                onClick={() => onSelect(s, colIso)} />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Month view ────────────────────────────────────────────────────────────────
function MonthView({ sessions, monthGrid, monthRef, monthLabel, todayStr,
                     leaveByKey, pendingByKey, onPrev, onNext, onDayClick }) {
  const dayNames = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                     border border-white/10 text-gray-400 hover:text-white transition shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-sm">{monthLabel}</span>
        <button onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                     border border-white/10 text-gray-400 hover:text-white transition shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-600 uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>

      {/* Grid */}
      {monthGrid.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7">
          {row.map((day, ci) => {
            const cellDate     = day ? new Date(monthRef.getFullYear(), monthRef.getMonth(), day) : null;
            const cellStr      = cellDate ? toDateStr(cellDate) : null;
            const isToday      = cellStr === todayStr;
            const cellSessions = day ? sessions.filter(s => s.dateIdx === ci) : [];
            const hasSess      = cellSessions.length > 0;

            return (
              <button key={ci}
                disabled={!day || !hasSess}
                onClick={() => cellDate && hasSess && onDayClick(cellDate, cellSessions[0], cellStr)}
                className={`aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl m-0.5 transition-all
                  ${isToday ? "bg-orange-500/15 ring-1 ring-orange-500/30" : ""}
                  ${day && hasSess ? "hover:bg-white/5 cursor-pointer" : "cursor-default"}`}>
                <span className={`text-sm font-semibold
                  ${day ? (isToday ? "text-orange-400" : "text-gray-300") : "text-transparent"}`}>
                  {day || "·"}
                </span>
                {day && hasSess && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {cellSessions.slice(0, 3).map((s, si) => {
                      const hasLv  = cellStr && leaveByKey[`${s.classId}|${cellStr}`];
                      const isPend = !hasLv && cellStr && pendingByKey[`${s.classId}|${cellStr}`];
                      return (
                        <span key={si}
                          className={`w-1.5 h-1.5 rounded-full ${hasLv ? "bg-green-500" : isPend ? "bg-amber-400" : (accentCls[s.accent]?.dot || "bg-orange-500")}`} />
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-gray-500 text-xs">Анхан шат</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-gray-500 text-xs">Дунд шат</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-gray-500 text-xs">Ахисан шат</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-500 text-xs">Чөлөөтэй</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-gray-500 text-xs">Хүлээгдэж буй</span>
        </div>
      </div>
    </div>
  );
}

// ── Leave form panel ──────────────────────────────────────────────────────────
function LeaveForm({ session, date, leaveByKey, pendingByKey, onSubmit, onClose }) {
  const [reason,     setReason]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const a = accentCls[session.accent] || accentCls.orange;

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Шалтгаанаа оруулна уу"); return; }
    const key = `${session.classId}|${date}`;
    if (leaveByKey[key])   { setError("Энэ өдрийн чөлөөний хүсэлт аль хэдийн зөвшөөрөгдсөн байна"); return; }
    if (pendingByKey[key]) { setError("Энэ өдрийн чөлөөний хүсэлт хүлээгдэж байна"); return; }
    setSubmitting(true); setError("");
    try {
      await onSubmit({ classId: session.classId, date, reason });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const dateObj  = date ? new Date(date) : null;
  const dayNum   = dateObj ? dateObj.getDate() : "—";
  const monthStr = dateObj ? MN_MONTHS[dateObj.getMonth()] : "";

  return (
    <div className="bg-[#151515] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.bg} border ${a.border}`}>
            <svg className={`w-4 h-4 ${a.text}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Чөлөөний хүсэлт</p>
           
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10
                     text-gray-500 hover:text-gray-300 transition shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selected session summary */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex gap-4 items-start">
          {/* Date badge */}
          <div className={`shrink-0 rounded-xl border px-3 py-2.5 text-center min-w-[52px] ${a.bg} ${a.border}`}>
            <p className={`text-[10px] font-semibold ${a.text}`}>{monthStr} сар</p>
            <p className="text-white font-extrabold text-2xl leading-none">{dayNum}</p>
          </div>
          {/* Info */}
          <div className="flex-1 space-y-1.5 pt-0.5">
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${a.badge}`}>
              {session.group}
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
                </svg>
                {session.start}–{session.end}
              </span>
              {session.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {session.location}
                </span>
              )}
              {session.coach && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {session.coach}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reason + actions */}
      <div className="px-5 py-4 space-y-3">
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
            Чөлөө авах шалтгаан *
          </label>
          <textarea rows={3} value={reason}
            onChange={e => { setReason(e.target.value); setError(""); }}
            placeholder="Чөлөө авах болсон шалтгаанаа дэлгэрэнгүй бичнэ үү..."
            className={`${inputCls} resize-none`} />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                       hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            )}
            {submitting ? "Илгээж байна..." : "Хүсэлт илгээх"}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-white/10 text-gray-400 text-sm font-medium
                       rounded-xl hover:border-white/20 hover:text-gray-300 transition">
            Цуцлах
          </button>
        </div>
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
  const [weekOffset,    setWeekOffset]    = useState(0);
  const [monthOffset,   setMonthOffset]   = useState(0);

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

  // Quick lookup: "classId|date" → leave record (approved only → ЧӨЛӨӨТЭЙ)
  const leaveByKey   = {};
  const pendingByKey = {};
  leaveList.forEach(lr => {
    const d = parseLocal(lr.date);
    if (!d) return;
    const key = `${lr.classId}|${toDateStr(d)}`;
    if (lr.status === "approved") leaveByKey[key]   = lr;
    if (lr.status === "pending")  pendingByKey[key] = lr;
  });

  // Dates
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayStr = toDateStr(today);

  // Week (with offset)
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIdx + weekOffset * 7);
  const weekDates    = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const weekIsoDates = weekDates.map(d => toDateStr(d));
  const weekLabel    = `${weekDates[0].getMonth()+1}/${weekDates[0].getDate()} – ${weekDates[6].getMonth()+1}/${weekDates[6].getDate()}`;

  // Month (with offset)
  const monthRef     = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthLabel   = `${monthRef.getFullYear()} оны ${MN_MONTHS[monthRef.getMonth()]} сар`;
  const startOffset  = monthRef.getDay() === 0 ? 6 : monthRef.getDay() - 1;
  const daysInMonth  = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0).getDate();
  const cells        = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const monthGrid    = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const handleSessionSelect = (s, date) => {
    if (selectedSess?.id === s.id && selectedDate === date) {
      setSelectedSess(null); setSelectedDate(null);
    } else {
      setSelectedSess(s); setSelectedDate(date);
    }
  };

  const handleDayClick = (date, s, isoDate) => {
    const di         = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const clickedMon = new Date(date); clickedMon.setDate(date.getDate() - di);
    const todayMon   = new Date(today); todayMon.setDate(today.getDate() - todayIdx);
    const diff       = Math.round((clickedMon - todayMon) / (7 * 86400000));
    setWeekOffset(diff);
    setCalView("week");
    setSelectedSess(s);
    setSelectedDate(isoDate);
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
            <p className="text-gray-500 text-sm">{monthLabel} · Хичээлийн хуваарьтай харьцуулан чөлөө авна уу</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Section 1: Schedule calendar ────────────────────────────────── */}
        <div className="space-y-4">
          

          <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
            {/* Calendar header */}
            <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-white font-bold">Хичээлийн хуваарь</h3>
                <p className="text-gray-600 text-xs mt-0.5">Хичээл дээр дарж чөлөө авна уу</p>
              </div>
              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                {[{ key: "week", label: "7 хоног" }, { key: "month", label: "Сарын" }].map(t => (
                  <button key={t.key}
                    onClick={() => { setCalView(t.key); setSelectedSess(null); setSelectedDate(null); }}
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
                      todayIso={todayStr}
                      weekDates={weekDates}
                      weekIsoDates={weekIsoDates}
                      weekOffset={weekOffset}
                      weekLabel={weekLabel}
                      leaveByKey={leaveByKey}
                      pendingByKey={pendingByKey}
                      selectedSession={selectedSess}
                      selectedDate={selectedDate}
                      onSelect={handleSessionSelect}
                      onPrev={() => setWeekOffset(p => p - 1)}
                      onNext={() => setWeekOffset(p => p + 1)}
                    />
                  )}
                  {calView === "month" && (
                    <MonthView
                      sessions={sessions}
                      monthGrid={monthGrid}
                      monthRef={monthRef}
                      monthLabel={monthLabel}
                      todayStr={todayStr}
                      leaveByKey={leaveByKey}
                      pendingByKey={pendingByKey}
                      onPrev={() => setMonthOffset(p => p - 1)}
                      onNext={() => setMonthOffset(p => p + 1)}
                      onDayClick={handleDayClick}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Leave form */}
          {selectedSess && selectedDate && (
            <LeaveForm
              session={selectedSess}
              date={selectedDate}
              leaveByKey={leaveByKey}
              pendingByKey={pendingByKey}
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

          {leaveList.length === 0 ? (
            <div className="bg-[#151515] rounded-2xl border border-white/5 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Илгээсэн хүсэлт байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveList.map(lr => {
                const a       = accentCls[LEVEL_ACCENT[lr.level] || "orange"];
                const sc      = STATUS_CFG[lr.status] || STATUS_CFG.pending;
                const dt      = lr.date?.split("T")[0] || lr.date;
                const dateObj = parseLocal(dt);

                const statusStrip = lr.status === "approved" ? "bg-green-500"
                                  : lr.status === "rejected" ? "bg-red-500"
                                  : "bg-amber-400";
                const statusBanner = lr.status === "approved"
                                   ? "bg-green-500/5 border-green-500/10 text-green-400"
                                   : lr.status === "rejected"
                                   ? "bg-red-500/5 border-red-500/10 text-red-400"
                                   : "bg-amber-500/5 border-amber-500/10 text-amber-400";
                const StatusIcon = lr.status === "approved"
                  ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  : lr.status === "rejected"
                  ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>;

                return (
                  <div key={lr.id} className="flex rounded-2xl overflow-hidden">
                    <div className={`w-2 shrink-0 ${statusStrip}`} />
                    <div className="flex-1 bg-[#1c1c1c] border border-l-0 border-white/10 rounded-r-2xl overflow-hidden">

                      {/* Status banner */}
                      <div className={`px-4 py-2 flex items-center justify-between border-b border-white/5 ${statusBanner}`}>
                        <div className="flex items-center gap-1.5">
                          {StatusIcon}
                          <span className="text-xs font-bold">{sc.label}</span>
                        </div>
                        <span className="text-gray-600 text-[10px]">Илгээсэн: {fmtDate(lr.createdAt)}</span>
                      </div>

                      {/* Main content */}
                      <div className="px-4 py-3.5">
                        <div className="flex gap-3.5 mb-3">
                          {/* Date badge */}
                          {dateObj && (
                            <div className={`shrink-0 rounded-xl border px-3 py-2 text-center min-w-[58px] ${a.bg} ${a.border}`}>
                              <p className={`text-[10px] font-semibold ${a.text}`}>{MN_MONTHS[dateObj.getMonth()]} сар</p>
                              <p className="text-white font-extrabold text-2xl leading-none">{dateObj.getDate()}</p>
                              {lr.dayOfWeek && (
                                <p className="text-gray-500 text-[9px] mt-0.5">{lr.dayOfWeek}</p>
                              )}
                            </div>
                          )}
                          {/* Info */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border mb-1.5 ${a.badge}`}>
                              {lr.level}
                            </span>
                            <p className="text-white font-bold text-sm leading-tight mb-2">{lr.className}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                  <path strokeLinecap="round" d="M12 6v6l4 2"/>
                                </svg>
                                {lr.startTime}–{lr.endTime}
                              </span>
                              {lr.location && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {lr.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        {lr.reason && (
                          <div className="flex gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 mb-3">
                            <svg className="w-3 h-3 text-gray-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                            </svg>
                            <p className="text-gray-500 text-xs line-clamp-2 italic">{lr.reason}</p>
                          </div>
                        )}

                        {/* Cancel */}
                        {lr.status === "pending" && (
                          <div className="flex justify-end">
                            <button onClick={() => handleCancel(lr.id)} disabled={cancellingId === lr.id}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400
                                         border border-white/10 hover:border-red-500/30
                                         px-3 py-1.5 rounded-xl transition disabled:opacity-50">
                              {cancellingId === lr.id ? (
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              )}
                              {cancellingId === lr.id ? "Цуцалж байна..." : "Хүсэлт цуцлах"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default LeaveRequest;
