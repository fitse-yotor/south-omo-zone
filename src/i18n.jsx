import { createContext, useContext, useEffect, useState } from "react";

const dict = {
  en: {
    home: "Home", woredas: "Woredas", opportunities: "Opportunities", announcements: "Announcements", contact: "Contact",
    invest: "Explore opportunities", leaderMsg: "Message from the Zone Administrator", readMore: "Read full message",
    watch: "Watch the message", noVideo: "Video coming soon", viewWoreda: "View woreda", viewDetails: "View details",
    woredaList: "Our woredas", woredaIntro: "Explore each woreda and the investment opportunities waiting there.",
    search: "Search", all: "All", sector: "Sector", woreda: "Woreda", land: "Land", investment: "Investment", jobs: "Jobs",
    ha: "ha", musd: "M USD", population: "Population", area: "Area", centre: "Administrative centre",
    available: "Available", limited: "Limited plots", noResults: "Nothing matches your filters.",
    vacancies: "Vacancies", tenders: "Tenders", open: "Open", closed: "Closed", daysLeft: "days left", closesToday: "Closes today",
    deadline: "Deadline", posted: "Posted", organization: "Organization", location: "Location", reference: "Reference",
    requirements: "Requirements / details", close: "Close", showClosed: "Show closed",
    annIntro: "Official job vacancies and procurement tenders from the zone administration.",
    heroKicker: "Zone Administration", back: "Back to woredas", loading: "Loading…", notFound: "Not found.",
    featured: "Featured opportunities", latestAnn: "Latest announcements", all_: "View all",
    investDesk: "Investment desk", mock: "Demo site with mock data",
    footerAbout: "Official website of the South Omo Zone administration.", quickLinks: "Quick links",
    opps: "opportunities",
    contactTitle: "Contact the zone", contactIntro: "Send us your enquiry and the investment desk will reply.",
    name: "Your name", email: "Email", message: "Message", send: "Send message", sent: "Thank you. Your message was recorded (demo).",
    address: "Address", phone: "Phone",
  },
  am: {
    home: "መነሻ", woredas: "ወረዳዎች", opportunities: "የኢንቨስትመንት ዕድሎች", announcements: "ማስታወቂያዎች", contact: "ያግኙን",
    invest: "ዕድሎችን ይመልከቱ", leaderMsg: "የዞኑ ዋና አስተዳዳሪ መልዕክት", readMore: "ሙሉ መልዕክቱን ያንብቡ",
    watch: "መልዕክቱን በቪዲዮ ይመልከቱ", noVideo: "ቪዲዮ በቅርቡ ይቀርባል", viewWoreda: "ወረዳውን ይመልከቱ", viewDetails: "ዝርዝር ይመልከቱ",
    woredaList: "ወረዳዎቻችን", woredaIntro: "እያንዳንዱን ወረዳና በውስጡ የሚጠብቁ የኢንቨስትመንት ዕድሎችን ይቃኙ።",
    search: "ፈልግ", all: "ሁሉም", sector: "ዘርፍ", woreda: "ወረዳ", land: "መሬት", investment: "ኢንቨስትመንት", jobs: "የሥራ ዕድል",
    ha: "ሄክታር", musd: "ሚሊዮን ዶላር", population: "የህዝብ ብዛት", area: "የቆዳ ስፋት", centre: "የአስተዳደር ማዕከል",
    available: "ክፍት", limited: "ውስን መሬት", noResults: "ከፍለጋዎ ጋር የሚዛመድ ነገር የለም።",
    vacancies: "ክፍት የሥራ ቦታዎች", tenders: "ጨረታዎች", open: "ክፍት", closed: "ተዘግቷል", daysLeft: "ቀናት ቀርተዋል", closesToday: "ዛሬ ይዘጋል",
    deadline: "የመጨረሻ ቀን", posted: "የወጣበት", organization: "ተቋም", location: "ቦታ", reference: "ማጣቀሻ ቁጥር",
    requirements: "መስፈርቶች / ዝርዝር", close: "ዝጋ", showClosed: "የተዘጉትን አሳይ",
    annIntro: "ከዞኑ አስተዳደር የሚወጡ ኦፊሴላዊ የሥራ ማስታወቂያዎችና የግዥ ጨረታዎች።",
    heroKicker: "የዞን አስተዳደር", back: "ወደ ወረዳዎች ተመለስ", loading: "በመጫን ላይ…", notFound: "አልተገኘም።",
    featured: "ተመራጭ ዕድሎች", latestAnn: "የቅርብ ጊዜ ማስታወቂያዎች", all_: "ሁሉንም ይመልከቱ",
    investDesk: "የኢንቨስትመንት ጽ/ቤት", mock: "ናሙና ድረ-ገጽ (የሙከራ መረጃ)",
    footerAbout: "የደቡብ ኦሞ ዞን አስተዳደር ኦፊሴላዊ ድረ-ገጽ።", quickLinks: "ፈጣን አገናኞች",
    opps: "ዕድሎች",
    contactTitle: "ዞኑን ያግኙ", contactIntro: "ጥያቄዎን ይላኩ፤ የኢንቨስትመንት ጽ/ቤቱ ምላሽ ይሰጣል።",
    name: "ስምዎ", email: "ኢሜይል", message: "መልዕክት", send: "መልዕክት ላክ", sent: "አመሰግናለሁ። መልዕክትዎ ተመዝግቧል (ናሙና)።",
    address: "አድራሻ", phone: "ስልክ",
  },
};

const Ctx = createContext(null);
export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") || "en"; } catch { return "en"; }
  });
  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (k) => dict[lang][k] ?? k;
  const tx = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o[lang] ?? o.en : o); // {en, am} -> string
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(lang === "am" ? "am-ET" : "en-GB", { year: "numeric", month: "short", day: "numeric" });
  return <Ctx.Provider value={{ lang, setLang, t, tx, fmtDate }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
