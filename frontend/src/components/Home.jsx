import React from "react";
import { Link } from "react-router-dom";

const CARD_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQssg52k8b3SDmGgYDqZeDNPybl5zLDXDQt6g&s";
const HERO_BG_IMAGE = "https://4kwallpapers.com/images/walls/thumbs_2t/14062.png";

const EnrollIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const features = [
  {
    icon: <EnrollIcon />,
    title: "Онлайн элсэлт",
    desc: "Элсэлтийн маягтыг бөглөж клубт онлайнаар хүсэлт илгээнэ.",
  },
  {
    icon: <CalendarIcon />,
    title: "Тренингийн хуваарь",
    desc: "Дасгалжуулагч, цаг, байршлын мэдээллийг дэлгэрэнгүй харна.",
  },
  {
    icon: <ChartIcon />,
    title: "Ирцийн бүртгэл",
    desc: "Ирцийн түүх болон гүйцэтгэлийн статистикаа хянана.",
  },
  {
    icon: <CardIcon />,
    title: "Онлайн төлбөр",
    desc: "QPay, SocialPay-ээр гишүүнчлэлийн хураамжаа төлнө.",
  },
];

const stats = [
  { value: "150+", label: "Гишүүд" },
  { value: "5", label: "Дасгалжуулагч" },
  { value: "6", label: "Бүлэг" },
  { value: "3+", label: "Жилийн туршлага" },
];

const benefits = [
  {
    emoji: "",
    title: "Мэргэжлийн сургалт",
    desc: "Олон жилийн туршлагатай дасгалжуулагч нарын удирдлага дор системтэй хичээллэнэ.",
  },
  {
    emoji: "",
    title: "Баг хамт олон",
    desc: "Ижил сонирхолтой хүмүүстэй танилцаж, найрсаг орчинд хөгжинө.",
  },
  {
    emoji: "",
    title: "Дэвшлийн хяналт",
    desc: "Ирц, гүйцэтгэлийн статистикаар өөрийн ахиц дэвшлийг хянана.",
  },
];

function Home({ user }) {
  return (
    <div className="bg-[#0a0a0a]">

      {/* HERO */}
      <section className="relative overflow-hidden">
        {HERO_BG_IMAGE && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10
                               rounded-full text-sm text-orange-400 mb-8">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Шилдэг волейболын клуб
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Волейболоор дамжуулан
                <span className="text-orange-500"> эрүүл амьдралыг</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                Мэргэжлийн дасгалжуулагч нарын удирдлага дор волейболын ур чадвараа
                хөгжүүлж, баг хамт олонтойгоо хамт өсөн дэвжээрэй.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {user ? (
                  <Link to="/enrollment"
                    className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-full
                               hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25
                               transition-all duration-300">
                    Элсэлтийн хүсэлт илгээх
                  </Link>
                ) : (
                  <Link to="/register"
                    className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-full
                               hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25
                               transition-all duration-300">
                    Бүртгүүлэх
                  </Link>
                )}
                <Link to="/schedule"
                  className="group flex items-center gap-3 px-6 py-3.5 text-white font-medium
                             hover:text-orange-400 transition-all">
                  <span className="w-11 h-11 border border-white/20 rounded-full flex items-center justify-center
                                   group-hover:border-orange-500 transition-all">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.8L16 10l-9.7 7.2V2.8z" />
                    </svg>
                  </span>
                  Хуваарь харах
                </Link>
              </div>
            </div>

            {/* Right: decorative card */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-orange-500 rounded-3xl transform rotate-3 opacity-80" />
                <div className="relative bg-[#1a1a1a] rounded-3xl border border-white/10
                                w-80 h-96 flex flex-col overflow-hidden">
                  {CARD_IMAGE && (
                    <img
                      src={CARD_IMAGE}
                      alt="Волейбол клуб"
                      className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-3xl" />
                  <div className="relative mt-auto p-6">
                   
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-orange-500">{s.value}</p>
                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Системийн <span className="text-orange-500">боломжууд</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Бүх үйл ажиллагааг нэг дороос удирдах боломжтой
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i}
                className="group bg-[#151515] p-6 rounded-2xl border border-white/5
                           hover:border-orange-500/30 hover:bg-[#1a1a1a]
                           transition-all duration-300">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl
                                flex items-center justify-center mb-5
                                group-hover:bg-orange-500/20 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Яагаад <span className="text-orange-500">бидэн рүү</span> нэгдэх вэ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-5xl mb-4">{b.emoji}</div>
                <h3 className="text-white font-bold text-xl mb-3">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-10 md:p-14
                            overflow-hidden text-center">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Манай клубт нэгдэх үү?
                </h2>
                <p className="text-orange-100 mb-8 text-lg max-w-xl mx-auto">
                  Бүртгүүлж, элсэлтийн хүсэлтээ илгээгээд манай баг хамт олонд нэгдээрэй.
                </p>
                <Link to="/register"
                  className="inline-block px-10 py-4 bg-white text-orange-600 font-bold text-lg
                             rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Одоо бүртгүүлэх
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default Home;
