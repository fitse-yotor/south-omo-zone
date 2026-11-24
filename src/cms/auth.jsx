// DEMO LOGIN ONLY. This check runs in the visitor's browser, so it does not protect anything:
// anyone can read these credentials in the site's code. Replace it with a real backend
// (for example Supabase Auth) before the admin panel is used for real.
import { Navigate, useLocation } from "react-router-dom";

export const DEMO_USER = { username: "admin", password: "southomo-demo", name: "Site administrator" };
const SESSION_KEY = "som-admin-session";

export function login(username, password) {
  if (username.trim().toLowerCase() !== DEMO_USER.username || password !== DEMO_USER.password) return false;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: DEMO_USER.username, name: DEMO_USER.name, at: Date.now() })); } catch {}
  return true;
}
export function logout() { try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
export function currentUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
}

export function RequireAuth({ children }) {
  const location = useLocation();
  if (!currentUser()) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
