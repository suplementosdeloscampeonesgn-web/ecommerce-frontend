export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
  return fetch(url, { ...options, headers });
}