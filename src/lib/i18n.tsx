import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type Lang = "hi" | "en";

// ─── Translation dictionary ───────────────────────────────────────────────────
export const translations = {
  // App-wide
  appName: { hi: "पूजासाथी", en: "PoojaSathi" },
  appTagline: {
    hi: "पूजा सहयोग, सरल बनाया",
    en: "Pooja Collaboration, Simplified",
  },
  subTagline: {
    hi: "पंडित और यजमान का साझा कार्यक्षेत्र",
    en: "Shared workspace for Pandit & Yajmaan",
  },

  // Nav
  home: { hi: "होम", en: "Home" },
  myPoojas: { hi: "मेरी पूजाएँ", en: "My Poojas" },
  masterLibrary: { hi: "मास्टर सूची", en: "Master Library" },
  tasks: { hi: "कार्य", en: "Tasks" },
  profile: { hi: "प्रोफ़ाइल", en: "Profile" },

  // Roles
  pandit: { hi: "पंडित", en: "Pandit" },
  yajmaan: { hi: "यजमान", en: "Yajmaan" },

  // Landing
  heroTitle: {
    hi: "पूजा, साथ मिलकर योजना बनाइए",
    en: "Plan a Pooja, Together.",
  },
  heroSubtitle: {
    hi: "पूजासाथी हाथ से लिखी सामग्री की पर्चियों को एक साझा कार्यक्षेत्र में बदलता है जहाँ पंडित और यजमान मिलकर काम करते हैं।",
    en: "PoojaSathi turns handwritten samagri slips into a shared workspace where Pandit and Yajmaan plan together.",
  },
  startPooja: { hi: "पूजा शुरू करें", en: "Start a Pooja" },
  viewPoojas: { hi: "मेरी पूजाएँ देखें", en: "View my Poojas" },

  // Pooja
  newPooja: { hi: "नई पूजा", en: "New Pooja" },
  createPooja: { hi: "पूजा बनाएं", en: "Create a Pooja" },
  poojaName: { hi: "पूजा का नाम", en: "Pooja Name" },
  poojaType: { hi: "पूजा प्रकार", en: "Pooja Type" },
  date: { hi: "दिनांक", en: "Date" },
  time: { hi: "समय", en: "Time" },
  venue: { hi: "स्थान", en: "Venue" },
  city: { hi: "शहर", en: "City" },
  budget: { hi: "बजट", en: "Budget" },
  occasion: { hi: "अवसर", en: "Occasion" },
  notes: { hi: "टिप्पणी", en: "Notes" },
  inPreparation: { hi: "तैयारी में", en: "In Preparation" },
  completed: { hi: "पूर्ण", en: "Completed" },
  planning: { hi: "योजना", en: "Planning" },

  // Workspace modules
  overview: { hi: "अवलोकन", en: "Overview" },
  booking: { hi: "बुकिंग", en: "Booking" },
  timeline: { hi: "समयरेखा", en: "Timeline" },
  masterSamagri: { hi: "मास्टर सामग्री", en: "Master Samagri" },
  checklist: { hi: "चेकलिस्ट", en: "Checklist" },
  requests: { hi: "अनुरोध", en: "Requests" },
  responsibilities: { hi: "जिम्मेदारियाँ", en: "Responsibilities" },
  notesModule: { hi: "नोट्स", en: "Notes" },
  completion: { hi: "समापन", en: "Completion" },

  // Samagri
  samagriList: { hi: "सामग्री सूची", en: "Samagri List" },
  addSamagri: { hi: "सामग्री जोड़ें", en: "Add Samagri" },
  addFromLibrary: { hi: "सूची से जोड़ें", en: "Add from Library" },
  customItem: { hi: "कस्टम वस्तु", en: "Custom Item" },
  required: { hi: "अनिवार्य", en: "Required" },
  optional: { hi: "वैकल्पिक", en: "Optional" },
  qty: { hi: "मात्रा", en: "Qty" },
  unit: { hi: "इकाई", en: "Unit" },
  category: { hi: "श्रेणी", en: "Category" },
  responsible: { hi: "जिम्मेदार", en: "Responsible" },
  description: { hi: "विवरण", en: "Description" },
  searchSamagri: { hi: "सामग्री खोजें...", en: "Search samagri..." },

  // Status
  notStarted: { hi: "शुरू नहीं", en: "Not Started" },
  searching: { hi: "खोज रहे हैं", en: "Searching" },
  arranged: { hi: "व्यवस्थित", en: "Arranged" },
  purchased: { hi: "खरीदा", en: "Purchased" },
  unableToArrange: { hi: "उपलब्ध नहीं", en: "Unable to Arrange" },
  requestPandit: { hi: "पंडित जी लाएंगे", en: "Request Pandit to Bring" },

  // Checklist actions
  markArranged: { hi: "व्यवस्थित करें", en: "Mark Arranged" },
  cannotArrange: { hi: "उपलब्ध नहीं", en: "Can't Arrange" },
  askPandit: { hi: "पंडित जी से माँगें", en: "Ask Pandit to Bring" },
  itemsArranged: { hi: "वस्तुएं व्यवस्थित", en: "Items Arranged" },
  itemsPending: { hi: "वस्तुएं बाकी", en: "Items Pending" },
  itemsToRequest: {
    hi: "पंडित जी से माँगी",
    en: "Items Requested from Pandit",
  },
  preparedBy: { hi: "तैयार", en: "Prepared" },
  progress: { hi: "प्रगति", en: "Progress" },

  // Requests
  raiseRequest: { hi: "अनुरोध करें", en: "Raise Request" },
  newRequest: { hi: "नया अनुरोध", en: "New Request" },
  bringItem: { hi: "वस्तु लाएं", en: "Bring Item" },
  addItem: { hi: "वस्तु जोड़ें", en: "Add Item" },
  pending: { hi: "प्रतीक्षारत", en: "Pending" },
  approved: { hi: "स्वीकृत", en: "Approved" },
  declined: { hi: "अस्वीकृत", en: "Declined" },
  approve: { hi: "स्वीकार करें", en: "Approve" },
  decline: { hi: "अस्वीकार करें", en: "Decline" },

  // Pandit actions
  panditAddsItem: { hi: "पंडित जी वस्तु जोड़ें", en: "Pandit adds item" },
  setRequired: { hi: "अनिवार्य सेट करें", en: "Set as Required" },
  setOptional: { hi: "वैकल्पिक सेट करें", en: "Set as Optional" },
  saveList: { hi: "सूची सहेजें", en: "Save List" },
  publishList: { hi: "सूची प्रकाशित करें", en: "Publish List" },
  listPublished: { hi: "सूची यजमान को भेजी गई", en: "List sent to Yajmaan" },

  // General
  save: { hi: "सहेजें", en: "Save" },
  cancel: { hi: "रद्द करें", en: "Cancel" },
  add: { hi: "जोड़ें", en: "Add" },
  edit: { hi: "संपादित करें", en: "Edit" },
  delete: { hi: "हटाएं", en: "Delete" },
  confirm: { hi: "पुष्टि करें", en: "Confirm" },
  close: { hi: "बंद करें", en: "Close" },
  back: { hi: "वापस", en: "Back" },
  next: { hi: "आगे", en: "Next" },
  send: { hi: "भेजें", en: "Send" },
  search: { hi: "खोजें", en: "Search" },
  filter: { hi: "फ़िल्टर", en: "Filter" },
  all: { hi: "सभी", en: "All" },
  loading: { hi: "लोड हो रहा है...", en: "Loading..." },
  noItems: { hi: "कोई वस्तु नहीं", en: "No items" },
  days: { hi: "दिन", en: "days" },
  inDays: { hi: "दिन में", en: "days remaining" },

  // Pandit profile
  panditName: {
    hi: "पंडित विजय कुमार मिश्रा",
    en: "Pandit Vijay Kumar Mishra",
  },
  panditTitle: { hi: "शास्त्री एम.ए.", en: "Shastri M.A." },
  panditAddress: {
    hi: "शिव मंदिर सेवा समिति, सुभाष मार्किट, खिचड़ीपुर, 5 ब्लॉक, दिल्ली - 110091",
    en: "Shiv Mandir Seva Samiti, Subhash Market, Khichdipur, 5 Block, Delhi - 110091",
  },

  // Language selector
  selectLanguage: { hi: "भाषा चुनें", en: "Select Language" },
  hindi: { hi: "हिंदी", en: "Hindi" },
  english: { hi: "अंग्रेज़ी", en: "English" },
  languageNote: {
    hi: "आप बाद में भी भाषा बदल सकते हैं",
    en: "You can change language anytime",
  },

  // Categories (Hindi)
  catGeneralPooja: { hi: "सामान्य पूजा", en: "General Pooja" },
  catHavan: { hi: "हवन", en: "Havan" },
  catKalash: { hi: "कलश", en: "Kalash" },
  catFruits: { hi: "फल", en: "Fruits" },
  catFlowers: { hi: "फूल", en: "Flowers" },
  catDryFruits: { hi: "मेवे", en: "Dry Fruits" },
  catCloth: { hi: "वस्त्र", en: "Cloth" },
  catUtensils: { hi: "बर्तन", en: "Utensils" },
  catDecoration: { hi: "सजावट", en: "Decoration" },
  catPrasad: { hi: "प्रसाद", en: "Prasad" },
  catMisc: { hi: "विविध", en: "Miscellaneous" },

  // Samagri sheet header
  sankshiptPujanSamagri: {
    hi: "संक्षिप्त पूजन सामग्री",
    en: "Brief Pooja Samagri List",
  },
  shriGaneshayNamah: { hi: "श्री गणेशाय नमः", en: "Shri Ganeshay Namah" },
  hariOm: { hi: "हरी ॐ", en: "Hari Om" },
} as const;

