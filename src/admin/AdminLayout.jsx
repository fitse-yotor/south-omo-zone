import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Database, ExternalLink, Info, Landmark, LayoutDashboard, LogOut, Map, Megaphone, Newspaper } from "lucide-react";
import { currentUser, logout } from "../cms/auth";
import { LOGO } from "../components/Layout";
import { ToastProvider } from "./kit";

export const ADMIN_NAV = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/news", "News", Newspaper],
  ["/admin/announcements", "Announcements", Megaphone],
  ["/admin/tourism", "Tourism & routes", Map],
  ["/admin/investment", "Investment", Briefcase],
  ["/admin/site", "Site text & leader", Landmark],
  ["/admin/data", "Publish & data", Database],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = currentUser();
  const [, force] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const signOut = () => { logout(); force((x) => x + 1); navigate("/login", { replace: true }); };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-sand-50 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="bg-royal-950 text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="flex items-center gap-3 px-5 py-5">
            <img src={LOGO} alt="" className="h-10 w-10 rounded-full bg-white p-0.5" />
            <div className="leading-tight"><p className="font-serif text-lg">South Omo Zone</p><p className="text-[11px] text-white/55">Content admin</p></div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Admin">
            {ADMIN_NAV.map(([to, label, I]) => (
              <NavLink key={to} to={to} end={to === "/admin"}
                className={({ isActive }) => `flex flex-none items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? "bg-white text-royal-950" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <I size={17} />{label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden px-5 py-6 lg:block">
            <div className="rounded-xl bg-white/5 p-3.5 text-xs leading-relaxed text-white/60 ring-1 ring-white/10">
              <p className="flex items-center gap-1.5 font-semibold text-sun-400"><Info size={13} />Demo mode</p>
              <p className="mt-1">Edits are saved in this browser only. Use Publish & data to export them.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex items-center justify-between gap-4 border-b border-sand-200 bg-white/80 px-5 py-3 backdrop-blur sm:px-8">
            <p className="truncate text-sm text-ink-soft">Signed in as <b className="font-semibold text-royal-950">{user?.name}</b></p>
            <div className="flex items-center gap-1">
              <a href="#/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-royal-700 hover:bg-royal-50"><ExternalLink size={15} /><span className="hidden sm:inline">View site</span></a>
              <button type="button" onClick={signOut} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-sand-100"><LogOut size={15} /><span className="hidden sm:inline">Sign out</span></button>
            </div>
          </header>
          <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-6xl"><Outlet /></div></main>
        </div>
      </div>
    </ToastProvider>
  );
}
