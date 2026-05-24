import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { accentCls, groupAccent, StatCard } from "./shared";

const MN_MONTHS = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];

const LEAVE_STATUS_CFG = {
  pending:  { label: "Хүлээгдэж буй", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  approved: { label: "Зөвшөөрөгдсөн", cls: "text-green-400 bg-green-500/10 border-green-500/20" },
  rejected: { label: "Татгалзсан",    cls: "text-red-400   bg-red-500/10   border-red-500/20"   },
};

export default function LeaveTab() {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("pending");
  const [actioning, setActioning] = useState(null);

  const fetchRequests = async () => {
    try {
      const data = await api.get("/leave/coach");
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    setActioning(id);
    try {
      await api.patch(`/leave/${id}`, { status });
      await fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioning(null);
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const filtered     = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={requests.filter(r => r.status === "pending").length}  label="Хүлээгдэж буй" color="text-amber-400" />
        <StatCard value={requests.filter(r => r.status === "approved").length} label="Зөвшөөрөгдсөн" color="text-green-400" />
        <StatCard value={requests.filter(r => r.status === "rejected").length} label="Татгалзсан"     color="text-red-400"   />
      </div>

      <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 w-fit">
        {[
          { key: "pending",  label: "Хүлээгдэж буй" },
          { key: "approved", label: "Зөвшөөрөгдсөн" },
          { key: "rejected", label: "Татгалзсан"    },
          { key: "all",      label: "Бүгд"          },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
              ${filter === f.key ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-white"}`}>
            {f.label}
            {f.key === "pending" && pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-black rounded-full text-[9px] font-bold leading-none">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-600 text-sm">Уншиж байна...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-8 h-8 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <p className="text-gray-600 text-sm">Хүсэлт байхгүй байна</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(lr => {
              const a        = accentCls[groupAccent[lr.level] || "orange"];
              const sc       = LEAVE_STATUS_CFG[lr.status] || LEAVE_STATUS_CFG.pending;
              const date     = lr.date?.split("T")[0] || lr.date;
              const initials = (lr.firstName?.[0] || "") + (lr.lastName?.[0] || "");
              const d        = date ? new Date(date) : null;

              return (
                <div key={lr.id} className="px-5 py-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl shrink-0 ${a.bg} border ${a.border}
                                   flex items-center justify-center font-bold text-sm ${a.text}`}>
                    {initials || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">{lr.lastName}. {lr.firstName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${a.badge}`}>
                        {lr.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-1">
                      {d && <span className="flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>{MN_MONTHS[d.getMonth()]} сарын {d.getDate()}</span>}
                      {lr.startTime && <span className="flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>{lr.startTime}–{lr.endTime}</span>}
                      {lr.location  && <span className="flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{lr.location}</span>}
                    </div>
                    {lr.reason && <p className="text-gray-500 text-xs line-clamp-2 flex items-start gap-1"><svg className="w-3 h-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>{lr.reason}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                      {sc.label}
                    </span>
                    {lr.status === "pending" && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleAction(lr.id, "approved")} disabled={actioning === lr.id}
                          className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25
                                     rounded-lg text-xs font-semibold hover:bg-green-500/25 transition disabled:opacity-50">
                          {actioning === lr.id ? "..." : "✓ Зөвшөөрөх"}
                        </button>
                        <button onClick={() => handleAction(lr.id, "rejected")} disabled={actioning === lr.id}
                          className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/25
                                     rounded-lg text-xs font-semibold hover:bg-red-500/25 transition disabled:opacity-50">
                          {actioning === lr.id ? "..." : "✕ Татгалзах"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
