import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

// ── Shared data ──────────────────────────────────────────────────────────────
const accentClasses = {
  blue:   { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",   badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",   dot: "bg-blue-500",   activeFlt: "bg-blue-500 border-blue-500 text-white",   avatar: "bg-blue-500/20 border-blue-500/30 text-blue-400"   },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", dot: "bg-purple-500", activeFlt: "bg-purple-500 border-purple-500 text-white", avatar: "bg-purple-500/20 border-purple-500/30 text-purple-400" },
  orange: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30", dot: "bg-orange-500", activeFlt: "bg-orange-500 border-orange-500 text-white", avatar: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  green:  { border: "border-green-500",  bg: "bg-green-500/10",  text: "text-green-400",  badge: "bg-green-500/20 text-green-300 border-green-500/30",   dot: "bg-green-500",  activeFlt: "bg-green-500 border-green-500 text-white",   avatar: "bg-green-500/20 border-green-500/30 text-green-400"  },
};

const DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

// Public schedule slots
const publicSlots = [
  { id:  1, levelId: 1, name: "Анхан шат",  accent: "blue",   day: "Даваа",   time: "09:00–10:30", coach: "Д. Сарантуяа",  location: "А заал", spots: 5  },
  { id:  2, levelId: 1, name: "Анхан шат",  accent: "blue",   day: "Мягмар",  time: "10:00–11:30", coach: "Д. Сарантуяа",  location: "А заал", spots: 3  },
  { id:  3, levelId: 1, name: "Анхан шат",  accent: "blue",   day: "Лхагва",  time: "09:00–10:30", coach: "Д. Сарантуяа",  location: "А заал", spots: 0  },
  { id:  4, levelId: 1, name: "Анхан шат",  accent: "blue",   day: "Пүрэв",   time: "10:00–11:30", coach: "Д. Сарантуяа",  location: "А заал", spots: 7  },
  { id:  5, levelId: 1, name: "Анхан шат",  accent: "blue",   day: "Баасан",  time: "09:00–10:30", coach: "Д. Сарантуяа",  location: "А заал", spots: 6  },
  { id:  6, levelId: 2, name: "Дунд шат",   accent: "purple", day: "Даваа",   time: "15:00–16:30", coach: "Г. Тэмүүлэн",   location: "Б заал", spots: 8  },
  { id:  7, levelId: 2, name: "Дунд шат",   accent: "purple", day: "Мягмар",  time: "16:00–17:30", coach: "Г. Тэмүүлэн",   location: "Б заал", spots: 6  },
  { id:  8, levelId: 2, name: "Дунд шат",   accent: "purple", day: "Лхагва",  time: "15:00–16:30", coach: "Г. Тэмүүлэн",   location: "Б заал", spots: 4  },
  { id:  9, levelId: 2, name: "Дунд шат",   accent: "purple", day: "Пүрэв",   time: "16:00–17:30", coach: "Г. Тэмүүлэн",   location: "Б заал", spots: 5  },
  { id: 10, levelId: 2, name: "Дунд шат",   accent: "purple", day: "Баасан",  time: "15:00–16:30", coach: "Г. Тэмүүлэн",   location: "Б заал", spots: 6  },
  { id: 11, levelId: 3, name: "Ахисан шат", accent: "orange", day: "Даваа",   time: "17:00–19:00", coach: "Б. Бат-Эрдэнэ", location: "А заал", spots: 2  },
  { id: 12, levelId: 3, name: "Ахисан шат", accent: "orange", day: "Лхагва",  time: "17:00–19:00", coach: "Б. Бат-Эрдэнэ", location: "А заал", spots: 0  },
  { id: 13, levelId: 3, name: "Ахисан шат", accent: "orange", day: "Баасан",  time: "17:00–19:00", coach: "Б. Бат-Эрдэнэ", location: "А заал", spots: 7  },
  { id: 14, levelId: 4, name: "Бүх түвшин", accent: "green",  day: "Бямба",   time: "10:00–12:00", coach: "Б. Бат-Эрдэнэ", location: "А заал", spots: 10 },
];

const levels = [
  { id: 0, name: "Бүгд",        accent: null     },
  { id: 1, name: "Анхан шат",   accent: "blue"   },
  { id: 2, name: "Дунд шат",    accent: "purple" },
  { id: 3, name: "Ахисан шат",  accent: "orange" },
  { id: 4, name: "Бүх түвшин",  accent: "green"  },
];

