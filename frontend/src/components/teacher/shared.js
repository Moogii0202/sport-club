export const WEEK_DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
export const GROUPS    = ["Анхан шат", "Дунд шат", "Ахисан шат"];
export const LEVELS    = ["Анхан шат", "Дунд шат", "Ахисан шат"];
export const WEEKDAYS  = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
export const DAY_IDX   = { "Даваа": 0, "Мягмар": 1, "Лхагва": 2, "Пүрэв": 3, "Баасан": 4, "Бямба": 5, "Ням": 6 };

export const accentCls = {
  orange: { border: "border-orange-500/40", bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500", badge: "bg-orange-500/15 text-orange-300 border-orange-500/20" },
  blue:   { border: "border-blue-500/40",   bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-500",   badge: "bg-blue-500/15 text-blue-300 border-blue-500/20"       },
  purple: { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500", badge: "bg-purple-500/15 text-purple-300 border-purple-500/20"  },
};

export const groupAccent = { "Анхан шат": "orange", "Дунд шат": "blue", "Ахисан шат": "purple" };

export const inputCls = `w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white
  placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1
  focus:ring-orange-500/30 transition text-sm`;

export function StatCard({ value, label, color = "text-orange-500" }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 text-center">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1">{label}</p>
    </div>
  );
}

export function MemberAvatar({ m, size = "md" }) {
  const initials = (m.firstName?.[0] || "") + (m.lastName?.[0] || "");
  const acc = accentCls[groupAccent[m.level]] || accentCls[groupAccent[m.group]] || accentCls.orange;
  const sz  = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-xl ${acc.bg} border ${acc.border} flex items-center justify-center font-bold ${acc.text} shrink-0`}>
      {initials}
    </div>
  );
}
