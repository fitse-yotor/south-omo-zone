// Content for the South Omo Zone portal.
// FACTS (zone structure, woredas, heritage, peoples, sectors) are researched from public sources (see README).
// LISTINGS (opportunities, vacancies, tenders) and the leader's name/message are SAMPLES to be replaced by the zone office.
const day = 86400000;
const iso = (offset) => new Date(Date.now() + offset * day).toISOString().slice(0, 10);

export const img = (id) => `./images/${id}.jpg`;

export const zone = {
  name: { en: "South Omo Zone", am: "ደቡብ ኦሞ ዞን" },
  admin: { en: "South Omo Zone Administration", am: "የደቡብ ኦሞ ዞን አስተዳደር" },
  region: { en: "South Ethiopia Regional State", am: "የደቡብ ኢትዮጵያ ክልላዊ መንግሥት" },
  capital: { en: "Dimeka", am: "ዲመካ" },
  tagline: {
    en: "Where the Omo River meets opportunity",
    am: "የኦሞ ወንዝ ከዕድል ጋር የሚገናኝበት",
  },
  intro: {
    en: "From the highlands of Male and Bako Gazer to the delta where the Omo River enters Lake Turkana, South Omo is a land of fertile river valleys, open savanna and some of the most remarkable living cultures in Africa.",
    am: "ከማሌና ከባኮ ጋዘር ደጋማ ቦታዎች እስከ ኦሞ ወንዝ ቱርካና ሐይቅን እስከሚቀላቀልበት ዴልታ ድረስ ደቡብ ኦሞ ለም የወንዝ ሸለቆዎች፣ ሰፊ የሳር ሜዳዎችና በአፍሪካ ካሉ አስደናቂ ህያው ባህሎች የሚገኙበት ምድር ነው።",
  },
  contact: {
    address: { en: "Zone Administration Office, Dimeka, South Omo Zone", am: "የዞኑ አስተዳደር ጽ/ቤት፣ ዲመካ፣ ደቡብ ኦሞ ዞን" },
    phone: "+251 00 000 0000",
    email: "info@southomo.gov.et",
    invest: "investment@southomo.gov.et",
    tourism: "tourism@southomo.gov.et",
    hours: { en: "Monday – Friday, 8:30 – 17:30", am: "ሰኞ – አርብ፣ 2፡30 – 11፡30" },
  },
};

export const facts = [
  { value: "8", label: { en: "Woredas", am: "ወረዳዎች" } },
  { value: "1980", label: { en: "UNESCO World Heritage listing", am: "በዩኔስኮ የዓለም ቅርስነት የተመዘገበበት" } },
  { value: "15+", label: { en: "Peoples and communities", am: "ብሔረሰቦችና ማህበረሰቦች" } },
  { value: "233,000", label: { en: "Years: oldest Homo sapiens fossils", am: "ዓመታት፦ ጥንታዊው የሆሞ ሳፒየንስ ቅሪተ አካል" } },
];

export const leader = {
  // SAMPLE: replace with the administrator's name, photo (public/images/leader.jpg) and video URL.
  name: { en: "Chief Administrator", am: "ዋና አስተዳዳሪ" },
  title: { en: "South Omo Zone Administration", am: "የደቡብ ኦሞ ዞን አስተዳደር" },
  photo: "",
  video: "", // mp4 URL or YouTube link
  excerpt: {
    en: "South Omo is open for investment that grows with our communities. We offer fertile land, abundant water and a people with a proud heritage. We ask only that you build with us, not around us.",
    am: "ደቡብ ኦሞ ከማህበረሰቦቻችን ጋር አብሮ ለሚያድግ ኢንቨስትመንት ክፍት ነው። ለም መሬት፣ በቂ ውሃና ኩሩ ቅርስ ያለው ሕዝብ አለን። የምንጠይቀው ከእኛ ጋር እንድትገነቡ ብቻ ነው።",
  },
  message: {
    en: [
      "On behalf of the people and the administration of South Omo Zone, welcome. Our zone stretches from cool highlands to the Omo delta and the shores of Lake Turkana. It is home to more than fifteen peoples whose cultures, markets and ceremonies make this one of the most distinctive places on the continent.",
      "The Lower Valley of the Omo is a UNESCO World Heritage Site and holds the oldest known fossils of our own species. We are proud guardians of that heritage, and of Mago National Park, the Omo River and the communities who have lived alongside them for generations.",
      "Our priority is development that our communities can see and share in: irrigated agriculture, livestock and dairy, agro-processing, fisheries and responsible tourism. We invite investors and partners to work with our woredas, to consult with our communities and to create jobs for our young people.",
      "Our offices are open to you. Come and see South Omo for yourself.",
    ],
    am: [
      "በደቡብ ኦሞ ዞን ሕዝብና አስተዳደር ስም እንኳን ደህና መጣችሁ። ዞናችን ከቀዝቃዛ ደጋማ ቦታዎች እስከ ኦሞ ዴልታና የቱርካና ሐይቅ ዳርቻ ይዘረጋል። ባህሎቻቸው፣ ገበያዎቻቸውና ሥነ ሥርዓቶቻቸው ይህንን ቦታ በአህጉሩ ልዩ ያደረጉት ከአሥራ አምስት በላይ ሕዝቦች መኖሪያ ነው።",
      "የታችኛው ኦሞ ሸለቆ በዩኔስኮ የተመዘገበ የዓለም ቅርስ ሲሆን የዝርያችን ጥንታዊ ቅሪተ አካላት የተገኙበት ነው። የዚህ ቅርስ፣ የማጎ ብሔራዊ ፓርክ፣ የኦሞ ወንዝና ለትውልዶች አብረዋቸው የኖሩ ማህበረሰቦች ኩሩ ጠባቂዎች ነን።",
      "ቅድሚያ የምንሰጠው ማህበረሰቦቻችን የሚያዩትና የሚካፈሉት ልማት ነው፦ የመስኖ ግብርና፣ የእንስሳት ሀብትና ወተት፣ የግብርና ምርት ማቀነባበር፣ የዓሣ ሀብትና ኃላፊነት የተሞላበት ቱሪዝም። ባለሀብቶችና አጋሮች ከወረዳዎቻችን ጋር እንዲሠሩ፣ ማህበረሰቦቻችንን እንዲያማክሩና ለወጣቶቻችን የሥራ ዕድል እንዲፈጥሩ እንጋብዛለን።",
      "ቢሮዎቻችን ለእናንተ ክፍት ናቸው። መጥታችሁ ደቡብ ኦሞን በዓይናችሁ እዩ።",
    ],
  },
};

