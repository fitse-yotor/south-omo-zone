import { useState } from "react";
import { useLang } from "../i18n";
import { SITE } from "../config";

export default function Contact() {
  const { t, tx } = useLang();
  const [sent, setSent] = useState(false);
  return (
    <section className="wrap section">
      <h1 className="h1">{t("contactTitle")}</h1>
      <p className="muted">{t("contactIntro")}</p>
      <div className="twocol">
        <form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <label>{t("name")}<input className="input" required /></label>
          <label>{t("email")}<input className="input" type="email" required /></label>
          <label>{t("message")}<textarea className="input" rows="5" required /></label>
          <button className="btn green">{t("send")}</button>
          {sent && <p className="ok">{t("sent")}</p>}
        </form>
        <dl className="facts box">
          <div><dt>{t("address")}</dt><dd>{tx(SITE.contact.address)}</dd></div>
          <div><dt>{t("phone")}</dt><dd>{SITE.contact.phone}</dd></div>
          <div><dt>{t("email")}</dt><dd>{SITE.contact.email}</dd></div>
          <div><dt>{t("investDesk")}</dt><dd>{SITE.contact.investmentDesk}</dd></div>
        </dl>
      </div>
    </section>
  );
}