const WEEK_DAYS    = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
const DAY_IDX      = { "Даваа": 0, "Мягмар": 1, "Лхагва": 2, "Пүрэв": 3, "Баасан": 4, "Бямба": 5, "Ням": 6 };
const LEVEL_ACCENT = { "Анхан шат": "orange", "Дунд шат": "blue", "Ахисан шат": "purple" };

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
// Normalise any date value (ISO timestamp, date string, or Date object) → "YYYY-MM-DD" or null
function fmtDate(d) {
  if (!d) return null;
  const s = String(d).trim().substring(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
const inRange = (s, dateStr) =>
  (!s.startDate || dateStr >= s.startDate) &&
  (!s.endDate   || dateStr <= s.endDate);

// ── Calendar sub-components ──────────────────────────────────────────────────
function SessionCard({ s, compact = false }) {
  const a = accentClasses[s.accent];
  const cancelled = s.status === "cancelled";
  return (
    <div className={`rounded-xl border p-2.5 ${cancelled ? "border-red-500/30 bg-red-500/5 opacity-70" : `${a.border} ${a.bg}`}`}>
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className={`text-xs font-bold ${cancelled ? "text-red-400 line-through" : a.text}`}>
          {s.start}–{s.end}
        </span>
        {cancelled && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 font-bold shrink-0">ЦЦ</span>
        )}
      </div>
      <p className={`text-xs font-semibold ${cancelled ? "text-gray-500 line-through" : "text-white"}`}>{s.group}</p>
      {!compact && (
        <>
          <p className="text-gray-500 text-[11px] mt-1">📍 {s.location}</p>
          <p className="text-gray-500 text-[11px]">👤 {s.coach}</p>
        </>
      )}
    </div>
  );
}

function toMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function TrainCard({ s }) {
  const a = accentClasses[s.accent];
  const cancelled = s.status === "cancelled";
  const mins = toMin(s.end) - toMin(s.start);
  const initials = s.coach ? s.coach.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className={`flex rounded-2xl overflow-hidden ${cancelled ? "opacity-60" : ""}`}>
      <div className={`w-2 shrink-0 ${cancelled ? "bg-red-500/60" : a.dot}`} />
      <div className="flex-1 bg-[#1c1c1c] border border-l-0 border-white/10 rounded-r-2xl px-4 py-3.5">
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <p className={`font-bold text-sm ${cancelled ? "text-gray-500 line-through" : "text-white"}`}>
            {s.group}
          </p>
          {cancelled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold">
              ЦУЦЛАГДСАН
            </span>
          )}
        </div>
        {/* Time connector row */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xl font-extrabold tabular-nums ${cancelled ? "text-gray-600" : "text-white"}`}>
            {s.start}
          </span>
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border
              ${cancelled ? "bg-gray-800 text-gray-600 border-gray-700" : `${a.bg} ${a.text} ${a.border}`}`}>
              {mins} мин
            </span>
            <div className="w-full flex items-center gap-0.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${cancelled ? "bg-gray-600" : a.dot}`} />
              <div className={`flex-1 border-t border-dashed ${cancelled ? "border-gray-700" : "border-white/20"}`} />
              <svg className={`w-3.5 h-3.5 shrink-0 ${cancelled ? "text-gray-600" : a.text}`}
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <span className={`text-xl font-extrabold tabular-nums ${cancelled ? "text-gray-600" : "text-white"}`}>
            {s.end}
          </span>
        </div>
        {/* Info row: location | coach */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-500 text-xs truncate">{s.location}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {s.coachImage ? (
              <img src={s.coachImage} alt={s.coach}
                className={`w-5 h-5 rounded-full object-cover border ${a.border}`} />
            ) : (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${a.bg} ${a.text}`}>
                {initials}
              </div>
            )}
            <span className="text-gray-400 text-xs">{s.coach}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainCardFull({ s, date }) {
  const a = accentClasses[s.accent];
  const cancelled = s.status === "cancelled";
  const mins = toMin(s.end) - toMin(s.start);
  const initials = s.coach ? s.coach.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className={`flex rounded-2xl overflow-hidden ${cancelled ? "opacity-60" : ""}`}>
      <div className={`w-2 shrink-0 ${cancelled ? "bg-red-500/60" : a.dot}`} />
      <div className="flex-1 bg-[#1c1c1c] border border-l-0 border-white/10 rounded-r-2xl px-4 py-3.5">
        {/* Top row: coach avatar + name | date */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {s.coachImage ? (
              <img src={s.coachImage} alt={s.coach}
                className={`w-10 h-10 rounded-full object-cover shrink-0 border-2 ${cancelled ? "border-gray-600" : a.border}`} />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${cancelled ? "bg-gray-800 text-gray-500 border border-gray-700" : `${a.bg} ${a.text} border ${a.border}`}`}>
                {initials}
              </div>
            )}
            <span className={`font-bold text-base leading-tight truncate ${cancelled ? "text-gray-500 line-through" : "text-white"}`}>
              {s.coach}
            </span>
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
        <p className={`text-xs font-semibold mb-3 ${cancelled ? "text-red-400/70" : a.text}`}>
          {cancelled ? "ЦУЦЛАГДСАН" : `Хичээл · ${s.group}`}
        </p>
        {/* Time connector row */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xl font-extrabold tabular-nums ${cancelled ? "text-gray-600" : "text-white"}`}>
            {s.start}
          </span>
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border
              ${cancelled ? "bg-gray-800 text-gray-600 border-gray-700" : `${a.bg} ${a.text} ${a.border}`}`}>
              {mins} мин
            </span>
            <div className="w-full flex items-center gap-0.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${cancelled ? "bg-gray-600" : a.dot}`} />
              <div className={`flex-1 border-t border-dashed ${cancelled ? "border-gray-700" : "border-white/20"}`} />
              <svg className={`w-3.5 h-3.5 shrink-0 ${cancelled ? "text-gray-600" : a.text}`}
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <span className={`text-xl font-extrabold tabular-nums ${cancelled ? "text-gray-600" : "text-white"}`}>
            {s.end}
          </span>
        </div>
        {/* Bottom: location */}
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-500 text-xs truncate">{s.location}</span>
        </div>
      </div>
    </div>
  );
}

