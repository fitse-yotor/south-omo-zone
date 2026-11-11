// ALL DATA BELOW IS MOCK. Replace with real content / a real API (see src/api.js).
const day = 86400000;
const iso = (offset) => new Date(Date.now() + offset * day).toISOString().slice(0, 10);

export const leader = {
  name: { en: "Ato Example Name", am: "አቶ ስም ምሳሌ" },
  title: { en: "Zone Administrator", am: "የዞኑ ዋና አስተዳዳሪ" },
  photo: "./leader.svg",
  // mp4 URL or YouTube link. Leave "" to hide the player.
  video: "https://www.w3schools.com/html/mov_bbb.mp4",
  videoPoster: "",
  message: {
    en: [
      "Welcome to South Omo, a land of rivers, rich soil and some of the most remarkable living cultures on Earth.",
      "Our zone is open for responsible investment. Our woredas offer fertile irrigable land, a young workforce and a government committed to making business simple, fast and fair.",
      "We invite investors, tour operators and development partners to explore our opportunities and grow together with our communities.",
    ],
    am: [
      "እንኳን ወደ ደቡብ ኦሞ በደህና መጡ። ይህ ምድር ወንዞች፣ ለም አፈርና በዓለም ላይ ካሉ አስደናቂ ህያው ባህሎች መገኛ ነው።",
      "ዞናችን ኃላፊነት ለሚሰማው ኢንቨስትመንት ክፍት ነው። ወረዳዎቻችን ለመስኖ ተስማሚ ለም መሬት፣ ወጣት የሰው ኃይልና ንግድን ቀላል፣ ፈጣንና ፍትሃዊ ለማድረግ የተዘጋጀ መንግሥት አላቸው።",
      "ባለሀብቶች፣ አስጎብኚዎችና የልማት አጋሮች ዕድሎቻችንን እንዲቃኙና ከማህበረሰቦቻችን ጋር አብረው እንዲያድጉ እንጋብዛለን።",
    ],
  },
};

export const stats = [
  { value: "8", label: { en: "Woredas", am: "ወረዳዎች" } },
  { value: "23,000 km²", label: { en: "Land area", am: "የቆዳ ስፋት" } },
  { value: "16", label: { en: "Ethnic groups", am: "ብሔረሰቦች" } },
  { value: "1", label: { en: "National Park (Mago)", am: "ብሔራዊ ፓርክ (ማጎ)" } },
];

export const sectors = {
  agriculture: { en: "Agriculture", am: "ግብርና", color: "#0b6b34" },
  livestock: { en: "Livestock", am: "እንስሳት ሀብት", color: "#8a5a3c" },
  tourism: { en: "Tourism", am: "ቱሪዝም", color: "#c8102e" },
  processing: { en: "Agro-processing", am: "የግብርና ምርት ማቀነባበር", color: "#b7791f" },
  energy: { en: "Energy & Water", am: "ኃይል እና ውሃ", color: "#1f6f9b" },
};

