import React, { useState, useRef } from "react";
import { api } from "../api/api";

// ── Constants ──────────────────────────────────────────────────────────────
const roleLabel = { admin: "Админ", coach: "Дасгалжуулагч", player: "Тоглогч" };
const roleColor = {
  admin:  "text-red-400 bg-red-500/10 border-red-500/20",
  coach:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  player: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};
const inputCls = `w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white
  placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1
  focus:ring-orange-500/30 transition text-sm`;
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

// ── Mock data ──────────────────────────────────────────────────────────────
const WEEK_DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
const WEEK_DATES = ["20", "21", "22", "23", "24", "25", "26"]; // Apr 20-26 2026
const TODAY_IDX = 2; // Wednesday = index 2

const SESSIONS = [
  { id: 1, dateIdx: 0, date: "2026-04-20", start: "09:00", end: "10:30", location: "Дасгалын заал №1", coach: "Б. Бат-Эрдэнэ", group: "Анхан шат", status: "active",    accent: "orange" },
  { id: 2, dateIdx: 1, date: "2026-04-21", start: "13:00", end: "14:30", location: "Дасгалын заал №2", coach: "О. Оюун",        group: "Дунд шат",  status: "active",    accent: "blue"   },
  { id: 3, dateIdx: 2, date: "2026-04-22", start: "09:00", end: "10:30", location: "Дасгалын заал №1", coach: "Б. Бат-Эрдэнэ", group: "Анхан шат", status: "active",    accent: "orange" },
  { id: 4, dateIdx: 2, date: "2026-04-22", start: "15:00", end: "16:30", location: "Дасгалын заал №2", coach: "О. Оюун",        group: "Дунд шат",  status: "active",    accent: "blue"   },
  { id: 5, dateIdx: 3, date: "2026-04-23", start: "09:00", end: "10:30", location: "Дасгалын заал №1", coach: "Б. Бат-Эрдэнэ", group: "Анхан шат", status: "active",    accent: "orange" },
  { id: 6, dateIdx: 4, date: "2026-04-24", start: "14:00", end: "15:30", location: "Спортын ордон",    coach: "О. Оюун",        group: "Ахисан шат",status: "cancelled", accent: "purple" },
  { id: 7, dateIdx: 5, date: "2026-04-25", start: "10:00", end: "12:00", location: "Дасгалын заал №1", coach: "Б. Бат-Эрдэнэ", group: "Анхан шат", status: "active",    accent: "orange" },
];

const COACHES = [
  { id: 1, initials: "ББ", name: "Б. Бат-Эрдэнэ", specialty: "Анхан болон Ахисан шат", experience: "8 жил", phone: "9900-0002", email: "coach@volleyball.mn",  color: "orange" },
  { id: 2, initials: "ОО", name: "О. Оюун",        specialty: "Дунд болон Ахисан шат",  experience: "5 жил", phone: "9900-0003", email: "oyuun@volleyball.mn",  color: "blue"   },
];

