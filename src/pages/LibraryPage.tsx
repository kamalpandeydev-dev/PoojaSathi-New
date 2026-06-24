import { useMemo, useState } from "react";
import { Search, Sparkles, BookOpen, PhoneCall } from "lucide-react";
import {
  categories as categoryList,
  categoryMeta,
  masterSamagriLibrary,
} from "../lib/masterLibrary";
import { Badge, EmptyState } from "../components/ui";
import { useLang } from "../lib/i18n";
import type { Category } from "../lib/types";

export function LibraryPage() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    return masterSamagriLibrary.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !`${m.hindiName} ${m.englishName} ${m.category}`
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      return true;
    });
  }, [search, cat]);

  const grouped = useMemo(() => {
    const map = new Map<Category, typeof masterSamagriLibrary>();
    filtered.forEach((m) => {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 animate-fade-in">
      {/* Pandit sheet header */}
      <div className="ps-card p-5 mb-6 bg-gradient-to-br from-maroon-50 to-saffron-50 border-maroon-200">
        <div className="text-center mb-3">
          <p className="font-deva text-sm text-saffron-700 font-bold">
            ॥ ॐ हरी ओम् · श्री गणेशाय नमः ॥
          </p>
          <h2 className="font-display text-xl text-maroon-900 mt-1">
            संक्षिप्त पूजन सामग्री
          </h2>
          <p className="font-deva font-bold text-base text-temple-ink mt-0.5">
            पंडित विजय कुमार मिश्रा
          </p>
          <p className="text-sm text-temple-muted">
            शास्त्री एम.ए. · Shastri M.A.
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <PhoneCall className="w-4 h-4 text-saffron-600" />
            <a href="tel:9899769768" className="text-saffron-700 font-bold">
              9899769768
            </a>
          </div>
          <p className="text-xs text-temple-muted mt-1">
            शिव मंदिर सेवा समिति, सुभाष मार्किट, खिचड़ीपुर, 5 ब्लॉक, दिल्ली -
            110091
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-maroon-200/60">
          <span className="ps-chip bg-maroon-100 text-maroon-800">
            {lang === "hi"
              ? `${masterSamagriLibrary.length} सामग्री`
              : `${masterSamagriLibrary.length} Items`}
          </span>
          <span className="ps-chip bg-saffron-100 text-saffron-800">
            {lang === "hi"
              ? `${categoryList.length} श्रेणियाँ`
              : `${categoryList.length} Categories`}
          </span>
          <Badge tone="gold">
            <Sparkles className="w-3 h-3" />{" "}
            {lang === "hi" ? "मास्टर सूची" : "Master Library"}
          </Badge>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted" />
          <input
            className="ps-input pl-9"
            placeholder={
              lang === "hi"
                ? "हिंदी या English में खोजें..."
                : "Search by Hindi or English name..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search library"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            {lang === "hi" ? "सभी" : "All"}
          </Chip>
          {categoryList.map((c) => (
            <Chip
              key={c.name}
              active={cat === c.name}
              onClick={() => setCat(c.name)}
            >
              {c.emoji} {lang === "hi" ? c.hindi : c.name.split(" ")[0]}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-saffron-400" />}
          title={lang === "hi" ? "कोई वस्तु नहीं मिली" : "No items found"}
          body={
            lang === "hi" ? "अलग नाम से खोजें।" : "Try a different search term."
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => {
            const catInfo = categoryMeta(category);
            return (
              <section key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{catInfo.emoji}</span>
                  <h2 className="font-display text-lg text-temple-ink">
                    {lang === "hi" ? catInfo.hindi : category}
                  </h2>
                  <Badge tone="neutral">{items.length}</Badge>
                </div>
                <p className="text-xs text-temple-muted mb-3">
                  {catInfo.blurb}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map((m) => (
                    <article key={m.id} className="ps-card ps-card-hover p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-temple-muted/60 font-mono">
                              {m.serialNo}.
                            </span>
                            <span className="font-deva text-sm font-semibold text-temple-ink">
                              {m.hindiName}
                            </span>
                          </div>
                          <p className="text-xs text-temple-muted mt-0.5">
                            {m.englishName}
                          </p>
                        </div>
                        {m.mandatory ? (
                          <Badge tone="maroon">
                            <span className="text-[10px]">
                              {lang === "hi" ? "अनिवार्य" : "Required"}
                            </span>
                          </Badge>
                        ) : (
                          <Badge tone="neutral">
                            <span className="text-[10px]">
                              {lang === "hi" ? "वैकल्पिक" : "Optional"}
                            </span>
                          </Badge>
                        )}
                      </div>
                      <dl className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-temple-muted">
                        <div>
                          <dt>{lang === "hi" ? "मात्रा" : "Qty"}</dt>
                          <dd className="text-temple-ink font-medium">
                            {m.defaultQty} {m.defaultUnit}
                          </dd>
                        </div>
                        <div>
                          <dt>{lang === "hi" ? "जिम्मेदार" : "By"}</dt>
                          <dd className="text-temple-ink font-medium">
                            {lang === "hi"
                              ? m.responsible === "Pandit"
                                ? "पंडित"
                                : m.responsible === "Yajmaan"
                                  ? "यजमान"
                                  : "दोनों"
                              : m.responsible}
                          </dd>
                        </div>
                        <div>
                          <dt>{lang === "hi" ? "श्रेणी" : "Cat"}</dt>
                          <dd className="text-temple-ink font-medium truncate">
                            {lang === "hi"
                              ? catInfo.hindi
                              : category.split(" ")[0]}
                          </dd>
                        </div>
                      </dl>
                      {m.description && (
                        <p className="mt-1.5 text-[11px] text-temple-muted italic">
                          {m.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`ps-chip cursor-pointer shrink-0 whitespace-nowrap transition-colors ${active ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted hover:bg-beige-200"}`}
    >
      {children}
    </button>
  );
}