export const sectors = [
  {
    id: "agriculture", icon: "Sprout", image: "banna-village", color: "leaf",
    title: { en: "Irrigated agriculture", am: "የመስኖ ግብርና" },
    text: {
      en: "The Omo, Weyto and Mago rivers support irrigated farming of cotton, sugarcane, sorghum, maize and sesame. A federal investment profile identified more than 300,000 ha suitable for investment in the zone.",
      am: "የኦሞ፣ የወይጦና የማጎ ወንዞች ለጥጥ፣ ለሸንኮራ አገዳ፣ ለማሽላ፣ ለበቆሎና ለሰሊጥ የመስኖ እርሻ ያገለግላሉ። የፌዴራል የኢንቨስትመንት ጥናት በዞኑ ከ300,000 ሄክታር በላይ ለኢንቨስትመንት ተስማሚ መሬት ለይቷል።",
    },
  },
  {
    id: "livestock", icon: "Beef", image: "hamer-village", color: "sun",
    title: { en: "Livestock & dairy", am: "የእንስሳት ሀብትና ወተት" },
    text: {
      en: "South Omo's agro-pastoral economy is built on cattle, goats, sheep and camels. Opportunities include feedlots, veterinary services, abattoirs, dairy and hides and skins.",
      am: "የደቡብ ኦሞ ከፊል አርብቶ አደር ኢኮኖሚ በከብት፣ በፍየል፣ በበግና በግመል ላይ የተመሠረተ ነው። ዕድሎቹ ማደለቢያ፣ የእንስሳት ህክምና፣ ቄራ፣ ወተትና ቆዳና ሌጦን ያካትታሉ።",
    },
  },
  {
    id: "processing", icon: "Factory", image: "banna-enterprise", color: "royal",
    title: { en: "Agro-processing & trade", am: "የግብርና ምርት ማቀነባበርና ንግድ" },
    text: {
      en: "Honey, cotton ginning, sugar by-products, edible oil and fruit processing add value close to the farm. Omorate is a gateway for trade with northern Kenya.",
      am: "ማር፣ የጥጥ ማዳመጫ፣ የስኳር ተረፈ ምርቶች፣ የምግብ ዘይትና የፍራፍሬ ማቀነባበር ከእርሻው አጠገብ እሴት ይጨምራሉ። ኦሞራቴ ከሰሜን ኬንያ ጋር ለሚደረግ ንግድ መግቢያ በር ነው።",
    },
  },
  {
    id: "fisheries", icon: "Fish", image: "lake-turkana-dusk", color: "royal",
    title: { en: "Fisheries", am: "የዓሣ ሀብት" },
    text: {
      en: "The Omo delta and the northern shore of Lake Turkana support Nile perch and tilapia fisheries. Cold chains, landing sites and processing are needed.",
      am: "የኦሞ ዴልታና የቱርካና ሐይቅ ሰሜናዊ ዳርቻ የናይል ፐርችና የቆሮሶ ዓሣ ሀብት አላቸው። የቅዝቃዜ ሰንሰለት፣ ማረፊያና ማቀነባበሪያ ያስፈልጋሉ።",
    },
  },
  {
    id: "tourism", icon: "Binoculars", image: "hamer-ceremony", color: "ember",
    title: { en: "Tourism & hospitality", am: "ቱሪዝምና መስተንግዶ" },
    text: {
      en: "A UNESCO World Heritage valley, Mago National Park and famous weekly markets draw visitors from around the world. Quality lodges, campsites and guiding services are in demand.",
      am: "በዩኔስኮ የተመዘገበ ሸለቆ፣ የማጎ ብሔራዊ ፓርክና ታዋቂ ሳምንታዊ ገበያዎች ከመላው ዓለም ጎብኚዎችን ይስባሉ። ጥራት ያላቸው ሎጆች፣ ካምፖችና የአስጎብኚ አገልግሎቶች ተፈላጊ ናቸው።",
    },
  },
  {
    id: "energy", icon: "Sun", image: "omo-river-aerial", color: "sun",
    title: { en: "Water & solar energy", am: "ውሃና የፀሐይ ኃይል" },
    text: {
      en: "Year-round sunshine and regulated river flows suit solar irrigation pumping, mini-grids and water supply for towns and settlements.",
      am: "ዓመቱን ሙሉ ያለው የፀሐይ ብርሃንና የተስተካከለ የወንዝ ፍሰት ለፀሐይ ኃይል የመስኖ ፓምፕ፣ ለሚኒ-ግሪድና ለከተሞች የውሃ አቅርቦት ተስማሚ ናቸው።",
    },
  },
];

