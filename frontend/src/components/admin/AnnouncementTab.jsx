import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { inputCls, IconPlus, IconTrash, Spinner, IconClose } from "./shared";

const TARGET_OPTS = [
  { value: "all",    label: "Бүгдэд (тоглогч + дасгалжуулагч)" },
  { value: "player", label: "Зөвхөн тоглогчид"                 },
  { value: "coach",  label: "Зөвхөн дасгалжуулагчид"           },
];
const TARGET_BADGE = {
  all:    "bg-gray-500/10   text-gray-400   border-gray-500/20",
  player: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  coach:  "bg-blue-500/10   text-blue-400   border-blue-500/20",
};
const TARGET_LABEL = { all: "Бүгдэд", player: "Тоглогч", coach: "Дасгалжуулагч" };

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const selCls = `w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white
  text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition`;

export default function AnnouncementTab() {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ title: "", body: "", targetRole: "all" });
  const [saving,     setSaving]     = useState(false);
  const [formErr,    setFormErr]    = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchList = async () => {
    try {
      const data = await api.get("/announcements");
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const setF = (k, v) => { setForm(p => ({ ...p, [k]: v })); setFormErr(""); };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormErr("Гарчиг оруулна уу"); return; }
    if (!form.body.trim())  { setFormErr("Агуулга оруулна уу"); return; }
    setSaving(true); setFormErr("");
    try {
      await api.post("/announcements", form);
      await fetchList();
      setShowForm(false);
      setForm({ title: "", body: "", targetRole: "all" });
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Мэдэгдэлийг устгах уу?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/announcements/${id}`);
      setList(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Нийт мэдэгдэл",     value: list.length,                                       color: "text-white"      },
          { label: "Бүгдэд хамаарах",    value: list.filter(n => n.targetRole === "all").length,  color: "text-gray-400"   },
          { label: "Тусгай хэрэглэгчид", value: list.filter(n => n.targetRole !== "all").length,  color: "text-orange-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="bg-[#151515] rounded-2xl border border-orange-500/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">Шинэ мэдэгдэл</h3>
            <button onClick={() => { setShowForm(false); setFormErr(""); }}
              className="text-gray-600 hover:text-gray-300 transition">
              <IconClose />
            </button>
          </div>

          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Хэрэглэгчийн бүлэг *</label>
            <select value={form.targetRole} onChange={e => setF("targetRole", e.target.value)} className={selCls}>
              {TARGET_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Гарчиг *</label>
            <input type="text" placeholder="Мэдэгдлийн гарчиг" value={form.title}
              onChange={e => setF("title", e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Агуулга *</label>
            <textarea rows={4} placeholder="Мэдэгдлийн дэлгэрэнгүй агуулга..."
              value={form.body} onChange={e => setF("body", e.target.value)}
              className={`${inputCls} resize-none`} />
          </div>

          {formErr && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{formErr}</p>
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                         hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
              {saving && <Spinner />}
              {saving ? "Нийтэлж байна..." : "Нийтлэх"}
            </button>
            <button onClick={() => { setShowForm(false); setFormErr(""); }}
              className="px-5 py-2.5 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition">
              Цуцлах
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm
                     font-bold rounded-xl hover:bg-orange-600 transition">
          <IconPlus /> Шинэ мэдэгдэл
        </button>
      )}

      <div className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3">
          <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
          <h3 className="text-white font-bold text-sm">Нийтлэгдсэн мэдэгдлүүд</h3>
          <span className="text-gray-600 text-xs">{list.length} нийт</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-600 text-sm">Уншиж байна...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🔔</p>
            <p className="text-gray-600 text-sm">Мэдэгдэл байхгүй байна</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map(n => (
              <div key={n.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">{n.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold
                      ${TARGET_BADGE[n.targetRole] || TARGET_BADGE.all}`}>
                      {TARGET_LABEL[n.targetRole] || "Бүгдэд"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{n.body}</p>
                  <p className="text-gray-700 text-[10px] mt-1.5">{fmtDateTime(n.createdAt)}</p>
                </div>
                <button onClick={() => handleDelete(n.id)} disabled={deletingId === n.id}
                  className="shrink-0 p-2 rounded-lg text-gray-600 hover:text-red-400
                             hover:bg-red-500/10 transition disabled:opacity-50">
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
