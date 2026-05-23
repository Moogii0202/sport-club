import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../api/api";

const ACCENT_OPTIONS = [
  { value: "orange", label: "Улаан шар", swatch: "bg-orange-500" },
  { value: "blue",   label: "Цэнхэр",   swatch: "bg-blue-500"   },
  { value: "purple", label: "Нил",       swatch: "bg-purple-500" },
  { value: "green",  label: "Ногоон",    swatch: "bg-green-500"  },
  { value: "red",    label: "Улаан",     swatch: "bg-red-500"    },
  { value: "yellow", label: "Шар",       swatch: "bg-yellow-500" },
  { value: "indigo", label: "Индиго",    swatch: "bg-indigo-500" },
  { value: "teal",   label: "Хөх ногоон",swatch: "bg-teal-500"  },
  { value: "pink",   label: "Ягаан",     swatch: "bg-pink-500"   },
];

const SWATCH = {
  orange: "bg-orange-500", blue: "bg-blue-500", purple: "bg-purple-500",
  green:  "bg-green-500",  red:  "bg-red-500",  yellow: "bg-yellow-500",
  indigo: "bg-indigo-500", teal: "bg-teal-500", pink:   "bg-pink-500",
};

const EMPTY_FORM = {
  name: "", badge: "", description: "", features: [""], fee: "", accent: "orange", sortOrder: "",
  startDate: "", endDate: "",
};

function LevelForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFeature = (i, v) => setForm(f => {
    const arr = [...f.features]; arr[i] = v; return { ...f, features: arr };
  });
  const addFeature    = () => setForm(f => ({ ...f, features: [...f.features, ""] }));
  const removeFeature = (i) => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleSubmit = () => {
    const payload = {
      ...form,
      fee:       parseInt(form.fee)       || 0,
      sortOrder: parseInt(form.sortOrder) || 0,
      features:  form.features.filter(f => f.trim()),
      startDate: form.startDate || null,
      endDate:   form.endDate   || null,
    };
    onSave(payload);
  };

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition";

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Түвшний нэр *</label>
          <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Анхан шат" />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Шошго</label>
          <input className={inputCls} value={form.badge} onChange={e => set("badge", e.target.value)} placeholder="Эхлэгчдэд" />
        </div>
      </div>

      <div>
        <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Тайлбар</label>
        <textarea className={inputCls + " resize-none"} rows={3} value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Энэ түвшний тухай товч тайлбар..." />
      </div>

      <div>
        <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Онцлогууд</label>
        <div className="space-y-2">
          {form.features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} value={f} onChange={e => setFeature(i, e.target.value)}
                placeholder={`Онцлог ${i + 1}`} />
              <button onClick={() => removeFeature(i)}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-red-400 border border-white/10 rounded-xl transition shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={addFeature}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Онцлог нэмэх
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Сарын хураамж (₮)</label>
          <input className={inputCls} type="number" min="0" value={form.fee}
            onChange={e => set("fee", e.target.value)} placeholder="80000" />
        </div>
        <div>
          <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Эрэмбэ</label>
          <input className={inputCls} type="number" min="0" value={form.sortOrder}
            onChange={e => set("sortOrder", e.target.value)} placeholder="1" />
        </div>
      </div>

      <div className="border-t border-white/8 pt-4">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Элсэлтийн хугацаа</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Эхлэх огноо</label>
            <input className={inputCls} type="date" value={form.startDate || ""}
              onChange={e => set("startDate", e.target.value)} />
          </div>
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Дуусах огноо</label>
            <input className={inputCls} type="date" value={form.endDate || ""}
              onChange={e => set("endDate", e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <label className="text-gray-500 text-xs uppercase tracking-widest block mb-2">Өнгө</label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => set("accent", opt.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition
                ${form.accent === opt.value
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"}`}>
              <span className={`w-3 h-3 rounded-full ${opt.swatch}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={handleSubmit} disabled={saving}
          className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition disabled:opacity-50 text-sm">
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
        <button onClick={onCancel}
          className="px-6 py-2.5 border border-white/20 text-gray-400 font-medium rounded-full hover:border-white/40 hover:text-white transition text-sm">
          Болих
        </button>
      </div>
    </div>
  );
}

export default function LevelsTab() {
  const [levels,   setLevels]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mode,     setMode]     = useState(null);   // null | "add" | {id, ...}
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");
  const [deleting, setDeleting] = useState(null);
  const [delErr,   setDelErr]   = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get("/admin/levels")
      .then(data => setLevels(Array.isArray(data) ? data : []))
      .catch(() => setLevels([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    setSaving(true);
    setFormErr("");
    try {
      if (mode === "add") {
        await api.post("/admin/levels", payload);
      } else {
        await api.put(`/admin/levels/${mode.id}`, payload);
      }
      setMode(null);
      load();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lv) => {
    setDeleting(lv.id);
    setDelErr("");
    try {
      await api.delete(`/admin/levels/${lv.id}`);
      load();
    } catch (err) {
      setDelErr(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-600">
        <svg className="w-5 h-5 animate-spin mr-2 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Уншиж байна...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Түвшин удирдлага</h2>
          <p className="text-gray-500 text-sm mt-1">Элсэлтийн хуудсанд харагдах түвшингүүдийг удирдана</p>
        </div>
        {mode !== "add" && (
          <button onClick={() => { setMode("add"); setFormErr(""); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Түвшин нэмэх
          </button>
        )}
      </div>

      {mode === "add" && (
        <LevelForm onSave={handleSave} onCancel={() => setMode(null)} saving={saving} error={formErr} />
      )}

      {delErr && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{delErr}</p>
      )}

      {levels.length === 0 && mode !== "add" ? (
        <div className="text-center py-16 border border-white/10 rounded-2xl bg-[#111]">
          <p className="text-gray-500 text-sm">Одоогоор түвшин бүртгэгдээгүй байна</p>
        </div>
      ) : (
        <div className="space-y-3">
          {levels.map(lv => {
            const swatch = SWATCH[lv.accent] || SWATCH.orange;
            const isEditing = mode && mode !== "add" && mode.id === lv.id;
            return (
              <div key={lv.id}>
                {isEditing ? (
                  <LevelForm
                    initial={{
                      name: lv.name, badge: lv.badge, description: lv.description,
                      features: Array.isArray(lv.features) && lv.features.length ? lv.features : [""],
                      fee: lv.fee, accent: lv.accent, sortOrder: lv.sortOrder,
                      startDate: lv.startDate || "", endDate: lv.endDate || "",
                    }}
                    onSave={handleSave}
                    onCancel={() => setMode(null)}
                    saving={saving}
                    error={formErr}
                  />
                ) : (
                  <div className="bg-[#151515] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${swatch}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold">{lv.name}</span>
                            {lv.badge && (
                              <span className="text-xs text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                {lv.badge}
                              </span>
                            )}
                            <span className="text-xs text-orange-400 font-semibold">
                              {lv.fee ? `${Number(lv.fee).toLocaleString()}₮/сар` : "—"}
                            </span>
                          </div>
                          {lv.description && (
                            <p className="text-gray-500 text-xs mt-1 truncate max-w-lg">{lv.description}</p>
                          )}
                          {Array.isArray(lv.features) && lv.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {lv.features.map((f, i) => (
                                <span key={i} className="text-[11px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                          {(lv.startDate || lv.endDate) && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[11px] text-gray-500">
                                {lv.startDate || "—"} → {lv.endDate || "—"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setMode(lv); setFormErr(""); setDelErr(""); }}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-400 border border-white/10 rounded-xl transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(lv)}
                          disabled={deleting === lv.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 border border-white/10 rounded-xl transition disabled:opacity-40">
                          {deleting === lv.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
