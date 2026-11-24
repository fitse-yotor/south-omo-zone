import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Info, LogIn } from "lucide-react";
import { currentUser, DEMO_USER, login } from "../cms/auth";
import { inputCls } from "./kit";
import { LOGO } from "../components/Layout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const to = location.state?.from && location.state.from.startsWith("/admin") ? location.state.from : "/admin";
  if (currentUser()) return <Navigate to={to} replace />;

  const submit = (e) => {
    e.preventDefault();
    if (login(username, password)) navigate(to, { replace: true });
    else setError("That username and password don't match. Check them and try again.");
  };

  return (
    <div className="grid min-h-screen bg-sand-50 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-royal-950 lg:block">
        <img src="./images/turmi-hills.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/40 to-royal-950/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <img src={LOGO} alt="" className="h-16 w-16 rounded-full bg-white p-0.5" />
          <h2 className="mt-6 max-w-md font-serif text-4xl leading-tight">Manage the South Omo Zone portal</h2>
          <p className="mt-3 max-w-md text-white/70">News, vacancies and tenders, tourism routes, investment opportunities and the leader's message, in English and Amharic.</p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-medium text-ink-soft hover:text-royal-700"><ArrowLeft size={16} />Back to the site</Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <img src={LOGO} alt="" className="h-14 w-14 rounded-full bg-white p-0.5 shadow-soft lg:hidden" />
          <h1 className="mt-6 font-serif text-3xl text-royal-950 lg:mt-0">Staff sign in</h1>
          <p className="mt-2 text-sm text-ink-soft">Sign in to edit the portal's content.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block text-[13px] font-medium text-royal-950">Username
              <input id="username" autoComplete="username" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} className={inputCls} required />
            </label>
            <label className="block text-[13px] font-medium text-royal-950">Password
              <span className="relative block">
                <input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} className={`${inputCls} pr-11`} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 mt-[3px] -translate-y-1/2 rounded-lg p-1.5 text-ink-mute hover:text-royal-700" aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-ember-50 px-3.5 py-2.5 text-sm text-ember-600">{error}</p>}
            <button type="submit" className="btn-primary w-full !py-3"><LogIn size={17} />Sign in</button>
          </form>

          <div className="mt-8 rounded-2xl bg-sun-100/70 p-4 text-sm text-ink-soft ring-1 ring-sun-400/40">
            <p className="flex items-center gap-2 font-semibold text-royal-950"><Info size={15} />Demo mode</p>
            <p className="mt-1.5 leading-relaxed">There is no server yet. Edits are saved in this browser only, and this login is for trying the panel, not for security.</p>
            <p className="mt-3 font-mono text-[13px] text-royal-950">{DEMO_USER.username} / {DEMO_USER.password}</p>
            <button type="button" onClick={() => { setUsername(DEMO_USER.username); setPassword(DEMO_USER.password); setError(""); }} className="mt-2 text-[13px] font-semibold text-royal-600 hover:text-royal-800">Fill in demo account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
