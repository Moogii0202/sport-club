import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../api/api";

const LEVEL_COLOR = {
  "Анхан шат":  { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-500" },
  "Дунд шат":   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20",   dot: "bg-blue-500"   },
  "Ахисан шат": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", dot: "bg-purple-500" },
};
const getColor = (level) => LEVEL_COLOR[level] || LEVEL_COLOR["Анхан шат"];

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")}`;
};

const fmtFee = (fee) =>
  fee ? `${Number(fee).toLocaleString()}₮` : "Үнэгүй";

function Avatar({ m }) {
  const c = getColor(m.level);
  if (m.profileImage) {
    return (
      <img src={m.profileImage} alt=""
        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10" />
    );
  }
  const initials = `${m.lastName?.[0] || ""}${m.firstName?.[0] || ""}`;
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                     text-sm font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {initials}
    </div>
  );
}

export default function EnrollmentTab() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterLevel, setFilterLevel] = useState("Бүгд");

  const fetchData = () => {
    setLoading(true);
    api.get("/enrollments/approved")
      .then(data => setEnrollments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Silently upgrade any old pending enrollments left from before the payment flow
    api.post("/enrollments/approve-pending", {}).catch(() => {});
    fetchData();
  }, []);

  const levels = useMemo(() => {
    const set = new Set(enrollments.map(e => e.level));
    return ["Бүгд", ...Array.from(set)];
  }, [enrollments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enrollments.filter(e => {
      const matchLevel  = filterLevel === "Бүгд" || e.level === filterLevel;
      const matchSearch = !q ||
        e.lastName?.toLowerCase().includes(q)  ||
        e.firstName?.toLowerCase().includes(q) ||
        e.phone?.includes(q) ||
        e.coachLastName?.toLowerCase().includes(q) ||
        e.className?.toLowerCase().includes(q);
      return matchLevel && matchSearch;
    });
  }, [enrollments, search, filterLevel]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const key = e.level || "Бусад";
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-[#151515] border border-white/5 rounded-2xl px-6 py-4
                      flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
          <h2 className="text-white font-bold">Элсэгчид</h2>
          {!loading && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10
                             text-orange-400 border border-orange-500/20 font-semibold">
              {enrollments.length} гишүүн
            </span>
          )}
          <button onClick={fetchData} disabled={loading}
            className="ml-1 p-1.5 rounded-lg text-gray-600 hover:text-gray-400
                       hover:bg-white/5 transition disabled:opacity-40">
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Нэр, утас, багш..."
            className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl
                       text-white text-sm placeholder-gray-600
                       focus:outline-none focus:border-orange-500/40 transition w-52" />
        </div>
      </div>

      {/* Level filter */}
      {levels.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {levels.map(lv => {
            const c      = lv === "Бүгд" ? null : getColor(lv);
            const active = filterLevel === lv;
            return (
              <button key={lv} onClick={() => setFilterLevel(lv)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm
                            font-medium transition-all
                  ${active
                    ? lv === "Бүгд"
                      ? "bg-orange-500 border-orange-500 text-white"
                      : `${c.bg} ${c.border} ${c.text}`
                    : "bg-[#151515] border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                  }`}>
                {c && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
                {lv}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-10
                        text-center text-gray-600 text-sm">
          Уншиж байна...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-gray-600 text-sm">
            {search ? "Хайлтын үр дүн олдсонгүй" : "Элссэн гишүүн байхгүй байна"}
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([level, members]) => {
          const c = getColor(level);
          return (
            <div key={level}
              className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden">

              {/* Level header */}
              <div className={`px-6 py-3 border-b border-white/5 flex items-center gap-3 ${c.bg}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`font-bold text-sm ${c.text}`}>{level}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border
                                  font-semibold ${c.bg} ${c.text} ${c.border}`}>
                  {members.length} гишүүн
                </span>
              </div>

              {/* Column headers */}
              <div className="px-6 py-2 grid grid-cols-[40px_1fr_140px_140px_100px_110px]
                              gap-4 border-b border-white/5">
                {["", "Овог нэр", "Элссэн түвшин", "Багш", "Төлбөр", "Элссэн огноо"].map((h, i) => (
                  <span key={i} className="text-gray-600 text-[10px] uppercase tracking-wider font-semibold">
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {members.map(e => (
                  <div key={e.id}
                    className="px-6 py-3 grid grid-cols-[40px_1fr_140px_140px_100px_110px]
                               gap-4 items-center hover:bg-white/[0.02] transition">

                    {/* Зураг */}
                    <Avatar m={e} />

                    {/* Овог нэр + утас */}
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {e.lastName} {e.firstName}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{e.phone}</p>
                    </div>

                    {/* Түвшин */}
                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium
                                        ${c.bg} ${c.text} ${c.border}`}>
                        {e.level}
                      </span>
                    </div>

                    {/* Багш */}
                    <p className="text-gray-400 text-sm truncate">
                      {e.coachLastName
                        ? `${e.coachLastName}. ${e.coachFirstName}`
                        : <span className="text-gray-700">—</span>}
                    </p>

                    {/* Төлбөр */}
                    <p className={`text-sm font-semibold ${e.fee ? c.text : "text-gray-600"}`}>
                      {fmtFee(e.fee)}
                    </p>

                    {/* Элссэн огноо */}
                    <p className="text-gray-500 text-xs">
                      {fmtDate(e.reviewedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
