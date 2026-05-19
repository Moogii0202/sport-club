import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const IcoBall = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
  </svg>
);

const IcoCheck = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const inputCls = `w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl
  text-white placeholder-gray-600
  focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
  outline-none transition`;

function Register() {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.lastName || !formData.firstName || !formData.phone || !formData.password) {
      setError("Овог, нэр, утасны дугаар, нууц үг заавал бөглөнө!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Нууц үг таарахгүй байна!");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...sendData } = formData;
      await api.post("/register", sendData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#0a0a0a] px-4">
        <div className="bg-[#151515] rounded-2xl p-10 text-center max-w-sm w-full border border-white/5">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center
                          text-green-400 mx-auto mb-4">
            <IcoCheck />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Амжилттай бүртгэгдлээ!</h2>
          <p className="text-gray-500 text-sm">Нэвтрэх хуудас руу шилжиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-[#151515] rounded-2xl p-8 border border-white/5">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center
                            text-orange-400 mx-auto mb-4">
              <IcoBall />
            </div>
            <h2 className="text-2xl font-bold text-white">Бүртгүүлэх</h2>
            <p className="text-gray-500 text-sm mt-1">Volleyball Club-д тавтай морил</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Овог, Нэр */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Овог *</label>
                <input name="lastName" placeholder="Овог" value={formData.lastName}
                  onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Нэр *</label>
                <input name="firstName" placeholder="Нэр" value={formData.firstName}
                  onChange={handleChange} className={inputCls} />
              </div>
            </div>

            {/* Утас */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Утасны дугаар *</label>
              <input name="phone" type="tel" placeholder="9911-2233" value={formData.phone}
                onChange={handleChange} className={inputCls} />
            </div>

            {/* Огноо, Хүйс */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Төрсөн огноо</label>
                <input name="birthDate" type="date" value={formData.birthDate}
                  onChange={handleChange}
                  className={`${inputCls} [color-scheme:dark]`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Хүйс</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className={inputCls}>
                  <option value="" className="bg-[#1a1a1a]">Сонгох</option>
                  <option value="male" className="bg-[#1a1a1a]">Эрэгтэй</option>
                  <option value="female" className="bg-[#1a1a1a]">Эмэгтэй</option>
                </select>
              </div>
            </div>

            {/* И-мэйл */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">И-мэйл</label>
              <input name="email" type="email" placeholder="example@mail.com" value={formData.email}
                onChange={handleChange} className={inputCls} />
            </div>

            {/* Нууц үг */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Нууц үг *</label>
                <input name="password" type="password" placeholder="6+ тэмдэгт"
                  value={formData.password} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Давтах *</label>
                <input name="confirmPassword" type="password" placeholder="Дахин оруулах"
                  value={formData.confirmPassword} onChange={handleChange} className={inputCls} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                         hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
                         transition-all disabled:bg-gray-700 disabled:cursor-not-allowed mt-2">
              {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Бүртгэлтэй юу?{" "}
            <Link to="/login" className="text-orange-500 font-medium hover:underline">
              Нэвтрэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
