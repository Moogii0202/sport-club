import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const API_BASE = `http://${window.location.hostname}:4000/api`;

const CLUB_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQssg52k8b3SDmGgYDqZeDNPybl5zLDXDQt6g&s";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const stats = [
  { value: "150+", label: "Гишүүд" },
  { value: "5", label: "Дасгалжуулагч" },
  { value: "6", label: "Бүлэг" },
  { value: "3+", label: "Жилийн туршлага" },
];

const coaches = [
  { name: "Б. Бат-Эрдэнэ", role: "Ахлах дасгалжуулагч", exp: "12 жил", specialty: "Довтолгоо", initial: "Б" },
  { name: "Д. Сарантуяа", role: "Дасгалжуулагч", exp: "8 жил", specialty: "Хамгаалалт", initial: "С" },
  { name: "Г. Тэмүүлэн", role: "Дасгалжуулагч", exp: "6 жил", specialty: "Серв, хүлээн авалт", initial: "Т" },
];

const achievements = [
  { year: "2024", title: "Улсын аварга шалгаруулалт — 2-р байр", icon: "🥈" },
  { year: "2023", title: "Нийслэлийн лиг — 1-р байр", icon: "🥇" },
  { year: "2023", title: "Шилдэг залуу баг — тусгай шагнал", icon: "🏅" },
  { year: "2022", title: "Клуб байгуулагдан анхны тэмцээн", icon: "🏐" },
];

const testimonials = [
  {
    name: "Э. Номин",
    role: "Гишүүн · 2 жил",
    quote: "Анхан шатнаас эхэлж одоо дунд бүлэгт хүрлээ. Дасгалжуулагч маш тусч, орчин нь найрсаг.",
    initial: "Н",
  },
  {
    name: "Д. Баярсайхан",
    role: "Гишүүн · 1.5 жил",
    quote: "Хуваарь нь тохиромжтой, онлайн системээр бүгдийг шийддэг болсон нь маш хялбар болсон.",
    initial: "Б",
  },
  {
    name: "О. Сувдаа",
    role: "Гишүүн · 3 жил",
    quote: "Баг хамт олон маань хамгийн сайн зүйл. Тэмцээнд хамт оролцдог болохоор урам зориг өндөр.",
    initial: "С",
  },
];

const galleryLabels = [
  "Тэмцээн 2024",
  "Дасгал хичээл",
  "Баг хамт олон",
  "Шагналын ёслол",
  "Улсын лиг",
  "Галерей",
];

