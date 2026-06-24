import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Hand,
  PackageCheck,
  Search,
  Send,
  X,
} from "lucide-react";
import { useStore, statusMeta, uid } from "../../lib/store";
import { currentUser } from "../../lib/profiles";
import {
  Badge,
  EmptyState,
  Modal,
  ProgressRing,
  pushToast,
} from "../../components/ui";
import { FloralDivider } from "../../components/SpiritualArt";
import { useLang } from "../../lib/i18n";
import type {
  ItemStatus,
  PoojaSamagriItem,
  SamagriRequest,
} from "../../lib/types";

type ViewFilter = "all" | "pending" | "arranged" | "requested";

export function ChecklistModule() {
  const { poojaId } = useParams();
  const { getPooja, samagriForPooja, dispatch } = useStore();
  const { lang } = useLang();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [search, setSearch] = useState("");
  const [requestItem, setRequestItem] = useState<PoojaSamagriItem | null>(null);

  if (!pooja) return null;
  const isPandit = currentUser.role === "Pandit";
  const items = samagriForPooja(pooja.id);
  const isPublished = !!pooja.samagriPublished;

  // Stats
  const total = items.length;
  const arrangedCount = items.filter(
    (i) => i.status === "Arranged" || i.status === "Purchased",
  ).length;
  const pendingCount = items.filter(
    (i) => i.status === "Not Started" || i.status === "Searching",
  ).length;
  const requestedCount = items.filter(
    (i) => i.status === "Request Pandit to Bring",
  ).length;
  const blockedCount = items.filter(
    (i) => i.status === "Unable to Arrange",
  ).length;
  const progress = total ? Math.round((arrangedCount / total) * 100) : 0;

  const filtered = items
    .filter((i) => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${i.hindiName} ${i.englishName}`.toLowerCase().includes(q))
          return false;
      }
      if (viewFilter === "pending")
        return (
          i.status === "Not Started" ||
          i.status === "Searching" ||
          i.status === "Unable to Arrange"
        );
      if (viewFilter === "arranged")
        return i.status === "Arranged" || i.status === "Purchased";
      if (viewFilter === "requested")
        return i.status === "Request Pandit to Bring";
      return true;
    })
    .sort((a, b) => {
      // mandatory first, then not started, then arranged
      if (a.mandatory !== b.mandatory)
        return Number(b.mandatory) - Number(a.mandatory);
      const order: ItemStatus[] = [
        "Not Started",
        "Searching",
        "Unable to Arrange",
        "Request Pandit to Bring",
        "Arranged",
        "Purchased",
      ];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });

  function quickAction(item: PoojaSamagriItem, newStatus: ItemStatus) {
    dispatch({
      type: "UPDATE_SAMAGRI_ITEM",
      poojaId: pooja!.id,
      itemId: item.id,
      patch: { status: newStatus },
    });
    const msgs: Record<string, string> = {
      Arranged:
        lang === "hi"
          ? `✓ ${item.hindiName} व्यवस्थित`
          : `✓ ${item.englishName} arranged`,
      Purchased:
        lang === "hi"
          ? `✓ ${item.hindiName} खरीदा`
          : `✓ ${item.englishName} purchased`,
      "Unable to Arrange":
        lang === "hi"
          ? `${item.hindiName} उपलब्ध नहीं`
          : `${item.englishName} unavailable`,
    };
    if (msgs[newStatus])
      pushToast(
        msgs[newStatus],
        newStatus === "Unable to Arrange" ? "info" : "success",
      );
  }

  function sendPanditRequest(item: PoojaSamagriItem, note: string) {
    // Mark item status
    dispatch({
      type: "UPDATE_SAMAGRI_ITEM",
      poojaId: pooja!.id,
      itemId: item.id,
      patch: { status: "Request Pandit to Bring" },
    });
    // Raise a formal request
    const req: SamagriRequest = {
      id: uid("req"),
      poojaId: pooja!.id,
      type: "Bring Item",
      title:
        lang === "hi"
          ? `${item.hindiName} लाएं`
          : `Please bring: ${item.englishName}`,
      detail:
        note ||
        (lang === "hi"
          ? `${item.hindiName} यहाँ उपलब्ध नहीं है।`
          : `${item.englishName} is not available here.`),
      createdBy: currentUser.id,
      assignedTo: "Pandit",
      status: "Pending",
      createdAt: new Date().toISOString(),
      relatedItemId: item.id,
    };
    dispatch({ type: "ADD_REQUEST", request: req });
    pushToast(
      lang === "hi"
        ? `पंडित जी को अनुरोध भेजा गया: ${item.hindiName}`
        : `Request sent to Pandit: ${item.englishName}`,
    );
    setRequestItem(null);
  }

  // If not published and Yajmaan
  if (!isPublished && !isPandit) {
    return (
      <div className="py-16 text-center px-4 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-saffron-50 flex items-center justify-center mb-4">
          <ClipboardCheck className="w-8 h-8 text-saffron-400" />
        </div>
        <h2 className="font-display text-xl text-maroon-900">
          {lang === "hi"
            ? "सामग्री सूची की प्रतीक्षा है"
            : "Waiting for Samagri List"}
        </h2>
        <p className="mt-2 text-sm text-temple-muted max-w-sm mx-auto">
          {lang === "hi"
            ? "पंडित जी अभी सामग्री सूची तैयार कर रहे हैं। जैसे ही वे भेजेंगे, आपको सूचना मिलेगी।"
            : "Pandit is preparing the samagri list. You will be notified once it is sent."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress header */}
      <div className="ps-card p-4 sm:p-5 bg-gradient-to-br from-saffron-50 to-ivory-100">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>
            <Badge tone="saffron">
              {lang === "hi" ? "तैयारी चेकलिस्ट" : "Preparation Checklist"}
            </Badge>
            <h1 className="mt-1.5 font-display text-xl sm:text-2xl text-maroon-900">
              {lang === "hi" ? "सामग्री की तैयारी" : "Samagri Preparation"}
            </h1>
            <p className="text-xs text-temple-muted mt-0.5">
              {lang === "hi"
                ? `पंडित विजय कुमार मिश्रा की सूची — ${total} वस्तुएं`
                : `Pandit Vijay Kumar Mishra's list — ${total} items`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={progress} size={64} />
            <div className="text-xs space-y-1">
              <Stat
                label={lang === "hi" ? "व्यवस्थित" : "Arranged"}
                value={arrangedCount}
                color="text-emerald-700"
              />
              <Stat
                label={lang === "hi" ? "बाकी" : "Pending"}
                value={pendingCount}
                color="text-gold-700"
              />
              <Stat
                label={lang === "hi" ? "पंडित जी लाएंगे" : "Pandit bringing"}
                value={requestedCount}
                color="text-maroon-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blocked items alert */}
      {blockedCount > 0 && !isPandit && (
        <div className="ps-card p-3.5 bg-rose-50 border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-800">
              {lang === "hi"
                ? `${blockedCount} वस्तु(एं) उपलब्ध नहीं`
                : `${blockedCount} item(s) unavailable`}
            </p>
            <p className="text-xs text-rose-700">
              {items
                .filter((i) => i.status === "Unable to Arrange")
                .map((i) => (lang === "hi" ? i.hindiName : i.englishName))
                .join(", ")}
              {" — "}
              {lang === "hi"
                ? '"पंडित जी लाएंगे" दबाएं।'
                : 'Use "Ask Pandit" button.'}
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1 p-1 rounded-xl bg-beige-100 overflow-x-auto no-scrollbar">
          {(
            [
              ["all", lang === "hi" ? `सभी (${total})` : `All (${total})`],
              [
                "pending",
                lang === "hi"
                  ? `बाकी (${pendingCount + blockedCount})`
                  : `Pending (${pendingCount + blockedCount})`,
              ],
              [
                "arranged",
                lang === "hi"
                  ? `व्यवस्थित (${arrangedCount})`
                  : `Arranged (${arrangedCount})`,
              ],
              [
                "requested",
                lang === "hi"
                  ? `पंडित जी (${requestedCount})`
                  : `Pandit (${requestedCount})`,
              ],
            ] as [ViewFilter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setViewFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${viewFilter === f ? "bg-white text-saffron-700 shadow-sm" : "text-temple-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-temple-muted" />
          <input
            className="ps-input pl-8 text-xs h-9"
            placeholder={lang === "hi" ? "खोजें..." : "Search items..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageCheck className="w-10 h-10 text-emerald-400" />}
          title={lang === "hi" ? "सब व्यवस्थित!" : "All done!"}
          body={
            lang === "hi"
              ? "इस फ़िल्टर में कोई वस्तु नहीं।"
              : "No items in this filter."
          }
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              lang={lang}
              isPandit={isPandit}
              onQuickAction={quickAction}
              onAskPandit={() => setRequestItem(item)}
            />
          ))}
        </div>
      )}

      {/* Ask Pandit modal */}
      <AskPanditModal
        open={!!requestItem}
        item={requestItem}
        lang={lang}
        onClose={() => setRequestItem(null)}
        onSend={sendPanditRequest}
      />
    </div>
  );
}

// ─── Individual checklist item ────────────────────────────────────────────────
function ChecklistItem({
  item,
  lang,
  isPandit,
  onQuickAction,
  onAskPandit,
}: {
  item: PoojaSamagriItem;
  lang: string;
  isPandit: boolean;
  onQuickAction: (item: PoojaSamagriItem, status: ItemStatus) => void;
  onAskPandit: () => void;
}) {
  const meta = statusMeta[item.status];
  const isArranged = item.status === "Arranged" || item.status === "Purchased";
  const isRequested = item.status === "Request Pandit to Bring";

  return (
    <article
      className={`rounded-xl border transition-all duration-200 ${
        isArranged
          ? "border-emerald-200 bg-emerald-50/40"
          : isRequested
            ? "border-maroon-200 bg-maroon-50/30"
            : item.mandatory
              ? "border-temple-border bg-white hover:border-saffron-200"
              : "border-temple-border/50 bg-white/80 hover:border-saffron-100"
      }`}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Status indicator */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />

        {/* Serial */}
        {item.serialNo && (
          <span className="text-[10px] text-temple-muted/60 w-4 shrink-0 font-mono">
            {item.serialNo}.
          </span>
        )}

        {/* Names */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-deva text-sm font-semibold ${isArranged ? "text-emerald-800 line-through" : "text-temple-ink"}`}
            >
              {item.hindiName}
            </span>
            <span className="text-xs text-temple-muted">
              / {item.englishName}
            </span>
            {item.mandatory && !isArranged && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-maroon-500"
                title={lang === "hi" ? "अनिवार्य" : "Required"}
              />
            )}
            {isArranged && <Check className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
          <p className="text-[11px] text-temple-muted mt-0.5">
            {item.qty} {item.unit}
            {item.note && ` · ${item.note}`}
          </p>
          {item.status !== "Not Started" && (
            <span className={`ps-chip ${meta.color} mt-1 text-[10px]`}>
              {lang === "hi" ? meta.hindi : item.status}
            </span>
          )}
        </div>

        {/* Quick action buttons — Yajmaan only */}
        {!isPandit && !isArranged && (
          <div className="flex items-center gap-1.5 shrink-0">
            {item.status !== "Request Pandit to Bring" && (
              <>
                <button
                  onClick={() => onQuickAction(item, "Arranged")}
                  className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                  title={lang === "hi" ? "व्यवस्थित किया" : "Mark Arranged"}
                >
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {lang === "hi" ? "व्यवस्थित" : "Arranged"}
                  </span>
                </button>
                <button
                  onClick={() => onQuickAction(item, "Unable to Arrange")}
                  className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-semibold hover:bg-rose-200 active:scale-95 transition-all"
                  title={lang === "hi" ? "उपलब्ध नहीं" : "Cannot Arrange"}
                >
                  <X className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {lang === "hi" ? "नहीं" : "No"}
                  </span>
                </button>
              </>
            )}
            {(item.status === "Unable to Arrange" ||
              item.status === "Not Started") && (
              <button
                onClick={onAskPandit}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-maroon-700 text-white text-[11px] font-semibold hover:bg-maroon-800 active:scale-95 transition-all"
                title={
                  lang === "hi" ? "पंडित जी से माँगें" : "Ask Pandit to bring"
                }
              >
                <Hand className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {lang === "hi" ? "पंडित जी" : "Ask Pandit"}
                </span>
              </button>
            )}
            {item.status === "Request Pandit to Bring" && (
              <span className="ps-chip bg-maroon-100 text-maroon-800 text-[10px]">
                <Send className="w-2.5 h-2.5" />
                {lang === "hi" ? "भेजा गया" : "Sent"}
              </span>
            )}
          </div>
        )}

        {/* Pandit view: can mark arranged too */}
        {isPandit && !isArranged && (
          <button
            onClick={() => onQuickAction(item, "Arranged")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-saffron-100 text-saffron-800 text-[11px] font-semibold hover:bg-saffron-200 transition-all shrink-0"
          >
            <Check className="w-3 h-3" />
            <span className="hidden sm:inline">
              {lang === "hi" ? "व्यवस्थित" : "Arranged"}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}

// ─── Ask Pandit Modal ─────────────────────────────────────────────────────────
function AskPanditModal({
  open,
  item,
  lang,
  onClose,
  onSend,
}: {
  open: boolean;
  item: PoojaSamagriItem | null;
  lang: string;
  onClose: () => void;
  onSend: (item: PoojaSamagriItem, note: string) => void;
}) {
  const [note, setNote] = useState("");

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lang === "hi" ? "पंडित जी से अनुरोध" : "Request Pandit"}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-maroon-50 border border-maroon-200 text-center">
          <span className="font-deva text-2xl font-bold text-maroon-900">
            {item.hindiName}
          </span>
          <p className="text-sm text-maroon-700">{item.englishName}</p>
          <p className="text-xs text-temple-muted mt-1">
            {item.qty} {item.unit}
          </p>
        </div>
        <div>
          <label className="ps-label">
            {lang === "hi"
              ? "पंडित जी को संदेश (वैकल्पिक)"
              : "Message to Pandit (optional)"}
          </label>
          <textarea
            className="ps-input min-h-[80px] resize-y"
            placeholder={
              lang === "hi"
                ? "जैसे: यहाँ नहीं मिल रहा, कृपया लाएं..."
                : "e.g. Not available here, please bring..."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <FloralDivider />
        <div className="flex gap-2">
          <button onClick={onClose} className="ps-btn-ghost flex-1">
            {lang === "hi" ? "रद्द" : "Cancel"}
          </button>
          <button
            onClick={() => {
              onSend(item, note);
              setNote("");
            }}
            className="ps-btn-maroon flex-1"
          >
            <Send className="w-4 h-4" />
            {lang === "hi" ? "अनुरोध भेजें" : "Send Request"}
          </button>
        </div>
      </div>
    </Modal>
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
    <div className="flex items-center gap-1.5">
      <span className={`font-bold ${color}`}>{value}</span>
      <span className="text-temple-muted">{label}</span>
    </div>
  );
}
