import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const roles = [
  { id: "player", label: "Хэрэглэгч", icon: "", desc: "Тоглогч / Гишүүн" },
  { id: "admin", label: "Админ", icon: "", desc: "Системийн удирдлага" },
  { id: "coach", label: "Дасгалжуулагч", icon: "", desc: "Багш / Coach" },
];

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState("player");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const data = await api.post("/login", { phone, password, role: selectedRole });
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      if (onLogin) onLogin(data.user);

      // Role-based redirect
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "coach") navigate("/coach");
      else navigate("/");
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
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center
                          text-3xl mx-auto mb-4">
              {roles.find(r => r.id === selectedRole)?.icon}
            </div>
            <h2 className="text-2xl font-bold text-white">Нэвтрэх</h2>
            <p className="text-gray-500 text-sm mt-1">Эрхийн төрлөө сонгоод нэвтэрнэ үү</p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setSelectedRole(r.id); setError(""); }}
                className={`p-3 rounded-xl text-center transition-all duration-200 border
                  ${selectedRole === r.id
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                    : "bg-[#1a1a1a] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                  }`}
              >
                <div className="text-xl mb-1">{r.icon}</div>
                <div className="text-xs font-semibold">{r.label}</div>
              </button>
            ))}
          </div>

          {/* Role description */}
          <div className="text-center mb-6">
            <span className="text-xs text-gray-600 bg-[#1a1a1a] px-3 py-1 rounded-full">
              {roles.find(r => r.id === selectedRole)?.desc}
            </span>
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

          {/* Register link (only for player) */}
          {selectedRole === "player" && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Бүртгэлгүй юу?{" "}
              <Link to="/register" className="text-orange-500 font-medium hover:underline">
                Бүртгүүлэх
              </Link>
            </p>
          )}

          {/* Demo credentials hint */}
          {selectedRole !== "player" && (
            <div className="mt-6 p-3 bg-[#1a1a1a] rounded-xl border border-white/5">
              <p className="text-xs text-gray-600 text-center">
                {selectedRole === "admin" ? "Админ: 99000001 / admin123" : "Багш: 99000002 / coach123"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
