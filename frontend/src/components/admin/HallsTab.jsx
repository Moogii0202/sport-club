import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { inputCls, IconPlus, IconEdit, IconTrash, IconHall, Spinner, IconClose } from "./shared";

const DISTRICTS = [
  "Баянзүрх", "Баянгол", "Сүхбаатар", "Чингэлтэй",
  "Хан-Уул", "Сонгинохайрхан", "Багануур", "Багахангай", "Налайх",
];

const EMPTY_HALL = { name: "", district: "", subDistrict: "", phone: "", mapUrl: "", image: "", lat: "", lng: "" };

const selCls = `w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-sm
  focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition`;

function extractCoordsFromUrl(url) {
  if (!url) return null;
  let m = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (m) return { lat: m[1], lng: m[2] };
  m = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (m) return { lat: m[1], lng: m[2] };
  m = url.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (m) return { lat: m[1], lng: m[2] };
  return null;
}

export default function HallsTab() {
  const [halls,      setHalls]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_HALL);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [imgPreview, setImgPreview] = useState("");

  const fetchHalls = () => {
    setLoading(true);
    api.get("/halls")
      .then(data => setHalls(Array.isArray(data) ? data : []))
      .catch(() => setHalls([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHalls(); }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const handleExtractCoords = () => {
    const coords = extractCoordsFromUrl(form.mapUrl);
    if (coords) {
      setForm(p => ({ ...p, lat: coords.lat, lng: coords.lng }));
      setError("");
    } else {
      setError("URL-с координат олдсонгүй. Өргөрөг/уртрагийг гараар оруулна уу");
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError("Зураг 4MB-аас бага байх ёстой"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("image", ev.target.result);
      setImgPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const openEdit = (h) => {
    setEditingId(h.id);
    setForm({
      name: h.name || "", district: h.district || "", subDistrict: h.subDistrict || "",
      phone: h.phone || "", mapUrl: h.mapUrl || "",
      image: "", lat: h.lat ?? "", lng: h.lng ?? "",
    });
    setImgPreview(h.image || "");
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null);
    setError(""); setImgPreview(""); setForm(EMPTY_HALL);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Заалны нэр шаардлагатай");
    setSaving(true); setError("");
    try {
      const payload = { ...form, image: form.image || imgPreview || "" };
      if (editingId) {
        await api.put(`/halls/${editingId}`, payload);
      } else {
        await api.post("/halls", payload);
      }
      closeForm();
      fetchHalls();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, hallName) => {
    if (!window.confirm(`"${hallName}" заалыг устгах уу?`)) return;
    try {
      await api.delete(`/halls/${id}`);
      setHalls(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4">
          <p className="text-2xl font-extrabold text-orange-400">{halls.length}</p>
          <p className="text-gray-500 text-sm">Нийт заал</p>
        </div>
        <button
          onClick={() => { if (showForm) { closeForm(); } else { setShowForm(true); setEditingId(null); } }}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-bold
                     rounded-xl hover:bg-orange-600 transition">
          <IconPlus />
          Заал нэмэх
        </button>
      </div>

      {showForm && (
        <div className="bg-[#151515] border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold flex items-center gap-2">
              <IconHall /> {editingId ? "Заал засварлах" : "Шинэ заал бүртгэх"}
            </h3>
            <button onClick={closeForm} className="text-gray-600 hover:text-gray-400 transition">
              <IconClose />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Заалны нэр *</label>
              <input type="text" placeholder="Дасгалын заал №1"
                value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Дүүрэг</label>
              <select value={form.district} onChange={e => set("district", e.target.value)} className={selCls}>
                <option value="">— Дүүрэг сонгох —</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d} дүүрэг</option>)}
              </select>
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Хороо</label>
              <input type="text" placeholder="1-р хороо"
                value={form.subDistrict} onChange={e => set("subDistrict", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Заалны утас</label>
              <input type="tel" placeholder="9911-2233"
                value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Google Maps холбоос</label>
              <div className="flex gap-2">
                <input type="url" placeholder="https://maps.google.com/..."
                  value={form.mapUrl} onChange={e => set("mapUrl", e.target.value)}
                  className={inputCls + " flex-1"} />
                <button type="button" onClick={handleExtractCoords}
                  title="URL-с өргөрөг/уртрагийг автоматаар авах"
                  className="shrink-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl
                             text-gray-400 text-xs hover:bg-white/10 hover:text-white transition whitespace-nowrap">
                  <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Координат авах
                </button>
              </div>
              <p className="text-gray-700 text-[10px] mt-1">
                Google Maps дээр байршлаа нээж Share → Copy link хийн нааж, "Координат авах" дарна уу
              </p>
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Өргөрөг (Latitude)</label>
              <input type="number" step="0.0000001" placeholder="47.9184676"
                value={form.lat} onChange={e => set("lat", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Уртраг (Longitude)</label>
              <input type="number" step="0.0000001" placeholder="106.9177016"
                value={form.lng} onChange={e => set("lng", e.target.value)} className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">Заалны зураг</label>
              <div className="flex items-start gap-4">
                {imgPreview && (
                  <div className="relative shrink-0">
                    <img src={imgPreview} alt="preview"
                      className="w-24 h-20 object-cover rounded-xl border border-white/10" />
                    <button onClick={() => { setImgPreview(""); set("image", ""); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                                 flex items-center justify-center text-white text-[10px]">✕</button>
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center px-4 py-5 border-2 border-dashed
                                  border-white/10 rounded-xl cursor-pointer hover:border-orange-500/40 transition">
                  <svg className="w-6 h-6 text-gray-600 mb-1.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 text-xs">Зураг сонгох (4MB хүртэл)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
          )}

          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl
                         hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
              {saving && <Spinner />}
              {saving ? "Хадгалж байна..." : editingId ? "Хадгалах" : "Заал нэмэх"}
            </button>
            <button onClick={closeForm}
              className="px-5 py-2.5 border border-white/10 text-gray-400 text-sm rounded-xl hover:border-white/20 transition">
              Цуцлах
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
          <h3 className="text-white font-bold">Заалны жагсаалт</h3>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-600 text-sm">Уншиж байна...</div>
        ) : halls.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
            <p className="text-gray-600 text-sm">Заал бүртгэлгүй байна</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {halls.map(h => (
              <div key={h.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition">
                <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0 bg-[#1a1a1a] border border-white/5
                                flex items-center justify-center">
                  {h.image
                    ? <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                    : <IconHall />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold text-sm">{h.name}</p>
                    {h.lat && h.lng
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-semibold flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Зурагт харагдана</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>Координат байхгүй</span>
                    }
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {[h.district && `${h.district} дүүрэг`, h.subDistrict].filter(Boolean).join(", ")}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {h.phone && <span className="text-gray-600 text-[10px] flex items-center gap-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{h.phone}</span>}
                    {h.mapUrl && (
                      <a href={h.mapUrl} target="_blank" rel="noreferrer"
                        className="text-orange-400 text-[10px] hover:underline flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>Газрын зураг
                      </a>
                    )}
                    {h.lat && h.lng && (
                      <span className="text-gray-600 text-[10px]">
                        {Number(h.lat).toFixed(4)}, {Number(h.lng).toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(h)}
                    className="p-2 rounded-lg text-gray-600 hover:text-orange-400 hover:bg-orange-500/10 transition"
                    title="Засварлах">
                    <IconEdit />
                  </button>
                  <button onClick={() => handleDelete(h.id, h.name)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Устгах">
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