export const woredas = [
  {
    id: "hamer",
    name: { en: "Hamer", am: "ሐመር" },
    town: { en: "Dimeka", am: "ዲመካ" },
    population: 78000,
    areaKm2: 4100,
    hue: 18,
    tagline: { en: "Home of the famous Hamer bull-jumping ceremony", am: "የታዋቂው የሐመር የከብት ዝላይ ሥነ ሥርዓት መገኛ" },
    about: {
      en: "Hamer is a gateway to Lower Omo culture, with vibrant weekly markets in Dimeka and Turmi, and wide rangelands suited to cotton and livestock.",
      am: "ሐመር የታችኛው ኦሞ ባህል መግቢያ በር ሲሆን በዲመካና ቱርሚ ደማቅ ሳምንታዊ ገበያዎች፣ ለጥጥና ለእንስሳት ሀብት ተስማሚ ሰፊ የግጦሽ መሬቶች አሏት።",
    },
  },
  {
    id: "bena-tsemay",
    name: { en: "Bena-Tsemay", am: "በና ጸማይ" },
    town: { en: "Key Afer", am: "ቁም አፈር" },
    population: 62000,
    areaKm2: 2600,
    hue: 140,
    tagline: { en: "Highland coffee, honey and the Key Afer market", am: "የደጋ ቡና፣ ማርና የቁም አፈር ገበያ" },
    about: {
      en: "Bena-Tsemay combines fertile highlands with lowland plains. Known for honey, sorghum and the colourful Key Afer Thursday market.",
      am: "በና ጸማይ ለም ደጋማ ቦታዎችን ከቆላማ ሜዳዎች ጋር ያጣመረች ናት። በማር፣ በማሽላና በደማቁ የሐሙስ የቁም አፈር ገበያ ትታወቃለች።",
    },
  },
  {
    id: "dasenech",
    name: { en: "Dasenech", am: "ዳሰነች" },
    town: { en: "Omorate", am: "ኦሞራቴ" },
    population: 69000,
    areaKm2: 3300,
    hue: 200,
    tagline: { en: "Omo river delta, fisheries and cross-border trade", am: "የኦሞ ወንዝ ዴልታ፣ አሳ ሀብትና ድንበር ተሻጋሪ ንግድ" },
    about: {
      en: "On the banks of the Omo River and Lake Turkana, Dasenech has strong potential for irrigation, fisheries and border trade with Kenya.",
      am: "በኦሞ ወንዝና በቱርካና ሐይቅ ዳርቻ የምትገኘው ዳሰነች ለመስኖ፣ ለአሳ ሀብትና ከኬንያ ጋር ለሚደረግ ድንበር ንግድ ከፍተኛ አቅም አላት።",
    },
  },
  {
    id: "nyangatom",
    name: { en: "Nyangatom", am: "ኛንጋቶም" },
    town: { en: "Kangaten", am: "ካንጋቴን" },
    population: 31000,
    areaKm2: 3900,
    hue: 35,
    tagline: { en: "Pastoral heartland on the Kibish plains", am: "በኪቢሽ ሜዳዎች ላይ የሚገኝ የአርብቶ አደር ማዕከል" },
    about: {
      en: "A vast pastoral landscape with livestock markets, rich wildlife corridors and emerging eco-tourism opportunities.",
      am: "ሰፊ የአርብቶ አደር ምድር ሲሆን የእንስሳት ገበያዎች፣ የዱር እንስሳት መተላለፊያዎችና አዲስ የሚያድጉ የስነ-ምህዳር ቱሪዝም ዕድሎች አሉት።",
    },
  },
  {
    id: "male",
    name: { en: "Male", am: "ማሌ" },
    town: { en: "Koybe", am: "ኮይቤ" },
    population: 95000,
    areaKm2: 1800,
    hue: 95,
    tagline: { en: "Fruit belt: banana, mango and maize", am: "የፍራፍሬ ቀበቶ፦ ሙዝ፣ ማንጎና በቆሎ" },
    about: {
      en: "Male has reliable rainfall and rivers, making it one of the zone’s strongest agricultural woredas, with growing smallholder fruit production.",
      am: "ማሌ አስተማማኝ ዝናብና ወንዞች ስላሏት ከዞኑ ጠንካራ የግብርና ወረዳዎች አንዷ ናት፤ የአነስተኛ አርሶ አደሮች የፍራፍሬ ምርትም እያደገ ነው።",
    },
  },
  {
    id: "selamago",
    name: { en: "Selamago", am: "ሰላማጎ" },
    town: { en: "Gazer", am: "ጋዘር" },
    population: 58000,
    areaKm2: 2700,
    hue: 60,
    tagline: { en: "Cotton, sesame and Mago National Park buffer", am: "ጥጥ፣ ሰሊጥና የማጎ ብሔራዊ ፓርክ ዙሪያ" },
    about: {
      en: "Selamago offers flat, mechanizable farmland and sits next to Mago National Park, combining commercial farming with wildlife tourism.",
      am: "ሰላማጎ ለማሽን ተስማሚ ጠፍጣፋ የእርሻ መሬት ያላት ሲሆን ከማጎ ብሔራዊ ፓርክ ጋር ትዋሰናለች፤ ንግድ ግብርናን ከዱር እንስሳት ቱሪዝም ጋር ታዋህዳለች።",
    },
  },
  {
    id: "gelab",
    name: { en: "Gelab", am: "ገላብ" },
    town: { en: "Gelab", am: "ገላብ" },
    population: 41000,
    areaKm2: 2200,
    hue: 160,
    tagline: { en: "Rivers, irrigation and solar potential", am: "ወንዞች፣ መስኖና የፀሐይ ኃይል አቅም" },
    about: {
      en: "Gelab has abundant sunshine and permanent rivers, ideal for irrigated horticulture and small-scale solar projects.",
      am: "ገላብ ብዙ ፀሐይና ቋሚ ወንዞች ስላሏት ለመስኖ አትክልትና ፍራፍሬና ለአነስተኛ የፀሐይ ኃይል ፕሮጀክቶች ተስማሚ ናት።",
    },
  },
  {
    id: "jinka-town",
    name: { en: "Jinka Town", am: "ጂንካ ከተማ" },
    town: { en: "Jinka", am: "ጂንካ" },
    population: 56000,
    areaKm2: 90,
    hue: 5,
    tagline: { en: "Administrative, commercial and tourism hub", am: "የአስተዳደር፣ የንግድና የቱሪዝም ማዕከል" },
    about: {
      en: "Jinka has an airport, banks, hotels and the South Omo Museum. It is the base for all tourism and investment services in the zone.",
      am: "ጂንካ አውሮፕላን ማረፊያ፣ ባንኮች፣ ሆቴሎችና የደቡብ ኦሞ ሙዚየም አላት። ለዞኑ ሁሉም የቱሪዝምና የኢንቨስትመንት አገልግሎቶች መሠረት ናት።",
    },
  },
];

