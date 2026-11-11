import { useLang } from "../i18n";
import { woredas as _w } from "../data/mock";

export const Loading = () => { const { t } = useLang(); return <p className="muted center pad">{t("loading")}</p>; };

export function SectorTag({ id, sectors }) {
  const { tx } = useLang();
  const s = sectors[id];
  return <span className="tag" style={{ "--c": s.color }}>{tx(s)}</span>;
}

// Generated art for a woreda (no external images needed)
export function WoredaArt({ hue, name }) {
  return (
    <div className="art" style={{ "--h": hue }} aria-hidden>
      <svg viewBox="0 0 400 200" preserveAspectRatio="none">
        <path d="M0 140 Q90 70 180 120 T400 90 V200 H0Z" fill="rgba(255,255,255,.18)" />
        <path d="M0 170 Q120 110 240 160 T400 140 V200 H0Z" fill="rgba(0,0,0,.18)" />
        <circle cx="320" cy="48" r="22" fill="rgba(255,255,255,.55)" />
      </svg>
      <span>{name.slice(0, 1)}</span>
    </div>
  );
}
