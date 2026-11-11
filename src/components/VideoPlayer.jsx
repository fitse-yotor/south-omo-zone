import { useState } from "react";
import { useLang } from "../i18n";

const yt = (u) => {
  const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

export default function VideoPlayer({ src, poster }) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return <div className="video placeholder"><span className="play">▶</span><p>{t("noVideo")}</p></div>;
  const embed = yt(src);
  return (
    <div className="video">
      {embed ? (
        <iframe src={embed} title="Message" allowFullScreen loading="lazy" />
      ) : (
        <video controls preload="metadata" poster={poster || undefined} onError={() => setFailed(true)}>
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
