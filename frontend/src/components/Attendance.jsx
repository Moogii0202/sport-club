import React, { useState, useEffect } from "react";
import { api } from "../api/api";

const PER_PAGE  = 8;
const MN_MONTHS = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];
const MN_DAYS   = ["Ням","Даваа","Мягмар","Лхагва","Пүрэв","Баасан","Бямба"];

const STATUS_CFG = {
  present: {
    label: "Ирсэн",
    strip:  "bg-green-500",
    banner: "bg-green-500/5  border-green-500/15 text-green-400",
    badge:  "bg-green-500/10  text-green-400  border-green-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
    ),
  },
  late: {
    label: "Хоцорсон",
    strip:  "bg-amber-400",
    banner: "bg-amber-500/5  border-amber-500/15 text-amber-400",
    badge:  "bg-amber-500/10  text-amber-400  border-amber-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  absent: {
    label: "Тасалсан",
    strip:  "bg-red-500",
    banner: "bg-red-500/5    border-red-500/15    text-red-400",
    badge:  "bg-red-500/10    text-red-400    border-red-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    ),
  },
  on_leave: {
    label: "Чөлөөтэй",
    strip:  "bg-teal-400",
    banner: "bg-teal-500/5   border-teal-500/15   text-teal-400",
    badge:  "bg-teal-500/10   text-teal-400   border-teal-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
};