export type TranslationKey = keyof typeof translations;

// ─── Context ───────────────────────────────────────────────────────────────────
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isHindi: boolean;
}

const LangContext = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("ps-lang") as Lang) || "hi";
    } catch {
      return "hi";
    }
  });
  const [showPicker, setShowPicker] = useState(() => {
    try {
      return !localStorage.getItem("ps-lang");
    } catch {
      return true;
    }
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setGlobalLang(l);
    try {
      localStorage.setItem("ps-lang", l);
    } catch {
      /* */
    }
    setShowPicker(false);
  }, []);

  // Keep global lang in sync for non-hook consumers (otp.ts)
  useEffect(() => {
    setGlobalLang(lang);
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[key][lang];
    },
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, isHindi: lang === "hi" }}>
      {children}
      {showPicker && <LanguagePickerModal onSelect={setLang} />}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

// Non-hook version for use outside React components (e.g., in lib/otp.ts)
let _currentLang: Lang = "hi";
export function setGlobalLang(l: Lang) {
  _currentLang = l;
}
export function getLang(): Lang {
  return _currentLang;
}

// ─── Language picker modal (auto-shows on first visit) ────────────────────────
function LanguagePickerModal({ onSelect }: { onSelect: (l: Lang) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-maroon-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Select language"
    >
      <div className="w-full max-w-sm ps-card shadow-lift p-8 text-center animate-scale-in">
        {/* Mandala header */}
        <div className="mx-auto w-16 h-16 rounded-full bg-saffron-50 flex items-center justify-center mb-4">
          <span className="font-display text-3xl text-saffron-600">ॐ</span>
        </div>
        <h2 className="font-display text-xl text-maroon-900 mb-1">
          भाषा चुनें
        </h2>
        <p className="text-sm text-temple-muted mb-6">Select Language</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect("hi")}
            className="group flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-temple-border hover:border-saffron-400 hover:bg-saffron-50 transition-all"
          >
            <span className="text-3xl font-deva font-bold text-saffron-700 group-hover:scale-110 transition-transform">
              अ
            </span>
            <span className="font-display text-base text-temple-ink">
              हिंदी
            </span>
            <span className="text-xs text-temple-muted">Hindi (प्राथमिक)</span>
          </button>
          <button
            onClick={() => onSelect("en")}
            className="group flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-temple-border hover:border-saffron-400 hover:bg-saffron-50 transition-all"
          >
            <span className="text-3xl font-bold text-saffron-700 group-hover:scale-110 transition-transform">
              A
            </span>
            <span className="font-display text-base text-temple-ink">
              English
            </span>
            <span className="text-xs text-temple-muted">Secondary</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-temple-muted">
          आप बाद में भी भाषा बदल सकते हैं · You can change anytime
        </p>
      </div>
    </div>
  );
}

// ─── Language toggle button (for AppShell) ────────────────────────────────────
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "hi" ? "en" : "hi")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-temple-border bg-white/60 hover:bg-beige-100 text-xs font-semibold text-temple-ink transition-colors"
      aria-label={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
      title={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
    >
      {lang === "hi" ? (
        <>
          <span className="font-deva text-sm text-saffron-700">अ</span>
          <span className="text-temple-muted">/</span>
          <span>A</span>
        </>
      ) : (
        <>
          <span>A</span>
          <span className="text-temple-muted">/</span>
          <span className="font-deva text-sm text-saffron-700">अ</span>
        </>
      )}
    </button>
  );
}
