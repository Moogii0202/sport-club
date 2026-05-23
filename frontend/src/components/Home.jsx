import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── images ─────────────────────────────────────────────────────────────── */
const HERO_BG = "https://4kwallpapers.com/images/walls/thumbs_2t/14062.png";
const IMG_A   = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQssg52k8b3SDmGgYDqZeDNPybl5zLDXDQt6g&s";
const IMG_B   = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80";

/* ─── level palette ──────────────────────────────────────────────────────── */

/* ─── static data ────────────────────────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Онлайн элсэлт",
    desc: "Элсэлтийн маягт бөглөж клубт онлайнаар хүсэлт илгээнэ.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Тренингийн хуваарь",
    desc: "Дасгалжуулагч, цаг, байршлын мэдээллийг дэлгэрэнгүй харна.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Ирцийн бүртгэл",
    desc: "Ирцийн түүх болон гүйцэтгэлийн статистикаа хянана.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Онлайн төлбөр",
    desc: "QPay, SocialPay-ээр гишүүнчлэлийн хураамжаа төлнө.",
  },
];
const checks = [
  "Мэргэжлийн дасгалжуулагч нарын удирдлага",
  "Ирц, гүйцэтгэлийн статистик хяналт",
  "Онлайн бүртгэл, хуваарь, төлбөр",
];

/* ─── hooks ──────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref    = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, seen];
}


/* ─── small components ───────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

/* ─── animated fade-up wrapper ───────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, seen] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}
        ${seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════════════════════ */