function parseDate(str) {
  if (!str || str === "—") return null;
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function avgTime(records, field) {
  const valid = records.filter(r => r[field] && r[field] !== "—");
  if (!valid.length) return "—";
  const total = valid.reduce((sum, r) => {
    const [h, mn] = r[field].split(":").map(Number);
    return sum + h * 60 + mn;
  }, 0);
  const avg = Math.round(total / valid.length);
  return `${String(Math.floor(avg / 60)).padStart(2, "0")}:${String(avg % 60).padStart(2, "0")}`;
}

// ── Circular progress ring ────────────────────────────────────────────────────
function RingChart({ pct, present, late, onLeave, absent, total }) {
  const R   = 52;
  const C   = 2 * Math.PI * R;
  const gap = 4;

  const segments = [
    { val: present, color: "#22c55e" },
    { val: late,    color: "#fbbf24" },
    { val: onLeave, color: "#2dd4bf" },
    { val: absent,  color: "#ef4444" },
  ].filter(s => s.val > 0);

  let offset = 0;
  const arcs = segments.map(s => {
    const len   = total ? (s.val / total) * (C - gap * segments.length) : 0;
    const arc   = { ...s, offset, len };
    offset += len + gap;
    return arc;
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          {total === 0 ? (
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.1)"
              strokeWidth="10" strokeDasharray={`${C} ${C}`} strokeDashoffset="0" />
          ) : arcs.map((a, i) => (
            <circle key={i} cx="60" cy="60" r={R} fill="none"
              stroke={a.color} strokeWidth="10"
              strokeDasharray={`${a.len} ${C - a.len}`}
              strokeDashoffset={-a.offset}
              strokeLinecap="round" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-extrabold text-2xl leading-none">{pct}%</span>
          <span className="text-gray-500 text-[10px] mt-0.5">ирц</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
function Attendance({ user }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup,  setFilterGroup]  = useState("all");
  const [page,         setPage]         = useState(1);
  const [records,      setRecords]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    api.get("/attendance/my")
      .then(data =>
        setRecords(
          (Array.isArray(data) ? data : []).map((r, i) => ({
            id:       i + 1,
            date:     r.date     ? String(r.date).split("T")[0] : "—",
            checkIn:  r.checkIn  || "—",
            checkOut: r.checkOut || "—",
            group:    r.group    || "—",
            status:   r.status   || "absent",
          }))
        )
      )
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  const present = records.filter(r => r.status === "present").length;
  const late    = records.filter(r => r.status === "late").length;
  const onLeave = records.filter(r => r.status === "on_leave").length;
  const absent  = records.filter(r => r.status === "absent").length;
  const total   = records.length;
  const pct     = total ? Math.round(((present + late + onLeave) / total) * 100) : 0;
  const predicate = pct >= 90 ? "Шилдэг" : pct >= 75 ? "Тогтмол" : "Хичээнгүй";

  const uniqueGroups = [...new Set(records.map(r => r.group).filter(g => g && g !== "—"))];

  const filtered   = records.filter(r =>
    (filterStatus === "all" || r.status === filterStatus) &&
    (filterGroup  === "all" || r.group  === filterGroup)
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter      = f => { setFilterStatus(f); setPage(1); };
  const handleGroupFilter = g => { setFilterGroup(g);  setPage(1); };

  const GROUP_COLOR = {
    "Анхан шат": { active: "bg-orange-500 text-white", dot: "bg-orange-500" },
    "Дунд шат":  { active: "bg-blue-500   text-white", dot: "bg-blue-500"   },
    "Ахисан шат":{ active: "bg-purple-500 text-white", dot: "bg-purple-500" },
  };

  const statCards = [
    { label: "Нийт хичээл", value: total,   sub: "бичлэг", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Ирсэн",       value: present, sub: "удаа",   color: "text-green-400",  bg: "bg-green-500/10  border-green-500/20"  },
    { label: "Хоцорсон",    value: late,    sub: "удаа",   color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20"  },
    { label: "Чөлөөтэй",   value: onLeave, sub: "удаа",   color: "text-teal-400",   bg: "bg-teal-500/10   border-teal-500/20"   },
    { label: "Тасалсан",    value: absent,  sub: "удаа",   color: "text-red-400",    bg: "bg-red-500/10    border-red-500/20"    },
  ];

  const filterTabs = [
    { key: "all",      label: "Бүгд",     count: total    },
    { key: "present",  label: "Ирсэн",   count: present  },
    { key: "late",     label: "Хоцорсон", count: late     },
    { key: "on_leave", label: "Чөлөөтэй", count: onLeave  },
    { key: "absent",   label: "Тасалсан", count: absent   },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero header ── */}
      <section className="bg-[#0d0d0d] border-b border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/25 rounded-2xl
                          flex items-center justify-center font-bold text-orange-400 text-lg shrink-0 overflow-hidden">
            {user?.profileImage
              ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              : initials || "U"}
          </div>
          <div>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
              Сайн байна уу, {user?.firstName}!
            </p>
            <h1 className="text-2xl font-extrabold text-white">
              Миний <span className="text-orange-500">ирц</span>
            </h1>
            <p className="text-gray-500 text-sm">{total} нийт бичлэг · {predicate} тоглогч</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Attendance summary card ── */}
        <div className="bg-[#151515] rounded-2xl border border-white/5 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Ring */}
            <RingChart pct={pct} present={present} late={late} onLeave={onLeave} absent={absent} total={total} />

            {/* Details */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-white font-bold text-sm">Ирцийн хувь</span>
                <span className="text-gray-500 text-xs tabular-nums">{present + late + onLeave}/{total}</span>
                <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border
                  ${pct >= 90 ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : pct >= 75 ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  {predicate}
                </span>
              </div>

              {/* Segmented bar */}
              <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                {total > 0 && (
                  <>
                    <div className="bg-green-500 h-full transition-all duration-700"
                         style={{ width: `${(present / total) * 100}%` }} />
                    <div className="bg-amber-400 h-full transition-all duration-700"
                         style={{ width: `${(late / total) * 100}%` }} />
                    <div className="bg-teal-400 h-full transition-all duration-700"
                         style={{ width: `${(onLeave / total) * 100}%` }} />
                    <div className="bg-red-500 h-full transition-all duration-700"
                         style={{ width: `${(absent / total) * 100}%` }} />
                  </>
                )}
              </div>

              {/* Legend + avg times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {[
                    { label: "Ирсэн",    val: present, pct: total ? Math.round((present/total)*100) : 0,  color: "bg-green-500" },
                    { label: "Хоцорсон", val: late,    pct: total ? Math.round((late/total)*100) : 0,     color: "bg-amber-400" },
                    { label: "Чөлөөтэй", val: onLeave, pct: total ? Math.round((onLeave/total)*100) : 0,  color: "bg-teal-400"  },
                    { label: "Тасалсан", val: absent,  pct: total ? Math.round((absent/total)*100) : 0,   color: "bg-red-500"   },
                  ].map(b => (
                    <div key={b.label} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${b.color}`} />
                      <span className="text-gray-500 text-xs flex-1">{b.label}</span>
                      <span className="text-white text-xs font-semibold tabular-nums">{b.val}</span>
                      <span className="text-gray-600 text-[10px] w-8 text-right tabular-nums">{b.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-l border-white/5 pl-3">
                  <div>
                    <p className="text-gray-600 text-[10px] uppercase tracking-wider">Дундаж ирсэн цаг</p>
                    <p className="text-white font-bold text-lg tabular-nums">{avgTime(records, "checkIn")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-[10px] uppercase tracking-wider">Дундаж явсан цаг</p>
                    <p className="text-white font-bold text-lg tabular-nums">{avgTime(records, "checkOut")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── History ── */}
        <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-orange-500 shrink-0" />
                <h3 className="text-white font-bold text-base">Ирцийн түүх</h3>
                <span className="text-gray-600 text-xs">{filtered.length} бичлэг</span>
              </div>
              {/* Status filter */}
              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 self-start sm:self-auto flex-wrap">
                {filterTabs.map(t => (
                  <button key={t.key}
                    onClick={() => { handleFilter(t.key); if (t.key !== "all") handleGroupFilter("all"); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                      ${filterStatus === t.key ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-white"}`}>
                    {t.label}
                    {t.count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 rounded-full
                        ${filterStatus === t.key ? "bg-white/20" : "bg-white/5"}`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Level dropdown — only on Бүгд tab with 2+ levels */}
            {filterStatus === "all" && uniqueGroups.length >= 2 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs shrink-0">Түвшин:</span>
                <div className="relative">
                  <select
                    value={filterGroup}
                    onChange={e => handleGroupFilter(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl
                               pl-3 pr-8 py-1.5 text-xs font-semibold text-white
                               focus:outline-none focus:border-orange-500/50 transition cursor-pointer">
                    <option value="all">Бүгд түвшин</option>
                    {uniqueGroups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <svg className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                       fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="p-5">
            {loading ? (
              <div className="text-center py-12 text-gray-600 text-sm">Уншиж байна...</div>
            ) : paged.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10
                                flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">Мэдээлэл олдсонгүй</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paged.map(r => {
                  const sc      = STATUS_CFG[r.status] || STATUS_CFG.absent;
                  const dateObj = parseDate(r.date);
                  const dayNum  = dateObj ? dateObj.getDate() : "—";
                  const month   = dateObj ? MN_MONTHS[dateObj.getMonth()] : "";
                  const weekday = dateObj ? MN_DAYS[dateObj.getDay()] : "";
                  const duration = (r.checkIn !== "—" && r.checkOut !== "—")
                    ? (() => {
                        const [ih, im] = r.checkIn.split(":").map(Number);
                        const [oh, om] = r.checkOut.split(":").map(Number);
                        const diff = (oh * 60 + om) - (ih * 60 + im);
                        return diff > 0 ? `${diff} мин` : null;
                      })()
                    : null;

                  return (
                    <div key={r.id} className="flex rounded-2xl overflow-hidden">
                      <div className={`w-2 shrink-0 ${sc.strip}`} />
                      <div className="flex-1 bg-[#1c1c1c] border border-l-0 border-white/10 rounded-r-2xl overflow-hidden">

                        {/* Status banner */}
                        <div className={`px-4 py-2 flex items-center justify-between border-b border-white/5 ${sc.banner}`}>
                          <div className="flex items-center gap-1.5">
                            {sc.icon}
                            <span className="text-xs font-bold">{sc.label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 text-[10px]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {r.date}
                          </div>
                        </div>

                        {/* Main */}
                        <div className="px-4 py-3.5 flex gap-4 items-center">
                          {/* Date badge */}
                          {dateObj && (
                            <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center min-w-[54px]">
                              <p className="text-gray-500 text-[10px] font-semibold">{month} сар</p>
                              <p className="text-white font-extrabold text-2xl leading-none">{dayNum}</p>
                              <p className="text-gray-600 text-[9px] mt-0.5">{weekday}</p>
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1 text-gray-500 text-xs mb-2">
                              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {r.group}
                            </span>

                            {/* Time row */}
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <p className="text-gray-600 text-[10px] uppercase tracking-wider">Орсон</p>
                                <p className={`font-extrabold text-lg tabular-nums leading-tight
                                  ${r.checkIn !== "—" ? "text-white" : "text-gray-700"}`}>
                                  {r.checkIn}
                                </p>
                              </div>

                              <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                {duration && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                                   bg-white/5 text-gray-500 border border-white/10">
                                    {duration}
                                  </span>
                                )}
                                <div className="w-full flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                                  <div className="flex-1 border-t border-dashed border-white/10" />
                                  <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>

                              <div className="text-center">
                                <p className="text-gray-600 text-[10px] uppercase tracking-wider">Дууссан</p>
                                <p className={`font-extrabold text-lg tabular-nums leading-tight
                                  ${r.checkOut !== "—" ? "text-white" : "text-gray-700"}`}>
                                  {r.checkOut}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5
                           text-gray-500 hover:text-white hover:bg-white/10 transition disabled:opacity-30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all
                    ${page === p
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-500 hover:text-white hover:bg-white/5 border border-white/5"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5
                           text-gray-500 hover:text-white hover:bg-white/10 transition disabled:opacity-30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Attendance;