const accentCls = {
  orange: { border: "border-orange-500/40", bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500", avatar: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  blue:   { border: "border-blue-500/40",   bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-500",   avatar: "bg-blue-500/20 border-blue-500/30 text-blue-400"       },
  purple: { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500", avatar: "bg-purple-500/20 border-purple-500/30 text-purple-400"  },
};

// April 2026 month grid (1st = Wednesday = index 2)
const MONTH_GRID = (() => {
  const cells = [];
  for (let i = 0; i < 2; i++) cells.push(null);       // empty before Apr 1 (Wed)
  for (let d = 1; d <= 30; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
})();

const sessionDaysInMonth = new Set(SESSIONS.filter(s => s.status === "active").map(s => parseInt(s.date.split("-")[2])));
const cancelledDaysInMonth = new Set(SESSIONS.filter(s => s.status === "cancelled").map(s => parseInt(s.date.split("-")[2])));

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionCard({ title, children, action }) {
  return (
    <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SessionCard({ s, compact = false }) {
  const a = accentCls[s.accent];
  const cancelled = s.status === "cancelled";
  return (
    <div className={`rounded-xl border p-3 ${cancelled ? "border-red-500/30 bg-red-500/5 opacity-60" : `${a.border} ${a.bg}`}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${cancelled ? "text-red-400 line-through" : a.text}`}>
          {s.start} – {s.end}
        </span>
        {cancelled && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 font-semibold">
            ЦУЦЛАГДСАН
          </span>
        )}
      </div>
      <p className={`text-white text-xs font-semibold ${cancelled ? "line-through text-gray-500" : ""}`}>{s.group}</p>
      {!compact && (
        <>
          <p className="text-gray-500 text-xs mt-1">📍 {s.location}</p>
          <p className="text-gray-500 text-xs">👤 {s.coach}</p>
        </>
      )}
    </div>
  );
}

function DayView() {
  const todaySessions = SESSIONS.filter(s => s.dateIdx === TODAY_IDX);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00–20:00

  const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const TOP_OFFSET = 8 * 60;
  const SCALE = 1.2; // px per minute

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px] relative" style={{ height: `${13 * 60 * SCALE}px` }}>
        {/* Hour lines */}
        {hours.map((h) => (
          <div key={h} className="absolute left-0 right-0 flex items-start"
               style={{ top: `${(h - 8) * 60 * SCALE}px` }}>
            <span className="text-gray-600 text-xs w-12 shrink-0 -mt-2.5 text-right pr-3">{h}:00</span>
            <div className="flex-1 border-t border-white/5" />
          </div>
        ))}
        {/* Session blocks */}
        {todaySessions.map((s) => {
          const top = (toMinutes(s.start) - TOP_OFFSET) * SCALE;
          const height = (toMinutes(s.end) - toMinutes(s.start)) * SCALE;
          const a = accentCls[s.accent];
          return (
            <div key={s.id}
              className={`absolute left-14 right-2 rounded-xl border px-3 py-2
                ${s.status === "cancelled" ? "border-red-500/30 bg-red-500/5" : `${a.border} ${a.bg}`}`}
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <p className={`text-xs font-bold ${s.status === "cancelled" ? "text-red-400" : a.text}`}>
                {s.start} – {s.end}
              </p>
              <p className="text-white text-xs font-semibold mt-0.5">{s.group}</p>
              <p className="text-gray-500 text-[11px]">📍 {s.location}</p>
            </div>
          );
        })}
        {todaySessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-600 text-sm">Өнөөдөр тренинг байхгүй</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WeekView() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10 mb-2">
          {WEEK_DAYS.map((d, i) => {
            const isToday = i === TODAY_IDX;
            return (
              <div key={d} className="text-center py-3 px-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider">{d.slice(0, 3)}</p>
                <div className={`mx-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                  ${isToday ? "bg-orange-500 text-white" : "text-gray-300"}`}>
                  {WEEK_DATES[i]}
                </div>
              </div>
            );
          })}
        </div>
        {/* Session columns */}
        <div className="grid grid-cols-7 gap-1 min-h-[140px]">
          {WEEK_DAYS.map((_, i) => {
            const daySessions = SESSIONS.filter(s => s.dateIdx === i);
            const isToday = i === TODAY_IDX;
            return (
              <div key={i} className={`space-y-1.5 px-0.5 py-1 rounded-xl min-h-[100px]
                ${isToday ? "bg-orange-500/5 ring-1 ring-orange-500/20" : ""}`}>
                {daySessions.map(s => <SessionCard key={s.id} s={s} compact />)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthView() {
  const dayNames = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs text-gray-600 uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>
      {MONTH_GRID.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7">
          {row.map((day, ci) => {
            const isToday = day === 22;
            const hasSession  = day && sessionDaysInMonth.has(day);
            const hasCancelled = day && cancelledDaysInMonth.has(day);
            return (
              <div key={ci} className={`aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl m-0.5
                ${isToday ? "bg-orange-500/15 ring-1 ring-orange-500/30" : "hover:bg-white/3"}`}>
                <span className={`text-sm font-semibold ${day ? (isToday ? "text-orange-400" : "text-gray-300") : ""}`}>
                  {day || ""}
                </span>
                {(hasSession || hasCancelled) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasSession   && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    {hasCancelled && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-gray-500 text-xs">Тренинг</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-gray-500 text-xs">Цуцлагдсан</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
function Profile({ user, onUpdate, onLogout }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    phone:     user?.phone     || "",
    email:     user?.email     || "",
    birthDate: user?.birthDate || "",
    gender:    user?.gender    || "",
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg,     setInfoMsg]     = useState(null);

  const [pwData,    setPwData]    = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg,     setPwMsg]     = useState(null);

  const [imgPreview, setImgPreview] = useState(user?.profileImage || null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgMsg,     setImgMsg]     = useState(null);
  const fileRef = useRef(null);

  const [calView,   setCalView]   = useState("week");   // "day" | "week" | "month"
  const [dismissed, setDismissed] = useState([]);

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");
  const role     = user?.role || "player";

  const handleInfoChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleInfoSave = async () => {
    setInfoLoading(true); setInfoMsg(null);
    try {
      await api.put("/profile", formData);
      const updated = { ...user, ...formData };
      sessionStorage.setItem("user", JSON.stringify(updated));
      if (onUpdate) onUpdate(updated);
      setInfoMsg({ ok: true, text: "Мэдээлэл амжилттай шинэчлэгдлээ!" });
    } catch (err) { setInfoMsg({ ok: false, text: err.message }); }
    finally { setInfoLoading(false); }
  };

  const handlePwChange = (e) => setPwData({ ...pwData, [e.target.name]: e.target.value });

  const handlePwSave = async () => {
    if (pwData.newPassword !== pwData.confirmPassword)
      return setPwMsg({ ok: false, text: "Шинэ нууц үг таарахгүй байна" });
    setPwLoading(true); setPwMsg(null);
    try {
      await api.put("/profile/password", { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      setPwMsg({ ok: true, text: "Нууц үг амжилттай солигдлоо!" });
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { setPwMsg({ ok: false, text: err.message }); }
    finally { setPwLoading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleImgSave = async () => {
    if (!imgPreview || imgPreview === user?.profileImage) return;
    setImgLoading(true); setImgMsg(null);
    try {
      const data = await api.put("/profile/image", { image: imgPreview });
      const updated = { ...user, profileImage: data.image };
      sessionStorage.setItem("user", JSON.stringify(updated));
      if (onUpdate) onUpdate(updated);
      setImgMsg({ ok: true, text: "Зураг шинэчлэгдлээ!" });
    } catch (err) { setImgMsg({ ok: false, text: err.message }); }
    finally { setImgLoading(false); }
  };

  const Alert = ({ msg }) => msg ? (
    <p className={`text-xs mt-3 px-3 py-2 rounded-lg border ${
      msg.ok ? "bg-green-500/10 text-green-400 border-green-500/20"
             : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
      {msg.text}
    </p>
  ) : null;

  const cancelledSessions = SESSIONS.filter(s => s.status === "cancelled" && !dismissed.includes(s.id));

  const calTabs = [
    { key: "day",   label: "Өдрөөр" },
    { key: "week",  label: "7 хоногийн" },
    { key: "month", label: "Сарын" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <section className="bg-[#0d0d0d] border-b border-white/10 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white mb-1">
            Миний <span className="text-orange-500">профайл</span>
          </h1>
          <p className="text-gray-500 text-sm">Хувийн мэдээлэл болон тренингийн хуваарь</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* ── Profile + Settings (2-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

          {/* Left panel */}
          <div className="space-y-4">
            <div className="bg-[#151515] rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-orange-500/20 border border-orange-500/30
                                flex items-center justify-center">
                  {imgPreview
                    ? <img src={imgPreview} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-orange-400 font-bold text-3xl">{initials || "U"}</span>}
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-xl
                             flex items-center justify-center hover:bg-orange-600 transition shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <p className="text-white font-bold text-lg leading-tight">{user?.firstName} {user?.lastName}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full border font-medium ${roleColor[role]}`}>
                {roleLabel[role]}
              </span>
              {imgPreview && imgPreview !== (user?.profileImage || null) && (
                <button onClick={handleImgSave} disabled={imgLoading}
                  className="mt-4 w-full py-2 text-sm bg-orange-500 text-white rounded-xl
                             hover:bg-orange-600 transition font-medium disabled:opacity-50">
                  {imgLoading ? "Хадгалж байна..." : "Зураг хадгалах"}
                </button>
              )}
              <Alert msg={imgMsg} />
            </div>

            <div className="bg-[#151515] rounded-2xl border border-white/5 p-5 space-y-3">
              {[
                { label: "Утас",        value: user?.phone },
                { label: "И-мэйл",     value: user?.email || "—" },
                { label: "Хүйс",       value: user?.gender === "male" ? "Эрэгтэй" : user?.gender === "female" ? "Эмэгтэй" : "—" },
                { label: "Төрсөн огноо", value: user?.birthDate || "—" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-gray-600 text-xs uppercase tracking-wider">{item.label}</p>
                  <p className="text-white text-sm font-medium mt-0.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <button onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm
                         font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5
                         border border-white/5 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Системээс гарах
            </button>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            <SectionCard title="Хувийн мэдээлэл">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Овог",          name: "lastName",  type: "text"  },
                  { label: "Нэр",           name: "firstName", type: "text"  },
                  { label: "Утасны дугаар", name: "phone",     type: "tel"   },
                  { label: "И-мэйл",        name: "email",     type: "email" },
                  { label: "Төрсөн огноо",  name: "birthDate", type: "date"  },
                ].map(f => (
                  <div key={f.name}>
                    <label className={labelCls}>{f.label}</label>
                    <input name={f.name} type={f.type} value={formData[f.name]}
                      onChange={handleInfoChange} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>Хүйс</label>
                  <select name="gender" value={formData.gender} onChange={handleInfoChange} className={inputCls}>
                    <option value="">Сонгох</option>
                    <option value="male">Эрэгтэй</option>
                    <option value="female">Эмэгтэй</option>
                  </select>
                </div>
              </div>
              <div className="mt-5">
                <button onClick={handleInfoSave} disabled={infoLoading}
                  className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl
                             hover:bg-orange-600 transition disabled:opacity-50">
                  {infoLoading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
              <Alert msg={infoMsg} />
            </SectionCard>

            <SectionCard title="Нууц үг солих">
              <div className="space-y-4 max-w-sm">
                {[
                  { label: "Одоогийн нууц үг",  name: "currentPassword" },
                  { label: "Шинэ нууц үг",      name: "newPassword"     },
                  { label: "Шинэ нууц үг давтах",name: "confirmPassword" },
                ].map(f => (
                  <div key={f.name}>
                    <label className={labelCls}>{f.label}</label>
                    <input name={f.name} type="password" value={pwData[f.name]}
                      onChange={handlePwChange} placeholder="••••••••" className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <button onClick={handlePwSave} disabled={pwLoading}
                  className="px-6 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-xl
                             hover:bg-white/15 transition disabled:opacity-50 border border-white/10">
                  {pwLoading ? "Солиж байна..." : "Нууц үг солих"}
                </button>
              </div>
              <Alert msg={pwMsg} />
            </SectionCard>
          </div>
        </div>

        {/* ── Training Schedule (full width) ── */}
       

        {/* ── Coaches ── */}
        <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-white font-bold">Дасгалжуулагчид</h3>
            <p className="text-gray-600 text-xs mt-0.5">Таны бүлгийн дасгалжуулагчдийн мэдээлэл</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COACHES.map(c => {
              const a = accentCls[c.color];
              return (
                <div key={c.id}
                  className={`rounded-2xl border p-5 flex gap-4 items-start ${a.border} ${a.bg}`}>
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center
                                   shrink-0 font-bold text-lg ${a.avatar}`}>
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-white text-sm`}>{c.name}</p>
                    <p className={`text-xs font-medium mt-0.5 ${a.text}`}>{c.specialty}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {c.experience} туршлагатай
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {c.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {c.email}
                      </div>
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

export default Profile;