export const woredas = [
  {
    id: "hamer", image: "hamer-village", seat: { en: "Dimeka", am: "ዲመካ" },
    name: { en: "Hamer", am: "ሐመር" },
    peoples: { en: "Hamer, Kara, Arbore", am: "ሐመር፣ ካራ፣ አርቦሬ" },
    tagline: { en: "Seat of the zone, home of the bull-jumping ceremony", am: "የዞኑ መቀመጫና የከብት ዝላይ ሥነ ሥርዓት መገኛ" },
    about: {
      en: "Hamer is the zone's largest woreda and its administrative heart: Dimeka is the zone capital and Turmi its best-known market town. The Hamer are renowned for their ukuli bula bull-jumping ceremony, while the Kara live along the Omo River and the Arbore near Lake Chew Bahir.",
      am: "ሐመር የዞኑ ትልቁ ወረዳና የአስተዳደር ማዕከል ነው፤ ዲመካ የዞኑ ዋና ከተማ ስትሆን ቱርሚ በገበያዋ ትታወቃለች። ሐመሮች በከብት ዝላይ (ኡኩሊ ቡላ) ሥነ ሥርዓታቸው ይታወቃሉ፤ ካራዎች በኦሞ ወንዝ ዳርቻ፣ አርቦሬዎች ደግሞ በጨው ባሕር ሐይቅ አቅራቢያ ይኖራሉ።",
    },
    highlights: { en: ["Dimeka and Turmi markets", "Bull-jumping ceremonies", "Kara villages on the Omo", "Lake Chew Bahir"], am: ["የዲመካና የቱርሚ ገበያዎች", "የከብት ዝላይ ሥነ ሥርዓት", "በኦሞ ዳርቻ የካራ መንደሮች", "የጨው ባሕር ሐይቅ"] },
    sectors: ["livestock", "tourism", "agriculture"],
  },
  {
    id: "bena-tsemay", image: "banna-village", seat: { en: "Key Afer", am: "ቀይ አፈር" },
    name: { en: "Bena Tsemay", am: "በና ጸማይ" },
    peoples: { en: "Banna, Tsemay, Birale", am: "በና፣ ጸማይ፣ ቢራሌ" },
    tagline: { en: "The Thursday market at Key Afer and the Weyto valley", am: "የሐሙስ የቀይ አፈር ገበያና የወይጦ ሸለቆ" },
    about: {
      en: "Bena Tsemay links the highlands to the lowlands. Its Thursday market at Key Afer, where Banna, Hamer and Tsemay people meet to trade, is among the largest in the valley. The Weyto river valley offers land for irrigated farming, and beekeeping is widespread.",
      am: "በና ጸማይ ደጋውን ከቆላው ያገናኛል። በና፣ ሐመርና ጸማይ ለንግድ የሚገናኙበት የሐሙስ የቀይ አፈር ገበያ በሸለቆው ካሉት ትላልቅ ገበያዎች አንዱ ነው። የወይጦ ወንዝ ሸለቆ ለመስኖ እርሻ መሬት ያቀርባል፤ ንብ ማነብም የተለመደ ነው።",
    },
    highlights: { en: ["Key Afer Thursday market", "Weyto river irrigation", "Honey and beekeeping"], am: ["የሐሙስ የቀይ አፈር ገበያ", "የወይጦ ወንዝ መስኖ", "ማርና ንብ ማነብ"] },
    sectors: ["agriculture", "processing", "tourism"],
  },
  {
    id: "dasenech", image: "omo-river-omorate", seat: { en: "Omorate", am: "ኦሞራቴ" },
    name: { en: "Dasenech", am: "ዳሰነች" },
    peoples: { en: "Dassanech", am: "ዳሰነች" },
    tagline: { en: "The Omo delta, Lake Turkana and the border with Kenya", am: "የኦሞ ዴልታ፣ የቱርካና ሐይቅና ከኬንያ ጋር ያለው ድንበር" },
    about: {
      en: "Dasenech sits where the Omo River fans out into its delta and meets Lake Turkana. Omorate, on the river, is the zone's southern gateway and a crossing point for trade with Kenya. Flood-recession farming, livestock and fishing sustain the Dassanech people.",
      am: "ዳሰነች የኦሞ ወንዝ ወደ ዴልታ ተዘርግቶ ቱርካና ሐይቅን በሚቀላቀልበት ይገኛል። በወንዙ ዳር ያለችው ኦሞራቴ የዞኑ ደቡባዊ መግቢያና ከኬንያ ጋር ለሚደረግ ንግድ መሻገሪያ ናት። የጎርፍ ማፈግፈግ እርሻ፣ እንስሳትና ዓሣ ማጥመድ የዳሰነች ሕዝብ መተዳደሪያ ናቸው።",
    },
    highlights: { en: ["Omo River at Omorate", "Lake Turkana fisheries", "Cross-border trade"], am: ["ኦሞ ወንዝ በኦሞራቴ", "የቱርካና ሐይቅ ዓሣ ሀብት", "ድንበር ተሻጋሪ ንግድ"] },
    sectors: ["fisheries", "agriculture", "processing"],
  },
  {
    id: "nyangatom", image: "omo-savanna", seat: { en: "Kangaten", am: "ካንጋተን" },
    name: { en: "Nyangatom", am: "ኛንጋቶም" },
    peoples: { en: "Nyangatom", am: "ኛንጋቶም" },
    tagline: { en: "Pastoral plains between the Omo and Kibish rivers", am: "በኦሞና በኪቢሽ ወንዞች መካከል ያሉ የአርብቶ አደር ሜዳዎች" },
    about: {
      en: "Nyangatom covers wide savanna on the west bank of the Omo. Its economy is centred on cattle, goats and riverbank cultivation. Livestock markets, veterinary services and water development are the main needs.",
      am: "ኛንጋቶም በኦሞ ምዕራባዊ ዳርቻ ሰፊ የሳር ሜዳን ይሸፍናል። ኢኮኖሚው በከብት፣ በፍየልና በወንዝ ዳር እርሻ ላይ ያተኮረ ነው። የእንስሳት ገበያ፣ የእንስሳት ህክምናና የውሃ ልማት ዋና ፍላጎቶች ናቸው።",
    },
    highlights: { en: ["Omo west-bank savanna", "Livestock trade", "Riverbank farming"], am: ["የኦሞ ምዕራብ ዳርቻ ሳቫና", "የእንስሳት ንግድ", "የወንዝ ዳር እርሻ"] },
    sectors: ["livestock", "energy"],
  },
  {
    id: "selamago", image: "mursi-woman", seat: { en: "Hana", am: "ሐና" },
    name: { en: "Selamago", am: "ሰላማጎ" },
    peoples: { en: "Mursi, Bodi (Me'en), Kwegu", am: "ሙርሲ፣ ቦዲ (መዕን)፣ ክዌጉ" },
    tagline: { en: "Mago National Park and the Mursi homeland", am: "የማጎ ብሔራዊ ፓርክና የሙርሲ ምድር" },
    about: {
      en: "Selamago borders Mago National Park, created to protect the buffalo, giraffe and elephant of the plains. It is home to the Mursi and Bodi, and part of the Omo-Kuraz sugar development lies within the woreda.",
      am: "ሰላማጎ የሜዳውን ጎሽ፣ ቀጭኔና ዝሆን ለመጠበቅ ከተቋቋመው የማጎ ብሔራዊ ፓርክ ጋር ይዋሰናል። የሙርሲና የቦዲ ሕዝቦች መኖሪያ ሲሆን የኦሞ-ኩራዝ የስኳር ልማት ከፊሉ በወረዳው ውስጥ ይገኛል።",
    },
    highlights: { en: ["Mago National Park", "Mursi villages", "Omo-Kuraz sugar development"], am: ["የማጎ ብሔራዊ ፓርክ", "የሙርሲ መንደሮች", "የኦሞ-ኩራዝ የስኳር ልማት"] },
    sectors: ["tourism", "agriculture"],
  },
  {
    id: "kuraz", image: "omo-river-aerial", seat: null,
    name: { en: "Kuraz", am: "ኩራዝ" },
    peoples: { en: "Nyangatom, Mursi and others", am: "ኛንጋቶም፣ ሙርሲና ሌሎች" },
    tagline: { en: "Centre of the Omo-Kuraz irrigation and sugar scheme", am: "የኦሞ-ኩራዝ የመስኖና የስኳር ፕሮጀክት ማዕከል" },
    about: {
      en: "Kuraz takes its name from the Omo-Kuraz sugar development, one of Ethiopia's largest irrigation schemes, with sugar factories along the lower Omo. The scheme creates opportunities for outgrowers, logistics and processing of by-products such as molasses.",
      am: "ኩራዝ ስሙን ያገኘው ከኢትዮጵያ ትላልቅ የመስኖ ፕሮጀክቶች አንዱ ከሆነውና በታችኛው ኦሞ የስኳር ፋብሪካዎች ካሉት የኦሞ-ኩራዝ የስኳር ልማት ነው። ፕሮጀክቱ ለአገዳ አቅራቢ አርሶ አደሮች፣ ለሎጂስቲክስና እንደ ሞላሰስ ያሉ ተረፈ ምርቶችን ለማቀነባበር ዕድል ይፈጥራል።",
    },
    highlights: { en: ["Omo-Kuraz sugar factories", "Large-scale irrigation", "Outgrower schemes"], am: ["የኦሞ-ኩራዝ ስኳር ፋብሪካዎች", "ሰፊ የመስኖ ልማት", "የአገዳ አቅራቢ አርሶ አደሮች"] },
    sectors: ["agriculture", "processing", "energy"],
  },
  {
    id: "male", image: null, seat: { en: "Koybe", am: "ኮይቤ" },
    name: { en: "Male", am: "ማሌ" },
    peoples: { en: "Male", am: "ማሌ" },
    tagline: { en: "Highland and midland farming country", am: "የደጋና የወይና ደጋ የእርሻ ምድር" },
    about: {
      en: "The Male people are settled farmers in the zone's northern highlands and midlands. Reliable rainfall supports maize, sorghum, teff, root crops and fruit, making Male one of the zone's food baskets.",
      am: "የማሌ ሕዝብ በዞኑ ሰሜናዊ ደጋና ወይና ደጋ የሚኖሩ አርሶ አደሮች ናቸው። አስተማማኝ ዝናብ በቆሎ፣ ማሽላ፣ ጤፍ፣ የሥራ ሥር ሰብሎችንና ፍራፍሬን ይደግፋል፤ ማሌንም ከዞኑ የምግብ ቅርጫቶች አንዱ ያደርጋታል።",
    },
    highlights: { en: ["Rain-fed highland farming", "Fruit and root crops", "Cooler climate"], am: ["በዝናብ የሚለማ የደጋ እርሻ", "ፍራፍሬና የሥራ ሥር ሰብሎች", "ቀዝቃዛ የአየር ንብረት"] },
    sectors: ["agriculture", "processing"],
  },
  {
    id: "bako-gazer", image: null, seat: null,
    name: { en: "Bako Gazer", am: "ባኮ ጋዘር" },
    peoples: { en: "Mixed highland communities", am: "የተለያዩ የደጋ ማህበረሰቦች" },
    tagline: { en: "Highland crops on the road to Jinka", am: "ወደ ጂንካ በሚወስደው መንገድ ላይ ያሉ የደጋ ሰብሎች" },
    about: {
      en: "Bako Gazer lies in the zone's northern highlands, close to Jinka airport. It suits highland crops, honey and spices, and its location makes it a natural base for logistics serving the zone.",
      am: "ባኮ ጋዘር በዞኑ ሰሜናዊ ደጋማ ቦታ ከጂንካ አውሮፕላን ማረፊያ አቅራቢያ ይገኛል። ለደጋ ሰብሎች፣ ለማርና ለቅመማ ቅመም ተስማሚ ሲሆን አቀማመጡ ዞኑን ለሚያገለግል ሎጂስቲክስ ምቹ ያደርገዋል።",
    },
    highlights: { en: ["Highland crops", "Honey and spices", "Near Jinka airport"], am: ["የደጋ ሰብሎች", "ማርና ቅመማ ቅመም", "ከጂንካ አውሮፕላን ማረፊያ አቅራቢያ"] },
    sectors: ["agriculture", "processing"],
  },
];

