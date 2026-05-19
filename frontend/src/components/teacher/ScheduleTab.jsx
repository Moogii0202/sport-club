import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { accentCls, groupAccent, LEVELS, WEEKDAYS, DAY_IDX, inputCls } from "./shared";

function SessionDetailPanel({ session, onDelete, onClose, onSaved, halls }) {
  const a = accentCls[session.accent];
  const selCls = `w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white
    text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition`;

  const initForm = {
    level:       session.level,
    dayOfWeek:   session.day,
    startTime:   session.start,
    endTime:     session.end,
    location:    session.location,
    startDate:   session.startDate,
    endDate:     session.endDate,
    maxCapacity: session.maxCapacity,
  };
  const [editing,      setEditing]      = useState(false);
  const [form,         setForm]         = useState(initForm);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [daySchedules, setDaySchedules] = useState([]);
  const [dayLoading,   setDayLoading]   = useState(false);

  useEffect(() => {
    if (!editing) return;
    setDayLoading(true);
    api.get(`/schedule/by-day?day=${encodeURIComponent(form.dayOfWeek)}`)
      .then(data => setDaySchedules(Array.isArray(data) ? data : []))
      .catch(() => setDaySchedules([]))
      .finally(() => setDayLoading(false));
  }, [form.dayOfWeek, editing]);

  const handleSave = async () => {
    if (!form.startTime || !form.endTime) { setError("Цагийг оруулна уу"); return; }
    if (form.startTime >= form.endTime)   { setError("Эхлэх цаг дуусах цагаас өмнө байх ёстой"); return; }
    setSaving(true); setError("");
    try {
      await api.put(`/schedule/${session.id}`, form);
      onSaved();
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <div className="bg-black/20 rounded-xl px-4 py-3">
      <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value || "—"}</p>
    </div>
  );

  return (
    <div className={`rounded-2xl border p-5 ${a.border} ${a.bg}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${a.text} mb-1`}>
            {session.day} · Давтагдах хуваарь
          </p>
          <h4 className="text-white font-extrabold text-lg">{session.group}</h4>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition shrink-0 mt-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!editing ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <InfoRow label="Түвшин"   value={session.level} />
            <InfoRow label="Гараг"    value={session.day} />
            <InfoRow label="Цаг"      value={`${session.start} – ${session.end}`} />
            <InfoRow label="Байршил"  value={session.location ? `📍 ${session.location}` : null} />
            <InfoRow label="Эхлэх огноо"  value={session.startDate} />
            <InfoRow label="Дуусах огноо" value={session.endDate} />
            <InfoRow label="Дүүргэлт" value={session.maxCapacity ? `${session.maxCapacity} хүн` : null} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(true); setError(""); setForm(initForm); }}
              className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-xl
                         hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Засварлах
            </button>
            <button onClick={() => onDelete(session.id)}
              className="py-2.5 px-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl
                         hover:bg-red-500/20 transition text-sm font-semibold">
              Устгах
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Түвшин</p>
              <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className={selCls}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Гараг</p>
              <select value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: e.target.value }))} className={selCls}>
                {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Эхлэх цаг</p>
              <input type="time" value={form.startTime}
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={selCls} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Дуусах цаг</p>
              <input type="time" value={form.endTime}
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={selCls} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Байршил (заал)</p>
              {halls.length === 0 ? (
                <input type="text" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="Байршил" className={selCls} />
              ) : (
                <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={selCls}>
                  <option value="">— Заал сонгох —</option>
                  {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Эхлэх огноо</p>
              <input type="date" value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={selCls} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Дуусах огноо</p>
              <input type="date" value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={selCls} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Анги дүүргэлт (хамгийн их хүн)</p>
              <input type="number" min={1} max={200} value={form.maxCapacity}
                onChange={e => setForm(p => ({ ...p, maxCapacity: e.target.value }))} className={selCls} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden mb-3">
            <div className="px-4 py-2.5 bg-black/20 border-b border-white/10 flex items-center justify-between">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {form.dayOfWeek} гарагт бусад багш нарын хуваарь
              </p>
              {dayLoading && <svg className="w-3.5 h-3.5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>}
            </div>
            {dayLoading ? (
              <p className="text-gray-600 text-xs text-center py-3">Уншиж байна...</p>
            ) : daySchedules.filter(s => s.id !== session.id).length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-3">Энэ гарагт бусад хуваарь байхгүй</p>
            ) : (
              <div className="divide-y divide-white/5 max-h-36 overflow-y-auto">
                {daySchedules.filter(s => s.id !== session.id).map(s => {
                  const hasConflict = form.startTime && form.endTime &&
                    form.startTime < s.endTime && form.endTime > s.startTime;
                  const locConflict = hasConflict && form.location?.trim() &&
                    form.location.trim() === s.location;
                  return (
                    <div key={s.id} className={`flex items-center gap-3 px-4 py-2 text-xs
                      ${locConflict ? "bg-red-500/10" : hasConflict ? "bg-amber-500/5" : ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0
                        ${locConflict ? "bg-red-500" : hasConflict ? "bg-amber-400" : "bg-gray-600"}`} />
                      <span className="text-white font-mono font-semibold w-24 shrink-0">{s.startTime}–{s.endTime}</span>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold
                        ${accentCls[groupAccent[s.level] || "orange"].badge}`}>{s.level}</span>
                      <span className="text-gray-400 truncate flex-1">
                        {s.coachLast} {s.coachFirst}
                        {s.location && <span className="text-gray-600"> · {s.location}</span>}
                      </span>
                      {locConflict  && <span className="text-red-400 font-semibold shrink-0">Байршил давхардаж байна</span>}
                      {!locConflict && hasConflict && <span className="text-amber-400 font-semibold shrink-0">Цаг давхардаж байна</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="mb-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-xl
                         hover:bg-orange-600 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
            <button onClick={() => { setEditing(false); setError(""); }}
              className="py-2.5 px-4 border border-white/10 text-gray-400 text-sm font-medium rounded-xl hover:border-white/20 transition">
              Цуцлах
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ScheduleTab({ onAttendance }) {
  const [calView,       setCalView]       = useState("week");
  const [activeSession, setActiveSession] = useState(null);
  const [schedules,     setSchedules]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const EMPTY_FORM = { level: "Анхан шат", dayOfWeek: "Даваа", startTime: "", endTime: "", location: "", maxCapacity: 20, startDate: "", endDate: "" };
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);
  const [formError,     setFormError]     = useState("");
  const [daySchedules,  setDaySchedules]  = useState([]);
  const [dayLoading,    setDayLoading]    = useState(false);
  const [halls,         setHalls]         = useState([]);
  const [weekOffset,    setWeekOffset]    = useState(0);
  const [monthOffset,   setMonthOffset]   = useState(0);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.get("/schedule/my");
      setSchedules(Array.isArray(data) ? data : []);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    api.get("/halls")
      .then(data => setHalls(Array.isArray(data) ? data : []))
      .catch(() => setHalls([]));
  }, []);

  useEffect(() => {
    if (!showForm) return;
    setDaySchedules([]);
    setDayLoading(true);
    api.get(`/schedule/by-day?day=${encodeURIComponent(form.dayOfWeek)}`)
      .then(data => setDaySchedules(Array.isArray(data) ? data : []))
      .catch(err => { console.error("by-day fetch:", err.message); setDaySchedules([]); })
      .finally(() => setDayLoading(false));
  }, [form.dayOfWeek, showForm]);

  // pg returns JS Date objects when the DB column is 'date' type (not TEXT).
  // String comparison breaks against Date.toString(), so always normalise to "YYYY-MM-DD".
  const fmtApiDate = d => {
    if (!d) return null;
    if (d instanceof Date)
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
    const str = String(d).substring(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
  };

  const displaySessions = schedules.map(s => ({
    id:          s.scheduleId,
    dateIdx:     DAY_IDX[s.dayOfWeek] ?? 0,
    day:         s.dayOfWeek,
    start:       s.startTime,
    end:         s.endTime,
    group:       s.level,
    location:    s.location || "",
    accent:      groupAccent[s.level] || "orange",
    classId:     s.classId,
    level:       s.level,
    startDate:   fmtApiDate(s.startDate),
    endDate:     fmtApiDate(s.endDate),
    maxCapacity: s.maxCapacity || 20,
  }));

  const sessionsByIdx = {};
  displaySessions.forEach(s => {
    if (!sessionsByIdx[s.dateIdx]) sessionsByIdx[s.dateIdx] = [];
    sessionsByIdx[s.dateIdx].push(s);
  });

  const today      = new Date();
  const todayIdx   = today.getDay() === 0 ? 6 : today.getDay() - 1;
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

  const toDateStr = d => {
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const inRange = (s, dateStr) =>
    (!s.startDate || dateStr >= s.startDate) &&
    (!s.endDate   || dateStr <= s.endDate);

  const now         = new Date();
  const monthRef    = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const startOffset = monthRef.getDay() === 0 ? 6 : monthRef.getDay() - 1;
  const daysInMonth = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0).getDate();
  const cells       = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const monthGrid   = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const monthLabel  = `${monthRef.getFullYear()} оны ${monthRef.getMonth() + 1}-р сар`;

  const goToWeekOf = (date) => {
    const di = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const clickedMon = new Date(date); clickedMon.setDate(date.getDate() - di);
    const todayMon   = new Date(today); todayMon.setDate(today.getDate() - todayIdx);
    const diff = Math.round((clickedMon - todayMon) / (7 * 86400000));
    setWeekOffset(diff);
    setCalView("week");
    setActiveSession(null);
  };

  const handleSessionClick = (s) => setActiveSession(prev => prev?.id === s.id ? null : s);

  const handleSave = async () => {
    if (!form.startTime || !form.endTime) { setFormError("Эхлэх болон дуусах цагийг оруулна уу"); return; }
    if (form.startTime >= form.endTime)   { setFormError("Эхлэх цаг дуусах цагаас өмнө байх ёстой"); return; }
    setSaving(true); setFormError("");
    try {
      await api.post("/schedule", form);
      await fetchSchedule();
      setShowForm(false);
      setForm(EMPTY_FORM);
      setDaySchedules([]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Энэ хуваарийг устгах уу?")) return;
    try {
      await api.delete(`/schedule/${scheduleId}`);
      setSchedules(prev => prev.filter(s => s.scheduleId !== scheduleId));
      if (activeSession?.id === scheduleId) setActiveSession(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const selCls = `w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white
    text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition`;

  const WeekView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[540px]">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWeekOffset(p => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                       border border-white/10 text-gray-400 hover:text-white transition shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{weekLabel}</span>
           
          </div>
          <button onClick={() => setWeekOffset(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                       border border-white/10 text-gray-400 hover:text-white transition shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 border-b border-white/10 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className="text-center py-3 px-1">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{d.slice(0, 2)}</p>
              <div className={`mx-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                ${weekOffset === 0 && i === todayIdx ? "bg-orange-500 text-white" : "text-gray-300"}`}>
                {weekDates[i].getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 min-h-[100px]">
          {WEEKDAYS.map((_, i) => {
            const colStr   = toDateStr(weekDates[i]);
            const sessions = (sessionsByIdx[i] || []).filter(s => inRange(s, colStr));
            const isToday  = weekOffset === 0 && i === todayIdx;
            return (
              <div key={i} className={`space-y-1.5 px-0.5 py-1 rounded-xl
                ${isToday ? "bg-orange-500/5 ring-1 ring-orange-500/20" : ""}`}>
                {sessions.map(s => {
                  const a      = accentCls[s.accent];
                  const isOpen = activeSession?.id === s.id;
                  return (
                    <button key={s.id} onClick={() => handleSessionClick(s)}
                      className={`w-full rounded-xl border px-2 py-2 text-left transition-all
                        ${isOpen ? `ring-2 ring-orange-500/60 ${a.border} ${a.bg}` : `${a.border} ${a.bg} hover:brightness-125`}`}>
                      <p className={`text-[10px] font-bold ${a.text}`}>{s.start}–{s.end}</p>
                      <p className="text-white text-[10px] font-semibold leading-tight mt-0.5">{s.group}</p>
                      <p className="text-gray-500 text-[9px] mt-0.5 truncate">📍{s.location}</p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {displaySessions.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-600 text-sm">Хуваарь байхгүй байна</div>
        )}
      </div>
    </div>
  );

  const MonthView = () => {
    const dayNames = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMonthOffset(p => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                       border border-white/10 text-gray-400 hover:text-white transition shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{monthLabel}</span>
            
          </div>
          <button onClick={() => setMonthOffset(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10
                       border border-white/10 text-gray-400 hover:text-white transition shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-600 uppercase tracking-wider py-2">{d}</div>
          ))}
        </div>
        {monthGrid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((day, colIdx) => {
              const isToday    = day !== null &&
                day === today.getDate() &&
                monthRef.getMonth() === today.getMonth() &&
                monthRef.getFullYear() === today.getFullYear();
              const cellDate   = day ? new Date(monthRef.getFullYear(), monthRef.getMonth(), day) : null;
              const cellStr    = cellDate ? toDateStr(cellDate) : "";
              const sessions   = day ? (sessionsByIdx[colIdx] || []).filter(s => inRange(s, cellStr)) : [];
              const hasSession = sessions.length > 0;
              return (
                <button key={colIdx} disabled={!day}
                  onClick={() => day && goToWeekOf(cellDate)}
                  className={`aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl m-0.5 transition-all
                    ${isToday   ? "bg-orange-500/15 ring-1 ring-orange-500/30" : ""}
                    ${day       ? "hover:bg-white/5 cursor-pointer" : "cursor-default"}`}>
                  <span className={`text-sm font-semibold
                    ${day ? (isToday ? "text-orange-400" : "text-gray-300") : "text-transparent"}`}>
                    {day || "·"}
                  </span>
                  {day && hasSession && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {sessions.map(s => (
                        <span key={s.id} className={`w-1.5 h-1.5 rounded-full ${accentCls[s.accent].dot}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
          {Object.entries({ orange: "Анхан шат", blue: "Дунд шат", purple: "Ахисан шат" }).map(([color, label]) => (
            <div key={color} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${accentCls[color].dot}`} />
              <span className="text-gray-500 text-xs">{label}</span>
            </div>
          ))}
          <span className="ml-auto text-gray-600 text-[10px]">Өдөр дарж 7 хонгийг харах</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {showForm && (
        <div className="bg-[#151515] rounded-2xl border border-orange-500/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Хуваарь нэмэх</h3>
            <button onClick={() => { setShowForm(false); setFormError(""); setDaySchedules([]); }}
              className="text-gray-600 hover:text-gray-400 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Түвшин</label>
              <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className={selCls}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Гараг</label>
              <select value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: e.target.value }))} className={selCls}>
                {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Эхлэх цаг</label>
              <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={selCls} />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Дуусах цаг</label>
              <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={selCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Байршил (заал)</label>
              {halls.length === 0 ? (
                <div className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-gray-600 text-sm">
                  Заал бүртгэлгүй — Админ заал нэмнэ үү
                </div>
              ) : (
                <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={selCls}>
                  <option value="">— Заал сонгох —</option>
                  {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Эхлэх огноо</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={selCls} />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Дуусах огноо</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={selCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
                Анги дүүргэлт (хамгийн их хүний тоо)
              </label>
              <input type="number" min={1} max={200} placeholder="20" value={form.maxCapacity}
                onChange={e => setForm(p => ({ ...p, maxCapacity: e.target.value }))} className={selCls} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {form.dayOfWeek} гарагт бусад багш нарын хуваарь
              </p>
              {dayLoading && (
                <svg className="w-3.5 h-3.5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
            </div>
            {dayLoading ? (
              <p className="text-gray-600 text-xs text-center py-4">Уншиж байна...</p>
            ) : daySchedules.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-4">Энэ гарагт хуваарь байхгүй байна</p>
            ) : (
              <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                {daySchedules.map(s => {
                  const hasConflict = form.startTime && form.endTime
                    && form.startTime < s.endTime && form.endTime > s.startTime;
                  const locConflict = hasConflict && form.location?.trim()
                    && form.location.trim() === s.location;
                  return (
                    <div key={s.id}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs
                        ${locConflict ? "bg-red-500/10" : hasConflict ? "bg-amber-500/5" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0
                        ${locConflict ? "bg-red-500" : hasConflict ? "bg-amber-400" : "bg-gray-600"}`} />
                      <span className="text-white font-mono font-semibold w-24 shrink-0">
                        {s.startTime}–{s.endTime}
                      </span>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold
                        ${accentCls[groupAccent[s.level] || "orange"].badge}`}>
                        {s.level}
                      </span>
                      <span className="text-gray-400 truncate flex-1">
                        {s.coachLast} {s.coachFirst}
                        {s.location && <span className="text-gray-600"> · {s.location}</span>}
                      </span>
                      {locConflict  && <span className="text-red-400 font-semibold shrink-0">Байршил давхардаж байна</span>}
                      {!locConflict && hasConflict && <span className="text-amber-400 font-semibold shrink-0">Цаг давхардаж байна</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {formError && (
            <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {formError}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                         hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
              {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
            <button onClick={() => { setShowForm(false); setFormError(""); setDaySchedules([]); }}
              className="px-5 py-2.5 border border-white/10 text-gray-400 text-sm font-medium rounded-xl hover:border-white/20 transition">
              Цуцлах
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-bold">Хичээлийн хуваарь</h3>
           
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowForm(p => !p); setFormError(""); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Нэмэх
            </button>
            <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
              {[{ key: "week", label: "7 хоногийн" }, { key: "month", label: "Сарын" }].map(t => (
                <button key={t.key} onClick={() => { setCalView(t.key); setActiveSession(null); if (t.key === "month") setWeekOffset(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${calView === t.key ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-white"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5">
          {calView === "week"  && <WeekView />}
          {calView === "month" && <MonthView />}
        </div>
      </div>

      {activeSession && (
        <SessionDetailPanel
          session={activeSession}
          onDelete={handleDelete}
          onClose={() => setActiveSession(null)}
          onSaved={() => { fetchSchedule(); setActiveSession(null); }}
          halls={halls}
        />
      )}

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
          <h3 className="text-white font-bold">Өнөөдрийн хуваарь</h3>
          <span className="text-gray-600 text-xs">{WEEKDAYS[todayIdx]}</span>
        </div>
        <div className="divide-y divide-white/5">
          {(sessionsByIdx[todayIdx] || []).filter(s => inRange(s, toDateStr(today))).map(s => {
            const a = accentCls[s.accent];
            return (
              <div key={s.id} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-1 self-stretch rounded-full shrink-0 ${a.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{s.group}</p>
                  <p className="text-gray-500 text-xs mt-0.5">🕘 {s.start}–{s.end} · 📍 {s.location}</p>
                </div>
                <button onClick={() => onAttendance(s.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all shrink-0
                    ${a.badge} hover:brightness-125`}>
                  Ирц бүртгэх
                </button>
              </div>
            );
          })}
          {(sessionsByIdx[todayIdx] || []).filter(s => inRange(s, toDateStr(today))).length === 0 && (
            <div className="text-center py-10 text-gray-600">
              <p className="text-2xl mb-2"></p>
              <p className="text-sm">{loading ? "Уншиж байна..." : "Өнөөдөр хуваарь байхгүй"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