function DayView({ sessions, todayIdx }) {
  const todayStr      = toDateStr(new Date());
  const todaySessions = [...sessions.filter(s => s.dateIdx === todayIdx && inRange(s, todayStr))]
    .sort((a, b) => a.start.localeCompare(b.start));

  const HOUR_H = 72;
  const START_H = 7;
  const END_H   = 23;
  const hours   = Array.from({ length: END_H - START_H }, (_, i) => i + START_H);

  const now     = new Date();
  const nowTop  = (now.getHours() * 60 + now.getMinutes() - START_H * 60) * (HOUR_H / 60);
  const showNow = nowTop >= 0 && nowTop <= hours.length * HOUR_H;

  if (todaySessions.length === 0) return (
    <div className="text-center py-12">
      <p className="text-2xl mb-2"></p>
      <p className="text-gray-600 text-sm">Өнөөдөр тренинг байхгүй</p>
    </div>
  );

  return (
    <div className="overflow-y-auto max-h-[580px] rounded-xl border border-white/5 bg-[#111]">
      <div className="relative" style={{ height: `${hours.length * HOUR_H}px` }}>

        {/* Hour lines */}
        {hours.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex pointer-events-none"
               style={{ top: `${i * HOUR_H}px` }}>
            <span className="text-gray-600 text-[11px] w-12 shrink-0 -mt-2 text-right pr-3 select-none tabular-nums">
              {String(h).padStart(2, "0")}:00
            </span>
            <div className="flex-1 border-t border-white/5" />
          </div>
        ))}

        {/* Current time indicator */}
        {showNow && (
          <div className="absolute left-12 right-0 flex items-center z-20 pointer-events-none"
               style={{ top: `${nowTop}px` }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
            <div className="flex-1 border-t-2 border-red-500" />
          </div>
        )}

        {/* TrainCard blocks */}
        {todaySessions.map(s => {
          const a         = accentClasses[s.accent];
          const cancelled = s.status === "cancelled";
          const top       = (toMin(s.start) - START_H * 60) * (HOUR_H / 60);
          const height    = Math.max((toMin(s.end) - toMin(s.start)) * (HOUR_H / 60), 44);
          const mins      = toMin(s.end) - toMin(s.start);
          const initials  = s.coach ? s.coach.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "?";

          return (
            <div key={s.id}
              className={`absolute left-14 right-2 z-10 flex rounded-xl overflow-hidden ${cancelled ? "opacity-60" : ""}`}
              style={{ top: `${top}px`, height: `${height}px` }}>

              {/* Left accent strip */}
              <div className={`w-1.5 shrink-0 ${cancelled ? "bg-red-500/60" : a.dot}`} />

              {/* Card content */}
              <div className={`flex-1 border border-l-0 border-white/10 rounded-r-xl px-2.5 py-2 overflow-hidden flex flex-col justify-between
                ${cancelled ? "bg-red-500/5" : a.bg}`}>

                {/* Title row */}
                <div className="flex items-center justify-between gap-1">
                  <p className={`font-bold text-[11px] leading-tight truncate
                    ${cancelled ? "text-gray-500 line-through" : "text-white"}`}>
                    {s.group}
                  </p>
                  {cancelled && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold shrink-0">
                      ЦЦ
                    </span>
                  )}
                </div>

                {/* Time connector — shown if height >= 80px */}
                {height >= 80 && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-extrabold tabular-nums shrink-0
                      ${cancelled ? "text-gray-600" : "text-white"}`}>
                      {s.start}
                    </span>
                    <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                      <span className={`text-[9px] font-bold px-1.5 py-px rounded-full border leading-tight
                        ${cancelled ? "bg-gray-800 text-gray-600 border-gray-700" : `${a.text} ${a.border}`}`}>
                        {mins}м
                      </span>
                      <div className="w-full flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cancelled ? "bg-gray-600" : a.dot}`} />
                        <div className={`flex-1 border-t border-dashed ${cancelled ? "border-gray-700" : "border-white/20"}`} />
                        <svg className={`w-2.5 h-2.5 shrink-0 ${cancelled ? "text-gray-600" : a.text}`}
                          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <span className={`text-xs font-extrabold tabular-nums shrink-0
                      ${cancelled ? "text-gray-600" : "text-white"}`}>
                      {s.end}
                    </span>
                  </div>
                )}

                {/* Info row — shown if height >= 110px */}
                {height >= 110 && (
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <svg className="w-3 h-3 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-500 text-[10px] truncate">{s.location}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {s.coachImage ? (
                        <img src={s.coachImage} alt={s.coach}
                          className={`w-4 h-4 rounded-full object-cover border ${a.border}`} />
                      ) : (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${a.bg} ${a.text}`}>
                          {initials}
                        </div>
                      )}
                      <span className="text-gray-400 text-[10px] truncate max-w-[80px]">{s.coach}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ sessions, todayIdx, weekDates, weekOffset, weekLabel, onPrev, onNext }) {
  const [selDay, setSelDay] = useState(() => weekOffset === 0 ? todayIdx : 0);

  useEffect(() => {
    setSelDay(weekOffset === 0 ? todayIdx : 0);
  }, [weekOffset, todayIdx]);

  const colStr      = toDateStr(weekDates[selDay]);
  const daySessions = sessions
    .filter(s => s.dateIdx === selDay && inRange(s, colStr))
    .sort((a, b) => a.start.localeCompare(b.start));


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
          const dStr       = toDateStr(weekDates[i]);
          const isSelected = i === selDay;
          const isToday    = weekOffset === 0 && i === todayIdx;
          const accents    = [...new Set(
            sessions.filter(s => s.dateIdx === i && inRange(s, dStr)).map(s => s.accent)
          )];
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
              {accents.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {accents.slice(0, 3).map(ac => (
                    <span key={ac} className={`w-1 h-1 rounded-full
                      ${isSelected ? "bg-gray-400" : accentClasses[ac]?.dot || "bg-orange-500"}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Session list for selected day */}
      {daySessions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-2xl mb-2"></p>
          <p className="text-gray-600 text-sm">Тренинг байхгүй</p>
        </div>
      ) : (
        <div className="space-y-3">
          {daySessions.map(s => <TrainCardFull key={s.id} s={s} date={colStr} />)}
        </div>
      )}
    </div>
  );
}

function MonthView({ sessions, monthGrid, monthRef, monthLabel, todayStr, onPrev, onNext, onDayClick }) {
  const dayNames = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
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

      <div className="grid grid-cols-7 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs text-gray-600 uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>
      {monthGrid.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7">
          {row.map((day, ci) => {
            const cellDate      = day ? new Date(monthRef.getFullYear(), monthRef.getMonth(), day) : null;
            const cellStr       = cellDate ? toDateStr(cellDate) : "";
            const isToday       = cellStr === todayStr;
            const cellSessions  = day ? sessions.filter(s => s.dateIdx === ci && s.status !== "cancelled" && inRange(s, cellStr)) : [];
            const hasCancelled  = day && sessions.some(s => s.dateIdx === ci && s.status === "cancelled" && inRange(s, cellStr));
            return (
              <button key={ci} disabled={!day}
                onClick={() => day && onDayClick(cellDate)}
                className={`aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl m-0.5 transition-all
                  ${isToday  ? "bg-orange-500/15 ring-1 ring-orange-500/30" : ""}
                  ${day      ? "hover:bg-white/5 cursor-pointer" : "cursor-default"}`}>
                <span className={`text-sm font-semibold
                  ${day ? (isToday ? "text-orange-400" : "text-gray-300") : "text-transparent"}`}>
                  {day || "·"}
                </span>
                {(cellSessions.length > 0 || hasCancelled) && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {cellSessions.map(s => (
                      <span key={s.id} className={`w-1.5 h-1.5 rounded-full ${accentClasses[s.accent]?.dot || "bg-orange-500"}`} />
                    ))}
                    {hasCancelled && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 flex-wrap">
        {Object.entries({ orange: "Анхан шат", blue: "Дунд шат", purple: "Ахисан шат" }).map(([color, label]) => (
          <div key={color} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${accentClasses[color].dot}`} />
            <span className="text-gray-500 text-xs">{label}</span>
          </div>
        ))}
        
        
      </div>
    </div>
  );
}

// ── Logged-in view ───────────────────────────────────────────────────────────
function PersonalSchedule({ user }) {
  const [calView,     setCalView]     = useState("week");
  const [dismissed,   setDismissed]   = useState([]);
  const [sessions,    setSessions]    = useState([]);
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    api.get("/schedule/enrolled")
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map(s => ({
          id:         s.scheduleId,
          dateIdx:    DAY_IDX[s.dayOfWeek] ?? 0,
          start:      s.startTime,
          end:        s.endTime,
          location:   s.location || "",
          coach:      `${s.coachLastName}. ${s.coachFirstName}`,
          coachImage: s.coachImage || null,
          group:      s.level,
          status:     "active",
          accent:     LEVEL_ACCENT[s.level] || "orange",
          coachPhone: s.coachPhone || "",
          coachEmail: s.coachEmail || "",
          startDate:  fmtDate(s.startDate),
          endDate:    fmtDate(s.endDate),
        }));
        setSessions(mapped);
      })
      .catch(() => setSessions([]));
  }, []);

  // Current date info
  const today      = new Date();
  const todayIdx   = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayDate  = today.getDate();
  const monday     = new Date(today);
  monday.setDate(today.getDate() - todayIdx + weekOffset * 7);
  const weekDates  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  });
  const sunday     = weekDates[6];
  const weekLabel  = (() => {
    const ms = monday.getMonth() + 1, me = sunday.getMonth() + 1;
    const y  = monday.getFullYear();
    if (ms !== me) return `${y} оны ${ms}/${monday.getDate()} – ${me}/${sunday.getDate()}`;
    return `${y} оны ${ms} сарын ${monday.getDate()}–${sunday.getDate()}`;
  })();
  const monthNames = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];

  // Month grid (navigable)
  const monthRef    = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthLabel  = `${monthRef.getFullYear()} оны ${monthNames[monthRef.getMonth()]} сар`;
  const startOffset = monthRef.getDay() === 0 ? 6 : monthRef.getDay() - 1;
  const daysInMonth = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0).getDate();
  const cells       = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const monthGrid   = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const goToWeekOf = (date) => {
    const di = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const clickedMon = new Date(date); clickedMon.setDate(date.getDate() - di);
    const todayMon   = new Date(today); todayMon.setDate(today.getDate() - todayIdx);
    const diff = Math.round((clickedMon - todayMon) / (7 * 86400000));
    setWeekOffset(diff);
    setCalView("week");
  };

  // Derive unique coaches from sessions
  const coaches = Object.values(
    sessions.reduce((acc, s) => {
      if (!acc[s.coach]) acc[s.coach] = { name: s.coach, group: s.group, color: s.accent, phone: s.coachPhone, email: s.coachEmail };
      return acc;
    }, {})
  );

  const cancelledSessions = sessions.filter(s => s.status === "cancelled" && !dismissed.includes(s.id));

  const calTabs = [
    { key: "day",   label: "Өдрөөр"     },
    { key: "week",  label: "7 хоног" },
    { key: "month", label: "Сараар"      },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <section className="bg-[#0d0d0d] border-b border-white/10 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Сайн байна уу, {user.firstName}!
          </p>
          <h1 className="text-3xl font-extrabold text-white mb-1">
            Тренингийн <span className="text-orange-500">хуваарь</span>
          </h1>
          <p className="text-gray-500 text-sm">{monthLabel} · Таны хичээлийн цаг, байршил</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Cancelled notifications */}
        {cancelledSessions.length > 0 && (
          <div className="space-y-2">
            {cancelledSessions.map(s => (
              <div key={s.id}
                className="flex items-start justify-between gap-4 px-5 py-4 rounded-2xl
                           bg-red-500/8 border border-red-500/25">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30
                                  flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Тренинг цуцлагдлаа</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {s.date} · {s.start}–{s.end} · {s.group}
                    </p>
                    <p className="text-gray-500 text-xs">📍 {s.location} · 👤 {s.coach}</p>
                  </div>
                </div>
                <button onClick={() => setDismissed(d => [...d, s.id])}
                  className="text-gray-600 hover:text-gray-400 transition shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Calendar card */}
        <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
          {/* Calendar header */}
          <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-white font-bold">Хичээлийн хуваарь </h3>
             
            </div>
            {/* View tabs */}
            <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
              {calTabs.map(t => (
                <button key={t.key} onClick={() => setCalView(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${calView === t.key
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-500 hover:text-white"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {calView === "day"   && <DayView   sessions={sessions} todayIdx={todayIdx} />}
            {calView === "week"  && <WeekView  sessions={sessions} todayIdx={todayIdx} weekDates={weekDates} weekOffset={weekOffset} weekLabel={weekLabel} onPrev={() => setWeekOffset(p => p - 1)} onNext={() => setWeekOffset(p => p + 1)} />}
            {calView === "month" && <MonthView sessions={sessions} monthGrid={monthGrid} monthRef={monthRef} monthLabel={monthLabel} todayStr={toDateStr(today)} onPrev={() => setMonthOffset(p => p - 1)} onNext={() => setMonthOffset(p => p + 1)} onDayClick={goToWeekOf} />}
          </div>
        </div>

        {/* Today's detail list */}
        <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-white font-bold">Өнөөдрийн тренинг</h3>
            <p className="text-gray-600 text-xs mt-0.5">{WEEK_DAYS[todayIdx]}</p>
          </div>
          <div className="p-4 space-y-3">
            {sessions.filter(s => s.dateIdx === todayIdx && inRange(s, toDateStr(today))).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">📅</p>
                <p className="text-gray-600 text-sm">Өнөөдөр тренинг байхгүй</p>
              </div>
            ) : sessions
                .filter(s => s.dateIdx === todayIdx && inRange(s, toDateStr(today)))
                .sort((a, b) => a.start.localeCompare(b.start))
                .map(s => <TrainCard key={s.id} s={s} />)
            }
          </div>
        </div>

        {/* Coaches */}
        <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-white font-bold">Дасгалжуулагчид</h3>
            <p className="text-gray-600 text-xs mt-0.5">Таны бүлгийн дасгалжуулагчдийн мэдээлэл</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coaches.length === 0 ? (
              <p className="text-gray-600 text-sm col-span-2 text-center py-4">Дасгалжуулагч байхгүй</p>
            ) : coaches.map((c, i) => {
              const a        = accentClasses[c.color] || accentClasses.orange;
              const initials = c.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={i} className={`rounded-2xl border p-5 flex gap-4 items-start ${a.border} ${a.bg}`}>
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center
                                   shrink-0 font-bold text-lg ${a.avatar}`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-sm">{c.name}</p>
                    <p className={`text-xs font-medium mt-0.5 ${a.text}`}>{c.group}</p>
                    <div className="mt-2 space-y-1">
                      {c.phone && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {c.phone}
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {c.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Public view (not logged in) ──────────────────────────────────────────────
function PublicSchedule() {
  const [filterId, setFilterId] = useState(0);

  const filtered = filterId === 0 ? publicSlots : publicSlots.filter(s => s.levelId === filterId);
  const activeLv = levels.find(l => l.id === filterId);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="bg-[#0d0d0d] border-b border-white/10 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Тренингийн <span className="text-orange-500">хуваарь</span>
          </h1>
          <p className="text-gray-500">Долоо хоногийн хичээлийн цаг, дасгалжуулагч, байршил</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {levels.map(lv => {
            const active = filterId === lv.id;
            const ac = lv.accent ? accentClasses[lv.accent] : null;
            const activeStyle = active
              ? (ac ? ac.activeFlt : "bg-white/10 border-white/20 text-white")
              : "bg-[#151515] border-white/10 text-gray-400 hover:border-white/20 hover:text-white";
            return (
              <button key={lv.id} onClick={() => setFilterId(lv.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 ${activeStyle}`}>
                {lv.name}
              </button>
            );
          })}
        </div>

        {/* Badge legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {levels.filter(l => l.accent).map(lv => {
            const ac = accentClasses[lv.accent];
            return (
              <span key={lv.id} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ac.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`} />
                {lv.name}
              </span>
            );
          })}
        </div>

        {/* Week grid */}
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="grid grid-cols-7 border-b border-white/10">
            {DAYS.map(d => (
              <div key={d}
                className="py-3 text-center text-xs font-semibold text-gray-500 border-r border-white/5 last:border-r-0">
                {d.slice(0, 3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[160px]">
            {DAYS.map(day => {
              const daySlots = filtered.filter(s => s.day === day);
              return (
                <div key={day} className="border-r border-white/5 last:border-r-0 p-2 flex flex-col gap-2">
                  {daySlots.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white/10 text-sm">—</span>
                    </div>
                  ) : daySlots.map(slot => {
                    const ac = accentClasses[slot.accent];
                    const isFull = slot.spots === 0;
                    return (
                      <div key={slot.id}
                        className={`w-full rounded-xl p-2.5 border transition-all duration-200
                          ${isFull ? "border-white/5 bg-[#1a1a1a] opacity-40" : `${ac.border} ${ac.bg}`}`}>
                        <p className={`text-xs font-bold mb-1 ${isFull ? "text-gray-500" : ac.text}`}>{slot.time}</p>
                        <p className="text-gray-400 text-xs leading-tight mb-1">{slot.coach}</p>
                        <p className="text-gray-600 text-xs">📍 {slot.location}</p>
                        <p className={`text-xs mt-1.5 font-semibold ${isFull ? "text-red-400" : "text-green-400"}`}>
                          {isFull ? "Дүүрсэн" : `${slot.spots} байр`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm">Сонгосон бүлгийн хуваарь байхгүй байна</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-6
                        flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-white font-bold mb-1">Элсэхийг хүсч байна уу?</p>
            <p className="text-gray-500 text-sm">Элсэлтийн хүсэлт илгээж клубт нэгдэнэ үү</p>
          </div>
          <Link to="/enrollment"
            className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
                       transition-all duration-300 shrink-0 flex items-center gap-2">
            Элсэлтийн хүсэлт
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
          <span className="text-xl shrink-0">ℹ️</span>
          <p className="text-gray-400 text-sm leading-relaxed">
            Хуваарь өөрчлөгдөж болно. Дэлгэрэнгүй мэдээллийг{" "}
            <span className="text-orange-400 font-medium">9911-2233</span> дугаараас лавлана уу.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Entry point ──────────────────────────────────────────────────────────────
function Schedule({ user }) {
  return user ? <PersonalSchedule user={user} /> : <PublicSchedule />;
}

export default Schedule;