let n = 0;
const opp = (woreda, sector, en, am, sEn, sAm, landHa, usdM, jobs) => ({
  id: `opp-${++n}`, woreda, sector, title: { en, am }, summary: { en: sEn, am: sAm }, landHa, investmentUsdM: usdM, jobs,
});
// SAMPLE listings: to be confirmed by the Zone Investment Office.
export const opportunities = [
  opp("hamer", "agriculture", "Irrigated cotton and sorghum", "የመስኖ ጥጥና ማሽላ", "Commercial farm on the Weyto plain with an outgrower component for local farmers.", "በወይጦ ሜዳ ላይ ለአካባቢው አርሶ አደሮች የአውትግሮወር ድርሻ ያለው የንግድ እርሻ።", 2000, 8, 600),
  opp("hamer", "livestock", "Cattle feedlot and export abattoir", "የከብት ማደለቢያና የኤክስፖርት ቄራ", "Feedlot, quarantine and abattoir sourcing from Hamer and Bena Tsemay herders.", "ከሐመርና ከበና ጸማይ አርብቶ አደሮች የሚገዛ ማደለቢያ፣ ኳራንቲንና ቄራ።", 150, 6, 260),
  opp("hamer", "tourism", "Community eco-lodge near Turmi", "በቱርሚ አቅራቢያ የማህበረሰብ ኢኮ-ሎጅ", "Twenty-room lodge with a revenue-sharing agreement with the host community.", "ከአስተናጋጁ ማህበረሰብ ጋር ገቢ የሚጋራ ሃያ ክፍሎች ያሉት ሎጅ።", 12, 1.4, 45),
  opp("bena-tsemay", "processing", "Honey and beeswax processing", "የማርና የሰም ማቀነባበሪያ", "Collection centres and a processing plant for honey from traditional and modern hives.", "ከባህላዊና ከዘመናዊ ቀፎዎች ለሚገኝ ማር የመሰብሰቢያ ማዕከላትና ማቀነባበሪያ።", 3, 0.8, 60),
  opp("bena-tsemay", "agriculture", "Weyto valley horticulture", "የወይጦ ሸለቆ አትክልትና ፍራፍሬ", "Drip-irrigated vegetables and fruit for regional markets.", "ለክልላዊ ገበያ የሚውሉ በጠብታ መስኖ የሚለሙ አትክልትና ፍራፍሬ።", 600, 3.5, 420),
  opp("dasenech", "fisheries", "Lake Turkana fish processing", "የቱርካና ሐይቅ ዓሣ ማቀነባበሪያ", "Landing site, ice plant and cold chain for Nile perch and tilapia.", "ለናይል ፐርችና ለቆሮሶ ዓሣ ማረፊያ፣ የበረዶ ፋብሪካና የቅዝቃዜ ሰንሰለት።", 8, 2.6, 130),
  opp("dasenech", "processing", "Omorate cross-border trade hub", "የኦሞራቴ ድንበር ተሻጋሪ የንግድ ማዕከል", "Warehousing, fuel and logistics serving trade with northern Kenya.", "ከሰሜን ኬንያ ጋር ለሚደረግ ንግድ መጋዘን፣ ነዳጅና ሎጂስቲክስ።", 20, 3, 180),
  opp("nyangatom", "livestock", "Livestock market and veterinary centre", "የእንስሳት ገበያና የእንስሳት ህክምና ማዕከል", "Market yards, watering points and animal-health services for pastoralists.", "ለአርብቶ አደሮች የገበያ ቦታ፣ የውሃ ማጠጫና የእንስሳት ጤና አገልግሎት።", 40, 1.5, 80),
  opp("nyangatom", "energy", "Solar water for people and livestock", "ለሰውና ለእንስሳት የፀሐይ ኃይል ውሃ", "Solar-powered boreholes and small irrigation along the Omo.", "በፀሐይ ኃይል የሚሠሩ የውሃ ጉድጓዶችና በኦሞ ዳርቻ አነስተኛ መስኖ።", 25, 2.2, 50),
  opp("selamago", "tourism", "Safari camp at Mago National Park", "በማጎ ብሔራዊ ፓርክ የሳፋሪ ካምፕ", "Low-impact tented camp in partnership with the park authority.", "ከፓርኩ ባለሥልጣን ጋር በሽርክና የሚሠራ ዝቅተኛ ተጽዕኖ ያለው የድንኳን ካምፕ።", 15, 1.8, 50),
  opp("kuraz", "processing", "Molasses-to-ethanol and feed", "ከሞላሰስ ኢታኖልና መኖ", "Value addition from Omo-Kuraz sugar by-products.", "ከኦሞ-ኩራዝ የስኳር ተረፈ ምርቶች እሴት መጨመር።", 30, 12, 300),
  opp("kuraz", "agriculture", "Sugarcane outgrower support", "የሸንኮራ አገዳ አቅራቢ አርሶ አደሮች ድጋፍ", "Mechanisation, inputs and transport services for outgrowers.", "ለአገዳ አቅራቢዎች የእርሻ መሣሪያ፣ ግብዓትና የትራንስፖርት አገልግሎት።", 0, 2, 200),
  opp("male", "processing", "Fruit and root-crop processing", "የፍራፍሬና የሥራ ሥር ሰብሎች ማቀነባበሪያ", "Drying, milling and packaging to cut post-harvest losses.", "ከምርት በኋላ ብክነትን ለመቀነስ ማድረቅ፣ መፍጨትና ማሸግ።", 5, 1.2, 90),
  opp("bako-gazer", "processing", "Spice and honey packing centre", "የቅመማ ቅመምና የማር ማሸጊያ ማዕከል", "Aggregation, grading and packing near Jinka airport.", "በጂንካ አውሮፕላን ማረፊያ አቅራቢያ መሰብሰብ፣ ደረጃ መለየትና ማሸግ።", 4, 0.9, 70),
];

