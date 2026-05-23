import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

function Login({ onLogin }) {
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Утасны дугаар болон нууц үгээ оруулна уу!");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post("/login", { phone, password });
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      if (onLogin) onLogin(data.user);

      if (data.user.role === "admin")       navigate("/admin");
      else if (data.user.role === "coach")  navigate("/coach");
      else                                  navigate("/");
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

          {/* Header */}
          <div className="text-center mb-8">
            <img src="/volleyball_club_logo_v2.svg" alt="Logo" className="h-28 w-auto mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-white">Нэвтрэх</h2>
            <p className="text-gray-500 text-sm mt-1">Утасны дугаар болон нууц үгээ оруулна уу</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Нууц үг
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl
                           text-white placeholder-gray-600
                           focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                           outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                         hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
                         transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              {loading ? "Нэвтэрж байна..." : "Нэвтрэх"}
            </button>

            <div className="text-right">
              <Link to="/forgot" className="text-xs text-gray-600 hover:text-orange-400 transition">
                Нууц үг мартсан уу?
              </Link>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Бүртгэлгүй юу?{" "}
            <Link to="/register" className="text-orange-500 font-medium hover:underline">
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
