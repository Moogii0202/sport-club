import React, { useState, useEffect } from "react";
import { api } from "../../api/api";

export default function EnrollmentTab() {
  const [enrollments,   setEnrollments]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get("/enrollments/pending");
      setEnrollments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      await api.put(`/enrollments/${id}/${action}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-orange-500 shrink-0" />
        <h2 className="text-white font-bold">Элсэлтийн хүсэлтүүд</h2>
        {!loading && (
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
            {enrollments.length} хүсэлт
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-600 text-sm">Уншиж байна...</div>
      ) : enrollments.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-gray-600 text-sm">Хүлээгдэж буй хүсэлт байхгүй</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {enrollments.map(e => (
            <div key={e.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{e.lastName} {e.firstName}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                  <span>📞 {e.phone}</span>
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                    {e.className}
                  </span>
                </div>
                {e.notes && <p className="text-gray-600 text-xs mt-1">📝 {e.notes}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleAction(e.id, "approve")} disabled={actionLoading === e.id}
                  className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-semibold rounded-xl
                             hover:bg-green-500/20 transition disabled:opacity-50 border border-green-500/20">
                  Батлах
                </button>
                <button onClick={() => handleAction(e.id, "reject")} disabled={actionLoading === e.id}
                  className="px-4 py-2 bg-red-500/10 text-red-400 text-sm font-semibold rounded-xl
                             hover:bg-red-500/20 transition disabled:opacity-50 border border-red-500/20">
                  Татгалзах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