export const attractions = [
  {
    id: "lower-omo", image: "lower-omo-aerial",
    title: { en: "Lower Valley of the Omo", am: "የታችኛው ኦሞ ሸለቆ" },
    tag: { en: "UNESCO World Heritage · 1980", am: "የዩኔስኮ የዓለም ቅርስ · 1980" },
    text: {
      en: "Fossil beds in the valley, including the Omo Kibish finds dated to about 233,000 years, are the oldest known remains of Homo sapiens. The site was inscribed on the World Heritage List in 1980.",
      am: "በሸለቆው የሚገኙት የቅሪተ አካል ስፍራዎች፣ በ233,000 ዓመታት ገደማ የተገመቱትን የኦሞ ኪቢሽ ግኝቶች ጨምሮ፣ እስካሁን የታወቁ ጥንታዊ የሆሞ ሳፒየንስ ቅሪቶች ናቸው። ስፍራው በ1980 በዓለም ቅርስነት ተመዝግቧል።",
    },
  },
  {
    id: "mago", image: "omo-savanna",
    title: { en: "Mago National Park", am: "የማጎ ብሔራዊ ፓርክ" },
    tag: { en: "Wildlife & savanna", am: "የዱር እንስሳትና ሳቫና" },
    text: {
      en: "Grassland and riverine forest created to protect the plains' buffalo, giraffe and elephant, with rich birdlife. The park is also the route to Mursi villages.",
      am: "የሜዳውን ጎሽ፣ ቀጭኔና ዝሆን ለመጠበቅ የተቋቋመ የሳርና የወንዝ ዳር ደን፤ ብዙ የአእዋፍ ዝርያዎችም አሉት። ወደ ሙርሲ መንደሮች የሚወስደው መንገድም በፓርኩ ያልፋል።",
    },
  },
  {
    id: "omo-river", image: "omo-river-omorate",
    title: { en: "The Omo River & Omorate", am: "የኦሞ ወንዝና ኦሞራቴ" },
    tag: { en: "River & delta", am: "ወንዝና ዴልታ" },
    text: {
      en: "Cross the Omo at Omorate to Dassanech villages, and follow the river to its delta on Lake Turkana.",
      am: "በኦሞራቴ ኦሞን ተሻግረው የዳሰነች መንደሮችን ይጎብኙ፤ ወንዙን ተከትለው ቱርካና ሐይቅ ላይ ወዳለው ዴልታ ይጓዙ።",
    },
  },
  {
    id: "hamer", image: "hamer-ceremony",
    title: { en: "Hamer culture & bull jumping", am: "የሐመር ባህልና የከብት ዝላይ" },
    tag: { en: "Living heritage", am: "ህያው ቅርስ" },
    text: {
      en: "The ukuli bula bull-jumping ceremony marks a young man's passage to adulthood. Ceremonies are family events: visit only by invitation and with a local guide.",
      am: "የኡኩሊ ቡላ የከብት ዝላይ ሥነ ሥርዓት ወጣቱ ወደ ጉልምስና መሸጋገሩን ያበስራል። ሥነ ሥርዓቱ የቤተሰብ ጉዳይ ስለሆነ በግብዣና ከአካባቢ አስጎብኚ ጋር ብቻ ይጎብኙ።",
    },
  },
  {
    id: "markets", image: "banna-enterprise",
    title: { en: "Weekly markets", am: "ሳምንታዊ ገበያዎች" },
    tag: { en: "Trade & crafts", am: "ንግድና የእጅ ሥራ" },
    text: {
      en: "Markets at Key Afer, Turmi and Dimeka bring together peoples from across the valley to trade cattle, grain, honey, gourds and beadwork.",
      am: "የቀይ አፈር፣ የቱርሚና የዲመካ ገበያዎች ከሸለቆው የተለያዩ አካባቢዎች የሚመጡ ሕዝቦችን ከብት፣ እህል፣ ማር፣ ቅልና ዶቃ ለመገበያየት ያገናኛሉ።",
    },
  },
  {
    id: "turkana", image: "lake-turkana-dusk",
    title: { en: "Lake Turkana & Chew Bahir", am: "ቱርካና ሐይቅና የጨው ባሕር" },
    tag: { en: "Lakes & birdlife", am: "ሐይቆችና አእዋፍ" },
    text: {
      en: "The world's largest desert lake begins at the Omo delta, while Lake Chew Bahir near the Arbore lands attracts flamingos and waterbirds.",
      am: "የዓለማችን ትልቁ የበረሃ ሐይቅ የሚጀምረው ከኦሞ ዴልታ ነው፤ በአርቦሬ ምድር አቅራቢያ ያለው የጨው ባሕር ሐይቅ ደግሞ ፍላሚንጎዎችንና የውሃ አእዋፍን ይስባል።",
    },
  },
];

