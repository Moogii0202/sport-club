import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

/* ── feeLabel helper ── */
const fmtFee = (fee) => fee ? `${Number(fee).toLocaleString()}₮ / сар` : "Үнэгүй";

const DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

function fmtDate(d) {
  if (!d) return null;
  // "YYYY-MM-DD" format
  const iso = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${parseInt(iso[1])} оны ${parseInt(iso[2])} сарын ${parseInt(iso[3])}`;
  // "Mon May 11 2026..." format
  const MN = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
  const full = d.match(/[A-Za-z]+ ([A-Za-z]{3}) (\d{1,2}) (\d{4})/);
  if (full && MN[full[1]]) return `${full[3]} оны ${MN[full[1]]} сарын ${parseInt(full[2])}`;
  return d;
}

const STEP_LABELS = ["Түвшин сонгох", "Хуваарь сонгох", "Баталгаажуулах", "Илгээх"];

/* ── Helpers ── */
const accentClasses = {
  orange: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30", dot: "bg-orange-500" },
  blue:   { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",   badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",     dot: "bg-blue-500" },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", dot: "bg-purple-500" },
  green:  { border: "border-green-500",  bg: "bg-green-500/10",  text: "text-green-400",  badge: "bg-green-500/20 text-green-300 border-green-500/30",   dot: "bg-green-500" },
  red:    { border: "border-red-500",    bg: "bg-red-500/10",    text: "text-red-400",    badge: "bg-red-500/20 text-red-300 border-red-500/30",         dot: "bg-red-500" },
  yellow: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", dot: "bg-yellow-500" },
  indigo: { border: "border-indigo-500", bg: "bg-indigo-500/10", text: "text-indigo-400", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", dot: "bg-indigo-500" },
  teal:   { border: "border-teal-500",   bg: "bg-teal-500/10",   text: "text-teal-400",   badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",     dot: "bg-teal-500" },
  pink:   { border: "border-pink-500",   bg: "bg-pink-500/10",   text: "text-pink-400",   badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",     dot: "bg-pink-500" },
};
const getAccent = (accent) => accentClasses[accent] || accentClasses.orange;

/* ── Step Indicator ── */
function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <React.Fragment key={num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                  ${done   ? "bg-green-500 border-green-500 text-white"
                  : active ? "bg-orange-500 border-orange-500 text-white"
                           : "bg-[#1a1a1a] border-white/20 text-gray-500"}`}
              >
                {done ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : num}
              </div>
              <span className={`text-xs mt-2 text-center leading-tight w-16
                ${active ? "text-white font-semibold" : done ? "text-green-400" : "text-gray-600"}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-12 md:w-20 mb-5 transition-all duration-300
                ${done ? "bg-green-500" : "bg-white/10"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Step 1: Түвшин сонгох ── */
function Step1({ levels, selected, onSelect, onNext }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Түвшин сонгох</h2>
      <p className="text-gray-500 text-sm mb-8">Өөрийн ур чадварт тохирсон бүлгийг сонгоно уу</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {levels.map((lv) => {
          const ac = getAccent(lv.accent);
          const active = selected === lv.name;
          return (
            <div
              key={lv.id}
              onClick={() => onSelect(lv.name)}
              className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200
                ${active ? `${ac.border} ${ac.bg}` : "border-white/10 bg-[#151515] hover:border-white/20"}`}
            >
              {active && (
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full ${ac.dot} flex items-center justify-center`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-4 ${ac.badge}`}>
                {lv.badge}
              </span>
              <h3 className="text-white font-bold text-xl mb-2">{lv.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{lv.description}</p>
              <ul className="space-y-2 mb-6">
                {lv.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className={`text-xl font-extrabold ${ac.text}`}>{fmtFee(lv.fee)}</div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full
                     hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          Үргэлжлүүлэх
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: Хуваарь сонгох (real DB data) ── */
function Step2({ levels, levelName, dbSlots, slotsLoading, selectedClassId, onSelectClass, onNext, onBack }) {
  const level      = levels.find((l) => l.name === levelName);
  const ac         = getAccent(level?.accent);
  const levelSlots = dbSlots.filter((s) => s.level === levelName);

  // Group by classId so multiple coaches for same level are distinct
  const classGroups = levelSlots.reduce((acc, s) => {
    if (!acc[s.classId]) acc[s.classId] = { classId: s.classId, coach: `${s.coachLastName}. ${s.coachFirstName}`, slots: [], fee: s.fee, maxCapacity: s.maxCapacity, enrolledCount: Number(s.enrolledCount), startDate: s.startDate || null, endDate: s.endDate || null };
    acc[s.classId].slots.push(s);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Хуваарь сонгох</h2>
      <p className="text-gray-500 text-sm mb-8">
        <span className={`font-medium ${ac.text}`}>{levelName}</span> — хуваарь сонгоно уу
      </p>

      {slotsLoading ? (
        <div className="text-center py-16 text-gray-600">
          <svg className="w-6 h-6 animate-spin mx-auto mb-3 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p className="text-sm">Уншиж байна...</p>
        </div>
      ) : levelSlots.length === 0 ? (
        <div className="text-center py-16 text-gray-600 border border-white/10 rounded-2xl bg-[#111111] mb-8">
          <p className="text-3xl mb-3">📅</p>
          <p className="text-sm font-medium text-gray-500">Одоогоор хуваарь нэмэгдээгүй байна</p>
          <p className="text-xs text-gray-600 mt-1">Дасгалжуулагч хуваарь оруулсны дараа энд харагдана</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {Object.values(classGroups).map((cg) => {
            const isSelected = selectedClassId === cg.classId;
            const spots      = cg.maxCapacity - cg.enrolledCount;
            const isFull     = spots <= 0;
            return (
              <button key={cg.classId} disabled={isFull}
                onClick={() => !isFull && onSelectClass(cg.classId)}
                className={`w-full text-left rounded-2xl border p-5 transition-all duration-200
                  ${isFull ? "border-white/5 bg-[#111111] opacity-50 cursor-not-allowed"
                  : isSelected ? `${ac.border} ${ac.bg} ring-2 ring-orange-500/40`
                  : "border-white/10 bg-[#151515] hover:border-white/20 cursor-pointer"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`font-bold text-sm ${isSelected ? ac.text : "text-white"}`}>{cg.coach}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{levelName}</p>
                    {(cg.startDate || cg.endDate) && (
                      <p className="text-gray-600 text-[11px] mt-1">
                        📅 {fmtDate(cg.startDate) || "—"} — {fmtDate(cg.endDate) || "—"}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${isFull ? "text-red-400" : "text-green-400"}`}>
                      {isFull ? "Дүүрсэн" : `${spots} байр үлдсэн`}
                    </p>
                    <p className={`text-base font-extrabold mt-0.5 ${ac.text}`}>
                      {(cg.fee || 0).toLocaleString()}₮/сар
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS.map((day) => {
                    const s = cg.slots.find(x => x.dayOfWeek === day);
                    return s ? (
                      <div key={day} className={`rounded-xl px-3 py-2 border ${isSelected ? ac.border : "border-white/10"} bg-black/20`}>
                        <p className={`text-[10px] font-bold uppercase ${isSelected ? ac.text : "text-gray-400"}`}>{day.slice(0, 2)}</p>
                        <p className="text-white text-xs font-semibold mt-0.5">{s.startTime}–{s.endTime}</p>
                        {s.location && <p className="text-gray-600 text-[10px] mt-0.5 truncate">📍{s.location}</p>}
                      </div>
                    ) : null;
                  })}
                </div>
                {isSelected && (
                  <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${ac.text}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Сонгогдсон
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack}
          className="px-6 py-3 border border-white/20 text-gray-400 font-medium rounded-full
                     hover:border-white/40 hover:text-white transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>
        <button onClick={onNext} disabled={!selectedClassId || levelSlots.length === 0}
          className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full
                     hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center gap-2">
          Үргэлжлүүлэх
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Баталгаажуулах + Илгээх ── */
function Step3({ levels, user, levelName, dbSlots, selectedClassId, notes, setNotes, onSubmit, onBack, loading, error }) {
  const level = levels.find((l) => l.name === levelName);
  const ac    = getAccent(level?.accent);
  const chosenSlots = dbSlots.filter((s) => s.classId === selectedClassId);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Мэдээлэл баталгаажуулах</h2>
      <p className="text-gray-500 text-sm mb-8">Мэдээллээ шалгаад хүсэлтээ илгээнэ үү</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: summary */}
        <div className="space-y-4">
          {/* Level summary */}
          <div className={`rounded-2xl border p-5 ${ac.border} ${ac.bg}`}>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Сонгосон түвшин</p>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-lg ${ac.text}`}>{level?.name}</p>
                <p className="text-gray-400 text-sm">{level?.description}</p>
              </div>
              <p className={`text-xl font-extrabold ${ac.text} shrink-0 ml-4`}>{fmtFee(level?.fee)}</p>
            </div>
          </div>

          {/* Schedule summary */}
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-5">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Сонгосон хуваарь</p>
            {chosenSlots[0]?.startDate && (
              <p className="text-gray-500 text-xs mb-3">
                📅 {fmtDate(chosenSlots[0].startDate)} — {fmtDate(chosenSlots[0].endDate) || "—"}
              </p>
            )}
            <div className="space-y-2">
              {chosenSlots.map((s) => (
                <div key={s.scheduleId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${ac.dot}`} />
                    <span className="text-white font-medium text-sm">{s.dayOfWeek}</span>
                    <span className="text-gray-500 text-sm">{s.startTime}–{s.endTime}</span>
                  </div>
                  <span className="text-gray-600 text-xs">{s.coachLastName}. {s.coachFirstName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-5">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Үнийн мэдээлэл</p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">{level?.name} · сарын хураамж</span>
              <span className="text-white font-semibold">{fmtFee(level?.fee)}</span>
            </div>
            <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-center">
              <span className="text-white font-bold">Нийт</span>
              <span className="text-orange-500 font-extrabold text-lg">{fmtFee(level?.fee)}</span>
            </div>
            <p className="text-gray-600 text-xs mt-2">Төлбөрийг QPay эсвэл SocialPay-ээр хийнэ</p>
          </div>
        </div>

        {/* Right: user info + notes / login CTA */}
        <div className="space-y-4">
          {!user ? (
            /* ── Нэвтрээгүй хэрэглэгчид login CTA ── */
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-8 flex flex-col items-center text-center h-full justify-center gap-5">
              <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-2">Хүсэлт илгээхийн тулд нэвтэрнэ үү</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Хувийн мэдээллээ бөглөж хүсэлт илгээхийн тулд эхлээд бүртгүүлж эсвэл нэвтрэх шаардлагатай.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Link to="/login"
                  className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-full text-center
                             hover:bg-orange-600 transition text-sm">
                  Нэвтрэх
                </Link>
                <Link to="/register"
                  className="flex-1 py-3 border border-white/20 text-gray-300 font-medium rounded-full text-center
                             hover:border-white/40 hover:text-white transition text-sm">
                  Бүртгүүлэх
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* User info */}
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-5">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Хувийн мэдээлэл</p>
                <div className="space-y-3">
                  {[
                    { label: "Нэр",    value: user?.name || user?.username || "—" },
                    { label: "Имэйл", value: user?.email || "—" },
                    { label: "Утас",  value: user?.phone || "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-gray-500 text-sm">{item.label}</span>
                      <span className="text-white text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-xs mt-3">
                  Мэдээлэл буруу бол{" "}
                  <Link to="/profile" className="text-orange-400 hover:underline">профайл</Link>
                  -аасаа засна уу
                </p>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-5">
                <label className="text-gray-500 text-xs uppercase tracking-widest block mb-3">
                  Нэмэлт тэмдэглэл (заавал биш)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Өмнөх туршлага, тусгай хүсэлт гэх мэт..."
                  rows={4}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm placeholder-gray-600
                             focus:outline-none focus:border-orange-500/50 resize-none transition"
                />
              </div>

              {/* Admin notice */}
              <div className="flex items-start gap-3 bg-white/5 rounded-xl border border-white/10 p-4">
                <span className="text-xl shrink-0">ℹ️</span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Хүсэлт илгээсний дараа <span className="text-white font-medium">админ хянаж баталгаажуулна.</span>{" "}
                  Баталгаажсан тохиолдолд и-мэйлээр мэдэгдэл хүлээн авна.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-white/20 text-gray-400 font-medium rounded-full
                     hover:border-white/40 hover:text-white transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>
        {user && (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-10 py-3 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Илгээж байна...
              </>
            ) : (
              <>
                Хүсэлт илгээх
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Submitted ── */
function Submitted({ levels, levelId: levelName, onReset }) {
  const level = levels.find((l) => l.name === levelName);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Хүсэлт илгээгдлээ!</h2>
        <p className="text-gray-400 leading-relaxed mb-2">
          <span className="text-orange-400 font-semibold">{level?.name}</span> бүлэгт элсэх хүсэлт амжилттай хүлээн авлаа.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Админ хянаж баталгаажуулсны дараа и-мэйлээр мэдэгдэл илгээнэ.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onReset}
            className="px-6 py-2.5 border border-white/20 text-gray-400 rounded-full
                       hover:border-white/40 hover:text-white transition text-sm"
          >
            Дахин илгээх
          </button>
          <Link
            to="/"
            className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-full
                       hover:bg-orange-600 transition text-sm"
          >
            Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Not logged in ── */
function NotLoggedIn() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center max-w-sm px-4">
        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
          <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Нэвтрэх шаардлагатай</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Элсэлтийн хүсэлт илгээхийн тулд эхлээд бүртгүүлж эсвэл нэвтрэх шаардлагатай.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 transition"
          >
            Нэвтрэх
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 border border-white/20 text-gray-300 font-medium rounded-full
                       hover:border-white/40 hover:text-white transition"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
function Enrollment({ user }) {
  const [step,            setStep]            = useState(1);
  const [selectedLevel,   setSelectedLevel]   = useState(null); // level name string
  const [selectedClassId, setSelectedClassId] = useState(null); // DB class_group id
  const [notes,           setNotes]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [submitted,       setSubmitted]       = useState(false);
  const [dbSlots,         setDbSlots]         = useState([]);
  const [slotsLoading,    setSlotsLoading]    = useState(true);
  const [levels,          setLevels]          = useState([]);

  useEffect(() => {
    api.get("/levels")
      .then(data => setLevels(Array.isArray(data) ? data : []))
      .catch(() => setLevels([]));

    api.get("/schedule")
      .then(data => setDbSlots(Array.isArray(data) ? data : []))
      .catch(() => setDbSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/enrollments", { classId: selectedClassId, notes });
      setSubmitted(true);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedLevel(null);
    setSelectedClassId(null);
    setNotes("");
    setError("");
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <section className="bg-[#0d0d0d] border-b border-white/10 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Элсэлтийн <span className="text-orange-500">хүсэлт</span>
          </h1>
          <p className="text-gray-500">Алхам алхмаар бүртгэлийн хүсэлтээ илгээнэ үү</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <StepIndicator step={submitted ? 4 : step} />

        {submitted ? (
          <Submitted levels={levels} levelId={selectedLevel} onReset={handleReset} />
        ) : step === 1 ? (
          <Step1
            levels={levels}
            selected={selectedLevel}
            onSelect={(name) => { setSelectedLevel(name); setSelectedClassId(null); }}
            onNext={() => setStep(2)}
          />
        ) : step === 2 ? (
          <Step2
            levels={levels}
            levelName={selectedLevel}
            dbSlots={dbSlots}
            slotsLoading={slotsLoading}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        ) : (
          <Step3
            levels={levels}
            user={user}
            levelName={selectedLevel}
            dbSlots={dbSlots}
            selectedClassId={selectedClassId}
            notes={notes}
            setNotes={setNotes}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default Enrollment;
