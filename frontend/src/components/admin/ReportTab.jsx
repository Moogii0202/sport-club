import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../api/api";
import * as XLSX from "xlsx";
import Table from "../common/Table";


function pctCls(pct) {
  if (pct >= 85) return { text: "text-green-400", bg: "bg-green-500/15 border-green-500/20", dot: "#22c55e" };
  if (pct >= 70) return { text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "#f59e0b" };
  return             { text: "text-red-400",   bg: "bg-red-500/10   border-red-500/20",   dot: "#ef4444" };
}

const fmtDate = d => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
};

const Section = ({ title, accent = "bg-orange-500", children }) => (
  <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
      <span className={`w-1 h-5 rounded-full ${accent} shrink-0`} />
      <h3 className="text-white font-bold text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

export default function ReportTab() {
  const [months,      setMonths]      = useState(3);
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/reports/attendance?months=${months}`)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [months]);

  const sessionsByLevel = useMemo(() => {
    if (!data) return {};
    const m = {};
    data.sessions.forEach(s => {
      if (!m[s.level]) m[s.level] = [];
      const total   = Number(s.totalMembers);
      const present = Number(s.present);
      const absent  = Number(s.absent);
      const pct     = total > 0 ? Math.round(present / total * 100) : 0;
      m[s.level].push({ date: s.date, present, absent, total, pct });
    });
    return m;
  }, [data]);

  const activeGroups = useMemo(() => {
    if (!data) return [];
    const fromSessions = Object.keys(sessionsByLevel);
    const fromStats    = Object.keys(data.stats.byLevel);
    const all = [...new Set([...fromSessions, ...fromStats])];
    return all.sort((a, b) => a.localeCompare(b, "mn"));
  }, [sessionsByLevel, data]);

  const memberRows = useMemo(() => {
    if (!data) return [];
    return data.members
      .filter(p => filterLevel === "all" || p.level === filterLevel)
      .map(p => {
        const present = Number(p.present) + Number(p.late);
        const absent  = Number(p.absent);
        const total   = Number(p.totalSessions);
        const pct     = total > 0 ? Math.round(present / total * 100) : 0;
        return { ...p, presentTotal: present, absent, total, pct };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [data, filterLevel]);

  const topAttendees = useMemo(
    () => [...memberRows].sort((a, b) => b.pct - a.pct).slice(0, 10),
    [memberRows]
  );

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const s1 = [
      ["Үзүүлэлт", "Тоо"],
      ["Нийт гишүүн", data.stats.totalMembers],
      ...activeGroups.map(l => [l, data.stats.byLevel[l] || 0]),
      ["Нийт орсон бэлтгэл", data.stats.totalSessions],
      ["Дундаж ирц", `${data.stats.avgPct}%`],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "Ерөнхий статистик");

    const s2 = [["Түвшин", "Огноо", "Ирсэн", "Тасалсан", "Нийт", "Ирц %"]];
    activeGroups.forEach(lvl => {
      (sessionsByLevel[lvl] || []).forEach(s => {
        s2.push([lvl, fmtDate(s.date), s.present, s.absent, s.total, `${s.pct}%`]);
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "Сессийн тайлан");

    const s3 = [["Нэр", "Түвшин", "Ирсэн", "Тасалсан", "Нийт хичээл", "Ирц %"]];
    memberRows.forEach(p => {
      s3.push([`${p.lastName}. ${p.firstName}`, p.level, p.presentTotal, p.absent, p.total, `${p.pct}%`]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), "Гишүүдийн ирц");

    XLSX.writeFile(wb, `Ирцийн_тайлан_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportPDF = () => {
    if (!data) return;
    const date = new Date().toLocaleDateString("mn-MN");

    const statRows = [
      ["Нийт гишүүн", data.stats.totalMembers],
      ...activeGroups.map(l => [l, data.stats.byLevel[l] || 0]),
      ["Нийт орсон бэлтгэл", data.stats.totalSessions],
      ["Дундаж ирц", `${data.stats.avgPct}%`],
    ].map(([k, v]) => `<tr><td>${k}</td><td><b>${v}</b></td></tr>`).join("");

    const sessionTables = activeGroups.map(lvl => {
      const rows = (sessionsByLevel[lvl] || []).map(s => {
        const cls = s.pct >= 85 ? "green" : s.pct >= 70 ? "amber" : "red";
        return `<tr><td>${fmtDate(s.date)}</td><td>${s.present}</td><td>${s.absent}</td><td class="${cls}">${s.pct}%</td></tr>`;
      }).join("");
      return `<h2>${lvl}</h2>
        <table><thead><tr><th>Огноо</th><th>Ирсэн</th><th>Тасалсан</th><th>Ирц %</th></tr></thead>
        <tbody>${rows}</tbody></table>`;
    }).join("");

    const memberTable = memberRows.map(p => {
      const cls = p.pct >= 85 ? "green" : p.pct >= 70 ? "amber" : "red";
      return `<tr><td>${p.lastName}. ${p.firstName}</td><td>${p.level}</td>
        <td>${p.presentTotal}</td><td>${p.absent}</td><td class="${cls}">${p.pct}%</td></tr>`;
    }).join("");

    const topRows = topAttendees.map((p, i) => {
      const cls = p.pct >= 85 ? "green" : p.pct >= 70 ? "amber" : "red";
      return `<tr><td>${i + 1}</td><td>${p.lastName}. ${p.firstName}</td><td>${p.level}</td><td class="${cls}">${p.pct}%</td></tr>`;
    }).join("");

    const win = window.open("", "_blank", "width=1050,height=750");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Ирцийн тайлан — ${date}</title><meta charset="utf-8"/>
      <style>
        *{box-sizing:border-box}
        body{font-family:"Segoe UI",Arial,sans-serif;font-size:10.5px;margin:24px;color:#111}
        h1{font-size:15px;margin-bottom:2px}
        h2{font-size:12px;margin:18px 0 5px;border-bottom:2px solid #f97316;padding-bottom:3px;color:#ea580c}
        .meta{color:#666;font-size:9.5px;margin-bottom:14px}
        table{border-collapse:collapse;width:100%;margin-bottom:10px}
        th{background:#f3f4f6;font-weight:600;font-size:10px}
        th,td{border:1px solid #d1d5db;padding:4px 8px;text-align:center}
        td:first-child{text-align:left}
        .green{color:#16a34a;font-weight:600}.amber{color:#d97706;font-weight:600}.red{color:#dc2626;font-weight:600}
        @media print{body{margin:0}}
      </style></head><body>
      <h1>Ирцийн тайлан</h1>
      <p class="meta">Гаргасан: ${date} · Сүүлийн ${months} сар</p>
      <h2>Ерөнхий статистик</h2>
      <table style="width:300px"><tbody>${statRows}</tbody></table>
      <h2>Түвшин тус бүрийн ирц</h2>${sessionTables}
      <h2>Гишүүдийн ирцийн мэдээлэл</h2>
      <table><thead><tr><th>Нэр</th><th>Түвшин</th><th>Ирсэн</th><th>Тасалсан</th><th>Ирц %</th></tr></thead>
      <tbody>${memberTable}</tbody></table>
      <h2>Шилдэг ирцтэй гишүүд</h2>
      <table><thead><tr><th>#</th><th>Нэр</th><th>Түвшин</th><th>Ирц %</th></tr></thead>
      <tbody>${topRows}</tbody></table>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-600">
      <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      Тайлан уншиж байна...
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 text-gray-600 text-sm">Тайланг татаж чадсангүй</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
          {[3, 6, 12].map(m => (
            <button key={m} onClick={() => setMonths(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${months === m ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-white"}`}>
              Сүүлийн {m} сар
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                       bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Excel
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                       bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            PDF
          </button>
        </div>
      </div>

      <Section title="Ерөнхий статистик">
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: "Нийт гишүүн",         value: data.stats.totalMembers,   color: "text-white"    },
              { label: "Нийт орсон бэлтгэл", value: data.stats.totalSessions,  color: "text-gray-200" },
              { label: "Дундаж ирц",           value: `${data.stats.avgPct}%`,   color: pctCls(data.stats.avgPct).text },
              ...activeGroups.map(l => ({
                label: l,
                value: data.stats.byLevel[l] || 0,
                color: "text-orange-400",
              })),
            ].map(s => (
              <div key={s.label} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Түвшин тус бүрийн ирц">
        <div className="p-6 space-y-6">
          {activeGroups.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-6">Энэ хугацаанд сесс бүртгэлгүй байна</p>
          ) : activeGroups.map(lvl => {
            const rows   = sessionsByLevel[lvl] || [];
            const lvlPct = rows.length > 0
              ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length)
              : 0;
            const c = pctCls(lvlPct);
            return (
              <div key={lvl}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{lvl}</h4>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.text}`}>
                    Дундаж {lvlPct}%
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#1a1a1a] text-gray-500 uppercase tracking-wider text-[10px]">
                        <th className="px-4 py-2.5 text-left">Огноо</th>
                        <th className="px-4 py-2.5 text-center">Ирсэн</th>
                        <th className="px-4 py-2.5 text-center">Тасалсан</th>
                        <th className="px-4 py-2.5 text-center">Ирц %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rows.map((s, i) => {
                        const sc = pctCls(s.pct);
                        return (
                          <tr key={i} className="hover:bg-white/2 transition">
                            <td className="px-4 py-2.5 text-gray-300 font-mono">{fmtDate(s.date)}</td>
                            <td className="px-4 py-2.5 text-center text-green-400 font-semibold">{s.present}</td>
                            <td className="px-4 py-2.5 text-center text-red-400 font-semibold">{s.absent}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.bg} ${sc.text}`}>
                                {s.pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Гишүүдийн ирцийн мэдээлэл">
        <div className="px-6 pt-4 pb-2 flex gap-2 flex-wrap">
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-xs
                       focus:outline-none focus:border-orange-500/50 transition">
            <option value="all">Бүх түвшин</option>
            {activeGroups.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <span className="self-center text-gray-600 text-xs">{memberRows.length} гишүүн</span>
        </div>
        <Table
          rows={memberRows}
          emptyText="Өгөгдөл байхгүй"
          columns={[
            { key: "name",         label: "Нэр"      },
            { key: "level",        label: "Түвшин"   },
            { key: "presentTotal", label: "Ирсэн",   align: "center" },
            { key: "absent",       label: "Тасалсан", align: "center" },
            { key: "pct",          label: "Ирц %",   align: "center" },
          ]}
          renderCell={(row, col) => {
            if (col.key === "name")  return <span className="text-white font-medium">{row.lastName}. {row.firstName}</span>;
            if (col.key === "level") return <span className="text-gray-400">{row.level}</span>;
            if (col.key === "presentTotal") return <span className="text-green-400 font-semibold">{row.presentTotal}</span>;
            if (col.key === "absent")       return <span className="text-red-400 font-semibold">{row.absent}</span>;
            if (col.key === "pct") {
              const c = pctCls(row.pct);
              return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text}`}>{row.pct}%</span>;
            }
          }}
        />
      </Section>

      <Section title="Шилдэг ирцтэй гишүүд" accent="bg-green-500">
        <div className="p-6 space-y-3">
          {topAttendees.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-4">Өгөгдөл байхгүй</p>
          ) : topAttendees.map((p, i) => {
            const c = pctCls(p.pct);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs font-bold w-5 text-right shrink-0">{i + 1}</span>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${c.bg} ${c.text}`}>
                  {(p.firstName?.[0] || "")}{(p.lastName?.[0] || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-semibold truncate">
                      {p.lastName}. {p.firstName}
                      <span className="text-gray-500 font-normal ml-1.5">{p.level}</span>
                    </span>
                    <span className={`text-xs font-bold ml-2 shrink-0 ${c.text}`}>{p.pct}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${p.pct}%`, backgroundColor: c.dot }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