// Day index: 0=Sun … 6=Sat. Market days change: confirm locally before travelling.
export const markets = [
  { place: { en: "Turmi", am: "ቱርሚ" }, woreda: "hamer", days: [1] },
  { place: { en: "Dimeka", am: "ዲመካ" }, woreda: "hamer", days: [2, 4] },
  { place: { en: "Key Afer", am: "ቀይ አፈር" }, woreda: "bena-tsemay", days: [4] },
];

export const peoples = ["Hamer", "Banna", "Tsemay", "Dassanech", "Nyangatom", "Mursi", "Bodi", "Kara", "Arbore", "Male", "Kwegu", "Birale"];
export const peoplesAm = ["ሐመር", "በና", "ጸማይ", "ዳሰነች", "ኛንጋቶም", "ሙርሲ", "ቦዲ", "ካራ", "አርቦሬ", "ማሌ", "ክዌጉ", "ቢራሌ"];

export const etiquette = {
  en: [
    ["Ask before you photograph", "Always ask permission and agree any photo fee before taking pictures of people."],
    ["Travel with a local guide", "Licensed guides from the woreda know the communities, the roads and the customs."],
    ["Buy local", "Buy crafts, honey and food directly from producers at the weekly markets."],
    ["Respect ceremonies", "Ceremonies are private family events. Attend only when invited."],
  ],
  am: [
    ["ፎቶ ከማንሳትዎ በፊት ይጠይቁ", "የሰዎችን ፎቶ ከማንሳትዎ በፊት ሁልጊዜ ፈቃድ ይጠይቁ፤ ክፍያ ካለም አስቀድመው ይስማሙ።"],
    ["ከአካባቢ አስጎብኚ ጋር ይጓዙ", "ፈቃድ ያላቸው የወረዳ አስጎብኚዎች ማህበረሰቦቹን፣ መንገዶቹንና ልማዶቹን ያውቃሉ።"],
    ["የአካባቢ ምርት ይግዙ", "የእጅ ሥራ፣ ማርና ምግብ በሳምንታዊ ገበያዎች በቀጥታ ከአምራቾች ይግዙ።"],
    ["ሥነ ሥርዓቶችን ያክብሩ", "ሥነ ሥርዓቶች የግል የቤተሰብ ጉዳዮች ናቸው። የሚገኙት ሲጋበዙ ብቻ ይሁን።"],
  ],
};