let n = 0;
const opp = (woreda, sector, titleEn, titleAm, sumEn, sumAm, landHa, usdM, jobs, status = "available") => ({
  id: `opp-${++n}`, woreda, sector,
  title: { en: titleEn, am: titleAm },
  summary: { en: sumEn, am: sumAm },
  landHa, investmentUsdM: usdM, jobs, status,
});

export const opportunities = [
  opp("hamer", "agriculture", "Irrigated cotton farm", "የመስኖ ጥጥ እርሻ", "2,000 ha of flat land close to the Weyto river, suited to commercial cotton.", "ለጥጥ ምርት ተስማሚ ከወይጦ ወንዝ አቅራቢያ 2,000 ሄክታር ጠፍጣፋ መሬት።", 2000, 8, 600),
  opp("hamer", "tourism", "Cultural eco-lodge, Turmi", "የባህል ኢኮ-ሎጅ፣ ቱርሚ", "Community-partnered lodge near the Turmi market with 20 tented rooms.", "ከቱርሚ ገበያ አቅራቢያ ከማህበረሰቡ ጋር በሽርክና የሚሠራ 20 ድንኳን ክፍሎች ያሉት ሎጅ።", 15, 1.2, 45),
  opp("hamer", "livestock", "Cattle fattening & export", "የከብት ማደለብና ኤክስፖርት", "Feedlot and quarantine facility serving Gulf export markets.", "ለባህረ ሰላጤ ገበያዎች የሚያገለግል የማደለቢያና የኳራንቲን ማዕከል።", 120, 3.5, 150),
  opp("bena-tsemay", "agriculture", "Specialty coffee washing station", "የልዩ ቡና ማጠቢያ ጣቢያ", "Wet-mill for highland coffee cooperatives with direct export links.", "ለደጋ ቡና ህብረት ሥራ ማህበራት ቀጥተኛ የኤክስፖርት ትስስር ያለው እርጥብ ማቀነባበሪያ።", 5, 0.9, 40),
  opp("bena-tsemay", "processing", "Honey refining and packaging", "የማር ማጣራትና ማሸጊያ", "Modern plant to process wild and hive honey for local and export markets.", "ለአገር ውስጥና ለውጭ ገበያ የዱር እና የቀፎ ማር የሚያቀነባብር ዘመናዊ ፋብሪካ።", 3, 0.7, 35),
  opp("bena-tsemay", "agriculture", "Sorghum and sesame outgrower scheme", "የማሽላና ሰሊጥ አውትግሮወር ፕሮግራም", "Contract farming with 1,500 smallholders, with input and buy-back support.", "ከ1,500 አነስተኛ አርሶ አደሮች ጋር የግብዓትና የግዥ ድጋፍ ያለው ውል እርሻ።", 900, 2.2, 1500),
  opp("dasenech", "livestock", "Lake and river fisheries", "የሐይቅና የወንዝ አሳ ሀብት", "Cold-chain, landing site and processing for Omo/Turkana Nile perch and tilapia.", "ለኦሞ/ቱርካና ናይል ፐርችና ለዓሳ ጣፋጭ የቅዝቃዜ ሰንሰለት፣ ማረፊያና ማቀነባበሪያ።", 10, 2.8, 120),
  opp("dasenech", "agriculture", "Flood-recession farming", "የጎርፍ ማፈግፈግ እርሻ", "Maize and vegetables on 1,200 ha of silt-rich delta soils.", "በደለል የበለጸገ 1,200 ሄክታር ዴልታ አፈር ላይ በቆሎና አትክልት።", 1200, 4, 400),
  opp("dasenech", "energy", "Omorate border trade centre", "የኦሞራቴ ድንበር ንግድ ማዕከል", "Warehouses, fuel and logistics serving trade with northern Kenya.", "ከሰሜን ኬንያ ጋር ለሚደረግ ንግድ መጋዘኖች፣ ነዳጅና ሎጂስቲክስ።", 25, 3.2, 200),
  opp("nyangatom", "livestock", "Mobile livestock market & vet hub", "ተንቀሳቃሽ የእንስሳት ገበያና የእንስሳት ህክምና ማዕከል", "Market infrastructure and veterinary services for pastoralist communities.", "ለአርብቶ አደር ማህበረሰቦች የገበያ መሠረተ ልማትና የእንስሳት ህክምና አገልግሎት።", 40, 1.5, 80),
  opp("nyangatom", "tourism", "Kibish eco-tourism concession", "የኪቢሽ ስነ-ምህዳር ቱሪዝም ኮንሴሽን", "Low-impact camp and guided experiences with community revenue sharing.", "ከማህበረሰቡ ጋር ገቢ በሚጋራ ዝቅተኛ ተጽዕኖ ያለው ካምፕና የተመራ ጉብኝት።", 50, 1.0, 30),
  opp("male", "agriculture", "Banana & mango plantation", "የሙዝና የማንጎ እርሻ", "Irrigated orchards with packing house for domestic and Djibouti export.", "ለአገር ውስጥና ለጅቡቲ ኤክስፖርት የማሸጊያ ቤት ያለው የመስኖ የፍራፍሬ እርሻ።", 800, 6, 700),
  opp("male", "processing", "Fruit juice and dried-fruit plant", "የፍራፍሬ ጭማቂና የደረቀ ፍራፍሬ ፋብሪካ", "Processing plant using local fruit surplus; reduces post-harvest loss.", "የአካባቢውን የፍራፍሬ ትርፍ የሚጠቀም ፋብሪካ፤ ከምርት በኋላ የሚደርስ ብክነትን ይቀንሳል።", 8, 2.5, 180),
  opp("selamago", "agriculture", "Mechanized maize & sesame", "በማሽን የሚሠራ በቆሎና ሰሊጥ", "5,000 ha of flat, mechanizable land with road access to Jinka.", "ወደ ጂንካ የመንገድ ግንኙነት ያለው 5,000 ሄክታር ጠፍጣፋ ለማሽን ተስማሚ መሬት።", 5000, 12, 900),
  opp("selamago", "tourism", "Mago National Park safari lodge", "የማጎ ብሔራዊ ፓርክ ሳፋሪ ሎጅ", "Mid-range safari lodge with guided game drives in partnership with park authority.", "ከፓርክ ባለሥልጣን ጋር በሽርክና የሚሠራ መካከለኛ ደረጃ ሳፋሪ ሎጅ።", 20, 2.0, 60),
  opp("gelab", "energy", "Solar mini-grid & irrigation pumping", "የፀሐይ ሚኒ-ግሪድና የመስኖ ፓምፕ", "5 MW solar farm powering pumps for smallholder irrigation.", "ለአነስተኛ አርሶ አደሮች መስኖ ፓምፕ የሚያመነጭ 5 ሜጋ ዋት የፀሐይ ኃይል ማመንጫ።", 30, 7, 90),
  opp("gelab", "agriculture", "Irrigated vegetables for export", "ለኤክስፖርት የሚሆን የመስኖ አትክልት", "Green-bean, onion and chilli production using permanent river water.", "ቋሚ የወንዝ ውሃ በመጠቀም የሚመረት አረንጓዴ ባቄላ፣ ሽንኩርትና ቃሪያ።", 400, 3, 350, "limited"),
  opp("jinka-town", "tourism", "Business hotel and conference centre", "የቢዝነስ ሆቴልና የስብሰባ ማዕከል", "80-room hotel serving government, NGO and tourism demand.", "የመንግሥት፣ የመንግሥታዊ ያልሆኑ ድርጅቶችና የቱሪዝም ፍላጎት የሚያገለግል 80 ክፍሎች ያሉት ሆቴል።", 2, 5, 120),
  opp("jinka-town", "processing", "Industrial park (agro-processing)", "የኢንዱስትሪ ፓርክ (የግብርና ማቀነባበር)", "Serviced plots for small and medium processors near Jinka airport.", "ከጂንካ አውሮፕላን ማረፊያ አቅራቢያ ለአነስተኛና መካከለኛ ማቀነባበሪያዎች የተዘጋጁ መሬቶች።", 60, 9, 500),
];

