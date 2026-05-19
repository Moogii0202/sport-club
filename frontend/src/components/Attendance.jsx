import React, { useState, useEffect } from "react";
import { api } from "../api/api";

const PER_PAGE = 6;

const statusCfg = {
  present: { label: "Цагтаа",   cls: "text-green-400 bg-green-500/10 border-green-500/20"  },
  late:    { label: "Хоцорсон", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20"  },
  absent:  { label: "Тасалсан", cls: "text-red-400   bg-red-500/10   border-red-500/20"    },
};

function avgTime(records, field) {
  const valid = records.filter(r => r[field] !== "—");
  if (!valid.length) return "—";
  const total = valid.reduce((sum, r) => {
    const [h, m] = r[field].split(":").map(Number);
    return sum + h * 60 + m;
  }, 0);
  const avg = Math.round(total / valid.length);
  return `${String(Math.floor(avg / 60)).padStart(2, "0")}:${String(avg % 60).padStart(2, "0")}`;
}

// ── Icons ──────────────────────────────────────────────────────────────────
const ClockInIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);
const ClockOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const AttendanceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ── Main ───────────────────────────────────────────────────────────────────
function Attendance({ user }) {
  const [viewMode,     setViewMode]     = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page,         setPage]         = useState(1);
  const [records,      setRecords]      = useState([]);

  useEffect(() => {
    api.get("/attendance/my")
      .then(data =>
        setRecords(
          (Array.isArray(data) ? data : []).map((r, i) => ({
            id:       i + 1,
            date:     r.date     ? new Date(r.date).toISOString().split("T")[0] : "—",
            checkIn:  r.checkIn  || "—",
            checkOut: r.checkOut || "—",
            group:    r.group    || "—",
            status:   r.status   || "absent",
          }))
        )
      )
      .catch(() => setRecords([]));
  }, []);

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");
  const role     = user?.role === "admin" ? "Админ" : user?.role === "coach" ? "Дасгалжуулагч" : "Тоглогч";

  const present = records.filter(r => r.status === "present").length;
  const late    = records.filter(r => r.status === "late").length;
  const absent  = records.filter(r => r.status === "absent").length;
  const total   = records.length;
  const pct     = total ? Math.round(((present + late) / total) * 100) : 0;

  const predicate = pct >= 90 ? "Шилдэг тоглогч" : pct >= 75 ? "Тогтмол" : "Хичээнгүй";

  const filtered = filterStatus === "all"
    ? records
    : records.filter(r => r.status === filterStatus);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (f) => { setFilterStatus(f); setPage(1); };

  const statCards = [
    { icon: <AttendanceIcon />, value: present + late, label: "Нийт ирц",            color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    { icon: <ClockInIcon />,    value: avgTime(records, "checkIn"),  label: "Дундаж орсон цаг",  color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { icon: <ClockOutIcon />,   value: avgTime(records, "checkOut"), label: "Дундаж гарсан цаг", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { icon: <StarIcon />,       value: predicate,    label: "Үнэлгээ",              color: "text-green-400 bg-green-500/10 border-green-500/20" },
  ];

  const filterTabs = [
    { key: "all",     label: "Бүгд"     },
    { key: "present", label: "Цагтаа"   },
    { key: "late",    label: "Хоцорсон" },
    { key: "absent",  label: "Тасалсан" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── User card ── */}
        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
          {/* Top row: user info + buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-orange-500/20 border border-orange-500/30
                              flex items-center justify-center shrink-0">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-orange-400 font-bold text-2xl">{initials || "U"}</span>
                }
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="flex flex-wrap gap-4 mt-1">
                  <span className="text-gray-500 text-sm">
                    <span className="text-gray-600 text-xs uppercase tracking-wider mr-1">Эрх</span>
                    <span className="text-white font-medium">{role}</span>
                  </span>
                  {user?.phone && (
                    <span className="text-gray-500 text-sm">
                      <span className="text-gray-600 text-xs uppercase tracking-wider mr-1">Утас</span>
                      <span className="text-white font-medium">{user.phone}</span>
                    </span>
                  )}
                  {user?.email && (
                    <span className="text-gray-500 text-sm">
                      <span className="text-gray-600 text-xs uppercase tracking-wider mr-1">И-мэйл</span>
                      <span className="text-white font-medium">{user.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Year badge */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10
                              rounded-xl text-white text-sm font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                2026 он
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((s, i) => (
              <div key={i} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}>
                <div className="opacity-80 shrink-0">{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-lg leading-none truncate">{s.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="bg-[#111111] rounded-2xl border border-white/10 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
              <span className="text-white font-semibold text-sm">Ирцийн хувь</span>
            </div>
            <span className="text-orange-400 font-bold">{pct}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-700"
                 style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-4 mt-3">
            {[
              { label: "Цагтаа",   val: present, color: "bg-green-500" },
              { label: "Хоцорсон", val: late,    color: "bg-amber-400" },
              { label: "Тасалсан", val: absent,  color: "bg-red-400"   },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${b.color}`} />
                <span className="text-gray-500 text-xs">{b.label} <span className="text-white font-semibold">{b.val}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* ── History section ── */}
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
          {/* Section header */}
          <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-orange-500 shrink-0" />
              <h3 className="text-white font-bold text-base">Ирцийн түүх</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter tabs */}
              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                {filterTabs.map(t => (
                  <button key={t.key} onClick={() => handleFilter(t.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                      ${filterStatus === t.key
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:text-white"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                <button onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all
                    ${viewMode === "grid" ? "bg-orange-500 text-white" : "text-gray-500 hover:text-white"}`}>
                  <GridIcon />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all
                    ${viewMode === "list" ? "bg-orange-500 text-white" : "text-gray-500 hover:text-white"}`}>
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="p-6">
            {paged.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-3xl mb-3"></p>
                <p className="text-sm">Мэдээлэл олдсонгүй</p>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid view — 3 columns like the image */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map(r => {
                  const s = statusCfg[r.status];
                  return (
                    <div key={r.id}
                      className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all">
                      {/* Date + status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <ClockIcon />
                          <span className="text-white font-semibold text-sm">{r.date}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>
                          {s.label}
                        </span>
                      </div>

                      {/* Check in / out */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Орсон цаг</p>
                          <p className="text-white font-bold text-lg">{r.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Гарсан цаг</p>
                          <p className="text-white font-bold text-lg">{r.checkOut}</p>
                        </div>
                      </div>

                      {/* Group */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-gray-500 text-xs">🏐 {r.group}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="divide-y divide-white/5 -mx-6 px-0">
                {paged.map(r => {
                  const s = statusCfg[r.status];
                  return (
                    <div key={r.id}
                      className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/2 transition-all">
                      <div className="flex items-center gap-2 text-gray-400 w-32 shrink-0">
                        <ClockIcon />
                        <span className="text-white text-sm font-medium">{r.date}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-6 min-w-0">
                        <div>
                          <p className="text-gray-600 text-[10px] uppercase tracking-wider">Орсон</p>
                          <p className="text-white font-bold text-sm">{r.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-[10px] uppercase tracking-wider">Гарсан</p>
                          <p className="text-white font-bold text-sm">{r.checkOut}</p>
                        </div>
                        <p className="text-gray-500 text-xs hidden sm:block">🏐 {r.group}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all
                    ${page === p
                      ? "bg-orange-500 text-white"
                      : "text-gray-500 hover:text-white hover:bg-white/5 border border-white/5"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Attendance;
