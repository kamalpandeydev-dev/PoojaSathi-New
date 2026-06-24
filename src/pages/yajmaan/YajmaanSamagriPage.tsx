import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Search,
  X,
  Send,
  AlertCircle,
  PackageCheck,
  RefreshCw,
  Hand,
} from "lucide-react";
import {
  supabase,
  type SamagriItemRow,
  type SamagriRequestRow,
  type BookingRow,
} from "../../lib/supabase";
import { useLang } from "../../lib/i18n";
import { Modal, ProgressRing, pushToast } from "../../components/ui";
import { FloralDivider } from "../../components/SpiritualArt";

type Filter = "all" | "pending" | "arranged" | "requested";

const STATUS_DISPLAY: Record<
  SamagriItemRow["yajmaan_status"],
  { hi: string; en: string; color: string; dot: string }
> = {
  not_started: {
    hi: "शुरू नहीं",
    en: "Not Started",
    color: "bg-beige-100 text-beige-800",
    dot: "bg-beige-400",
  },
  searching: {
    hi: "खोज रहे हैं",
    en: "Searching",
    color: "bg-gold-100 text-gold-800",
    dot: "bg-gold-500",
  },
  arranged: {
    hi: "व्यवस्थित ✓",
    en: "Arranged ✓",
    color: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  purchased: {
    hi: "खरीदा ✓",
    en: "Purchased ✓",
    color: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-600",
  },
  unable: {
    hi: "नहीं मिला",
    en: "Not Available",
    color: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
  },
  requested_pandit: {
    hi: "पंडित जी लाएंगे",
    en: "Pandit Bringing",
    color: "bg-maroon-100 text-maroon-800",
    dot: "bg-maroon-600",
  },
};

export function YajmaanSamagriPage() {
  const { bookingId } = useParams();
  const { lang } = useLang();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [items, setItems] = useState<SamagriItemRow[]>([]);
  const [requests, setRequests] = useState<SamagriRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [askItem, setAskItem] = useState<SamagriItemRow | null>(null);
  const [askNote, setAskNote] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookingId) return;
    const [bRes, iRes, rRes] = await Promise.all([
      supabase
        .from("puja_bookings")
        .select("*, pandits(*)")
        .eq("id", bookingId)
        .maybeSingle(),
      supabase
        .from("samagri_items")
        .select("*")
        .eq("booking_id", bookingId)
        .order("serial_no", { ascending: true, nullsFirst: false }),
      supabase.from("samagri_requests").select("*").eq("booking_id", bookingId),
    ]);
    setBooking(bRes.data);
    setItems(iRes.data ?? []);
    setRequests(rRes.data ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(
    item: SamagriItemRow,
    newStatus: SamagriItemRow["yajmaan_status"],
  ) {
    setSaving(item.id);
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, yajmaan_status: newStatus } : i,
      ),
    );
    const { error } = await supabase
      .from("samagri_items")
      .update({ yajmaan_status: newStatus })
      .eq("id", item.id);
    setSaving(null);
    if (error) {
      pushToast(lang === "hi" ? "अपडेट विफल" : "Update failed", "error");
    } else {
      const msgs: Record<string, string> = {
        arranged:
          lang === "hi"
            ? `✓ ${item.hindi_name} व्यवस्थित`
            : `✓ ${item.english_name || item.hindi_name} arranged`,
        purchased: lang === "hi" ? `✓ ${item.hindi_name} खरीदा` : `✓ Purchased`,
        unable:
          lang === "hi"
            ? `${item.hindi_name} — नहीं मिला`
            : `${item.english_name || item.hindi_name} unavailable`,
      };
      if (msgs[newStatus]) pushToast(msgs[newStatus]);
    }
  }

  async function sendPanditRequest(item: SamagriItemRow, note: string) {
    // update item status
    await updateStatus(item, "requested_pandit");
    // insert request
    const { error } = await supabase.from("samagri_requests").insert({
      booking_id: bookingId,
      item_id: item.id,
      item_hindi_name: item.hindi_name,
      message:
        note ||
        (lang === "hi"
          ? `${item.hindi_name} यहाँ उपलब्ध नहीं है।`
          : `${item.hindi_name} not available here.`),
      status: "pending",
    });
    if (!error) {
      pushToast(
        lang === "hi"
          ? `पंडित जी को अनुरोध भेजा: ${item.hindi_name}`
          : `Request sent to Pandit: ${item.hindi_name}`,
      );
      setRequests((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          booking_id: bookingId!,
          item_id: item.id,
          item_hindi_name: item.hindi_name,
          message: note,
          status: "pending",
          pandit_reply: null,
          created_at: new Date().toISOString(),
          resolved_at: null,
        },
      ]);
    }
    setAskItem(null);
    setAskNote("");
  }

  if (loading) return <Loader />;
  if (!booking) return <NotFound lang={lang} />;
  if (!booking.samagri_published)
    return <NotPublished lang={lang} bookingId={bookingId!} />;

  const total = items.length;
  const arrangedCount = items.filter(
    (i) => i.yajmaan_status === "arranged" || i.yajmaan_status === "purchased",
  ).length;
  const pendingCount = items.filter(
    (i) =>
      i.yajmaan_status === "not_started" || i.yajmaan_status === "searching",
  ).length;
  const unableCount = items.filter((i) => i.yajmaan_status === "unable").length;
  const requestedCount = items.filter(
    (i) => i.yajmaan_status === "requested_pandit",
  ).length;
  const progress = total ? Math.round((arrangedCount / total) * 100) : 0;

  const filtered = items
    .filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !`${item.hindi_name} ${item.english_name || ""}`
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      if (filter === "pending")
        return (
          item.yajmaan_status === "not_started" ||
          item.yajmaan_status === "searching" ||
          item.yajmaan_status === "unable"
        );
      if (filter === "arranged")
        return (
          item.yajmaan_status === "arranged" ||
          item.yajmaan_status === "purchased"
        );
      if (filter === "requested")
        return item.yajmaan_status === "requested_pandit";
      return true;
    })
    .sort((a, b) => {
      // mandatory first, then pending items first
      if (a.mandatory !== b.mandatory)
        return Number(b.mandatory) - Number(a.mandatory);
      const ord = [
        "not_started",
        "searching",
        "unable",
        "requested_pandit",
        "arranged",
        "purchased",
      ];
      return ord.indexOf(a.yajmaan_status) - ord.indexOf(b.yajmaan_status);
    });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-5 animate-fade-in">
      <Link
        to={`/yajmaan/booking/${bookingId}`}
        className="inline-flex items-center gap-1 text-sm text-temple-muted hover:text-temple-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {lang === "hi" ? "बुकिंग" : "Booking"}
      </Link>

      {/* Sheet header — mimics the actual pandit's sheet */}
      <div className="ps-card p-4 mb-4 bg-gradient-to-br from-maroon-50 to-saffron-50 border-maroon-200 text-center">
        <p className="font-deva text-sm text-saffron-700 font-bold">
          ॥ ॐ हरी ओम् · श्री गणेशाय नमः ॥
        </p>
        <h2 className="font-display text-lg text-maroon-900">
          संक्षिप्त पूजन सामग्री
        </h2>
        <p className="font-deva font-bold text-base text-temple-ink">
          {booking.pandits?.name ?? "पंडित जी"}
        </p>
        <p className="text-xs text-temple-muted">
          {booking.puja_type} · {booking.puja_date}
        </p>
      </div>

      {/* Progress */}
      <div className="ps-card p-4 mb-4 flex items-center gap-4">
        <ProgressRing value={progress} size={64} />
        <div className="flex-1 grid grid-cols-3 gap-2 text-center">
          <Stat
            label={lang === "hi" ? "व्यवस्थित" : "Arranged"}
            value={arrangedCount}
            color="text-emerald-700"
          />
          <Stat
            label={lang === "hi" ? "बाकी" : "Pending"}
            value={pendingCount + unableCount}
            color="text-gold-700"
          />
          <Stat
            label={lang === "hi" ? "पंडित जी" : "Pandit"}
            value={requestedCount}
            color="text-maroon-700"
          />
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg hover:bg-beige-100 text-temple-muted"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Unavailable banner */}
      {unableCount > 0 && (
        <div className="ps-card p-3 mb-3 bg-rose-50 border-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-800">
              {lang === "hi"
                ? `${unableCount} वस्तु नहीं मिली`
                : `${unableCount} item(s) unavailable`}
            </p>
            <p className="text-xs text-rose-700">
              {items
                .filter((i) => i.yajmaan_status === "unable")
                .map((i) => i.hindi_name)
                .join(", ")}
              {" — "}
              {lang === "hi"
                ? '"पंडित जी से माँगें" दबाएं'
                : 'Use "Ask Pandit" button'}
            </p>
          </div>
        </div>
      )}

      {/* Requests from Pandit */}
      {requests.filter((r) => r.status === "approved").length > 0 && (
        <div className="ps-card p-3 mb-3 bg-saffron-50 border-saffron-200">
          <p className="text-xs font-semibold text-saffron-900">
            {lang === "hi"
              ? "✓ पंडित जी ने स्वीकारा:"
              : "✓ Pandit approved to bring:"}
          </p>
          <p className="text-xs text-saffron-800 mt-0.5">
            {requests
              .filter((r) => r.status === "approved")
              .map((r) => r.item_hindi_name)
              .join(", ")}
          </p>
        </div>
      )}

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex gap-1 p-1 rounded-xl bg-beige-100 overflow-x-auto no-scrollbar">
          {(
            [
              ["all", lang === "hi" ? `सभी (${total})` : `All (${total})`],
              [
                "pending",
                lang === "hi"
                  ? `बाकी (${pendingCount + unableCount})`
                  : `Pending (${pendingCount + unableCount})`,
              ],
              [
                "arranged",
                lang === "hi"
                  ? `तैयार (${arrangedCount})`
                  : `Done (${arrangedCount})`,
              ],
              [
                "requested",
                lang === "hi"
                  ? `पंडित (${requestedCount})`
                  : `Pandit (${requestedCount})`,
              ],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-white text-saffron-700 shadow-sm" : "text-temple-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-temple-muted" />
          <input
            className="ps-input pl-8 text-xs h-9"
            placeholder={lang === "hi" ? "खोजें..." : "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Item list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <PackageCheck className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
          <p className="text-temple-muted">
            {lang === "hi"
              ? "इस फ़िल्टर में कोई वस्तु नहीं।"
              : "No items in this filter."}
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {filtered.map((item) => {
            const st = STATUS_DISPLAY[item.yajmaan_status];
            const isArranged =
              item.yajmaan_status === "arranged" ||
              item.yajmaan_status === "purchased";
            const isRequested = item.yajmaan_status === "requested_pandit";
            const isSaving = saving === item.id;

            return (
              <li
                key={item.id}
                className={`rounded-xl border transition-all duration-200 ${
                  isArranged
                    ? "border-emerald-200 bg-emerald-50/40"
                    : isRequested
                      ? "border-maroon-200 bg-maroon-50/30"
                      : item.mandatory
                        ? "border-temple-border bg-white"
                        : "border-temple-border/50 bg-white/80"
                }`}
              >
                <div className="flex items-center gap-3 p-3.5">
                  {/* Serial */}
                  {item.serial_no != null && (
                    <span className="text-[10px] text-temple-muted/60 font-mono w-5 shrink-0 text-center">
                      {item.serial_no}.
                    </span>
                  )}

                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />

                  {/* Names */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-deva font-semibold text-sm ${isArranged ? "text-emerald-800" : "text-temple-ink"}`}
                      >
                        {item.hindi_name}
                      </span>
                      {item.english_name && (
                        <span className="text-xs text-temple-muted">
                          / {item.english_name}
                        </span>
                      )}
                      {item.mandatory && !isArranged && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-maroon-500 shrink-0"
                          title={lang === "hi" ? "अनिवार्य" : "Required"}
                        />
                      )}
                      {isArranged && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-temple-muted mt-0.5">
                      {item.qty} {item.unit}
                      {item.pandit_note && ` · ${item.pandit_note}`}
                    </p>
                    {item.yajmaan_status !== "not_started" && (
                      <span className={`ps-chip ${st.color} mt-1 text-[10px]`}>
                        {lang === "hi" ? st.hi : st.en}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!isArranged && !isRequested && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateStatus(item, "arranged")}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                        title={
                          lang === "hi" ? "व्यवस्थित किया" : "Mark Arranged"
                        }
                      >
                        <Check className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {lang === "hi" ? "व्यवस्थित" : "Done"}
                        </span>
                      </button>
                      <button
                        onClick={() => updateStatus(item, "unable")}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-semibold hover:bg-rose-200 active:scale-95 transition-all disabled:opacity-50"
                        title={lang === "hi" ? "नहीं मिला" : "Not Available"}
                      >
                        <X className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {lang === "hi" ? "नहीं" : "No"}
                        </span>
                      </button>
                      <button
                        onClick={() => setAskItem(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-maroon-700 text-white text-[11px] font-semibold hover:bg-maroon-800 active:scale-95 transition-all"
                        title={
                          lang === "hi" ? "पंडित जी से माँगें" : "Ask Pandit"
                        }
                      >
                        <Hand className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {lang === "hi" ? "माँगें" : "Ask"}
                        </span>
                      </button>
                    </div>
                  )}

                  {isRequested && (
                    <span className="ps-chip bg-maroon-100 text-maroon-800 text-[10px] shrink-0">
                      <Send className="w-2.5 h-2.5" />
                      {lang === "hi" ? "भेजा" : "Sent"}
                    </span>
                  )}

                  {isArranged && (
                    <button
                      onClick={() => updateStatus(item, "not_started")}
                      className="text-[10px] text-temple-muted hover:text-rose-600 shrink-0"
                      title={lang === "hi" ? "पूर्ववत करें" : "Undo"}
                    >
                      ↩
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <FloralDivider className="mt-6" />

      {/* Ask Pandit modal */}
      <Modal
        open={!!askItem}
        onClose={() => {
          setAskItem(null);
          setAskNote("");
        }}
        title={lang === "hi" ? "पंडित जी से अनुरोध" : "Request Pandit to Bring"}
      >
        {askItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-maroon-50 border border-maroon-200 text-center">
              <span className="font-deva text-xl font-bold text-maroon-900">
                {askItem.hindi_name}
              </span>
              {askItem.english_name && (
                <p className="text-sm text-maroon-700">
                  {askItem.english_name}
                </p>
              )}
              <p className="text-xs text-temple-muted mt-1">
                {askItem.qty} {askItem.unit}
              </p>
            </div>
            <div>
              <label className="ps-label">
                {lang === "hi"
                  ? "पंडित जी को संदेश (वैकल्पिक)"
                  : "Message (optional)"}
              </label>
              <textarea
                className="ps-input min-h-[80px] resize-y"
                placeholder={
                  lang === "hi"
                    ? "जैसे: यहाँ नहीं मिल रहा, कृपया लाएं..."
                    : "e.g. Not available here, please bring..."
                }
                value={askNote}
                onChange={(e) => setAskNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAskItem(null);
                  setAskNote("");
                }}
                className="ps-btn-ghost flex-1"
              >
                {lang === "hi" ? "रद्द" : "Cancel"}
              </button>
              <button
                onClick={() => sendPanditRequest(askItem, askNote)}
                className="ps-btn-maroon flex-1"
              >
                <Send className="w-4 h-4" />
                {lang === "hi" ? "अनुरोध भेजें" : "Send Request"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <p className={`font-display text-2xl ${color}`}>{value}</p>
      <p className="text-[10px] text-temple-muted">{label}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function NotFound({ lang }: { lang: string }) {
  return (
    <div className="text-center py-16 text-temple-muted">
      {lang === "hi" ? "बुकिंग नहीं मिली।" : "Booking not found."}
    </div>
  );
}

function NotPublished({
  lang,
  bookingId,
}: {
  lang: string;
  bookingId: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-gold-600" />
      </div>
      <h2 className="font-display text-xl text-maroon-900 mb-2">
        {lang === "hi"
          ? "सामग्री सूची की प्रतीक्षा"
          : "Waiting for Samagri List"}
      </h2>
      <p className="text-sm text-temple-muted mb-6">
        {lang === "hi"
          ? "पंडित जी अभी सामग्री सूची तैयार कर रहे हैं। जैसे ही वे भेजेंगे, यहाँ दिखेगी।"
          : "Pandit is building the samagri list. It will appear here once sent."}
      </p>
      <Link to={`/yajmaan/booking/${bookingId}`} className="ps-btn-ghost">
        ← {lang === "hi" ? "वापस जाएं" : "Go Back"}
      </Link>
    </div>
  );
}
