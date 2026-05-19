import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

const STEPS = { PHONE: 1, RESET: 2, DONE: 3 };

function ForgotPassword() {
  const [step, setStep]           = useState(STEPS.PHONE);
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // ── Step 1: утасны дугаар илгээж OTP авах ─────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/forgot", { phone });
      setStep(STEPS.RESET);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP + шинэ нууц үг илгээх ────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm)
      return setError("Нууц үг таарахгүй байна");
    if (newPassword.length < 6)
      return setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна");
    setLoading(true);
    try {
      await api.post("/reset-password", { phone, otp, newPassword });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-[#151515] rounded-2xl p-8 border border-white/5">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {step === STEPS.DONE ? (
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step === STEPS.PHONE && "Нууц үг сэргээх"}
              {step === STEPS.RESET && "Шинэ нууц үг тохируулах"}
              {step === STEPS.DONE  && "Амжилттай!"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {step === STEPS.PHONE && "Бүртгэлтэй утасны дугаараа оруулна уу"}
              {step === STEPS.RESET && "Баталгаажуулалтын код болон шинэ нууц үгээ оруулна уу"}
              {step === STEPS.DONE  && "Нууц үг амжилттай шинэчлэгдлээ"}
            </p>
          </div>

          {/* ── Step indicator ──────────────────────────────────────────────── */}
          {step !== STEPS.DONE && (
            <div className="flex items-center gap-2 mb-6">
              {[STEPS.PHONE, STEPS.RESET].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex-1 h-1 rounded-full transition-all duration-300
                    ${step >= s ? "bg-orange-500" : "bg-white/10"}`} />
                  {i === 0 && (
                    <div className={`w-2 h-2 rounded-full shrink-0
                      ${step > STEPS.PHONE ? "bg-orange-500" : "bg-white/10"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* ── Step 1: Утасны дугаар ───────────────────────────────────────── */}
          {step === STEPS.PHONE && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Утасны дугаар
                </label>
                <input
                  type="tel"
                  placeholder="9911-2233"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl
                             text-white placeholder-gray-600
                             focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                             outline-none transition"
                />
              </div>

              <div className="p-3 bg-[#1a1a1a] rounded-xl border border-white/5 flex gap-3">
                <svg className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Баталгаажуулалтын 6 оронтой код таны утасны дугаарт илгээгдэх болно.
                  Одоогоор код серверийн console-д харагдана — SMS тохируулагдсан үед автоматаар явуулна.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                           hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
                           transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {loading ? "Илгээж байна..." : "OTP код авах"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP + шинэ нууц үг ─────────────────────────────────── */}
          {step === STEPS.RESET && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Баталгаажуулалтын код (OTP)
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl
                             text-white placeholder-gray-600 tracking-[0.3em] text-center text-lg font-mono
                             focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                             outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Шинэ нууц үг
                </label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl
                             text-white placeholder-gray-600
                             focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                             outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Нууц үг давтах
                </label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-xl
                             text-white placeholder-gray-600 outline-none transition
                             focus:ring-2 focus:ring-orange-500/50
                             ${confirm && confirm !== newPassword
                               ? "border-red-500/40 focus:border-red-500/50"
                               : "border-white/10 focus:border-orange-500/50"}`}
                />
                {confirm && confirm !== newPassword && (
                  <p className="text-red-400 text-xs mt-1">Нууц үг таарахгүй байна</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                           hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
                           transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {loading ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
              </button>

              <button
                type="button"
                onClick={() => { setStep(STEPS.PHONE); setError(""); setOtp(""); }}
                className="w-full py-2 text-gray-600 hover:text-gray-400 text-sm transition"
              >
                ← Дугаараа дахин оруулах
              </button>
            </form>
          )}

          {/* ── Step 3: Амжилтай ────────────────────────────────────────────── */}
          {step === STEPS.DONE && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm font-medium">
                  Нууц үг амжилттай шинэчлэгдлээ
                </p>
              </div>
              <Link to="/login"
                className="block w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                           hover:bg-orange-600 transition-all text-center">
                Нэвтрэх хуудас руу очих
              </Link>
            </div>
          )}

          {/* ── Login link ──────────────────────────────────────────────────── */}
          {step !== STEPS.DONE && (
            <p className="text-center text-sm text-gray-600 mt-6">
              <Link to="/login" className="text-orange-500 font-medium hover:underline">
                ← Нэвтрэх хуудас руу буцах
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
