import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:4000/api`;
const CLUB_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQssg52k8b3SDmGgYDqZeDNPybl5zLDXDQt6g&s";
const HERO_IMAGE    = "/volleyball-hero.jpg";
const HISTORY_LEFT  = "/volleyball-hero1.jpg";
const HISTORY_RIGHT = "/history-right.jpg";

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}


const IcoTrophy = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}
       strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M8 21h8M12 17v4M5 5h14l-1 8a6 6 0 01-12 0L5 5z"/>
    <path d="M4 5H2v2a4 4 0 003.4 3.95M20 5h2v2a4 4 0 01-3.4 3.95"/>
  </svg>
);
const IcoStar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IcoMedal = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}
       strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.48 12.89L17 22l-5-3-5 3 1.52-9.11"/>
  </svg>
);
const IcoFlag = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}
       strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const achievements = [
  { year: "2024", title: "Улсын аварга шалгаруулалт — 2-р байр", Icon: IcoTrophy },
  { year: "2023", title: "Нийслэлийн лиг — 1-р байр",            Icon: IcoStar   },
  { year: "2023", title: "Шилдэг залуу баг — тусгай шагнал",     Icon: IcoMedal  },
  { year: "2022", title: "Клуб байгуулагдан анхны тэмцээн",       Icon: IcoFlag   },
];

const galleryLabels = [
  "Тэмцээн 2024", "Дасгал хичээл", "Баг хамт олон",
  "Шагналын ёслол", "Улсын лиг", "Галерей",
];

function Label({ children }) {
  return (
    <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500 mb-4">
      {children}
    </span>
  );
}

/* ═══ 1. Hero ═══════════════════════════════════════════════════════════════ */
function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-4 pt-4 pb-0 bg-[#0a0a0a]">
      <section
        className="relative rounded-3xl overflow-hidden"
        style={{ height: "88vh", minHeight: "560px" }}>

        {/* Full-bleed background image */}
        <img
          src={HERO_IMAGE}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover object-top
            transition-transform duration-[1800ms] ease-out
            ${mounted ? "scale-100" : "scale-105"}`}
        />

        {/* Overlays — left-side dark wash keeps text readable, right stays light */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8 md:p-12">

          {/* Top-left: label + heading grouped together */}
          <div>
            {/* Small label */}
            <div className={`transition-all duration-700 ease-out
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400 block mb-3">
                Volleyball Club · Since 2022
              </span>
            </div>

            {/* Giant heading */}
            <div className={`transition-all duration-700 ease-out
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "120ms" }}>
              <h1 className="text-[clamp(4rem,13vw,11rem)] font-black text-white
                             leading-[0.88] uppercase tracking-tighter drop-shadow-2xl">
                Бидний<br />тухай
              </h1>
            </div>
          </div>

          {/* Bottom: description left + scroll button right */}
          <div className={`flex items-end justify-between gap-6
            transition-all duration-700 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "240ms" }}>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs drop-shadow-lg">
              Монголын волейболыг хөгжүүлж, мэргэжлийн тамирчид бэлтгэхэд
              зориулсан клуб
            </p>
            <a href="#history"
              className="w-11 h-11 rounded-2xl border border-white/30 bg-black/20
                         flex items-center justify-center text-white shrink-0
                         hover:bg-black/40 hover:border-white/50
                         transition-all duration-300 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══ 2. History ════════════════════════════════════════════════════════════ */
function HistorySection() {
  const [ref, visible] = useInView();
  return (
    <section id="history" ref={ref} className="py-20 overflow-hidden">
      <div className="grid grid-cols-[1fr_1.6fr_1fr] items-center" style={{ minHeight: "520px" }}>

        {/* Left image — rounded right corners */}
        <div className={`h-full transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}>
          <div className="relative h-full overflow-hidden rounded-r-3xl"
               style={{ minHeight: "480px", outline: "1px solid rgba(255,255,255,0.22)", outlineOffset: "6px" }}>
            <img
              src={HISTORY_LEFT}
              alt="Клуб"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          </div>
        </div>

        {/* Center text */}
        <div className={`px-10 md:px-16 transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "150ms" }}>
          <Label>Клубийн түүх</Label>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-[0.95] mb-6">
            Волейболд<br />хайртай<br />
            <span className="text-orange-500">хүмүүсийн</span><br />нэгдэл
          </h2>
          <div className="w-10 h-0.5 bg-orange-500 mb-8" />
          <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
            <p>
              Манай волейболын клуб нь 2022 онд хэсэг волейбол сонирхогчдын санаачилгаар
              байгуулагдсан. Эхний жилд ердөө 20 гишүүнтэй байсан бол өнөөдөр 150 гаруй
              идэвхтэй гишүүнтэй болсон.
            </p>
            <p>
              Анхан шатнаас эхлэн ахисан түвшний хүртэл 6 бүлэгтэй бөгөөд насны ангиллаас
              үл хамааран хэн бүхэнд нээлттэй орчин бүрдүүлсэн.
            </p>
          </div>
          {/* Mini stats */}
          <div className="mt-10 flex gap-8">
            {[["2022","Байгуулагдсан"],["150+","Гишүүд"],["6","Бүлэг"]].map(([v, l], i) => (
              <React.Fragment key={l}>
                {i > 0 && <div className="w-px bg-white/8" />}
                <div>
                  <p className="text-2xl font-black text-orange-500">{v}</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-0.5">{l}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right image — rounded left corners */}
        <div className={`h-full transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}
          style={{ transitionDelay: "100ms" }}>
          <div className="relative h-full overflow-hidden rounded-l-3xl"
               style={{ minHeight: "480px", outline: "1px solid rgba(255,255,255,0.22)", outlineOffset: "6px" }}>
            <img
              src={HISTORY_RIGHT}
              alt="Клуб"
              className="w-full h-full object-cover"
              style={{ objectPosition: "60% center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
            {/* Badge */}
            
          </div>
        </div>

      </div>
    </section>
  );
}

