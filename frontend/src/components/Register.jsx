import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const inputCls = `w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl
  text-white placeholder-gray-600
  focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
  outline-none transition`;

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

function mask(channel, phone, email) {
  if (channel === "email" && email) {
    const [local, domain] = email.split("@");
    return local.slice(0, 2) + "*".repeat(Math.max(local.length - 2, 2)) + "@" + domain;
  }
  const p = phone.replace(/[\s\-]/g, "");
  return p.slice(0, 4) + "****";
}

export default function Register() {
  const [step,    setStep]    = useState("form"); // form | channel | otp | success
  const [form,    setForm]    = useState({
    lastName: "", firstName: "", phone: "", password: "",
    confirmPassword: "", birthDate: "", gender: "", email: "",
  });
  const [channel,     setChannel]     = useState("phone");
  const [otp,         setOtp]         = useState(["", "", "", "", ""]);
  const [sending,     setSending]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const otpRefs  = useRef([]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── Form validation ────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.lastName || !form.firstName || !form.phone || !form.password)
      return setError("Овог, нэр, утасны дугаар, нууц үг заавал бөглөнө!"), false;
    const phone = form.phone.replace(/[\s\-]/g, "");
    if (!/^\d{8}$/.test(phone))
      return setError("Утасны дугаар 8 оронтой тоо байна!"), false;
    if (form.password.length < 6)
      return setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна!"), false;
    if (form.password !== form.confirmPassword)
      return setError("Нууц үг таарахгүй байна!"), false;
    return true;
  };

  const handleFormNext = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...sendData } = form;
      await api.post("/register", { ...sendData });
      setStep("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (channel === "email" && !form.email)
      return setError("И-мэйл хаягаа бөглөнө үү");
    setSending(true); setError("");
    try {
      const phone = form.phone.replace(/[\s\-]/g, "");
      await api.post("/otp/send", { channel, phone, email: form.email });
      setOtp(["", "", "", "", ""]);
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 4) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!paste) return;
    e.preventDefault();
    const next = [...otp];
    paste.split("").forEach((c, idx) => { if (idx < 5) next[idx] = c; });
    setOtp(next);
    otpRefs.current[Math.min(paste.length, 4)]?.focus();
  };

  // ── Final register ─────────────────────────────────────────────────────────
  const handleRegister = async () => {
    const code = otp.join("");
    if (code.length < 5) return setError("5 оронтой код оруулна уу");
    setLoading(true); setError("");
    try {
      const { confirmPassword, ...sendData } = form;
      await api.post("/register", { ...sendData, otp: code });
      setStep("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (step === "success") return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="bg-[#151515] rounded-2xl p-10 text-center max-w-sm w-full border border-white/5">
        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center
                        text-green-400 mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Амжилттай бүртгэгдлээ!</h2>
        <p className="text-gray-500 text-sm">Нэвтрэх хуудас руу шилжиж байна...</p>
      </div>
    </div>
  );

  // ── Shared wrapper ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-[#151515] rounded-2xl p-8 border border-white/5">

          {/* Header */}
          <div className="text-center mb-8">
            <img src="/volleyball_club_logo_v2.svg" alt="Logo" className="h-28 w-auto mx-auto mb-5" />
            {step === "form" && (
              <>
                <h2 className="text-2xl font-bold text-white">Бүртгүүлэх</h2>
                <p className="text-gray-500 text-sm mt-1">Volleyball Club-д тавтай морил</p>
              </>
            )}
            {step === "channel" && (
              <>
                <h2 className="text-2xl font-bold text-white">Баталгаажуулах</h2>
                <p className="text-gray-500 text-sm mt-1">Нэг удаагийн код хаана очих вэ?</p>
              </>
            )}
            {step === "otp" && (
              <>
                <h2 className="text-2xl font-bold text-white">Код оруулах</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {channel === "email" ? "И-мэйл" : "Утасны дугаар"} руу 5 оронтой код илгээгдлээ
                </p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* ── STEP: FORM ─────────────────────────────────────────────── */}
          {step === "form" && (
            <form onSubmit={handleFormNext} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Овог *</label>
                  <input placeholder="Овог" value={form.lastName}
                    onChange={e => set("lastName", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Нэр *</label>
                  <input placeholder="Нэр" value={form.firstName}
                    onChange={e => set("firstName", e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Утасны дугаар *</label>
                <input type="tel" placeholder="99112233" value={form.phone}
                  onChange={e => set("phone", e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Төрсөн огноо</label>
                <div className="relative h-[50px] bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden
                                focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500/50 transition">
                  <input type="date" value={form.birthDate}
                    onChange={e => set("birthDate", e.target.value)}
                    className="absolute inset-0 w-full h-full px-4 bg-transparent text-white text-sm outline-none [color-scheme:dark] appearance-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Хүйс</label>
                <div className="relative">
                  <select value={form.gender} onChange={e => set("gender", e.target.value)}
                    className={`${inputCls} appearance-none pr-10 cursor-pointer`}>
                    <option value="" className="bg-[#1a1a1a]">Сонгох</option>
                    <option value="male" className="bg-[#1a1a1a]">Эрэгтэй</option>
                    <option value="female" className="bg-[#1a1a1a]">Эмэгтэй</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  И-мэйл
                  <span className="text-gray-600 font-normal ml-1">(Gmail-ээр код авах бол заавал бөглөнө)</span>
                </label>
                <input type="email" placeholder="example@gmail.com" value={form.email}
                  onChange={e => set("email", e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Нууц үг *</label>
                  <input type="password" placeholder="6+ тэмдэгт" value={form.password}
                    onChange={e => set("password", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Давтах *</label>
                  <input type="password" placeholder="Дахин оруулах" value={form.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)} className={inputCls} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                           hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
                           transition-all mt-2 disabled:opacity-50
                           flex items-center justify-center gap-2">
                {loading && <Spinner />}
                {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
              </button>
            </form>
          )}

          {/* ── STEP: CHANNEL ──────────────────────────────────────────── */}
          {step === "channel" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                Бүртгэлийг баталгаажуулахын тулд нэг удаагийн 5 оронтой код илгээнэ
              </p>

              <div className="space-y-3 mt-2">
                {/* Phone option */}
                <button onClick={() => setChannel("phone")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                    ${channel === "phone"
                      ? "border-orange-500/60 bg-orange-500/10"
                      : "border-white/10 bg-[#1a1a1a] hover:border-white/20"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${channel === "phone" ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-500"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${channel === "phone" ? "text-white" : "text-gray-400"}`}>
                      Утасны дугаар
                    </p>
                    <p className="text-gray-600 text-xs truncate">{form.phone || "—"} руу SMS</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all
                    ${channel === "phone" ? "border-orange-500 bg-orange-500" : "border-gray-600"}`} />
                </button>

                {/* Email option */}
                <button onClick={() => setChannel("email")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                    ${channel === "email"
                      ? "border-orange-500/60 bg-orange-500/10"
                      : "border-white/10 bg-[#1a1a1a] hover:border-white/20"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${channel === "email" ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-500"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${channel === "email" ? "text-white" : "text-gray-400"}`}>
                      Gmail хаяг
                    </p>
                    <p className="text-gray-600 text-xs truncate">
                      {form.email || "И-мэйл хаяг бөглөгдсөн байх ёстой"}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all
                    ${channel === "email" ? "border-orange-500 bg-orange-500" : "border-gray-600"}`} />
                </button>
              </div>

              <button onClick={handleSendOtp} disabled={sending}
                className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                           hover:bg-orange-600 transition-all disabled:opacity-50
                           flex items-center justify-center gap-2 mt-2">
                {sending && <Spinner />}
                {sending ? "Илгээж байна..." : "Код авах"}
              </button>

              <button onClick={() => { setStep("form"); setError(""); }}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-400 transition py-1">
                ← Буцах
              </button>
            </div>
          )}

          {/* ── STEP: OTP ──────────────────────────────────────────────── */}
          {step === "otp" && (
            <div className="space-y-6">
              {/* Destination badge */}
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 text-center border border-white/5">
                <p className="text-gray-600 text-xs">Код илгээсэн хаяг</p>
                <p className="text-white font-semibold text-sm mt-0.5">
                  {mask(channel, form.phone, form.email)}
                </p>
              </div>

              {/* 5 digit inputs */}
              <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border
                                bg-[#1a1a1a] text-white outline-none transition-all
                                ${digit
                                  ? "border-orange-500 ring-2 ring-orange-500/30"
                                  : "border-white/15 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"}`}
                  />
                ))}
              </div>

              {/* Confirm button */}
              <button onClick={handleRegister} disabled={loading || otp.join("").length < 5}
                className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                           hover:bg-orange-600 transition-all disabled:opacity-50
                           flex items-center justify-center gap-2">
                {loading && <Spinner />}
                {loading ? "Баталгаажуулж байна..." : "Баталгаажуулах"}
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-gray-600 text-sm">
                    Дахин код авах:{" "}
                    <span className="text-orange-400 font-semibold tabular-nums">{resendTimer}с</span>
                  </p>
                ) : (
                  <button onClick={handleSendOtp} disabled={sending}
                    className="text-orange-400 text-sm hover:text-orange-300 transition disabled:opacity-50">
                    {sending ? "Илгээж байна..." : "Дахин код авах"}
                  </button>
                )}
              </div>

              <button onClick={() => { setStep("channel"); setError(""); }}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-400 transition py-1">
                ← Буцах
              </button>
            </div>
          )}

          {/* Login link (form step only) */}
          {step === "form" && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Бүртгэлтэй юу?{" "}
              <Link to="/login" className="text-orange-500 font-medium hover:underline">
                Нэвтрэх
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
