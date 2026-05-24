import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { accentCls, groupAccent, GROUPS, inputCls, StatCard, MemberAvatar } from "./shared";

const MN_DAYS = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

function formatDate(dateStr) {
  if (!dateStr || dateStr === "—") return "—";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  const dt = new Date(y, m - 1, d);
  return `${y} оны ${m} сарын ${d} (${MN_DAYS[dt.getDay()]})`;
}

const STATUS_CFG = {
  present: { label: "Цагтаа",   cls: "text-green-400 bg-green-500/10 border-green-500/20", dot: "bg-green-500" },
  late:    { label: "Хоцорсон", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  absent:  { label: "Тасалсан", cls: "text-red-400   bg-red-500/10   border-red-500/20",   dot: "bg-red-400"   },
};

function MemberDetail({ member, onBack }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const qs = member.classId ? `?classId=${member.classId}` : "";
    api.get(`/members/${member.id}/attendance${qs}`)
      .then(data =>
        setRecords(
          (Array.isArray(data) ? data : []).map(r => ({
            date:     r.date      || "—",
            checkIn:  r.startTime || "—",
            checkOut: r.endTime   || "—",
            status:   r.status    || "absent",
          }))
        )
      )
      .catch(() => setRecords([]));
  }, [member.id, member.classId]);

  const acc     = accentCls[groupAccent[member.level]] || accentCls.orange;
  const present = records.filter(r => r.status === "present").length;
  const late    = records.filter(r => r.status === "late").length;
  const absent  = records.filter(r => r.status === "absent").length;
  const total   = records.length;
  const pct     = total ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
             fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Жагсаалт руу буцах
      </button>

      <div className={`rounded-2xl border p-6 ${acc.border} ${acc.bg}`}>
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center
                           font-bold text-2xl shrink-0 ${acc.border} ${acc.text}`}
               style={{ background: "rgba(255,255,255,0.05)" }}>
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-extrabold text-xl leading-tight">
              {member.lastName}. {member.firstName}
            </h2>
            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-semibold mt-1.5 ${acc.badge}`}>
              {member.group}
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold shrink-0">
            Идэвхтэй
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10">
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">Утасны дугаар</p>
            <p className="text-white font-semibold text-sm mt-0.5">{member.phone}</p>
          </div>
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">Элссэн огноо</p>
            <p className="text-white font-semibold text-sm mt-0.5">{member.enrolledAt}</p>
          </div>
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">Бүлэг</p>
            <p className={`font-semibold text-sm mt-0.5 ${acc.text}`}>{member.group}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={total}   label="Нийт хичээл"  color="text-gray-300"  />
        <StatCard value={present} label="Цагтаа ирсэн" color="text-green-400" />
        <StatCard value={late}    label="Хоцорсон"      color="text-amber-400" />
        <StatCard value={absent}  label="Тасалсан"      color="text-red-400"   />
      </div>

      <div className="bg-[#151515] rounded-2xl border border-white/5 p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-semibold text-sm">Нийт ирцийн хувь</span>
          <span className={`font-extrabold text-lg
            ${pct >= 85 ? "text-green-400" : pct >= 70 ? "text-amber-400" : "text-red-400"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700
            ${pct >= 85 ? "bg-green-500" : pct >= 70 ? "bg-amber-400" : "bg-red-400"}`}
               style={{ width: `${pct}%` }} />
        </div>
        <p className="text-gray-600 text-xs mt-2">{present + late} / {total} хичээлд оролцсон</p>
      </div>

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
            <h3 className="text-white font-bold">Ирцийн түүх</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${acc.badge}`}>
            {member.group} · {member.level}
          </span>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">Бүртгэл байхгүй</div>
        ) : (
          <div className="divide-y divide-white/5">
            {records.map((r, i) => {
              const s = STATUS_CFG[r.status];
              return (
                <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/2 transition">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                  <span className="text-white text-sm font-medium shrink-0">{formatDate(r.date)}</span>
                  <div className="flex-1 flex gap-6 min-w-0">
                    <div>
                      <p className="text-gray-600 text-[10px] uppercase tracking-wider">Орсон</p>
                      <p className="text-white text-sm font-bold">{r.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-[10px] uppercase tracking-wider">Гарсан</p>
                      <p className="text-white text-sm font-bold">{r.checkOut}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MembersTab() {
  const [search,         setSearch]         = useState("");
  const [groupFilter,    setGroupFilter]    = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);
  const [members,        setMembers]        = useState([]);

  useEffect(() => {
    api.get("/members")
      .then(data => {
        const seen = new Set();
        const rows = (Array.isArray(data) ? data : [])
          .filter(m => {
            const key = `${m.id}-${m.level || ""}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map(m => ({
            id:           m.id,
            firstName:    m.firstName    || "",
            lastName:     m.lastName     || "",
            phone:        m.phone        || "—",
            email:        m.email        || "—",
            profileImage: m.profileImage || null,
            classId:      m.classId      || null,
            group:        m.group        || "—",
            level:        m.level        || "—",
            enrolledAt:   m.enrolledAt ? new Date(m.enrolledAt).toISOString().split("T")[0] : "—",
            attendance:   Number(m.totalSessions) > 0
              ? Math.round((Number(m.attendedSessions) / Number(m.totalSessions)) * 100)
              : 0,
          }));
        setMembers(rows);
      })
      .catch(() => setMembers([]));
  }, []);

  if (selectedMember) {
    return <MemberDetail member={selectedMember} onBack={() => setSelectedMember(null)} />;
  }

  const filtered = members.filter(m => {
    const matchGroup  = groupFilter === "all"
      || m.level === groupFilter
      || m.group === groupFilter;
    const q           = search.toLowerCase();
    const matchSearch = !q || m.firstName.toLowerCase().includes(q) || m.lastName.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={members.length}                                                                              label="Нийт гишүүн" color="text-white"      />
        <StatCard value={members.filter(m => m.level === "Анхан шат"  || m.group === "Анхан шат").length}  label="Анхан шат"   color="text-orange-400" />
        <StatCard value={members.filter(m => m.level === "Дунд шат"   || m.group === "Дунд шат").length}   label="Дунд шат"    color="text-blue-400"   />
        <StatCard value={members.filter(m => m.level === "Ахисан шат" || m.group === "Ахисан шат").length} label="Ахисан шат"  color="text-purple-400" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:max-w-xs w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
               fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Нэрээр хайх..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={inputCls + " pl-9"} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", ...GROUPS].map(g => {
            const acc = g !== "all" ? accentCls[groupAccent[g]] : null;
            return (
              <button key={g} onClick={() => setGroupFilter(g)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                  ${groupFilter === g
                    ? (acc ? `${acc.bg} ${acc.text} ${acc.border}` : "bg-white/10 text-white border-white/20")
                    : "bg-[#1a1a1a] text-gray-500 border-white/5 hover:border-white/10 hover:text-white"}`}>
                {g === "all" ? "Бүгд" : g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-gray-500 text-xs uppercase tracking-wider">{filtered.length} гишүүн</p>
          <p className="text-gray-600 text-xs">Дарж дэлгэрэнгүйг харна уу</p>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map(m => {
            const acc = accentCls[groupAccent[m.level]] || accentCls.orange;
            const pct = m.attendance;
            return (
              <button key={m.id} onClick={() => setSelectedMember(m)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/3 transition-all text-left group">
                <MemberAvatar m={m} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">
                    {m.lastName}. {m.firstName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${acc.badge}`}>
                      {m.group}
                    </span>
                    <span className="text-gray-600 text-xs">{m.phone}</span>
                  </div>
                </div>

                <div className="hidden sm:block w-28 shrink-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Ирц</span>
                    <span className={`font-bold
                      ${pct >= 85 ? "text-green-400" : pct >= 70 ? "text-amber-400" : "text-red-400"}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full
                      ${pct >= 85 ? "bg-green-500" : pct >= 70 ? "bg-amber-400" : "bg-red-400"}`}
                         style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <span className="text-gray-600 text-xs hidden md:block shrink-0 w-24">{m.enrolledAt}</span>

                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                     fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <p className="text-sm">Гишүүн олдсонгүй</p>
          </div>
        )}
      </div>
    </div>
  );
}