/* ═══ 3. Mission ════════════════════════════════════════════════════════════ */
function MissionSection() {
  const [ref, visible] = useInView();
  const items = [
    { num: "01", title: "Системтэй хөгжил",   desc: "Тамирчин бүрийн түвшинд тохирсон хөтөлбөрөөр ур чадварыг хөгжүүлнэ." },
    { num: "02", title: "Багийн соёл",         desc: "Хүндэтгэл, хамтын ажиллагаа дээр суурилсан эерэг орчин бүрдүүлнэ." },
    { num: "03", title: "Тэмцээний амжилт",    desc: "Улсын болон олон улсын тэмцээнд өрсөлдөх чадвартай баг бэлтгэнэ." },
    { num: "04", title: "Эрүүл амьдрал",       desc: "Спортоор дамжуулан идэвхтэй, эрүүл амьдралын хэвшлийг дэмжинэ." },
  ];

  return (
    <section ref={ref} className="bg-[#0d0d0d] border-y border-white/5 py-28">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between mb-16
          transition-all duration-600 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <Label>Эрхэм зорилго</Label>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
              Бид юуг зорьж<br /><span className="text-orange-500">ажилладаг вэ?</span>
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs mt-4 sm:mt-0 leading-relaxed">
            Дасгалжуулагчид болон гишүүдийн хамтын хүчин чармайлтаар
            дэлхийн түвшинд хүрнэ.
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {items.map((item, i) => (
            <div
              key={i}
              className={`group relative bg-[#0d0d0d] hover:bg-[#131313] p-8 transition-all duration-300
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 scale-x-0
                              group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <span className="block text-[11px] font-black text-orange-500/40 tracking-[0.2em] mb-5">
                {item.num}
              </span>
              <h3 className="text-white font-black text-lg uppercase tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 4. Coaches ════════════════════════════════════════════════════════════ */
function CoachesSection() {
  const [ref, visible] = useInView();
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/coaches/public`)
      .then(r => r.json())
      .then(data => setCoaches(Array.isArray(data) ? data : []))
      .catch(() => setCoaches([]));
  }, []);

  return (
    <section ref={ref} className="py-28 bg-[#0d0d0d] border-y border-white/5">
      <div className={`max-w-6xl mx-auto px-4 transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <Label></Label>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
              Дасгалжуулагч <span className="text-orange-500">нар</span>
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs mt-4 sm:mt-0 leading-relaxed">
            Туршлагатай дасгалжуулагч нарын удирдлаган дор хөгжинө
          </p>
        </div>

        {/* Grid — mobile: horizontal scroll; md+: 3-column grid */}
        {coaches.length === 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar
                          md:grid md:grid-cols-3 md:gap-6 md:pb-0">
            {[0, 1, 2].map(i => (
              <div key={i} className="animate-pulse shrink-0 w-[220px] md:w-auto">
                <div className="rounded-2xl bg-white/5 mb-4" style={{ aspectRatio: "3/4" }} />
                <div className="h-3 w-full bg-white/5 rounded mb-2" />
                <div className="h-3 w-3/4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory
                          md:grid md:grid-cols-3 md:justify-items-center
                          md:gap-3 md:pb-0 md:overflow-x-visible md:snap-none">
            {coaches.map((coach, i) => {
              const lastName   = coach.lastName  ?? "";
              const firstName  = coach.firstName ?? "";
              const fullName   = `${lastName} ${firstName}`.trim();
              const levelTags  = coach.levels ? coach.levels.split(", ").filter(Boolean) : [];
              const primaryLvl = levelTags[0] ?? "Дасгалжуулагч";

              return (
                <div
                  key={coach.id}
                  className={`group shrink-0 w-[220px] md:w-[250px] snap-start
                    transition-all duration-700 ease-out
                    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 80}ms` }}>

                  {/* Photo card */}
                  <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] mb-4"
                       style={{ aspectRatio: "3/4" }}>

                    {/* Photo */}
                    {coach.profileImage ? (
                      <img
                        src={coach.profileImage}
                        alt={fullName}
                        className="w-full h-full object-cover object-center
                                   group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl font-black text-white/10 select-none">
                          {lastName[0] ?? "?"}
                        </span>
                      </div>
                    )}

                    {/* Vertical category label — top left */}
                    <div className="absolute top-4 left-3 z-10">
                      <span
                        className="text-[11px] font-bold tracking-widest text-white/85 drop-shadow select-none"
                        style={{ writingMode: "vertical-rl" }}>
                        {primaryLvl}
                      </span>
                    </div>

                    {/* Diagonal wedge — creates slanted top-left edge on the white banner */}
                    <div
                      className="absolute bg-white pointer-events-none"
                      style={{
                        bottom: "56px",
                        left: 0,
                        width: "88px",
                        height: "28px",
                        clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                      }}
                    />

                    {/* White name banner */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-white
                                    flex items-center px-3 gap-3">
                      <div
                        className="w-8 h-8 bg-orange-500 shrink-0 flex items-center justify-center
                                   text-white font-black text-sm"
                        style={{ borderRadius: "4px" }}>
                        {i + 1}
                      </div>
                      <p className="text-gray-900 font-black text-base leading-tight truncate">
                        {fullName}
                      </p>
                    </div>
                  </div>

                  {/* Description below the card */}
                  <div className="px-0.5">
                    {levelTags.length > 0 && (
                      <p className="text-gray-500 text-[11px] font-medium mb-1">
                        {levelTags.join(" · ")}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Мэргэжлийн дасгалжуулагч. Тамирчин бүрийн ур чадвар,
                      сонирхлыг хөгжүүлж өрсөлдөх чадвартай болгоход зориулан ажилладаг.
                      {coach.memberCount > 0 && ` ${coach.memberCount} гишүүнийг удирдаж байна.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

/* ═══ 5. Achievements ═══════════════════════════════════════════════════════ */
function AchievementsSection() {
  const [ref, visible] = useInView();

  return (
    <section ref={ref} className="bg-[#0d0d0d] border-y border-white/5 py-28">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className={`mb-20 transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Label>Амжилтууд</Label>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
            Бидний хүрсэн<br /><span className="text-orange-500">амжилтууд</span>
          </h2>
        </div>

        {/* ── Mobile: left-rail layout ── */}
        <div className="md:hidden relative pl-8">
          <div className="tl-line absolute left-3 top-0 w-px"
               style={{
                 bottom: "1.5rem",
                 maskImage: "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
                 WebkitMaskImage: "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
               }} />
          <div className="tl-arrow absolute left-[10px] bottom-0 -translate-x-1/2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 10 10">
              <polygon points="5,10 0,0 10,0" />
            </svg>
          </div>

          {achievements.map((a, i) => (
            <div
              key={i}
              className={`relative mb-7 transition-all duration-700 ease-out
                ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
              style={{ transitionDelay: `${i * 130}ms` }}>
              {/* Dot on rail */}
              <div className="absolute -left-5 top-[18px] w-2.5 h-2.5 rounded-full bg-orange-500
                              shadow-[0_0_0_3px_rgba(249,115,22,0.25)] z-10" />
              {/* Year above card */}
              <p className="tl-year text-[1.8rem] font-black leading-none tabular-nums mb-2
                            select-none pointer-events-none">
                {a.year}
              </p>
              {/* Card full width */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5
                                  flex items-center justify-center shrink-0 text-orange-400">
                    <a.Icon />
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug">{a.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop: center alternating zigzag ── */}
        <div className="hidden md:block relative">
          <div
            className="tl-line absolute left-1/2 -translate-x-1/2 top-0 w-px"
            style={{
              bottom: "2rem",
              maskImage: "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
            }}
          />
          <div className="tl-arrow absolute left-1/2 bottom-0 -translate-x-1/2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 10 10">
              <polygon points="5,10 0,0 10,0" />
            </svg>
          </div>

          {achievements.map((a, i) => {
            const isLeft = i % 2 === 0;
            const card = (
              <div className="bg-[#111] border border-white/10 rounded-2xl p-5 w-full max-w-[280px]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5
                                  flex items-center justify-center shrink-0 text-orange-400">
                    <a.Icon />
                  </div>
                  <div className="flex items-center min-h-[40px]">
                    <p className="text-white font-bold text-sm leading-snug">{a.title}</p>
                  </div>
                </div>
              </div>
            );
            const yearLabel = (
              <p className="tl-year text-[3.5rem] font-black leading-none
                            tabular-nums select-none pointer-events-none">
                {a.year}
              </p>
            );

            return (
              <div
                key={i}
                className={`relative flex items-center mb-10 transition-all duration-700 ease-out
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 130}ms` }}>
                <div className={`w-1/2 pr-8 flex ${isLeft ? "justify-end" : "justify-end items-center"}`}>
                  {isLeft ? card : yearLabel}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className="w-3 h-3 rounded-full bg-orange-500
                                  shadow-[0_0_0_4px_rgba(249,115,22,0.22)]" />
                </div>
                <div className={`w-1/2 pl-8 flex ${isLeft ? "items-center" : "justify-start"}`}>
                  {isLeft ? yearLabel : card}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ═══ 6. Gallery ════════════════════════════════════════════════════════════ */
function GallerySection() {
  const [ref, visible] = useInView(0.08);
  const [activeCat, setActiveCat]   = useState(0);
  const [activeIdx, setActiveIdx]   = useState(0);

  const categories = galleryLabels.map((label, ci) => ({
    label,
    photos: [0,1,2,3,4].map(pi => ({
      pos: `${((ci * 23 + pi * 37) % 70) + 15}% ${((ci * 17 + pi * 29) % 50) + 25}%`,
    })),
  }));

  const cat   = categories[activeCat];
  const total = cat.photos.length;
  const goTo  = (n) => setActiveIdx(((n % total) + total) % total);

  const fanParams = [
    { scale: 1,    tx: "0px",                    ry: 0,   zi: 5, op: 1,    shadow: "0 40px 100px rgba(0,0,0,0.7)" },
    { scale: 0.85, tx: "clamp(95px,24vw,270px)",  ry: -9,  zi: 4, op: 0.88, shadow: "0 14px 40px rgba(0,0,0,0.45)" },
    { scale: 0.70, tx: "clamp(160px,41vw,480px)", ry: -17, zi: 3, op: 0.6,  shadow: "0 8px 24px rgba(0,0,0,0.35)"  },
  ];

  return (
    <section ref={ref} className="py-28 overflow-hidden">
      <div className={`max-w-6xl mx-auto px-4 transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <Label>Галерей</Label>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
              Хөдөлгөөнт<br /><span className="text-orange-500">мөчүүд</span>
            </h2>
          </div>
        </div>

        {/* Category tabs — horizontal scroll on mobile */}
        <div className="flex flex-nowrap gap-2 mb-12 overflow-x-auto hide-scrollbar pb-1">
          {categories.map((c, i) => (
            <button key={i}
              onClick={() => { setActiveCat(i); setActiveIdx(0); }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300
                ${activeCat === i
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-transparent border-white/15 text-gray-500 hover:border-white/30 hover:text-white"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fan carousel */}
      <div className="relative flex items-center justify-center"
           style={{ height: "clamp(440px,58vw,680px)", perspective: "1600px" }}>
        {[-2, -1, 0, 1, 2].map(offset => {
          const photoIdx = ((activeIdx + offset) % total + total) % total;
          const photo    = cat.photos[photoIdx];
          const abs      = Math.abs(offset);
          const p        = fanParams[abs];
          const sign     = offset < 0 ? -1 : 1;

          return (
            <div
              key={`${activeCat}-${photoIdx}`}
              className="absolute rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-[#1a1a1a]"
              style={{
                width:  "clamp(240px,62vw,400px)",
                height: "clamp(320px,84vw,560px)",
                transform: `translateX(${sign > 0 ? p.tx : `calc(-1 * ${p.tx})`}) rotateY(${sign > 0 ? -p.ry : p.ry}deg) scale(${p.scale})`,
                zIndex:    p.zi,
                opacity:   p.op,
                boxShadow: p.shadow,
                transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)",
              }}
              onClick={() => offset !== 0 && goTo(activeIdx + offset)}>
              <img src={HISTORY_LEFT} alt=""
                   className="w-full h-full object-cover"
                   style={{ objectPosition: photo.pos }} />
              {abs > 0 && <div className="absolute inset-0 bg-black/25" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button onClick={() => goTo(activeIdx - 1)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center
                     text-white/50 hover:text-white hover:border-white/40 transition-all duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => goTo(activeIdx + 1)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center
                     text-white/50 hover:text-white hover:border-white/40 transition-all duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ═══ 7. Contact / Map ══════════════════════════════════════════════════════ */
const UB_CENTER = [47.9184676, 106.9177016];

function ContactSection() {
  const [ref, visible]   = useInView();
  const [halls, setHalls] = useState([]);
  const mapDivRef         = useRef(null);
  const leafletRef        = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/halls`)
      .then(r => r.json())
      .then(data => setHalls(Array.isArray(data) ? data : []))
      .catch(() => setHalls([]));
  }, []);

  useEffect(() => {
    if (!mapDivRef.current) return;
    if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
    delete mapDivRef.current._leaflet_id;

    const withCoords = halls.filter(
      h => h.lat != null && h.lng != null && String(h.lat).trim() !== "" && String(h.lng).trim() !== ""
    );
    const center = withCoords.length
      ? [
          withCoords.reduce((s, h) => s + Number(h.lat), 0) / withCoords.length,
          withCoords.reduce((s, h) => s + Number(h.lng), 0) / withCoords.length,
        ]
      : UB_CENTER;

    const map = L.map(mapDivRef.current, { center, zoom: withCoords.length ? 13 : 12,
                                            zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors", maxZoom: 19,
    }).addTo(map);

    withCoords.forEach(h => {
      const imgInner = h.image
        ? `<img src="${h.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px">🏛️</div>`;

      const icon = L.divIcon({
        html: `
          <div style="width:54px;height:64px;cursor:pointer;filter:drop-shadow(0 4px 12px rgba(0,0,0,.7))">
            <div style="width:50px;height:50px;border-radius:50%;border:3px solid #f97316;
                        overflow:hidden;background:#1a1a1a;margin:0 auto">${imgInner}</div>
            <div style="width:0;height:0;border-left:9px solid transparent;
                        border-right:9px solid transparent;border-top:13px solid #f97316;
                        margin:0 auto"></div>
          </div>`,
        className: "", iconSize: [54, 64], iconAnchor: [27, 64], tooltipAnchor: [0, -68],
      });

      const addr = [h.district && `${h.district} дүүрэг`, h.subDistrict].filter(Boolean).join(", ");
      const tip = `
        <div style="background:#111;border:1px solid rgba(255,255,255,.12);border-radius:14px;
                    overflow:hidden;width:210px;box-shadow:0 12px 32px rgba(0,0,0,.8)">
          ${h.image
            ? `<img src="${h.image}" style="width:100%;height:118px;object-fit:cover;display:block" />`
            : `<div style="height:60px;display:flex;align-items:center;justify-content:center;font-size:28px;background:#1a1a1a">🏛️</div>`}
          <div style="padding:11px 13px">
            <div style="color:#fff;font-weight:700;font-size:13px;line-height:1.3;margin-bottom:5px">${h.name}</div>
            ${addr   ? `<div style="color:#9ca3af;font-size:11px;margin-bottom:3px">📍 ${addr}</div>` : ""}
            ${h.phone ? `<div style="color:#9ca3af;font-size:11px;margin-bottom:6px">📞 ${h.phone}</div>` : ""}
            ${h.mapUrl
              ? `<a href="${h.mapUrl}" target="_blank"
                    style="color:#f97316;font-size:11px;font-weight:600;text-decoration:none">
                   Газрын зураг харах →</a>`
              : ""}
          </div>
        </div>`;

      L.marker([Number(h.lat), Number(h.lng)], { icon })
        .addTo(map)
        .bindTooltip(tip, { permanent: false, direction: "top", className: "hall-tip", opacity: 1 });
    });

    leafletRef.current = map;
    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
      if (mapDivRef.current) delete mapDivRef.current._leaflet_id;
    };
  }, [halls]);

  return (
    <section ref={ref} className="py-28">
      <style>{`
        .hall-tip { background:transparent!important; border:none!important;
                    box-shadow:none!important; padding:0!important; }
        .hall-tip::before { display:none!important; }
        .leaflet-container { background:#0d0d0d!important; }
        .leaflet-tile { filter:brightness(.85) saturate(.7) hue-rotate(180deg) invert(1); }
      `}</style>

      <div className="max-w-6xl mx-auto px-4">
        <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12
          transition-all duration-600 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <Label>Байршил</Label>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
              Бидийг<br /><span className="text-orange-500">олоорой</span>
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs mt-4 sm:mt-0 leading-relaxed">
            Заал дээр хулганаа аваачихад дэлгэрэнгүй мэдээлэл харагдана
          </p>
        </div>

        {/* Map */}
        <div className={`rounded-2xl overflow-hidden border border-white/8 mb-4
          transition-all duration-700 ease-out
          ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[.98]"}`}>
          <div ref={mapDivRef} style={{ height: 480, width: "100%", background: "#0d0d0d" }} />
        </div>

        {/* Warning: halls without coords */}
        {halls.filter(h => !h.lat || !h.lng).length > 0 && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">⚠️</span>
            <p className="text-amber-300 text-xs leading-relaxed">
              <span className="font-semibold">Газрын зурагт харагдахгүй заалнууд:</span>{" "}
              {halls.filter(h => !h.lat || !h.lng).map(h => h.name).join(", ")}.{" "}
              Админ хэсгээс заалны Google Maps холбоосоор координатыг нэмнэ үү.
            </p>
          </div>
        )}

        {/* Hall cards */}
        {halls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {halls.map((h, i) => (
              <div key={h.id}
                className={`group bg-[#111111] rounded-2xl border border-white/5 overflow-hidden
                  hover:border-orange-500/30 transition-all duration-300
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="h-36 bg-[#1a1a1a] overflow-hidden">
                  {h.image
                    ? <img src={h.image} alt={h.name}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">🏛️</div>}
                </div>
                <div className="p-4">
                  <p className="text-white font-bold text-sm">{h.name}</p>
                  {(h.district || h.subDistrict) && (
                    <p className="text-gray-500 text-xs mt-1">
                      📍 {[h.district && `${h.district} дүүрэг`, h.subDistrict].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {h.phone && (
                    <a href={`tel:${h.phone}`}
                       className="text-gray-500 text-xs mt-1 block hover:text-gray-300 transition">
                      📞 {h.phone}
                    </a>
                  )}
                  {h.mapUrl && (
                    <a href={h.mapUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg
                                 bg-orange-500/10 border border-orange-500/20 text-orange-400
                                 text-xs font-semibold hover:bg-orange-500/20 transition">
                      Газрын зураг →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "📍", label: "Хаяг",          value: "Улаанбаатар, Чингэлтэй дүүрэг" },
              { icon: "📞", label: "Утас",           value: "9911-2233" },
              { icon: "✉️", label: "Имэйл",          value: "info@volleyball.mn" },
              { icon: "⏰", label: "Цагийн хуваарь", value: "Даваа–Бямба 09:00–21:00" },
            ].map(item => (
              <div key={item.label}
                className="bg-[#111111] rounded-2xl border border-white/5 p-5 flex items-start gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-white text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══ Main ══════════════════════════════════════════════════════════════════ */
export default function About() {
  return (
    <div className="bg-[#0a0a0a] overflow-x-hidden">
      <HeroSection />
      <HistorySection />
      <MissionSection />
      <CoachesSection />
      <AchievementsSection />
      <GallerySection />
      <ContactSection />
    </div>
  );
}
