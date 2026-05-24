import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

const fmtFee  = (fee) => fee ? `${Number(fee).toLocaleString()}₮ / сар` : "Үнэгүй";
const DAYS    = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

const DAY_NUM = { "Даваа":1, "Мягмар":2, "Лхагва":3, "Пүрэв":4, "Баасан":5, "Бямба":6, "Ням":0 };

function countSessions(startDate, endDate, slots) {
  if (!startDate || !endDate || !slots?.length) return null;
  const s = new Date(startDate), e = new Date(endDate);
  if (isNaN(s) || isNaN(e) || e < s) return null;
  let total = 0;
  for (const slot of slots) {
    const target = DAY_NUM[slot.dayOfWeek];
    if (target === undefined) continue;
    const cur = new Date(s);
    const diff = (target - cur.getDay() + 7) % 7;
    cur.setDate(cur.getDate() + diff);
    while (cur <= e) { total++; cur.setDate(cur.getDate() + 7); }
  }
  return total || null;
}

function fmtDate(d) {
  if (!d) return null;
  const iso  = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${parseInt(iso[1])} оны ${parseInt(iso[2])} сарын ${parseInt(iso[3])}`;
  const MN   = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
  const full = d.match(/[A-Za-z]+ ([A-Za-z]{3}) (\d{1,2}) (\d{4})/);
  if (full && MN[full[1]]) return `${full[3]} оны ${MN[full[1]]} сарын ${parseInt(full[2])}`;
  return d;
}

const STEP_LABELS = ["Түвшин сонгох", "Хуваарь сонгох", "Баталгаажуулах", "Төлбөр хийх"];

const accentClasses = {
  orange: { border:"border-orange-500", bg:"bg-orange-500/10", text:"text-orange-400", badge:"bg-orange-500/20 text-orange-300 border-orange-500/30", dot:"bg-orange-500", glow:"shadow-orange-500/20" },
  blue:   { border:"border-blue-500",   bg:"bg-blue-500/10",   text:"text-blue-400",   badge:"bg-blue-500/20 text-blue-300 border-blue-500/30",     dot:"bg-blue-500",   glow:"shadow-blue-500/20" },
  purple: { border:"border-purple-500", bg:"bg-purple-500/10", text:"text-purple-400", badge:"bg-purple-500/20 text-purple-300 border-purple-500/30", dot:"bg-purple-500", glow:"shadow-purple-500/20" },
  green:  { border:"border-green-500",  bg:"bg-green-500/10",  text:"text-green-400",  badge:"bg-green-500/20 text-green-300 border-green-500/30",   dot:"bg-green-500",  glow:"shadow-green-500/20" },
  red:    { border:"border-red-500",    bg:"bg-red-500/10",    text:"text-red-400",    badge:"bg-red-500/20 text-red-300 border-red-500/30",         dot:"bg-red-500",    glow:"shadow-red-500/20" },
  yellow: { border:"border-yellow-500", bg:"bg-yellow-500/10", text:"text-yellow-400", badge:"bg-yellow-500/20 text-yellow-300 border-yellow-500/30", dot:"bg-yellow-500", glow:"shadow-yellow-500/20" },
  indigo: { border:"border-indigo-500", bg:"bg-indigo-500/10", text:"text-indigo-400", badge:"bg-indigo-500/20 text-indigo-300 border-indigo-500/30", dot:"bg-indigo-500", glow:"shadow-indigo-500/20" },
  teal:   { border:"border-teal-500",   bg:"bg-teal-500/10",   text:"text-teal-400",   badge:"bg-teal-500/20 text-teal-300 border-teal-500/30",     dot:"bg-teal-500",   glow:"shadow-teal-500/20" },
  pink:   { border:"border-pink-500",   bg:"bg-pink-500/10",   text:"text-pink-400",   badge:"bg-pink-500/20 text-pink-300 border-pink-500/30",     dot:"bg-pink-500",   glow:"shadow-pink-500/20" },
};
const getAccent = (a) => accentClasses[a] || accentClasses.orange;

/* ── Label ── */
const Label = ({ children }) => (
  <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500 mb-4">
    {children}
  </span>
);

/* ── Step Indicator ── */
function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-14">
      {STEP_LABELS.map((label, i) => {
        const num    = i + 1;
        const done   = step > num;
        const active = step === num;
        return (
          <React.Fragment key={num}>
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm
                               transition-all duration-300 border-2
                ${done   ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                : active ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30"
                         : "bg-[#111111] border-white/15 text-gray-600"}`}>
                {done ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : num}
              </div>
              <span className={`text-[11px] mt-2 text-center leading-tight whitespace-nowrap font-medium
                ${active ? "text-white" : done ? "text-green-400" : "text-gray-600"}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-10 md:w-16 mb-6 mx-1 transition-all duration-500
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
      {/* Bold section heading */}
      <div className="mb-10">
        <h2 className="text-[clamp(2rem,6vw,3.2rem)] font-black text-white uppercase leading-[0.9] tracking-tight">
          Түвшингээ<br /><span className="text-orange-500">сонгоно уу</span>
        </h2>
        <p className="text-gray-500 text-sm mt-4 max-w-xs leading-relaxed">
          Өөрийн ур чадварт тохирсон бүлгийг сонгоно уу
        </p>
      </div>

      {/* Horizontal level cards */}
      <div className="space-y-4 mb-10">
        {levels.map((lv, idx) => {
          const ac     = getAccent(lv.accent);
          const active = selected === lv.name;
          return (
            <div key={lv.id} onClick={() => onSelect(lv.name)}
              className={`relative flex rounded-2xl overflow-hidden cursor-pointer
                          border-2 transition-all duration-200
                ${active
                  ? `${ac.border} shadow-2xl shadow-${lv.accent}-500/20`
                  : "enroll-level-inactive border-white/8 hover:border-white/20"}`}>

              {/* Left panel — dark with big bg number */}
              <div className={`relative flex flex-col justify-between p-5 shrink-0
                               w-[130px] sm:w-[160px] overflow-hidden
                ${active ? ac.bg : "bg-[#111111]"}`}>
                {/* Background index number */}
                <span className="absolute -bottom-3 -left-1 text-[80px] font-black leading-none
                                 text-white/5 select-none pointer-events-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-4 ${ac.badge}`}>
                    {lv.badge}
                  </span>
                  <h3 className={`font-black text-lg uppercase leading-tight tracking-tight
                    ${active ? ac.text : "text-white"}`}>
                    {lv.name}
                  </h3>
                </div>

                <div className="relative z-10 mt-4">
                  <p className={`text-xl font-black leading-none ${ac.text}`}>
                    {lv.fee ? `${Number(lv.fee).toLocaleString()}₮` : "Үнэгүй"}
                  </p>
                  <p className="text-gray-600 text-[11px] mt-0.5">/ сар</p>
                </div>
              </div>

              {/* Right panel */}
              <div className={`flex-1 p-5 flex flex-col justify-center border-l
                ${active ? "border-white/10 bg-[#0f0f0f]" : "border-white/5 bg-[#0d0d0d]"}`}>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {lv.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {lv.features.map((f) => (
                    <span key={f}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border
                        ${active
                          ? `${ac.bg} ${ac.border} ${ac.text}`
                          : "bg-white/4 border-white/8 text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? ac.dot : "bg-gray-600"}`} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Far-right checkmark */}
              <div className={`flex items-center justify-center px-4 shrink-0 border-l
                ${active ? "border-white/10 bg-[#0f0f0f]" : "border-white/5 bg-[#0d0d0d]"}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${active
                    ? `${ac.dot} border-transparent shadow-lg`
                    : "border-white/15 bg-transparent"}`}>
                  {active && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!selected}
          className="px-10 py-3.5 bg-orange-500 text-white font-bold rounded-full
                     hover:bg-orange-600 transition disabled:opacity-30 disabled:cursor-not-allowed
                     flex items-center gap-2 shadow-lg shadow-orange-500/20">
          Үргэлжлүүлэх
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: Хуваарь сонгох ── */
function Step2({ levels, levelName, dbSlots, slotsLoading, selectedSlotIds, onToggleSlot, slotWarning, onNext, onBack }) {
  const level      = levels.find((l) => l.name === levelName);
  const ac         = getAccent(level?.accent);
  const levelSlots = dbSlots.filter((s) => s.level === levelName);

  const classGroups = levelSlots.reduce((acc, s) => {
    if (!acc[s.classId]) acc[s.classId] = {
      classId: s.classId,
      coach: `${s.coachLastName}. ${s.coachFirstName}`,
      coachInitial: s.coachLastName?.[0] || "?",
      slots: [], fee: s.fee, maxCapacity: s.maxCapacity,
      enrolledCount: Number(s.enrolledCount),
      startDate: s.startDate || null, endDate: s.endDate || null,
    };
    acc[s.classId].slots.push(s);
    return acc;
  }, {});

  const selectedCount = selectedSlotIds.size;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white uppercase leading-tight">
            Хуваарь <span className="text-orange-500">сонгох</span>
          </h2>
         
        </div>
        <span className={`hidden sm:inline-flex shrink-0 items-center px-4 py-1.5 rounded-full text-sm font-bold border ${ac.badge}`}>
          {levelName}
        </span>
      </div>

      {slotsLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Уншиж байна...</p>
        </div>
      ) : levelSlots.length === 0 ? (
        <div className="text-center py-20 border border-white/8 rounded-2xl bg-[#111111] mb-10">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/8">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-white font-black text-sm uppercase mb-1">Хуваарь байхгүй байна</p>
          <p className="text-gray-600 text-xs">Дасгалжуулагч хуваарь оруулсны дараа харагдана</p>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {Object.values(classGroups).map((cg) => {
            const spots   = cg.maxCapacity - cg.enrolledCount;
            const isFull  = spots <= 0;
            const fillPct = Math.min(100, Math.round((cg.enrolledCount / (cg.maxCapacity || 1)) * 100));
            const anySelected = cg.slots.some(s => selectedSlotIds.has(s.scheduleId));

            return (
              <div key={cg.classId}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-200
                  ${isFull ? "border-white/5 bg-[#111111] opacity-40"
                  : anySelected ? `${ac.border} ${ac.bg}`
                  : "border-white/8 bg-[#111111]"}`}>

                {/* Coach + price row */}
                <div className="flex items-center gap-4 px-5 pt-5 pb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                                   font-black text-lg border-2 transition-all
                    ${anySelected ? `${ac.bg} ${ac.border}` : "bg-white/5 border-white/10"}`}>
                    <span className={anySelected ? ac.text : "text-gray-300"}>{cg.coachInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-base leading-tight ${anySelected ? ac.text : "text-white"}`}>
                      {cg.coach}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{levelName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-2xl font-black leading-none ${ac.text}`}>
                      {(cg.fee || 0).toLocaleString()}₮
                    </p>
                    <p className="text-gray-600 text-[11px] mt-0.5">/ сар</p>
                  </div>
                </div>

                {/* Date row */}
                {(cg.startDate || cg.endDate) && (
                  <div className="px-5 pb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span className="text-gray-600 text-[11px]">
                        {fmtDate(cg.startDate) || "—"} — {fmtDate(cg.endDate) || "—"}
                      </span>
                    </div>
                    {(() => {
                      const total = countSessions(cg.startDate, cg.endDate, cg.slots);
                      return total ? (
                        <span className="text-[11px] font-bold text-gray-500">{total} хичээл</span>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Capacity bar */}
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-600 text-[11px]">{cg.enrolledCount} / {cg.maxCapacity} гишүүн</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border
                      ${isFull ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : spots <= 3 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                      {isFull ? "Дүүрсэн" : `${spots} байр үлдсэн`}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500
                      ${fillPct >= 100 ? "bg-red-500" : fillPct >= 75 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${fillPct}%` }} />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/8" />

                {/* Individual selectable slots */}
                <div className="p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-2 pt-1 pb-0.5">
                    Цаг сонгох
                  </p>
                  {DAYS.flatMap((day) => {
                    const daySlots = cg.slots.filter(x => x.dayOfWeek === day);
                    if (!daySlots.length) return [];
                    return daySlots.map(s => {
                      const isSlotSelected = selectedSlotIds.has(s.scheduleId);
                      return (
                        <button key={s.scheduleId} disabled={isFull}
                          onClick={() => !isFull && onToggleSlot(s.scheduleId)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
                                      transition-all duration-150
                            ${isFull ? "border-white/5 cursor-not-allowed opacity-50"
                            : isSlotSelected
                              ? `${ac.border} ${ac.bg} shadow-md`
                              : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5 cursor-pointer"}`}>

                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                            ${isSlotSelected ? `${ac.dot} border-transparent` : "border-white/25 bg-transparent"}`}>
                            {isSlotSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Day */}
                          <span className={`text-sm font-black w-16 shrink-0
                            ${isSlotSelected ? ac.text : "text-gray-400"}`}>
                            {day}
                          </span>

                          {/* Time */}
                          <span className={`text-sm font-bold flex-1
                            ${isSlotSelected ? "text-white" : "text-gray-300"}`}>
                            {s.startTime}–{s.endTime}
                          </span>

                          {/* Location */}
                          {s.location && (
                            <span className="text-gray-600 text-[11px] shrink-0 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              {s.location}
                            </span>
                          )}

                          {/* Seat count */}
                          {s.maxCapacity > 0 && (
                            <span className={`text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-lg border
                              ${s.enrolledCount >= s.maxCapacity
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : s.enrolledCount >= s.maxCapacity * 0.8
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                  : isSlotSelected
                                    ? `${ac.bg} ${ac.border} ${ac.text}`
                                    : "bg-white/5 text-gray-500 border-white/10"}`}>
                              {s.enrolledCount}/{s.maxCapacity}
                            </span>
                          )}
                        </button>
                      );
                    });
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hint + warning */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <svg className="w-3.5 h-3.5 shrink-0 text-orange-400/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Яг <span className="text-orange-400 font-bold mx-1">3 цаг</span> сонгосон үед үргэлжлүүлэх боломжтой
        </div>
        {slotWarning && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <span className="text-red-400 text-sm font-medium">Хамгийн ихдээ 3 цаг сонгоно уу. Өөр цаг нэмэхийн тулд сонгогдсон цагаа эхлээд болиулна уу.</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack}
          className="px-6 py-3 border border-white/15 text-gray-400 font-medium rounded-full
                     hover:border-white/30 hover:text-white transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-bold ${selectedCount === 3 ? ac.text : "text-gray-500"}`}>
            {selectedCount}/3 цаг сонгогдсон
          </span>
          <button onClick={onNext} disabled={selectedCount !== 3}
            className="px-10 py-3.5 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 transition disabled:opacity-30 disabled:cursor-not-allowed
                       flex items-center gap-2 shadow-lg shadow-orange-500/20">
            Үргэлжлүүлэх
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Баталгаажуулах ── */
function Step3({ levels, user, levelName, dbSlots, selectedSlotIds, notes, setNotes, onNext, onBack }) {
  const level       = levels.find((l) => l.name === levelName);
  const ac          = getAccent(level?.accent);
  const chosenSlots = dbSlots.filter((s) => selectedSlotIds.has(s.scheduleId));

  const totalSessions = countSessions(
    chosenSlots[0]?.startDate, chosenSlots[0]?.endDate, chosenSlots
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white uppercase leading-tight">
          Баталгаа<span className="text-orange-500">жуулах</span>
        </h2>
        <p className="text-gray-500 text-sm mt-2">Мэдээллээ шалгаад дараагийн алхам руу үргэлжлүүлнэ үү</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        {/* Left — нэгдсэн хураангуй карт */}
        <div className={`rounded-2xl border-2 overflow-hidden ${ac.border}`}>

          {/* Level хэсэг */}
          <div className={`px-5 pt-5 pb-4 ${ac.bg}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Сонгосон түвшин</p>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${ac.badge}`}>
                  {level?.badge}
                </span>
                <p className={`font-black text-2xl uppercase leading-tight ${ac.text}`}>{level?.name}</p>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{level?.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-2xl font-black leading-none ${ac.text}`}>
                  {level?.fee ? `${Number(level.fee).toLocaleString()}₮` : "Үнэгүй"}
                </p>
                <p className="text-gray-600 text-[11px] mt-0.5">/ сар</p>
              </div>
            </div>
          </div>

          {/* Хуваарь хэсэг */}
          <div className="border-t border-white/8 px-5 py-4 bg-[#111111]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Хуваарь</p>

            {chosenSlots[0]?.startDate && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {fmtDate(chosenSlots[0].startDate)} — {fmtDate(chosenSlots[0].endDate) || "—"}
                </div>
                {totalSessions && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ac.badge}`}>
                    {totalSessions} хичээл
                  </span>
                )}
              </div>
            )}

            <div className="space-y-3">
              {chosenSlots.map((s) => (
                <div key={s.scheduleId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${ac.dot}`} />
                    <span className="text-white font-bold text-sm">{s.dayOfWeek}</span>
                    <span className="text-gray-500 text-sm">{s.startTime}–{s.endTime}</span>
                  </div>
                  <span className="text-gray-600 text-xs shrink-0">{s.coachLastName}. {s.coachFirstName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {!user ? (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8
                            flex flex-col items-center text-center h-full justify-center gap-6">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center
                              border border-orange-500/20">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg uppercase mb-2">Нэвтрэх шаардлагатай</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Хүсэлт илгээхийн тулд эхлээд бүртгүүлж эсвэл нэвтэрнэ үү.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Link to="/login"
                  className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-full text-center
                             hover:bg-orange-600 transition text-sm shadow-lg shadow-orange-500/20">
                  Нэвтрэх
                </Link>
                <Link to="/register"
                  className="flex-1 py-3 border border-white/15 text-gray-300 font-medium rounded-full text-center
                             hover:border-white/30 hover:text-white transition text-sm">
                  Бүртгүүлэх
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-[#111111] overflow-hidden">
              {/* Coach info */}
              {chosenSlots[0] && (
                <>
                  <div className="px-5 pt-5 pb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Дасгалжуулагч</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                       font-black text-base border-2 ${ac.bg} ${ac.border}`}>
                        <span className={ac.text}>{chosenSlots[0].coachLastName?.[0] || "?"}</span>
                      </div>
                      <p className={`font-black text-base leading-tight ${ac.text}`}>
                        {chosenSlots[0].coachLastName}. {chosenSlots[0].coachFirstName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {chosenSlots[0].coachPhone && (
                        <div className="flex items-center gap-2.5">
                          <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                          <span className="text-gray-400 text-[12px]">{chosenSlots[0].coachPhone}</span>
                        </div>
                      )}
                      {chosenSlots[0].coachEmail && (
                        <div className="flex items-center gap-2.5">
                          <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                          <span className="text-gray-400 text-[12px]">{chosenSlots[0].coachEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-white/8" />
                </>
              )}

              {/* User info */}
              <div className="px-5 pt-4 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Элсэгч</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                    label: "Нэр",    value: user?.name || user?.username || "—" },
                  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                    label: "Имэйл", value: user?.email || "—" },
                  { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                    label: "Утас",  value: user?.phone || "—" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-5 py-3.5">
                    <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                    </svg>
                    <span className="text-gray-500 text-sm flex-1">{item.label}</span>
                    <span className="text-white text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-4 pt-2">
                <p className="text-gray-600 text-xs">
                  Буруу бол <Link to="/profile" className="text-orange-400 hover:underline">профайл</Link>-аасаа засна уу
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/8 mx-5" />

              {/* Notes */}
              <div className="p-5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 block mb-3">
                  Нэмэлт тэмдэглэл <span className="normal-case text-gray-700">(заавал биш)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Өмнөх туршлага, тусгай хүсэлт гэх мэт..."
                  rows={3}
                  className="w-full bg-[#0d0d0d] border border-white/8 rounded-xl px-4 py-3
                             text-white text-sm placeholder-gray-700
                             focus:outline-none focus:border-orange-500/40 resize-none transition"
                />
              </div>

              {/* Info hint */}
              <div className="border-t border-white/8 px-5 py-4 flex items-center gap-3">
                <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Дараагийн алхамд <span className="text-white font-semibold">төлбөрөө хийнэ үү.</span> Баталгаажмагц элсэлт идэвхжинэ.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack}
          className="px-6 py-3 border border-white/15 text-gray-400 font-medium rounded-full
                     hover:border-white/30 hover:text-white transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>
        {user && (
          <button onClick={onNext}
            className="px-10 py-3.5 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 transition flex items-center gap-2
                       shadow-lg shadow-orange-500/20">
            Төлбөр хийх
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Step 4: Төлбөр хийх ── */
const PAYMENT_METHODS = [
  { id: "qpay",      label: "QPay",        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>, desc: "QR уншуулах" },
  { id: "socialpay", label: "SocialPay",   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, desc: "Хаан банк" },
  { id: "cash",      label: "Бэлэн мөнгө", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>, desc: "Заал дээр" },
];

function Step4({ levels, levelName, dbSlots, selectedSlotIds, paymentMethod, setPaymentMethod, onSubmit, onBack, loading, error }) {
  const level       = levels.find((l) => l.name === levelName);
  const ac          = getAccent(level?.accent);
  const chosenSlots = dbSlots.filter((s) => selectedSlotIds.has(s.scheduleId));

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white uppercase leading-tight">
          Төлбөр <span className="text-orange-500">хийх</span>
        </h2>
        <p className="text-gray-500 text-sm mt-3">Төлбөрийн аргаа сонгоод баталгаажуулна уу</p>
      </div>

      {/* Дүнгийн хураангуй */}
      <div className={`rounded-2xl border-2 p-5 mb-8 ${ac.border} ${ac.bg}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Төлөх дүн</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`font-black text-xl uppercase ${ac.text}`}>{level?.name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {chosenSlots.map(s => `${s.dayOfWeek} ${s.startTime}–${s.endTime}`).join("  ·  ")}
            </p>
          </div>
          <p className={`text-3xl font-black ${ac.text} shrink-0`}>{fmtFee(level?.fee)}</p>
        </div>
      </div>

      {/* Аргын сонголт */}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Төлбөрийн арга</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {PAYMENT_METHODS.map((m) => (
          <button key={m.id} onClick={() => setPaymentMethod(m.id)}
            className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition-all duration-200
              ${paymentMethod === m.id
                ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/15"
                : "border-white/8 bg-[#111111] hover:border-white/20 hover:bg-[#141414]"}`}>
            <span className="text-2xl">{m.icon}</span>
            <span className={`text-sm font-black ${paymentMethod === m.id ? "text-orange-400" : "text-white"}`}>
              {m.label}
            </span>
            <span className="text-gray-600 text-[10px]">{m.desc}</span>
          </button>
        ))}
      </div>

      {paymentMethod === "qpay" && (
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-8 mb-8 flex flex-col items-center gap-5">
          <p className="text-gray-400 text-sm font-medium">QPay QR кодыг уншуулна уу</p>
          <div className="w-44 h-44 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-gray-400 text-xs text-center px-4">QR код энд харагдана</span>
          </div>
          <p className="text-gray-600 text-xs">QPay апп нээж QR уншуулаарай</p>
        </div>
      )}

      {paymentMethod === "socialpay" && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 mb-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20
                            flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
            <div>
              <p className="text-white font-black text-sm">SocialPay — Хаан банк</p>
              <p className="text-gray-500 text-xs">Доорх данс руу шилжүүлэнэ үү</p>
            </div>
          </div>
          <div className="bg-[#0a0a0a] rounded-xl border border-white/8 divide-y divide-white/5">
            {[
              { label: "Банк",            value: "Хаан банк (SocialPay)" },
              { label: "Дансны дугаар",   value: "5000 1234 5678" },
              { label: "Хүлээн авагч",    value: "Спорт клуб ХХК" },
              { label: "Дүн",             value: `${(level?.fee || 0).toLocaleString()}₮`, highlight: true },
              { label: "Гүйлгээний утга", value: `${levelName} · сарын хураамж` },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between px-4 py-3 gap-4">
                <span className="text-gray-500 text-xs shrink-0">{r.label}</span>
                <span className={`text-sm font-bold text-right ${r.highlight ? "text-blue-400" : "text-white"}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs text-center">
            Шилжүүлэг хийсний дараа "Баталгаажуулах" товчийг дарна уу
          </p>
        </div>
      )}

      {paymentMethod === "cash" && (
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Бэлэн мөнгөөр төлөх</p>
          <div className="divide-y divide-white/5">
            {[
              { label: "Байршил",        value: "Спорт клубын бүртгэлийн тасаг" },
              { label: "Цагийн хуваарь", value: "Даваа–Баасан, 09:00–18:00" },
              { label: "Утас",           value: "+976 9900-0000" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-3">
                <span className="text-gray-500 text-sm">{r.label}</span>
                <span className="text-white text-sm font-semibold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack}
          className="px-6 py-3 border border-white/15 text-gray-400 font-medium rounded-full
                     hover:border-white/30 hover:text-white transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>
        <button onClick={onSubmit} disabled={!paymentMethod || loading}
          className={`px-10 py-3.5 text-white font-bold rounded-full transition
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2
                     shadow-lg
                     ${paymentMethod === "socialpay"
                       ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                       : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"}`}>
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Илгээж байна...
            </>
          ) : paymentMethod === "socialpay" ? (
            <>Шилжүүлэг хийлээ — Баталгаажуулах
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>Төлбөр баталгаажуулах
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Submitted ── */
function Submitted({ levels, levelId: levelName, onReset }) {
  const level = levels.find((l) => l.name === levelName);
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-green-500/15 rounded-full flex items-center justify-center
                        mx-auto mb-8 border border-green-500/25">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-green-500 mb-4">
          Амжилттай
        </span>
        <h2 className="text-3xl font-black text-white uppercase mb-3">
          Элсэлт <span className="text-green-400">баталгаажлаа!</span>
        </h2>
        <p className="text-gray-400 leading-relaxed mb-2">
          Төлбөр хийгдсэн тул{" "}
          <span className="text-orange-400 font-semibold">{level?.name}</span> бүлэгт
          амжилттай элслээ.
        </p>
        <p className="text-gray-600 text-sm mb-10">
          Хичээлийн хуваарийг профайл хэсгээс харна уу.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onReset}
            className="px-6 py-3 border border-white/15 text-gray-400 rounded-full
                       hover:border-white/30 hover:text-white transition text-sm">
            Дахин илгээх
          </button>
          <Link to="/"
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 transition text-sm shadow-lg shadow-orange-500/20">
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
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center
                        mx-auto mb-8 border border-orange-500/20">
          <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <Label>Анхааруулга</Label>
        <h2 className="text-2xl font-black text-white uppercase mb-3">Нэвтрэх шаардлагатай</h2>
        <p className="text-gray-400 mb-10 leading-relaxed text-sm">
          Элсэлтийн хүсэлт илгээхийн тулд эхлээд бүртгүүлж эсвэл нэвтэрнэ үү.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login"
            className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full
                       hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
            Нэвтрэх
          </Link>
          <Link to="/register"
            className="px-8 py-3 border border-white/15 text-gray-300 font-medium rounded-full
                       hover:border-white/30 hover:text-white transition">
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
  const [selectedLevel,   setSelectedLevel]   = useState(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState(new Set());
  const [notes,           setNotes]           = useState("");
  const [paymentMethod,   setPaymentMethod]   = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [submitted,       setSubmitted]       = useState(false);
  const [dbSlots,         setDbSlots]         = useState([]);
  const [slotsLoading,    setSlotsLoading]    = useState(true);
  const [levels,          setLevels]          = useState([]);

  const [slotWarning, setSlotWarning] = useState(false);

  const toggleSlot = (scheduleId) => {
    setSelectedSlotIds(prev => {
      if (!prev.has(scheduleId) && prev.size >= 3) {
        setSlotWarning(true);
        return prev;
      }
      setSlotWarning(false);
      const next = new Set(prev);
      if (next.has(scheduleId)) next.delete(scheduleId);
      else next.add(scheduleId);
      return next;
    });
  };

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
      const chosenSlots = dbSlots.filter(s => selectedSlotIds.has(s.scheduleId));
      for (const slot of chosenSlots) {
        await api.post("/enrollments", { classId: slot.classId, scheduleId: slot.scheduleId, notes });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1); setSelectedLevel(null); setSelectedSlotIds(new Set());
    setNotes(""); setPaymentMethod(null); setError(""); setSubmitted(false);
    setSlotWarning(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero Banner ── */}
      <div className="bg-[#0d0d0d] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">

          {/* Framed photo */}
          <div className="relative shrink-0 w-full sm:w-[300px]">
            {/* Offset border frame */}
            <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border-2 border-orange-500/30" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/10
                            shadow-2xl shadow-black/60 aspect-[4/3] sm:aspect-[3/4]">
              <img src="/volleyball-hero.jpg" alt="Volleyball"
                   className="w-full h-full object-cover object-center grayscale brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-orange-500 mb-5">
              Volleyball Club
            </span>
            <h1 className="text-[clamp(2rem,5vw,3.4rem)] font-black text-white uppercase
                           leading-[0.88] tracking-tight mb-5">
              Элсэлт<br /><span className="text-orange-500">хийх</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Дугуйлангийн гишүүн болж, мэргэжлийн дасгалжуулагчтай хамт өсч хөгжөөрэй.
            </p>
            <div className="flex items-center gap-3 mt-7">
              <span className="w-8 h-px bg-orange-500/60" />
              <span className="text-gray-600 text-[11px] uppercase tracking-widest">
                Доорх алхмуудыг дагана уу
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <StepIndicator step={submitted ? 4 : step} />

        {submitted ? (
          <Submitted levels={levels} levelId={selectedLevel} onReset={handleReset} />
        ) : step === 1 ? (
          <Step1
            levels={levels}
            selected={selectedLevel}
            onSelect={(name) => { setSelectedLevel(name); setSelectedSlotIds(new Set()); setSlotWarning(false); }}
            onNext={() => setStep(2)}
          />
        ) : step === 2 ? (
          <Step2
            levels={levels} levelName={selectedLevel}
            dbSlots={dbSlots} slotsLoading={slotsLoading}
            selectedSlotIds={selectedSlotIds} onToggleSlot={toggleSlot}
            slotWarning={slotWarning}
            onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        ) : step === 3 ? (
          <Step3
            levels={levels} user={user} levelName={selectedLevel}
            dbSlots={dbSlots} selectedSlotIds={selectedSlotIds}
            notes={notes} setNotes={setNotes}
            onNext={() => setStep(4)} onBack={() => setStep(2)}
          />
        ) : (
          <Step4
            levels={levels} levelName={selectedLevel}
            dbSlots={dbSlots} selectedSlotIds={selectedSlotIds}
            paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
            onSubmit={handleSubmit} onBack={() => setStep(3)}
            loading={loading} error={error}
          />
        )}
      </div>
    </div>
  );
}

export default Enrollment;
