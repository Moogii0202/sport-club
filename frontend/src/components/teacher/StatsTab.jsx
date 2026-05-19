import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { accentCls, groupAccent, GROUPS, StatCard, MemberAvatar } from "./shared";

export default function StatsTab() {
  const [rawMembers, setRawMembers] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.get("/members")
      .then(data => setRawMembers(Array.isArray(data) ? data : []))
      .catch(() => setRawMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const members = rawMembers.map(m => ({
    ...m,
    group:      m.level,
    attendance: Number(m.totalSessions) > 0
      ? Math.round((Number(m.attendedSessions) / Number(m.totalSessions)) * 100)
      : 0,
  }));

  const groups = GROUPS.map(g => {
    const gMembers      = members.filter(m => m.group === g);
    const avgAtt        = gMembers.length
      ? Math.round(gMembers.reduce((s, m) => s + m.attendance, 0) / gMembers.length)
      : 0;
    const totalSessions = gMembers.length > 0 ? Number(gMembers[0].totalSessions) : 0;
    return { name: g, members: gMembers, count: gMembers.length, avgAtt, totalSessions, accent: groupAccent[g] };
  }).filter(g => g.count > 0);

  const totalMembers  = members.length;
  const totalAvg      = totalMembers
    ? Math.round(members.reduce((s, m) => s + m.attendance, 0) / totalMembers)
    : 0;
  const totalSessions = groups.reduce((s, g) => s + g.totalSessions, 0);
  const topPerformers = [...members].sort((a, b) => b.attendance - a.attendance).slice(0, 3);

  if (loading) {
    return <div className="text-center py-20 text-gray-600 text-sm">Уншиж байна...</div>;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-3xl mb-3">📊</p>
        <p className="text-gray-600 text-sm">Статистик мэдээлэл байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={totalMembers}   label="Нийт гишүүн"  color="text-orange-400" />
        <StatCard value={`${totalAvg}%`} label="Дундаж ирц"   color="text-blue-400"   />
        <StatCard value={totalSessions}  label="Нийт тренинг" color="text-purple-400" />
        <StatCard value={groups.length}  label="Бүлгийн тоо"  color="text-green-400"  />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {groups.map(g => {
          const a = accentCls[g.accent];
          return (
            <div key={g.name} className={`rounded-2xl border p-5 ${a.border} ${a.bg}`}>
              <div className="flex items-center justify-between mb-4">
                <p className={`font-bold text-sm ${a.text}`}>{g.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${a.badge} font-semibold`}>
                  {g.count} гишүүн
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Дундаж ирц</span>
                  <span className={`font-bold ${a.text}`}>{g.avgAtt}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${a.dot}`}
                       style={{ width: `${g.avgAtt}%` }} />
                </div>
                <p className="text-gray-700 text-[10px] mt-1">{g.totalSessions} тренинг болсон</p>
              </div>

              <div className="space-y-2">
                {g.members.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <MemberAvatar m={m} size="sm" />
                    <span className="text-white text-xs flex-1 truncate">{m.lastName}. {m.firstName}</span>
                    <span className={`text-xs font-bold shrink-0
                      ${m.attendance >= 85 ? "text-green-400" : m.attendance >= 70 ? "text-amber-400" : "text-red-400"}`}>
                      {m.attendance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
          <h3 className="text-white font-bold">Шилдэг ирцтэй гишүүд</h3>
        </div>
        <div className="divide-y divide-white/5">
          {topPerformers.map((m, i) => {
            const a      = accentCls[groupAccent[m.group]];
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                <span className="text-xl shrink-0">{medals[i]}</span>
                <MemberAvatar m={m} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{m.lastName}. {m.firstName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${a.badge} font-medium`}>{m.group}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-extrabold text-lg
                    ${m.attendance >= 85 ? "text-green-400" : m.attendance >= 70 ? "text-amber-400" : "text-red-400"}`}>
                    {m.attendance}%
                  </p>
                  <p className="text-gray-600 text-xs">{m.attendedSessions}/{m.totalSessions} ирц</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
