import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../api/api";

// ── Icons ────────────────────────────────────────────────────────────────────
const ProfileIcon    = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const ScheduleIcon   = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const AttendanceIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const EnrollIcon     = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const AdminIcon      = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const LeaveIcon      = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4m0 0l-2-2m2 2l2-2" />
  </svg>
);
const CoachIcon      = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const BellIcon       = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const roleLabel = { admin: "Админ", coach: "Дасгалжуулагч", player: "Тоглогч" };
const roleColor = {
  admin:  "text-red-400    bg-red-500/10    border-red-500/20",
  coach:  "text-blue-400   bg-blue-500/10   border-blue-500/20",
  player: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};
const targetLabel = { all: "Бүгдэд", player: "Тоглогч", coach: "Дасгалжуулагч" };
const targetCls   = {
  all:    "bg-gray-500/10   text-gray-400   border-gray-500/20",
  player: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  coach:  "bg-blue-500/10   text-blue-400   border-blue-500/20",
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return "Дөнгөж сая";
  if (s < 3600)  return `${Math.floor(s / 60)} мин өмнө`;
  if (s < 86400) return `${Math.floor(s / 3600)} цаг өмнө`;
  return `${Math.floor(s / 86400)} өдрийн өмнө`;
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label, collapsed }) {
  return (
    <NavLink to={to} title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-xl text-sm font-medium transition-all duration-200
        ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
        ${isActive
          ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`
      }>
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout, collapsed, onToggle }) {
  const role     = user?.role;
  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  const [notifOpen,  setNotifOpen]  = useState(false);
  const [notifs,     setNotifs]     = useState([]);
  const [unread,     setUnread]     = useState(0);
  const [notifLoad,  setNotifLoad]  = useState(false);

  useEffect(() => {
    api.get("/announcements")
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setNotifs(list);
        const lastSeen = localStorage.getItem("notif_last_seen");
        const count = lastSeen
          ? list.filter(n => new Date(n.createdAt) > new Date(lastSeen)).length
          : list.length;
        setUnread(count);
      })
      .catch(() => {});
  }, []);

  const openPanel = () => {
    setNotifOpen(true);
    setNotifLoad(true);
    api.get("/announcements")
      .then(data => setNotifs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setNotifLoad(false));
    localStorage.setItem("notif_last_seen", new Date().toISOString());
    setUnread(0);
  };

  const closePanel = () => setNotifOpen(false);

  const sidebarW = collapsed ? "w-16" : "w-56";
  const panelLeft = collapsed ? "left-16" : "left-56";

  return (
    <>
      <aside className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#111111]
                        border-r border-white/10 flex flex-col z-40 hidden md:flex
                        transition-all duration-300 ${sidebarW}`}>

        {/* Toggle button — pinned to right edge */}
        <button
          onClick={onToggle}
          title={collapsed ? "Цэс нээх" : "Цэс хаах"}
          className="absolute -right-3 top-5 w-6 h-6 bg-[#1a1a1a] border border-white/15
                     rounded-full flex items-center justify-center z-50
                     text-gray-500 hover:text-white hover:border-white/30 transition-all duration-200">
          <svg className={`w-3 h-3 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* User avatar */}
        <div className={`border-b border-white/10 ${collapsed ? "p-3" : "p-4"}`}>
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30
                              flex items-center justify-center" title={`${user?.firstName} ${user?.lastName}`}>
                <span className="text-orange-400 font-bold text-sm">{initials || "U"}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30
                              flex items-center justify-center shrink-0">
                <span className="text-orange-400 font-bold text-sm">{initials || "U"}</span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-white font-semibold text-sm truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-0.5
                  ${roleColor[role] || roleColor.player}`}>
                  {roleLabel[role] || role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto space-y-1 ${collapsed ? "p-2" : "p-3"}`}>
          {!collapsed && (
            <p className="text-gray-600 text-xs uppercase tracking-widest px-3 mb-2">Үндсэн цэс</p>
          )}
          <NavItem to="/profile"    icon={<ProfileIcon />}    label="Профайл"           collapsed={collapsed} />
          <NavItem to="/schedule"   icon={<ScheduleIcon />}   label="Хуваарь"           collapsed={collapsed} />
          <NavItem to="/attendance" icon={<AttendanceIcon />} label="Ирц"               collapsed={collapsed} />
          <NavItem to="/leave"      icon={<LeaveIcon />}      label="Чөлөөний хүсэлт"  collapsed={collapsed} />
          <NavItem to="/enrollment" icon={<EnrollIcon />}     label="Элсэлт"            collapsed={collapsed} />

          {role === "admin" && (
            <>
              {!collapsed && (
                <p className="text-gray-600 text-xs uppercase tracking-widest px-3 mt-4 mb-2">Удирдлага</p>
              )}
              {collapsed && <div className="my-2 border-t border-white/10" />}
              <NavItem to="/admin" icon={<AdminIcon />} label="Админ хэсэг" collapsed={collapsed} />
            </>
          )}
          {role === "coach" && (
            <>
              {!collapsed && (
                <p className="text-gray-600 text-xs uppercase tracking-widest px-3 mt-4 mb-2">Удирдлага</p>
              )}
              {collapsed && <div className="my-2 border-t border-white/10" />}
              <NavItem to="/coach" icon={<CoachIcon />} label="Дасгалжуулагч" collapsed={collapsed} />
            </>
          )}
        </nav>

        {/* Bell + Logout */}
        <div className={`border-t border-white/10 space-y-1 ${collapsed ? "p-2" : "p-3"}`}>
          {/* Notification bell */}
          <button onClick={notifOpen ? closePanel : openPanel}
            title={collapsed ? "Мэдэгдэл" : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-medium
                       transition-all duration-200 relative
                       ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                       ${notifOpen
                         ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                         : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
            <BellIcon />
            {!collapsed && <span>Мэдэгдэл</span>}
            {unread > 0 && (
              <span className={`absolute top-1.5 w-4 h-4 bg-red-500 rounded-full
                               flex items-center justify-center text-[9px] font-bold text-white
                               ${collapsed ? "left-5" : "left-7"}`}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Logout */}
          <button onClick={onLogout}
            title={collapsed ? "Гарах" : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-medium
                       text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200
                       ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Гарах</span>}
          </button>
        </div>
      </aside>

      {/* Notification panel backdrop */}
      {notifOpen && (
        <div className={`fixed top-16 bottom-0 z-30 ${panelLeft} right-0`}
             onClick={closePanel} />
      )}

      {/* Notification panel */}
      {notifOpen && (
        <div className={`fixed top-16 ${panelLeft} w-80 h-[calc(100vh-64px)] bg-[#111111]
                        border-r border-white/10 flex flex-col z-40 shadow-2xl hidden md:flex`}>
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <BellIcon />
              <h3 className="text-white font-bold text-sm">Мэдэгдлүүд</h3>
            </div>
            <button onClick={closePanel}
              className="text-gray-600 hover:text-gray-300 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifLoad ? (
              <div className="text-center py-10 text-gray-600 text-sm">Уншиж байна...</div>
            ) : notifs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-gray-600 text-sm">Мэдэгдэл байхгүй байна</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifs.map(n => (
                  <div key={n.id}
                    className={`px-4 py-3.5 hover:bg-white/3 transition relative
                      ${n.isPersonal ? "border-l-2 border-orange-500/60" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-white font-semibold text-sm leading-snug flex-1">
                        {n.title}
                      </p>
                      {n.isPersonal ? (
                        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold
                          bg-orange-500/10 text-orange-400 border-orange-500/20">
                          Хувийн
                        </span>
                      ) : (
                        <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold
                          ${targetCls[n.targetRole] || targetCls.all}`}>
                          {targetLabel[n.targetRole] || "Бүгдэд"}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{n.body}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-gray-700 text-[10px]">{timeAgo(n.createdAt)}</p>
                      {!n.isPersonal && (n.authorFirst || n.authorLast) && (
                        <>
                          <span className="text-gray-800 text-[10px]">·</span>
                          <p className="text-gray-700 text-[10px]">
                            {n.authorLast} {n.authorFirst}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
