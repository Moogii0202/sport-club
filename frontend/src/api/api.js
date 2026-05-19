const API_BASE_URL = process.env.REACT_APP_API_URL ||
  `http://${window.location.hostname}:4000/api`;

const getToken = () => sessionStorage.getItem("token");

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Сервертэй холбогдох хугацаа дууссан. Сервер ажиллаж байгаа эсэхийг шалгана уу.");
    throw new Error("Сервертэй холбогдож чадсангүй. Интернэт болон серверийн тохиргоог шалгана уу.");
  } finally {
    clearTimeout(timer);
  }
}

async function handleError(res) {
  const text = await res.text();
  let message = `Серверийн алдаа (${res.status})`;
  try {
    const e = JSON.parse(text);
    if (e.error) message = e.error;
  } catch {}
  throw new Error(message);
}

export const api = {
  post: async (url, data) => {
    const token = getToken();
    const res = await request(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) await handleError(res);
    return res.json();
  },

  get: async (url) => {
    const token = getToken();
    const res = await request(`${API_BASE_URL}${url}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (!res.ok) await handleError(res);
    return res.json();
  },

  put: async (url, data) => {
    const token = getToken();
    const res = await request(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) await handleError(res);
    return res.json();
  },

  patch: async (url, data) => {
    const token = getToken();
    const res = await request(`${API_BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) await handleError(res);
    return res.json();
  },

  delete: async (url) => {
    const token = getToken();
    const res = await request(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (!res.ok) await handleError(res);
    return res.json();
  }
};