export const investSteps = {
  en: [
    ["Explore", "Review sectors and woreda opportunities on this portal, or request a profile from the investment desk."],
    ["Consult", "Meet the Zone Investment Office and the woreda administration to discuss land, water and access."],
    ["Visit the site", "We arrange a field visit and introduce you to the host community."],
    ["Apply & license", "Submit your project proposal; we support licensing with the regional investment bureau."],
    ["Launch", "Agree a community development plan, recruit locally and begin operations with our follow-up support."],
  ],
  am: [
    ["ይቃኙ", "በዚህ ፖርታል ዘርፎችንና የወረዳ ዕድሎችን ይመልከቱ ወይም ከኢንቨስትመንት ጽ/ቤቱ መገለጫ ይጠይቁ።"],
    ["ይመካከሩ", "ስለ መሬት፣ ውሃና መዳረሻ ለመወያየት የዞኑን ኢንቨስትመንት ጽ/ቤትና የወረዳውን አስተዳደር ያግኙ።"],
    ["ቦታውን ይጎብኙ", "የመስክ ጉብኝት እናዘጋጃለን፤ ከአስተናጋጁ ማህበረሰብም ጋር እናስተዋውቅዎታለን።"],
    ["ያመልክቱና ፈቃድ ያውጡ", "የፕሮጀክት ሀሳብዎን ያቅርቡ፤ ከክልሉ ኢንቨስትመንት ቢሮ ፈቃድ እንዲያገኙ እንደግፋለን።"],
    ["ሥራ ይጀምሩ", "የማህበረሰብ ልማት ዕቅድ ይስማሙ፣ ከአካባቢው ይቅጠሩና በክትትል ድጋፋችን ሥራ ይጀምሩ።"],
  ],
};

export const principles = {
  en: [
    ["Community consultation", "Projects are discussed with affected communities before land is allocated."],
    ["Local jobs and skills", "Investors commit to hiring and training local workers."],
    ["Shared benefits", "Outgrower schemes, services and infrastructure that reach surrounding villages."],
    ["Protect the river and the lake", "Water use and land clearing must respect the Omo, Lake Turkana and protected areas."],
  ],
  am: [
    ["የማህበረሰብ ምክክር", "መሬት ከመሰጠቱ በፊት ፕሮጀክቶች ከሚመለከታቸው ማህበረሰቦች ጋር ይመከርባቸዋል።"],
    ["የአካባቢ ሥራና ክህሎት", "ባለሀብቶች የአካባቢውን ሠራተኞች ለመቅጠርና ለማሰልጠን ቃል ይገባሉ።"],
    ["የጋራ ተጠቃሚነት", "በዙሪያው ላሉ መንደሮች የሚደርሱ የአውትግሮወር ፕሮግራሞች፣ አገልግሎቶችና መሠረተ ልማት።"],
    ["ወንዙንና ሐይቁን መጠበቅ", "የውሃ አጠቃቀምና የመሬት ምንጣሮ ኦሞን፣ ቱርካና ሐይቅንና ጥብቅ ስፍራዎችን ማክበር አለበት።"],
  ],
};

