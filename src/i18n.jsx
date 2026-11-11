import { createContext, useContext, useEffect, useState } from "react";

const dict = {
  en: {
    home: "Home", about: "The Zone", invest: "Invest", woredas: "Woredas", tourism: "Tourism", announcements: "Announcements", contact: "Contact", credits: "Photo credits",
    region: "South Ethiopia Regional State", officialPortal: "Official portal",
    exploreInvest: "Investment opportunities", planVisit: "Plan your visit",
    leaderEyebrow: "From the Chief Administrator", leaderTitle: "A message to our investors, partners and visitors",
    readFull: "Read the full message", watchVideo: "Watch video message", videoSoon: "The video message will be published here soon.", close: "Close",
    sectorsEyebrow: "Invest in South Omo", sectorsTitle: "Six sectors ready for investment", sectorsLead: "Land, water and a young workforce, with an administration committed to responsible development that our communities share in.",
    woredasEyebrow: "Our woredas", woredasTitle: "Eight woredas, each with its own strengths", allWoredas: "All woredas",
    tourismEyebrow: "Discover", tourismTitle: "A valley unlike anywhere else", tourismLead: "A UNESCO World Heritage landscape, wild savanna and living cultures that welcome respectful travellers.", exploreTourism: "Explore tourism",
    annEyebrow: "Notice board", annTitle: "Vacancies & tenders", vacancies: "Vacancies", tenders: "Tenders", all: "All", allAnn: "All announcements",
    open: "Open", closed: "Closed", daysLeft: "days left", dayLeft: "day left", closesToday: "Closes today", deadline: "Deadline", posted: "Posted", reference: "Reference", organization: "Office", location: "Location", requirements: "Requirements", showClosed: "Show closed",
    ctaTitle: "Talk to our investment desk", ctaText: "Tell us about your project. We will arrange meetings with the woreda and a site visit.", ctaBtn: "Contact the investment office",
    seat: "Administrative seat", peoples: "Peoples", highlights: "Highlights", keySectors: "Key sectors", opportunities: "Opportunities", viewWoreda: "View woreda", backWoredas: "All woredas",
    land: "Land", investment: "Investment", jobs: "Jobs", ha: "ha", musd: "M USD", search: "Search opportunities", sector: "Sector", woreda: "Woreda", noResults: "No results match your filters.",
    sample: "Sample listing: details to be confirmed by the Zone Investment Office.", sampleAnn: "Sample notices: official notices will be published by the zone HR and procurement offices.",
    stepsEyebrow: "How to invest", stepsTitle: "From first enquiry to operation", principlesEyebrow: "Our commitments", principlesTitle: "Responsible investment",
    attractions: "Attractions", markets: "Weekly markets", marketsLead: "Market days can change. Confirm with the tourism office or your guide before travelling.", today: "Today", etiquetteTitle: "Travel responsibly", peoplesTitle: "Peoples of South Omo",
    gettingThere: "Getting there", gettingThereText: "Fly from Addis Ababa to Jinka, then continue by road to Dimeka, Turmi and the rest of the zone. Most visitors travel with a licensed guide and a 4×4 vehicle.",
    bestTime: "When to visit", bestTimeText: "The drier months from about June to February are the easiest for travel. Heavy rains, usually from March to May, can make roads difficult.",
    aboutEyebrow: "About the zone", aboutTitle: "South Omo at a glance", capital: "Capital",
    contactTitle: "Get in touch", contactLead: "Our offices in Dimeka are open Monday to Friday. Write to the right desk and we will respond.",
    name: "Full name", email: "Email", subject: "Subject", message: "Message", send: "Send message", sent: "Thank you. Your message has been recorded.",
    general: "General enquiry", investDesk: "Investment desk", tourismDesk: "Tourism office", address: "Address", phone: "Phone", hours: "Office hours",
    creditsLead: "Photographs on this site are used under Creative Commons licences from Wikimedia Commons. We thank the photographers.",
    photo: "Photo", license: "License", source: "Source", footerAbout: "The official portal of the South Omo Zone Administration for investors, visitors and citizens.",
    quickLinks: "Explore", reachUs: "Reach us", rights: "South Omo Zone Administration", loading: "Loading…", notFound: "Page not found.", menu: "Menu",
  },
  am: {
    home: "መነሻ", about: "ዞኑ", invest: "ኢንቨስትመንት", woredas: "ወረዳዎች", tourism: "ቱሪዝም", announcements: "ማስታወቂያዎች", contact: "ያግኙን", credits: "የፎቶ ምስጋና",
    region: "የደቡብ ኢትዮጵያ ክልላዊ መንግሥት", officialPortal: "ኦፊሴላዊ ፖርታል",
    exploreInvest: "የኢንቨስትመንት ዕድሎች", planVisit: "ጉብኝትዎን ያቅዱ",
    leaderEyebrow: "ከዋና አስተዳዳሪው", leaderTitle: "ለባለሀብቶች፣ ለአጋሮችና ለጎብኚዎች የተላለፈ መልዕክት",
    readFull: "ሙሉውን መልዕክት ያንብቡ", watchVideo: "የቪዲዮ መልዕክቱን ይመልከቱ", videoSoon: "የቪዲዮ መልዕክቱ በቅርቡ እዚህ ይለቀቃል።", close: "ዝጋ",
    sectorsEyebrow: "በደቡብ ኦሞ ኢንቨስት ያድርጉ", sectorsTitle: "ለኢንቨስትመንት ዝግጁ የሆኑ ስድስት ዘርፎች", sectorsLead: "መሬት፣ ውሃና ወጣት የሰው ኃይል፤ ማህበረሰቦቻችን የሚጠቀሙበትን ኃላፊነት የተሞላበት ልማት ለማረጋገጥ ቁርጠኛ የሆነ አስተዳደር።",
    woredasEyebrow: "ወረዳዎቻችን", woredasTitle: "የየራሳቸው ጥንካሬ ያላቸው ስምንት ወረዳዎች", allWoredas: "ሁሉም ወረዳዎች",
    tourismEyebrow: "ይጎብኙ", tourismTitle: "እንደ እርሱ ያለ ሸለቆ የትም የለም", tourismLead: "በዩኔስኮ የተመዘገበ ምድር፣ የዱር ሳቫናና ጨዋ ጎብኚዎችን የሚቀበሉ ህያው ባህሎች።", exploreTourism: "ቱሪዝምን ይቃኙ",
    annEyebrow: "የማስታወቂያ ሰሌዳ", annTitle: "ክፍት የሥራ ቦታዎችና ጨረታዎች", vacancies: "ክፍት የሥራ ቦታዎች", tenders: "ጨረታዎች", all: "ሁሉም", allAnn: "ሁሉም ማስታወቂያዎች",
    open: "ክፍት", closed: "ተዘግቷል", daysLeft: "ቀናት ቀርተዋል", dayLeft: "ቀን ቀርቷል", closesToday: "ዛሬ ይዘጋል", deadline: "የመጨረሻ ቀን", posted: "የወጣበት ቀን", reference: "ማጣቀሻ", organization: "መሥሪያ ቤት", location: "ቦታ", requirements: "መስፈርቶች", showClosed: "የተዘጉትንም አሳይ",
    ctaTitle: "የኢንቨስትመንት ጽ/ቤታችንን ያነጋግሩ", ctaText: "ስለ ፕሮጀክትዎ ይንገሩን። ከወረዳው ጋር ስብሰባና የቦታ ጉብኝት እናዘጋጃለን።", ctaBtn: "የኢንቨስትመንት ጽ/ቤቱን ያግኙ",
    seat: "የአስተዳደር መቀመጫ", peoples: "ሕዝቦች", highlights: "ዋና ዋና መስህቦች", keySectors: "ቁልፍ ዘርፎች", opportunities: "ዕድሎች", viewWoreda: "ወረዳውን ይመልከቱ", backWoredas: "ሁሉም ወረዳዎች",
    land: "መሬት", investment: "ኢንቨስትመንት", jobs: "የሥራ ዕድል", ha: "ሄክታር", musd: "ሚ. ዶላር", search: "ዕድሎችን ይፈልጉ", sector: "ዘርፍ", woreda: "ወረዳ", noResults: "ከመረጡት ጋር የሚዛመድ ውጤት የለም።",
    sample: "ናሙና ዝርዝር፦ ዝርዝሩ በዞኑ ኢንቨስትመንት ጽ/ቤት ይረጋገጣል።", sampleAnn: "ናሙና ማስታወቂያዎች፦ ኦፊሴላዊ ማስታወቂያዎች በዞኑ የሰው ሀብትና የግዥ ጽ/ቤቶች ይወጣሉ።",
    stepsEyebrow: "እንዴት ኢንቨስት ያደርጋሉ", stepsTitle: "ከመጀመሪያ ጥያቄ እስከ ሥራ ጅምር", principlesEyebrow: "ቃል ኪዳኖቻችን", principlesTitle: "ኃላፊነት የተሞላበት ኢንቨስትመንት",
    attractions: "መስህቦች", markets: "ሳምንታዊ ገበያዎች", marketsLead: "የገበያ ቀናት ሊቀየሩ ይችላሉ። ከመጓዝዎ በፊት ከቱሪዝም ጽ/ቤቱ ወይም ከአስጎብኚዎ ያረጋግጡ።", today: "ዛሬ", etiquetteTitle: "በኃላፊነት ይጓዙ", peoplesTitle: "የደቡብ ኦሞ ሕዝቦች",
    gettingThere: "እንዴት ይደርሳሉ", gettingThereText: "ከአዲስ አበባ ወደ ጂንካ በአውሮፕላን ይብረሩ፤ ከዚያም በመንገድ ወደ ዲመካ፣ ቱርሚና ሌሎች የዞኑ አካባቢዎች ይቀጥሉ። አብዛኞቹ ጎብኚዎች ፈቃድ ካለው አስጎብኚና ባለአራት እግር ተሽከርካሪ ጋር ይጓዛሉ።",
    bestTime: "መቼ ይጎብኙ", bestTimeText: "ከሰኔ እስከ የካቲት ገደማ ያሉት ደረቅ ወራት ለጉዞ ምቹ ናቸው። አብዛኛውን ጊዜ ከመጋቢት እስከ ግንቦት የሚዘንበው ከባድ ዝናብ መንገዶችን አስቸጋሪ ሊያደርግ ይችላል።",
    aboutEyebrow: "ስለ ዞኑ", aboutTitle: "ደቡብ ኦሞ በጨረፍታ", capital: "ዋና ከተማ",
    contactTitle: "ያግኙን", contactLead: "በዲመካ የሚገኙት ቢሮዎቻችን ከሰኞ እስከ አርብ ክፍት ናቸው። ለሚመለከተው ክፍል ይጻፉ፤ ምላሽ እንሰጣለን።",
    name: "ሙሉ ስም", email: "ኢሜይል", subject: "ርዕስ", message: "መልዕክት", send: "መልዕክት ላክ", sent: "እናመሰግናለን። መልዕክትዎ ተመዝግቧል።",
    general: "አጠቃላይ ጥያቄ", investDesk: "የኢንቨስትመንት ጽ/ቤት", tourismDesk: "የቱሪዝም ጽ/ቤት", address: "አድራሻ", phone: "ስልክ", hours: "የሥራ ሰዓት",
    creditsLead: "በዚህ ድረ-ገጽ ላይ ያሉት ፎቶዎች ከዊኪሚዲያ ኮመንስ በክሪኤቲቭ ኮመንስ ፈቃድ የተወሰዱ ናቸው። ፎቶ አንሺዎቹን እናመሰግናለን።",
    photo: "ፎቶ", license: "ፈቃድ", source: "ምንጭ", footerAbout: "ለባለሀብቶች፣ ለጎብኚዎችና ለዜጎች የደቡብ ኦሞ ዞን አስተዳደር ኦፊሴላዊ ፖርታል።",
    quickLinks: "ይቃኙ", reachUs: "ያግኙን", rights: "የደቡብ ኦሞ ዞን አስተዳደር", loading: "በመጫን ላይ…", notFound: "ገጹ አልተገኘም።", menu: "ማውጫ",
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
  const t = (k) => dict[lang][k] ?? dict.en[k] ?? k;
  const tx = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o[lang] ?? o.en : o);
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString(lang === "am" ? "am-ET" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  return <Ctx.Provider value={{ lang, setLang, t, tx, fmtDate }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