export default function Home({ user }) {
  /* hero mount animation */
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* section in-view refs */
  const [aboutRef, aboutIn] = useInView(0.15);
  const [featRef,  featIn]  = useInView(0.1);
  const [ctaRef,   ctaIn]   = useInView(0.2);

  return (
    <div className="bg-[#0a0a0a]">

      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* parallax bg — subtle scale on load */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1800ms] ease-out"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            transform: heroIn ? "scale(1)" : "scale(1.06)",
          }}
        />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 py-28 w-full">
          <div className="hero-text max-w-2xl">

            {/* badge */}
            <div className={`transition-all duration-700 ease-out
              ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0ms" }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/8 border border-white/15
                               rounded-full text-xs font-semibold text-orange-400 mb-8 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                Шилдэг волейболын клуб
              </span>
            </div>

            {/* h1 */}
            <div className={`transition-all duration-700 ease-out
              ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "120ms" }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 uppercase tracking-tight">
                Волейболоор<br />
                дамжуулан<br />
                <span className="text-orange-500">өсөн дэвж</span>
              </h1>
            </div>

            {/* body */}
            <div className={`transition-all duration-700 ease-out
              ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "240ms" }}>
              <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed max-w-md">
                Мэргэжлийн дасгалжуулагч нарын удирдлага дор ур чадвараа
                хөгжүүлж, баг хамт олонтойгоо хамт тэмцэнэ.
              </p>
            </div>

            {/* buttons */}
            <div className={`transition-all duration-700 ease-out
              ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "360ms" }}>
              <div className="flex flex-wrap items-center gap-4">
                {user ? (
                  <Link
                    to="/enrollment"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white
                               font-bold rounded-full hover:bg-orange-600
                               hover:shadow-xl hover:shadow-orange-500/30
                               hover:gap-3 transition-all duration-300 uppercase tracking-wide text-sm">
                    Элсэх хүсэлт
                    <ArrowIcon />
                  </Link>
                ) : (
                  <a href="#about"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white
                               font-bold rounded-full hover:bg-orange-600
                               hover:shadow-xl hover:shadow-orange-500/30
                               hover:gap-3 transition-all duration-300 uppercase tracking-wide text-sm">
                    Бидний тухай
                    <ArrowIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* scroll hint — floating */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1
          transition-all duration-1000 ease-out
          ${heroIn ? "opacity-40" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "800ms" }}>
          <span className="text-white text-[10px] uppercase tracking-widest">Доош</span>
          <div className="w-px h-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-white animate-scroll-line" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ABOUT — split layout
      ════════════════════════════════════════════════════ */}
      <section id="about" ref={aboutRef} className="bg-[#111111] py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: images — slide from left */}
            <div className={`relative grid grid-cols-2 gap-4 transition-all duration-800 ease-out
              ${aboutIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
              style={{ transitionDelay: "0ms" }}>
              <div className="col-span-2 relative rounded-2xl overflow-hidden h-64 group">
                <img src={IMG_A} alt="Волейбол"
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* shimmer overlay */}
                <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 bg-[#111111]/90 backdrop-blur-sm
                                border border-white/10 rounded-xl px-4 py-2">
                  <p className="text-3xl font-black text-orange-500">150+</p>
                  <p className="text-white text-xs uppercase tracking-wider">Гишүүд</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-44 group">
                <img src={IMG_B} alt="Тренинг"
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     onError={e => { e.target.style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 to-orange-900/80
                                flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-black text-white">5</p>
                    <p className="text-orange-200 text-xs uppercase tracking-wider mt-1">Дасгалжуулагч</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-44 bg-[#1a1a1a] border border-white/5
                              flex items-center justify-center animate-float">
                <div className="text-center p-4">
                  <p className="text-4xl font-black text-white">3+</p>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Жилийн туршлага</p>
                  <div className="mt-3 flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: text — slide from right */}
            <div className={`transition-all duration-800 ease-out
              ${aboutIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
              style={{ transitionDelay: "150ms" }}>
              <span className="inline-block px-3 py-1 border border-orange-500/30 text-orange-400
                               text-xs font-semibold rounded-full uppercase tracking-widest mb-6">
                Бидний тухай
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6 uppercase">
                Манай клубт<br />
                <span className="text-orange-500">нэгдэж өсөн</span><br />
                дэвжих боломж
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Мэргэжлийн дасгалжуулагч нарын удирдлага дор волейболын ур чадвараа
                хөгжүүлж, баг хамт олонтойгоо хамт өсөн дэвжих боломжийг олгоно.
              </p>
              <ul className="space-y-3 mb-10">
                {checks.map((c, i) => (
                  <li key={i}
                    className={`flex items-center gap-3 text-gray-300 text-sm
                      transition-all duration-500 ease-out
                      ${aboutIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                    style={{ transitionDelay: `${300 + i * 100}ms` }}>
                    <span className="w-6 h-6 bg-orange-500/15 border border-orange-500/30
                                     rounded-full flex items-center justify-center text-orange-400 shrink-0">
                      <CheckIcon />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
              <Link to={user ? "/enrollment" : "/register"}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white
                           font-bold rounded-full hover:bg-orange-600
                           hover:shadow-lg hover:shadow-orange-500/25 hover:gap-3
                           transition-all duration-300 text-sm uppercase tracking-wide">
                Эхлэх
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════ */}
      <section ref={featRef} className="py-24 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <span className="inline-block px-3 py-1 border border-white/10 text-gray-400
                             text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
              Боломжууд
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase">
              Бүх үйл ажиллагааг<br />
              <span className="text-orange-500">нэг дороос</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {features.map((f, i) => (
              <div key={i}
                className={`group bg-[#111111] p-8 hover:bg-[#161616] transition-all duration-500 relative
                  ${featIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                {/* top line reveal on hover */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 scale-x-0
                                group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                <div className="w-12 h-12 border border-white/10 text-white rounded-xl
                                flex items-center justify-center mb-6
                                group-hover:border-orange-500/40 group-hover:text-orange-400
                                group-hover:scale-110
                                transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════ */}
      {!user && (
        <section ref={ctaRef} className="relative overflow-hidden" style={{ minHeight: "480px" }}>
          {/* YouTube video background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: "177.78vh", minWidth: "100%", height: "56.25vw", minHeight: "100%" }}
              src="https://www.youtube.com/embed/IM_6kkCFigs?autoplay=1&mute=1&loop=1&playlist=IM_6kkCFigs&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&start=300"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title="bg"
            />
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/55" />

          {/* Content */}
          <div className={`relative text-center py-32 px-8 transition-all duration-800 ease-out
            ${ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className={`text-4xl md:text-5xl font-black text-white mb-4 uppercase
              transition-all duration-700 ease-out
              ${ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "150ms" }}>
              Манай клубт нэгдэх үү?
            </h2>
            <p className={`text-white/70 mb-10 text-lg max-w-xl mx-auto leading-relaxed
              transition-all duration-700 ease-out
              ${ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "250ms" }}>
              Бүртгүүлж, элсэлтийн хүсэлтээ илгээгээд
              манай баг хамт олонд нэгдээрэй.
            </p>
            <div className={`transition-all duration-700 ease-out
              ${ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "350ms" }}>
              <Link to="/register"
                className="inline-flex items-center gap-3 px-10 py-4 bg-orange-500 text-white
                           font-black text-base rounded-full uppercase tracking-wide
                           hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/30
                           hover:-translate-y-1 hover:gap-5 transition-all duration-300">
                Одоо бүртгүүлэх
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
