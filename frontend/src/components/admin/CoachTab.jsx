import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { inputCls, IconPlus, IconEdit, IconTrash, Spinner, IconClose } from "./shared";

function CoachForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    firstName: initial?.firstName || "",
    lastName:  initial?.lastName  || "",
    phone:     initial?.phone     || "",
    email:     initial?.email     || "",
    password:  "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      if (isEdit) {
        await api.put(`/admin/coaches/${initial.id}`, form);
      } else {
        await api.post("/admin/coaches", form);
      }
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
        <h3 className="text-white font-bold">{isEdit ? "Багш засварлах" : "Шинэ багш нэмэх"}</h3>
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-400 transition"><IconClose /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Овог *</label>
          <input type="text" placeholder="Батбаяр" value={form.lastName}
            onChange={e => set("lastName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Нэр *</label>
          <input type="text" placeholder="Мөнхбат" value={form.firstName}
            onChange={e => set("firstName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Утас *</label>
          <input type="text" placeholder="99001122" value={form.phone}
            onChange={e => set("phone", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">И-мэйл</label>
          <input type="email" placeholder="coach@example.com" value={form.email}
            onChange={e => set("email", e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
            Нууц үг {isEdit && <span className="normal-case text-gray-600">(хоосон үлдээвэл өөрчлөгдөхгүй)</span>}
          </label>
          <input type="password" placeholder={isEdit ? "Шинэ нууц үг..." : "Хамгийн багадаа 6 тэмдэгт"}
            value={form.password} onChange={e => set("password", e.target.value)} className={inputCls} />
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
          {saving ? "Хадгалж байна..." : (isEdit ? "Хадгалах" : "Нэмэх")}
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

export default function CoachTab() {
  const [coaches,   setCoaches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editCoach, setEditCoach] = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/coaches");
      setCoaches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoaches(); }, []);

  const handleSaved = () => {
    setShowForm(false);
    setEditCoach(null);
    fetchCoaches();
  };

  const handleDelete = async (coach) => {
    if (!window.confirm(`"${coach.lastName} ${coach.firstName}" багшийг устгах уу?`)) return;
    setDeleting(coach.id);
    try {
      await api.delete(`/admin/coaches/${coach.id}`);
      fetchCoaches();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {(showForm || editCoach) && (
        <CoachForm
          initial={editCoach}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditCoach(null); }}
        />
      )}

      <div className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
          <h2 className="text-white font-bold">Багш нар</h2>
          <span className="text-gray-600 text-xs">{coaches.length} багш</span>
          <button onClick={() => { setShowForm(true); setEditCoach(null); }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white
                       text-xs font-bold rounded-xl hover:bg-orange-600 transition">
            <IconPlus />
            Нэмэх
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-600 text-sm">Уншиж байна...</div>
        ) : coaches.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-8 h-8 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <p className="text-gray-600 text-sm">Багш бүртгэлгүй байна</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {coaches.map(c => {
              const initials = (c.firstName?.[0] || "") + (c.lastName?.[0] || "");
              return (
                <div key={c.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25
                                  flex items-center justify-center font-bold text-blue-400 text-sm shrink-0">
                    {c.profileImage
                      ? <img src={c.profileImage} alt="" className="w-full h-full object-cover rounded-xl" />
                      : initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{c.lastName} {c.firstName}</p>
                    <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{c.phone}</span>
                      {c.email && <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{c.email}</span>}
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-4 text-center shrink-0">
                    <div>
                      <p className="text-white font-bold text-sm">{c.classCount}</p>
                      <p className="text-gray-600 text-[10px]">бүлэг</p>
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold text-sm">{c.memberCount}</p>
                      <p className="text-gray-600 text-[10px]">гишүүн</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditCoach(c); setShowForm(false); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl
                                 bg-white/5 text-gray-400 border border-white/10
                                 hover:bg-white/10 hover:text-white transition">
                      <IconEdit />
                      Засах
                    </button>
                    <button onClick={() => handleDelete(c)} disabled={deleting === c.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl
                                 bg-red-500/10 text-red-400 border border-red-500/20
                                 hover:bg-red-500/20 transition disabled:opacity-50">
                      <IconTrash />
                      {deleting === c.id ? "..." : "Устгах"}
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
