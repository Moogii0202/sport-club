import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { inputCls, IconEdit, IconTrash, Spinner, IconClose } from "./shared";

const ROLE_CFG = {
  player: { label: "Тоглогч",       cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  coach:  { label: "Дасгалжуулагч", cls: "bg-blue-500/10   text-blue-400   border-blue-500/20"   },
};

function UserForm({ user: target, onSave, onCancel }) {
  const [form, setForm] = useState({
    firstName: target.firstName || "",
    lastName:  target.lastName  || "",
    phone:     target.phone     || "",
    email:     target.email     || "",
    password:  "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      await api.put(`/admin/users/${target.id}`, form);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#151515] rounded-2xl border border-orange-500/30 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">Хэрэглэгч засварлах</h3>
          <p className="text-gray-500 text-xs mt-0.5">{target.lastName} {target.firstName}</p>
        </div>
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-400 transition"><IconClose /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Овог *</label>
          <input type="text" value={form.lastName}
            onChange={e => set("lastName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Нэр *</label>
          <input type="text" value={form.firstName}
            onChange={e => set("firstName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Утас *</label>
          <input type="text" value={form.phone}
            onChange={e => set("phone", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">И-мэйл</label>
          <input type="email" value={form.email}
            onChange={e => set("email", e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
            Нууц үг <span className="normal-case text-gray-600">(хоосон үлдээвэл өөрчлөгдөхгүй)</span>
          </label>
          <input type="password" placeholder="Шинэ нууц үг..." value={form.password}
            onChange={e => set("password", e.target.value)} className={inputCls} />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                     hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
          {saving && <Spinner />}
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 border border-white/10 text-gray-400 text-sm font-medium rounded-xl
                     hover:border-white/20 transition">
          Цуцлах
        </button>
      </div>
    </div>
  );
}

export default function UsersTab() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser,   setEditUser]   = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (u) => {
    if (!window.confirm(`"${u.lastName} ${u.firstName}" хэрэглэгчийг бүртгэлийн мэдээллийн хамт устгах уу?`)) return;
    setDeleting(u.id);
    try {
      await api.delete(`/admin/users/${u.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)  ||
      u.phone?.includes(q) ||
      u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-4">
      {editUser && (
        <UserForm
          user={editUser}
          onSave={() => { setEditUser(null); fetchUsers(); }}
          onCancel={() => setEditUser(null)}
        />
      )}

      <div className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
              <h2 className="text-white font-bold">Бүртгэлтэй хэрэглэгчид</h2>
              <span className="text-gray-600 text-xs">{filtered.length} / {users.length}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600"
                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Нэр, утас хайх..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`${inputCls} pl-8 py-2 text-xs w-full sm:w-52`} />
              </div>

              <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                {[
                  { key: "all",    label: "Бүгд"          },
                  { key: "player", label: "Тоглогч"       },
                  { key: "coach",  label: "Дасгалжуулагч" },
                ].map(f => (
                  <button key={f.key} onClick={() => setRoleFilter(f.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                      ${roleFilter === f.key ? "bg-orange-500 text-white" : "text-gray-500 hover:text-white"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px] gap-4 px-6 py-2 border-b border-white/5">
          {["Хэрэглэгч", "Утас / И-мэйл", "Эрх", "Үйлдэл"].map(h => (
            <p key={h} className="text-gray-600 text-[10px] uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-600 text-sm">Уншиж байна...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-gray-600 text-sm">Хэрэглэгч олдсонгүй</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(u => {
              const initials = (u.firstName?.[0] || "") + (u.lastName?.[0] || "");
              const roleCfg  = ROLE_CFG[u.role] || ROLE_CFG.player;
              const approved = parseInt(u.approvedCount) || 0;
              const pending  = parseInt(u.pendingCount)  || 0;

              return (
                <div key={u.id}
                  className="px-6 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_120px_80px_100px]
                             gap-3 sm:gap-4 sm:items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10
                                    flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                      {u.profileImage
                        ? <img src={u.profileImage} alt="" className="w-full h-full object-cover rounded-xl" />
                        : initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{u.lastName} {u.firstName}</p>
                      <div className="flex gap-2 mt-0.5">
                        {approved > 0 && <span className="text-[10px] text-green-400">✓ {approved} элссэн</span>}
                        {pending  > 0 && <span className="text-[10px] text-amber-400">⏳ {pending} хүлээгдэж буй</span>}
                        {approved === 0 && pending === 0 && <span className="text-[10px] text-gray-600">Элсээгүй</span>}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs truncate">📞 {u.phone}</p>
                    {u.email && <p className="text-gray-600 text-xs truncate">✉ {u.email}</p>}
                  </div>

                  <div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleCfg.cls}`}>
                      {roleCfg.label}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button onClick={() => setEditUser(u)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                 bg-white/5 text-gray-400 border border-white/10
                                 hover:bg-white/10 hover:text-white transition">
                      <IconEdit />
                      Засах
                    </button>
                    <button onClick={() => handleDelete(u)} disabled={deleting === u.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                 bg-red-500/10 text-red-400 border border-red-500/20
                                 hover:bg-red-500/20 transition disabled:opacity-50">
                      <IconTrash />
                      {deleting === u.id ? "..." : "Устгах"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