// SAMPLE announcements: replace from the HR and procurement offices.
export const announcements = [
  {
    id: "v1", type: "vacancy", posted: iso(-4), deadline: iso(10),
    title: { en: "Irrigation Engineer", am: "የመስኖ መሐንዲስ" },
    org: { en: "Zone Agriculture Department", am: "የዞኑ ግብርና መምሪያ" },
    location: { en: "Dimeka", am: "ዲመካ" },
    summary: { en: "Design and supervise small-scale irrigation schemes in the lowland woredas.", am: "በቆላማ ወረዳዎች አነስተኛ የመስኖ ፕሮጀክቶችን መንደፍና መቆጣጠር።" },
    details: {
      en: ["BSc in Irrigation or Water Resources Engineering", "Minimum 3 years of relevant experience", "Willingness to work in remote woredas", "Apply in person with CV and credentials"],
      am: ["በመስኖ ወይም በውሃ ሀብት ምህንድስና የመጀመሪያ ዲግሪ", "ቢያንስ 3 ዓመት ተዛማጅ የሥራ ልምድ", "በራቅ ያሉ ወረዳዎች ለመሥራት ፈቃደኛ", "ሲቪና ማስረጃዎችን ይዘው በአካል ያመልክቱ"],
    },
  },
  {
    id: "v2", type: "vacancy", posted: iso(-2), deadline: iso(16),
    title: { en: "Tourism Development Officer", am: "የቱሪዝም ልማት ባለሙያ" },
    org: { en: "Zone Culture & Tourism Department", am: "የዞኑ ባህልና ቱሪዝም መምሪያ" },
    location: { en: "Dimeka", am: "ዲመካ" },
    summary: { en: "Develop community-based tourism and register guides and lodges.", am: "በማህበረሰብ ላይ የተመሠረተ ቱሪዝም ማልማትና አስጎብኚዎችንና ሎጆችን መመዝገብ።" },
    details: {
      en: ["BA in Tourism Management or related field", "Fluent in Amharic and English", "Knowledge of a local language is an advantage"],
      am: ["በቱሪዝም አስተዳደር ወይም ተዛማጅ መስክ ዲግሪ", "አማርኛና እንግሊዝኛ አቀላጥፎ መናገር", "የአካባቢ ቋንቋ ማወቅ ተጨማሪ ነጥብ ያስገኛል"],
    },
  },
  {
    id: "v3", type: "vacancy", posted: iso(-6), deadline: iso(7),
    title: { en: "Animal Health Technicians (4 posts)", am: "የእንስሳት ጤና ቴክኒሻኖች (4 ቦታ)" },
    org: { en: "Zone Livestock & Fisheries Department", am: "የዞኑ እንስሳትና ዓሣ ሀብት መምሪያ" },
    location: { en: "Nyangatom, Dasenech", am: "ኛንጋቶም፣ ዳሰነች" },
    summary: { en: "Vaccination campaigns and animal-health services for pastoral communities.", am: "ለአርብቶ አደር ማህበረሰቦች የክትባት ዘመቻና የእንስሳት ጤና አገልግሎት።" },
    details: { en: ["Diploma in Animal Health", "Driving licence is an advantage"], am: ["በእንስሳት ጤና ዲፕሎማ", "መንጃ ፈቃድ ተጨማሪ ነጥብ ያስገኛል"] },
  },
  {
    id: "v4", type: "vacancy", posted: iso(-25), deadline: iso(-5),
    title: { en: "Accountant", am: "የሂሳብ ባለሙያ" },
    org: { en: "Zone Finance Department", am: "የዞኑ ፋይናንስ መምሪያ" },
    location: { en: "Dimeka", am: "ዲመካ" },
    summary: { en: "Public financial management and reporting.", am: "የመንግሥት ፋይናንስ አስተዳደርና ሪፖርት።" },
    details: { en: ["BA in Accounting"], am: ["በሂሳብ አያያዝ ዲግሪ"] },
  },
  {
    id: "t1", type: "tender", ref: "SOZ/NCB/W/014/2026", posted: iso(-3), deadline: iso(20),
    title: { en: "Construction of Key Afer market shelter", am: "የቀይ አፈር ገበያ መጠለያ ግንባታ" },
    org: { en: "Zone Trade & Market Development", am: "የዞኑ ንግድና ገበያ ልማት" },
    location: { en: "Bena Tsemay", am: "በና ጸማይ" },
    summary: { en: "National competitive bidding for a 1,200 m² covered market with water and sanitation.", am: "ውሃና ንጽሕና ያለው 1,200 ካሬ ሜትር የተሸፈነ ገበያ ለመገንባት ብሔራዊ ግልጽ ጨረታ።" },
    details: {
      en: ["Building contractors grade BC-5 or above", "Bid security: 2% of bid price", "Bid documents: non-refundable fee of ETB 500", "Bids opened publicly on the closing date at 10:00"],
      am: ["ደረጃ BC-5 እና ከዚያ በላይ የሕንፃ ተቋራጮች", "የጨረታ ማስከበሪያ፦ ከጨረታ ዋጋው 2%", "የጨረታ ሰነድ፦ የማይመለስ 500 ብር", "ጨረታው በመዝጊያው ቀን 4፡00 ሰዓት በይፋ ይከፈታል"],
    },
  },
  {
    id: "t2", type: "tender", ref: "SOZ/NCB/G/021/2026", posted: iso(-1), deadline: iso(24),
    title: { en: "Supply of veterinary vaccines and cold boxes", am: "የእንስሳት ክትባቶችና የቀዝቃዛ ሳጥኖች አቅርቦት" },
    org: { en: "Zone Livestock & Fisheries Department", am: "የዞኑ እንስሳትና ዓሣ ሀብት መምሪያ" },
    location: { en: "Dimeka", am: "ዲመካ" },
    summary: { en: "Supply and delivery of vaccines and solar cold boxes for pastoral areas.", am: "ለአርብቶ አደር አካባቢዎች ክትባቶችንና በፀሐይ ኃይል የሚሠሩ ቀዝቃዛ ሳጥኖችን ማቅረብ።" },
    details: { en: ["Valid trade licence and VAT registration", "Delivery to Dimeka within 30 days"], am: ["የታደሰ የንግድ ፈቃድና የተ.እ.ታ. ምዝገባ", "በ30 ቀናት ውስጥ ዲመካ ማድረስ"] },
  },
  {
    id: "t3", type: "tender", ref: "SOZ/NCB/W/009/2026", posted: iso(-5), deadline: iso(12),
    title: { en: "Solar water schemes in Nyangatom", am: "በኛንጋቶም የፀሐይ ኃይል የውሃ ተቋማት" },
    org: { en: "Zone Water & Energy Department", am: "የዞኑ ውሃና ኢነርጂ መምሪያ" },
    location: { en: "Nyangatom", am: "ኛንጋቶም" },
    summary: { en: "Drilling and solar pumping for three community water points.", am: "ለሦስት የማህበረሰብ የውሃ ቦታዎች ቁፋሮና የፀሐይ ኃይል ፓምፕ።" },
    details: { en: ["Water-works contractors grade WWC-4 or above", "Site visit is mandatory"], am: ["ደረጃ WWC-4 እና ከዚያ በላይ የውሃ ሥራ ተቋራጮች", "የቦታ ጉብኝት ግዴታ ነው"] },
  },
  {
    id: "t4", type: "tender", ref: "SOZ/NCB/W/003/2026", posted: iso(-40), deadline: iso(-12),
    title: { en: "Dimeka–Turmi road maintenance", am: "የዲመካ–ቱርሚ መንገድ ጥገና" },
    org: { en: "Zone Roads Department", am: "የዞኑ መንገዶች መምሪያ" },
    location: { en: "Hamer", am: "ሐመር" },
    summary: { en: "Routine maintenance of the gravel road.", am: "የጠጠር መንገዱ መደበኛ ጥገና።" },
    details: { en: ["Road contractors grade RC-5 or above"], am: ["ደረጃ RC-5 እና ከዚያ በላይ የመንገድ ተቋራጮች"] },
  },
];