/* ─── 1. Түүх ─── */
function HistorySection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-20 max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Зураг */}
        <div
          className={`relative transition-all duration-700 ease-out
            ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
        >
          <div className="absolute -inset-3 bg-orange-500/20 rounded-3xl -rotate-2" />
          <div className="relative rounded-3xl overflow-hidden h-80 lg:h-96">
            <img src={CLUB_IMAGE} alt="Клубийн түүх" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <span className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-full">
                2022 оноос хойш
              </span>
            </div>
          </div>
        </div>

        {/* Текст */}
        <div
          className={`transition-all duration-700 delay-150 ease-out
            ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
        >
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Клубийн түүх
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-snug">
            Волейболд хайртай хүмүүсийн <span className="text-orange-500">нэгдэл</span>
          </h2>
          <div className="space-y-4 text-gray-400 leading-relaxed">
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
          <div className="mt-8 flex gap-6">
            {[["2022", "Байгуулагдсан"], ["150+", "Гишүүд"], ["6", "Бүлэг"]].map(([v, l], i) => (
              <React.Fragment key={l}>
                {i > 0 && <div className="w-px bg-white/10" />}
                <div>
                  <p className="text-2xl font-extrabold text-orange-500">{v}</p>
                  <p className="text-gray-500 text-sm">{l}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 2. Эрхэм зорилго ─── */
function MissionSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-20 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Текст */}
          <div
            className={`transition-all duration-700 ease-out
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
          >
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
              Эрхэм зорилго
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-8 leading-snug">
              Бид юуг зорьж <span className="text-orange-500">ажилладаг вэ?</span>
            </h2>
            <ul className="space-y-5">
              {[
                { icon: "", title: "Системтэй хөгжил", desc: "Тамирчин бүрийн түвшинд тохирсон хөтөлбөрөөр ур чадварыг хөгжүүлнэ." },
                { icon: "", title: "Багийн соёл", desc: "Хүндэтгэл, хамтын ажиллагаа дээр суурилсан эерэг орчин бүрдүүлнэ." },
                { icon: "", title: "Тэмцээний амжилт", desc: "Улсын болон олон улсын тэмцээнд өрсөлдөх чадвартай баг бэлтгэнэ." },
                { icon: "", title: "Эрүүл амьдрал", desc: "Спортоор дамжуулан идэвхтэй, эрүүл амьдралын хэвшлийг дэмжинэ." },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Тоон хүснэгт */}
          <div
            className={`transition-all duration-700 delay-200 ease-out
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            <div className="bg-[#151515] rounded-3xl border border-white/5 p-8 grid grid-cols-2 gap-5">
              {[
                { label: "Долоо хоног бүр", value: "6 өдөр", sub: "хичээллэдэг" },
                { label: "Нийт хичээл", value: "200+", sub: "жилд" },
                { label: "Гишүүдийн үнэлгээ", value: "4.9 ★", sub: "5-аас" },
                { label: "Үлдэж байгаа", value: "98%", sub: "гишүүд" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 text-center"
                >
                  <p className="text-2xl font-extrabold text-orange-500">{item.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.sub}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Статистик ─── */
function StatsSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="border-y border-white/10 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-500 ease-out
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="text-4xl md:text-5xl font-extrabold text-orange-500">{s.value}</p>
              <p className="text-gray-500 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Дасгалжуулагч нар ─── */
function CoachesSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`text-center mb-14 transition-all duration-600 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Баг</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Дасгалжуулагч <span className="text-orange-500">нар</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
            Олон жилийн туршлагатай мэргэжлийн багш нарын удирдлага дор хичээллэнэ
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coaches.map((c, i) => (
            <div
              key={i}
              className={`group bg-[#151515] rounded-2xl border border-white/5 p-7
                hover:border-orange-500/30 transition-all duration-300
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${100 + i * 120}ms`, transitionDuration: "600ms" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700
                              rounded-full flex items-center justify-center
                              text-white text-xl font-bold shrink-0
                              group-hover:scale-105 transition-transform duration-300"
                >
                  {c.initial}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{c.name}</h3>
                  <p className="text-orange-400 text-sm">{c.role}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-full">
                  {c.exp}
                </span>
                <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs rounded-full">
                  {c.specialty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. Амжилт / Шагнал ─── */
function AchievementsSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-20 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Текст */}
          <div
            className={`transition-all duration-700 ease-out
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
          >
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
              Амжилтууд
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-snug">
              Бидний хүрсэн <span className="text-orange-500">амжилтууд</span>
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Богино хугацаанд олон тэмцээнд амжилттай оролцож, хамт олны хүчин чармайлтын
              үр дүнг харуулж чадсан.
            </p>
            <div className="mt-8 w-20 h-1 bg-orange-500 rounded-full" />
          </div>

          {/* Timeline */}
          <div
            className={`space-y-4 transition-all duration-700 delay-200 ease-out
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            {achievements.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-5 bg-[#151515] border border-white/5
                           hover:border-orange-500/30 rounded-2xl p-5 transition-all duration-300"
              >
                <span className="text-3xl shrink-0">{a.icon}</span>
                <p className="text-white font-semibold flex-1">{a.title}</p>
                <span className="text-orange-500 font-bold text-sm shrink-0">{a.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. Гишүүдийн сэтгэгдэл ─── */
function TestimonialsSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`text-center mb-14 transition-all duration-600 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Сэтгэгдэл
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Гишүүдийн <span className="text-orange-500">үг</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`bg-[#151515] rounded-2xl border border-white/5 p-6
                hover:border-orange-500/20 transition-all duration-300
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${100 + i * 120}ms`, transitionDuration: "600ms" }}
            >
              <div className="text-orange-500 text-4xl leading-none mb-4 font-serif">"</div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700
                              rounded-full flex items-center justify-center
                              text-white font-bold text-sm shrink-0"
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-600 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 7. Галерей ─── */
function GallerySection() {
  const [ref, visible] = useInView(0.08);
  return (
    <section ref={ref} className="py-20 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`text-center mb-12 transition-all duration-600 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Галерей
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Хөдөлгөөнт <span className="text-orange-500">мөчүүд</span>
          </h2>
        </div>

        <div
          className={`grid grid-cols-3 grid-rows-2 gap-3 h-72 md:h-[420px]
            transition-all duration-700 ease-out
            ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          {/* Том нүд */}
          <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src={CLUB_IMAGE}
              alt={galleryLabels[0]}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute bottom-4 left-4 text-white text-sm font-semibold">
              {galleryLabels[0]}
            </span>
          </div>

          {/* Жижиг нүднүүд */}
          {galleryLabels.slice(1).map((label, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img
                src={CLUB_IMAGE}
                alt={label}
                className="w-full h-full object-cover opacity-50
                           group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                style={{ objectPosition: `${20 + i * 15}% center` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-2 left-2 text-white text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 8. Байршил — Бидийг олоорой ─── */
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

  // Map init / re-init whenever halls change
  useEffect(() => {
    if (!mapDivRef.current) return;

    // Destroy previous map instance
    if (leafletRef.current) {
      leafletRef.current.remove();
      leafletRef.current = null;
    }
    // Leaflet stores _leaflet_id on the DOM element; must clear it before re-init
    // otherwise "Map container is already initialized" error fires silently
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

    const map = L.map(mapDivRef.current, {
      center,
      zoom: withCoords.length ? 13 : 12,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark-tinted OpenStreetMap tile
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    withCoords.forEach(h => {
      const imgInner = h.image
        ? `<img src="${h.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px">🏛️</div>`;

      // Custom pin: circular photo + orange triangle tail
      const icon = L.divIcon({
        html: `
          <div style="width:54px;height:64px;cursor:pointer;filter:drop-shadow(0 4px 12px rgba(0,0,0,.7))">
            <div style="width:50px;height:50px;border-radius:50%;border:3px solid #f97316;
                        overflow:hidden;background:#1a1a1a;margin:0 auto">
              ${imgInner}
            </div>
            <div style="width:0;height:0;border-left:9px solid transparent;
                        border-right:9px solid transparent;border-top:13px solid #f97316;
                        margin:0 auto"></div>
          </div>`,
        className: "",
        iconSize:   [54, 64],
        iconAnchor: [27, 64],
        tooltipAnchor: [0, -68],
      });

      // Hover tooltip — dark card with hall image
      const addr = [h.district && `${h.district} дүүрэг`, h.subDistrict].filter(Boolean).join(", ");
      const tip = `
        <div style="background:#111;border:1px solid rgba(255,255,255,.12);border-radius:14px;
                    overflow:hidden;width:210px;box-shadow:0 12px 32px rgba(0,0,0,.8)">
          ${h.image
            ? `<img src="${h.image}" style="width:100%;height:118px;object-fit:cover;display:block" />`
            : `<div style="height:60px;display:flex;align-items:center;justify-content:center;font-size:28px;background:#1a1a1a">🏛️</div>`}
          <div style="padding:11px 13px">
            <div style="color:#fff;font-weight:700;font-size:13px;line-height:1.3;margin-bottom:5px">${h.name}</div>
            ${addr  ? `<div style="color:#9ca3af;font-size:11px;margin-bottom:3px">📍 ${addr}</div>` : ""}
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
        .bindTooltip(tip, {
          permanent:  false,
          direction:  "top",
          className:  "hall-tip",
          opacity:    1,
        });
    });

    leafletRef.current = map;
    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
      if (mapDivRef.current) delete mapDivRef.current._leaflet_id;
    };
  }, [halls]);

  return (
    <section ref={ref} className="py-20">
      {/* Leaflet tooltip override */}
      <style>{`
        .hall-tip { background:transparent!important; border:none!important;
                    box-shadow:none!important; padding:0!important; }
        .hall-tip::before { display:none!important; }
        .leaflet-container { background:#0d0d0d!important; }
        .leaflet-tile { filter:brightness(.85) saturate(.7) hue-rotate(180deg) invert(1); }
      `}</style>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-600 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Байршил</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Бидийг <span className="text-orange-500">олоорой</span>
          </h2>
          <p className="text-gray-500 mt-3 text-sm">
            Заал дээр хулганаа аваачихад дэлгэрэнгүй мэдээлэл харагдана
          </p>
        </div>

        {/* Leaflet map */}
        <div className={`rounded-2xl overflow-hidden border border-white/10 mb-4
            transition-all duration-700 ease-out
            ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[.98]"}`}>
          <div ref={mapDivRef} style={{ height: 480, width: "100%", background: "#0d0d0d" }} />
        </div>

        {/* Halls without coordinates warning */}
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

        {/* Cards row */}
        {halls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {halls.map((h, i) => (
              <div key={h.id}
                className={`bg-[#151515] rounded-2xl border border-white/5 overflow-hidden
                  hover:border-orange-500/30 transition-all duration-300
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${i * 70}ms` }}>
                {/* Thumbnail */}
                <div className="h-36 bg-[#1a1a1a] overflow-hidden">
                  {h.image
                    ? <img src={h.image} alt={h.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">🏛️</div>}
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-white font-bold text-sm">{h.name}</p>
                  {(h.district || h.subDistrict) && (
                    <p className="text-gray-500 text-xs mt-1">
                      📍 {[h.district && `${h.district} дүүрэг`, h.subDistrict].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {h.phone && (
                    <a href={`tel:${h.phone}`} className="text-gray-500 text-xs mt-1 block hover:text-gray-300 transition">
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
          /* Fallback if no halls */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "📍", label: "Хаяг", value: "Улаанбаатар, Чингэлтэй дүүрэг" },
              { icon: "📞", label: "Утас", value: "9911-2233" },
              { icon: "✉️", label: "Имэйл", value: "info@volleyball.mn" },
              { icon: "⏰", label: "Цагийн хуваарь", value: "Даваа–Бямба 09:00–21:00" },
            ].map(item => (
              <div key={item.label}
                className="bg-[#151515] rounded-2xl border border-white/5 p-5 flex items-start gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">{item.label}</p>
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

/* ─── Main ─── */
function About() {
  return (
    <div className="bg-[#0a0a0a] overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d0d0d] border-b border-white/10 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/8 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10
                           rounded-full text-sm text-orange-400 mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Volleyball Club
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Бидний <span className="text-orange-500">тухай</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Монголын волейболыг хөгжүүлж, мэргэжлийн тамирчид бэлтгэхэд зориулсан клуб
          </p>
        </div>
      </section>

      <HistorySection />
      <MissionSection />
      <StatsSection />
      <CoachesSection />
      <AchievementsSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
    </div>
  );
}

export default About;
