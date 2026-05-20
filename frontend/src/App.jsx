import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Link, NavLink } from "react-router-dom";
import Sidebar    from "./components/Sidebar";
import AppRoutes  from "./router/AppRoutes";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoHome = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
  </svg>
);
const IcoAbout = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
  </svg>
);
const IcoProfile = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IcoSchedule = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IcoAttendance = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const IcoLeave = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4m0 0l-2-2m2 2l2-2" />
  </svg>
);
const IcoEnroll = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IcoAdmin = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IcoCoach = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const IcoRegister = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);
const IcoLogin = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);
const IcoLogout = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IcoBall = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
  </svg>
);
const IcoLocation = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcoPhone = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const IcoMail = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IcoClock = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

// ── Mobile menu link ──────────────────────────────────────────────────────────
function MobileNavLink({ to, icon, label, onClick }) {
  return (
    <NavLink to={to} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${isActive
          ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
          : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"}`
      }>
      {icon}
      {label}
    </NavLink>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar_collapsed") === "true"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(prev => {
    const next = !prev;
    localStorage.setItem("sidebar_collapsed", String(next));
    return next;
  });

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch { setUser(null); }
    }
  }, []);

  const handleLogin = (userData) => { setUser(userData); closeMenu(); };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    closeMenu();
  };

  const role = user?.role;

  return (
    <Router>
      {/* Navbar */}
      <nav className="bg-[#111111] text-white sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2 font-bold text-xl">
              <span className="text-orange-500"><IcoBall /></span>
              <span className="hidden sm:inline tracking-tight">VOLLEYBALL</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1 text-sm">
              <Link to="/" className="px-4 py-2 rounded-full hover:bg-white/10 transition font-medium">Нүүр</Link>
              <Link to="/about" className="px-4 py-2 rounded-full hover:bg-white/10 transition font-medium">Бидний тухай</Link>
              {!user && (
                <Link to="/enrollment" className="px-4 py-2 rounded-full hover:bg-white/10 transition font-medium">Элсэлт</Link>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 text-sm">
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Цэс">
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {user ? null : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/register" className="px-4 py-2 hover:text-orange-400 transition font-medium">
                    Бүртгүүлэх
                  </Link>
                  <Link to="/login"
                    className="px-5 py-2 border border-white/30 rounded-full hover:bg-white/10 transition font-medium">
                    Нэвтрэх
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-[#0d0d0d] overflow-y-auto">
          <div className="p-4 space-y-1">
            <p className="text-gray-600 text-xs uppercase tracking-widest px-4 mb-2 mt-1">Үндсэн</p>
            <MobileNavLink to="/"      icon={<IcoHome />}  label="Нүүр"         onClick={closeMenu} />
            <MobileNavLink to="/about" icon={<IcoAbout />} label="Бидний тухай" onClick={closeMenu} />

            {user ? (
              <>
                <div className="my-3 border-t border-white/10" />
                <p className="text-gray-600 text-xs uppercase tracking-widest px-4 mb-2">Хэрэглэгч</p>
                <MobileNavLink to="/profile"    icon={<IcoProfile />}    label="Профайл"          onClick={closeMenu} />
                <MobileNavLink to="/schedule"   icon={<IcoSchedule />}   label="Хуваарь"          onClick={closeMenu} />
                <MobileNavLink to="/attendance" icon={<IcoAttendance />} label="Ирц"              onClick={closeMenu} />
                <MobileNavLink to="/leave"      icon={<IcoLeave />}      label="Чөлөөний хүсэлт" onClick={closeMenu} />
                <MobileNavLink to="/enrollment" icon={<IcoEnroll />}     label="Элсэлт"           onClick={closeMenu} />

                {role === "admin" && (
                  <>
                    <div className="my-3 border-t border-white/10" />
                    <p className="text-gray-600 text-xs uppercase tracking-widest px-4 mb-2">Удирдлага</p>
                    <MobileNavLink to="/admin" icon={<IcoAdmin />} label="Админ хэсэг" onClick={closeMenu} />
                  </>
                )}
                {role === "coach" && (
                  <>
                    <div className="my-3 border-t border-white/10" />
                    <p className="text-gray-600 text-xs uppercase tracking-widest px-4 mb-2">Удирдлага</p>
                    <MobileNavLink to="/coach" icon={<IcoCoach />} label="Дасгалжуулагч" onClick={closeMenu} />
                  </>
                )}

                <div className="my-3 border-t border-white/10" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                             text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition border border-transparent">
                  <IcoLogout />
                  Гарах
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/enrollment" icon={<IcoEnroll />}   label="Элсэлт"    onClick={closeMenu} />
                <div className="my-3 border-t border-white/10" />
                <p className="text-gray-600 text-xs uppercase tracking-widest px-4 mb-2">Бүртгэл</p>
                <MobileNavLink to="/register" icon={<IcoRegister />} label="Бүртгүүлэх" onClick={closeMenu} />
                <MobileNavLink to="/login"    icon={<IcoLogin />}    label="Нэвтрэх"    onClick={closeMenu} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {user && (
        <Sidebar
          user={user}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className={user ? (sidebarCollapsed ? "md:ml-16" : "md:ml-56") : ""}
           style={{ transition: "margin-left 0.3s" }}>
        <AppRoutes
          user={user}
          role={role}
          setUser={setUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* Footer */}
        <footer className="bg-[#111111] text-gray-400 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-orange-500"><IcoBall /></span>
                  VOLLEYBALL CLUB
                </h3>
                <p className="text-sm leading-relaxed">
                  Мэргэжлийн волейболын сургалт, тэмцээнд бэлтгэх хөтөлбөрүүд.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Холбоо барих</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><IcoLocation /> Улаанбаатар, Чингэлтэй дүүрэг</p>
                  <p className="flex items-center gap-2"><IcoPhone /> 9911-2233</p>
                  <p className="flex items-center gap-2"><IcoMail /> info@volleyball.mn</p>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Цагийн хуваарь</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><IcoClock /> Даваа - Баасан: 09:00 - 21:00</p>
                  <p className="flex items-center gap-2"><IcoClock /> Бямба: 10:00 - 18:00</p>
                  <p className="flex items-center gap-2"><IcoClock /> Ням: Амарна</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-gray-600">
              © 2025 Volleyball Club. Бүх эрх хуулиар хамгаалагдсан.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