export const announcements = [
  {
    id: "a1", type: "vacancy",
    title: { en: "Zone Agriculture Expert (Irrigation)", am: "የዞን ግብርና ባለሙያ (መስኖ)" },
    org: { en: "Zone Agriculture Office", am: "የዞኑ ግብርና ጽ/ቤት" },
    posted: iso(-5), deadline: iso(9), location: { en: "Jinka", am: "ጂንካ" },
    description: {
      en: "Support irrigation scheme design and monitoring across woredas.",
      am: "በወረዳዎች የመስኖ ፕሮጀክቶች ዲዛይንና ክትትል ላይ ድጋፍ ማድረግ።",
    },
    details: {
      en: ["BSc in Irrigation or Agricultural Engineering", "2+ years of experience", "Knowledge of Aari or Hamer language is an advantage", "Submit CV and credentials to the zone HR office"],
      am: ["በመስኖ ወይም በግብርና ምህንድስና የመጀመሪያ ዲግሪ", "2+ ዓመት የሥራ ልምድ", "የአሪ ወይም ሐመር ቋንቋ ዕውቀት ተጨማሪ ነው", "ሲቪና ማስረጃዎችን ለዞኑ የሰው ሀብት ጽ/ቤት ያቅርቡ"],
    },
  },
  {
    id: "a2", type: "vacancy",
    title: { en: "Tourism Destination Officer", am: "የቱሪዝም መዳረሻ ኦፊሰር" },
    org: { en: "Zone Culture & Tourism Office", am: "የዞኑ ባህልና ቱሪዝም ጽ/ቤት" },
    posted: iso(-2), deadline: iso(14), location: { en: "Jinka", am: "ጂንካ" },
    description: { en: "Develop tourism products and community partnerships.", am: "የቱሪዝም ምርቶችንና ከማህበረሰብ ጋር ያሉ ሽርክናዎችን ማልማት።" },
    details: {
      en: ["BA in Tourism, Hospitality or related", "English and Amharic required", "Experience with community-based tourism"],
      am: ["በቱሪዝም፣ ሆስፒታሊቲ ወይም ተዛማጅ መስክ ዲግሪ", "እንግሊዝኛና አማርኛ ግዴታ", "በማህበረሰብ ላይ የተመሰረተ ቱሪዝም ልምድ"],
    },
  },
  {
    id: "a3", type: "vacancy",
    title: { en: "Veterinary Health Assistant (3 posts)", am: "የእንስሳት ጤና ረዳት (3 ቦታ)" },
    org: { en: "Zone Livestock Office", am: "የዞኑ እንስሳት ሀብት ጽ/ቤት" },
    posted: iso(-20), deadline: iso(-3), location: { en: "Dasenech, Nyangatom", am: "ዳሰነች፣ ኛንጋቶም" },
    description: { en: "Deliver vaccination and animal health services to pastoral areas.", am: "ለአርብቶ አደር አካባቢዎች የክትባትና የእንስሳት ጤና አገልግሎት መስጠት።" },
    details: { en: ["Diploma in Animal Health", "Willing to work in remote areas"], am: ["በእንስሳት ጤና ዲፕሎማ", "በራቁ አካባቢዎች ለመሥራት ፈቃደኛ"] },
  },
  {
    id: "t1", type: "tender",
    title: { en: "Construction of Key Afer Market Shed", am: "የቁም አፈር ገበያ ሼድ ግንባታ" },
    org: { en: "Zone Finance & Economic Development", am: "የዞኑ ፋይናንስና ኢኮኖሚ ልማት" },
    posted: iso(-4), deadline: iso(18), ref: "SOZ/NCB/2026/012", location: { en: "Bena-Tsemay", am: "በና ጸማይ" },
    description: { en: "National competitive bidding for a 1,200 m² covered market.", am: "ለ1,200 ካሬ ሜትር የተሸፈነ ገበያ ሀገር አቀፍ ውድድር ጨረታ።" },
    details: {
      en: ["Contractors: Grade 5 or higher (building)", "Bid security: 2% of bid price", "Bid documents available for a non-refundable fee of 500 ETB", "Bids are opened publicly on the deadline"],
      am: ["ተቋራጮች፦ ደረጃ 5 እና ከዚያ በላይ (ህንፃ)", "የጨረታ ማስከበሪያ፦ 2% ከጨረታ ዋጋ", "የጨረታ ሰነድ በማይመለስ 500 ብር ይገኛል", "ጨረታው በተዘጋበት ቀን በይፋ ይከፈታል"],
    },
  },
  {
    id: "t2", type: "tender",
    title: { en: "Supply of Veterinary Vaccines and Cold Boxes", am: "የእንስሳት ክትባትና የቀዝቃዛ ሳጥኖች አቅርቦት" },
    org: { en: "Zone Livestock Office", am: "የዞኑ እንስሳት ሀብት ጽ/ቤት" },
    posted: iso(-1), deadline: iso(25), ref: "SOZ/NCB/2026/015", location: { en: "Jinka", am: "ጂንካ" },
    description: { en: "Supply and delivery of vaccines for FMD and CBPP campaigns.", am: "ለአፍና ለሰኮና በሽታና ለሳንባ ምች ዘመቻዎች ክትባት አቅርቦት።" },
    details: { en: ["Valid supplier licence and tax clearance", "Delivery to Jinka within 30 days"], am: ["ህጋዊ የአቅራቢ ፈቃድና የግብር ግዴታ ማረጋገጫ", "በ30 ቀናት ውስጥ ጂንካ ማድረስ"] },
  },
  {
    id: "t3", type: "tender",
    title: { en: "Rehabilitation of Dimeka–Turmi Gravel Road", am: "የዲመካ–ቱርሚ የጠጠር መንገድ ጥገና" },
    org: { en: "Zone Roads Authority", am: "የዞኑ መንገዶች ባለሥልጣን" },
    posted: iso(-30), deadline: iso(-8), ref: "SOZ/NCB/2026/009", location: { en: "Hamer", am: "ሐመር" },
    description: { en: "Rehabilitation of 38 km of rural gravel road.", am: "የ38 ኪ.ሜ የገጠር የጠጠር መንገድ ጥገና።" },
    details: { en: ["Grade 4 road contractors", "Site visit mandatory"], am: ["ደረጃ 4 የመንገድ ተቋራጮች", "የቦታ ጉብኝት ግዴታ ነው"] },
  },
];
