import React, { useState, useEffect } from "react";
import { api } from "../api/api";
import MembersTab    from "./teacher/MembersTab";
import ScheduleTab   from "./teacher/ScheduleTab";
import AttendanceTab from "./teacher/AttendanceTab";
import StatsTab      from "./teacher/StatsTab";
import LeaveTab      from "./teacher/LeaveTab";

const TABS = [
  {
    key: "members", label: "Миний гишүүд",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "schedule", label: "Миний хуваарь",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "attendance", label: "Ирц бүртгэх",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "stats", label: "Бүлгийн статистик",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: "leave", label: "Чөлөөний хүсэлт",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4m0 0l-2-2m2 2l2-2" />
      </svg>
    ),
  },
];

function CoachDashboard({ user }) {
  const [activeTab,         setActiveTab]         = useState("members");
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    api.get("/leave/coach")
      .then(data => setPendingLeaveCount((Array.isArray(data) ? data : []).filter(r => r.status === "pending").length))
      .catch(() => {});
  }, []);

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  const goToAttendance = (sessionId) => {
    setAttendanceSession(sessionId);
    setActiveTab("attendance");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="bg-[#0d0d0d] border-b border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30
                          flex items-center justify-center font-bold text-blue-400 text-lg shrink-0">
            {initials || "DC"}
          </div>
          <div>
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Дасгалжуулагч</p>
            <h1 className="text-2xl font-extrabold text-white">
              Тавтай морил, <span className="text-orange-500">{user?.firstName}</span>!
            </h1>
          </div>
        </div>
      </section>

      <div className="bg-[#0d0d0d] border-b border-white/10 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            transition-all whitespace-nowrap shrink-0
                  ${activeTab === t.key
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                    : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                {t.icon}
                {t.label}
                {t.key === "leave" && pendingLeaveCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-black rounded-full text-[9px] font-bold leading-none">
                    {pendingLeaveCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "members"    && <MembersTab />}
        {activeTab === "schedule"   && <ScheduleTab onAttendance={goToAttendance} />}
        {activeTab === "attendance" && <AttendanceTab initialSessionId={attendanceSession} />}
        {activeTab === "stats"      && <StatsTab />}
        {activeTab === "leave"      && <LeaveTab />}
      </div>
    </div>
  );
}

export default CoachDashboard;
