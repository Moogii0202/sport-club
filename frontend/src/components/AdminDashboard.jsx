import React, { useState } from "react";
import EnrollmentTab   from "./admin/EnrollmentTab";
import CoachTab        from "./admin/CoachTab";
import UsersTab        from "./admin/UsersTab";
import AnnouncementTab from "./admin/AnnouncementTab";
import HallsTab        from "./admin/HallsTab";
import ReportTab       from "./admin/ReportTab";
import LevelsTab       from "./admin/LevelsTab";

const IconEnrollment = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconCoach = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconBell = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const IconHall = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconReport = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconLevels = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

const TABS = [
  { key: "enrollments",   label: "Элсэлтийн хүсэлт", icon: <IconEnrollment /> },
  { key: "coaches",       label: "Багш удирдлага",    icon: <IconCoach />      },
  { key: "users",         label: "Хэрэглэгчид",       icon: <IconUsers />      },
  { key: "halls",         label: "Заал",               icon: <IconHall />       },
  { key: "announcements", label: "Мэдэгдэл",           icon: <IconBell />       },
  { key: "report",        label: "Ирцийн тайлан",      icon: <IconReport />     },
  { key: "levels",        label: "Түвшин",             icon: <IconLevels />     },
];

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("enrollments");

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="bg-[#0d0d0d] border-b border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/25 rounded-2xl
                          flex items-center justify-center font-bold text-orange-400 text-lg shrink-0">
            {initials || "A"}
          </div>
          <div>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">Администратор</p>
            <h1 className="text-2xl font-extrabold text-white">
              Тавтай морил, <span className="text-orange-500">{user?.firstName}</span>!
            </h1>
          </div>
        </div>
      </section>

      <div className="bg-[#0d0d0d] border-b border-white/10 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            transition-all whitespace-nowrap shrink-0 border
                  ${activeTab === t.key
                    ? "bg-orange-500/15 text-orange-400 border-orange-500/25"
                    : "text-gray-500 hover:text-white hover:bg-white/5 border-transparent"}`}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "enrollments"   && <EnrollmentTab />}
        {activeTab === "coaches"       && <CoachTab />}
        {activeTab === "users"         && <UsersTab />}
        {activeTab === "halls"         && <HallsTab />}
        {activeTab === "announcements" && <AnnouncementTab />}
        {activeTab === "report"        && <ReportTab />}
        {activeTab === "levels"        && <LevelsTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
