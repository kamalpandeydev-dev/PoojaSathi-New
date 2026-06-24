import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Send,
  Trash2,
  Square,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import {
  supabase,
  type SamagriItemRow,
  type BookingRow,
} from "../../lib/supabase";
import {
  masterSamagriLibrary,
  categories as categoryList,
  categoryMeta,
} from "../../lib/masterLibrary";
import { useLang } from "../../lib/i18n";
import { Modal, pushToast } from "../../components/ui";
import { FloralDivider } from "../../components/SpiritualArt";
import type { Category } from "../../lib/types";

export function PanditSamagriBuilder() {
  const { bookingId } = useParams();
  const { lang } = useLang();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [items, setItems] = useState<SamagriItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookingId) return;
    const [b, i] = await Promise.all([
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
    ]);
    setBooking(b.data);
    setItems(i.data ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleMandatory(item: SamagriItemRow) {
    const newVal = !item.mandatory;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, mandatory: newVal } : i)),
    );
    await supabase
      .from("samagri_items")
      .update({ mandatory: newVal })
      .eq("id", item.id);
  }

  async function updateItem(id: string, patch: Partial<SamagriItemRow>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await supabase.from("samagri_items").update(patch).eq("id", id);
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("samagri_items").delete().eq("id", id);
  }

  async function publishList() {
    if (items.length === 0) {
      pushToast(
        lang === "hi" ? "पहले वस्तुएं जोड़ें" : "Add items first",
        "error",
      );
      return;
    }
    setPublishing(true);
    const { error } = await supabase
      .from("puja_bookings")
      .update({
        samagri_published: true,
        samagri_published_at: new Date().toISOString(),
        status: "in_preparation",
      })
      .eq("id", bookingId!);
    if (error) {
      pushToast(lang === "hi" ? "त्रुटि" : "Error publishing", "error");
    } else {
      setBooking((b) =>
        b ? { ...b, samagri_published: true, status: "in_preparation" } : b,
      );
      pushToast(
        lang === "hi"
          ? `सूची यजमान को भेजी गई! (${items.length} वस्तुएं)`
          : `List sent to Yajmaan! (${items.length} items)`,
      );
    }
    setPublishing(false);
  }

  if (loading) return <Loader />;
  if (!booking)
    return (
      <div className="text-center py-16 text-temple-muted">
        {lang === "hi" ? "बुकिंग नहीं मिली" : "Booking not found"}
      </div>
    );

  const isPublished = booking.samagri_published;
  const mandatoryCount = items.filter((i) => i.mandatory).length;
  const optionalCount = items.filter((i) => !i.mandatory).length;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-5 animate-fade-in">
      <Link
        to={`/pandit/booking/${bookingId}`}
        className="inline-flex items-center gap-1 text-sm text-temple-muted hover:text-temple-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {lang === "hi" ? "बुकिंग" : "Booking"}
      </Link>

      {/* Sheet header — exactly like Pandit's physical sheet */}
      <div className="ps-card p-4 mb-4 bg-gradient-to-br from-maroon-50 to-saffron-50 border-maroon-200 text-center">
        <p className="font-deva text-xs text-saffron-700 font-bold">
          ॥ ॐ हरी ओम् · श्री गणेशाय नमः ॥
        </p>
        <h2 className="font-display text-lg text-maroon-900">
          संक्षिप्त पूजन सामग्री
        </h2>
        <p className="text-sm font-semibold text-temple-ink">
          {booking.yajmaan_name} · {booking.puja_type}
        </p>
        <p className="text-xs text-temple-muted">
          {lang === "hi" ? "दिनांक" : "Date"}: {booking.puja_date} ·{" "}
          {booking.puja_time}
        </p>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <span className="ps-chip bg-maroon-100 text-maroon-800">
            {lang === "hi"
              ? `${mandatoryCount} अनिवार्य ✓`
              : `${mandatoryCount} Required ✓`}
          </span>
          <span className="ps-chip bg-beige-100 text-beige-800">
            {lang === "hi"
              ? `${optionalCount} वैकल्पिक`
              : `${optionalCount} Optional`}
          </span>
        </div>
      </div>

      {/* Published status */}
      {isPublished ? (
        <div className="ps-card p-3.5 mb-4 bg-emerald-50 border-emerald-300 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">
            {lang === "hi"
              ? "सूची यजमान को भेज दी गई। आप अभी भी बदलाव कर सकते हैं।"
              : "List sent to Yajmaan. You can still edit items."}
          </p>
          <button
            onClick={load}
            className="ml-auto p-1.5 rounded hover:bg-emerald-100 text-emerald-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="ps-card p-3.5 mb-4 bg-gold-50 border-gold-300 flex items-center gap-3">
          <span className="text-lg">📝</span>
          <p className="text-sm text-gold-900 flex-1">
            {lang === "hi"
              ? "सूची अभी यजमान को नहीं मिली। नीचे से वस्तुएं जोड़ें और भेजें।"
              : "List not yet sent. Add items below and send to Yajmaan."}
          </p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button onClick={() => setPickerOpen(true)} className="ps-btn-ghost">
          <BookOpen className="w-4 h-4" />{" "}
          {lang === "hi" ? "75 सूची से जोड़ें" : "Add from 75-item List"}
        </button>
        <button onClick={() => setCustomOpen(true)} className="ps-btn-ghost">
          <Plus className="w-4 h-4" />{" "}
          {lang === "hi" ? "नई वस्तु" : "Custom Item"}
        </button>
        <button
          onClick={publishList}
          disabled={publishing || items.length === 0}
          className={`ps-btn-maroon ml-auto ${items.length === 0 ? "opacity-40" : ""}`}
        >
          <Send className="w-4 h-4" />
          {publishing
            ? lang === "hi"
              ? "भेज रहे हैं..."
              : "Sending..."
            : isPublished
              ? lang === "hi"
                ? "फिर से भेजें"
                : "Re-send"
              : lang === "hi"
                ? "यजमान को भेजें"
                : "Send to Yajmaan"}
        </button>
      </div>

      {/* Instructions */}
      {items.length === 0 ? (
        <div className="ps-card p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-saffron-400 mb-3" />
          <h3 className="font-display text-lg text-maroon-900 mb-2">
            {lang === "hi" ? "सामग्री जोड़ें" : "Add Samagri Items"}
          </h3>
          <p className="text-sm text-temple-muted mb-4">
            {lang === "hi"
              ? "पंडित विजय कुमार मिश्रा की 75 वस्तुओं की सूची से चुनें या नई वस्तु बनाएं।"
              : "Choose from the 75-item master list or add custom items."}
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="ps-btn-primary"
          >
            <BookOpen className="w-4 h-4" />{" "}
            {lang === "hi" ? "मास्टर सूची से जोड़ें" : "Add from Master List"}
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <SamagriRow
              key={item.id}
              item={item}
              lang={lang}
              expanded={expandedId === item.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              onToggleMandatory={() => toggleMandatory(item)}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}

      <FloralDivider className="mt-6" />

      {/* Send CTA at bottom */}
      {items.length > 0 && !isPublished && (
        <div className="mt-4 text-center">
          <button
            onClick={publishList}
            disabled={publishing}
            className="ps-btn-maroon"
          >
            <Send className="w-4 h-4" />
            {publishing
              ? "..."
              : lang === "hi"
                ? `यजमान को सूची भेजें (${items.length} वस्तुएं)`
                : `Send list to Yajmaan (${items.length} items)`}
          </button>
        </div>
      )}

      <LibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bookingId={bookingId!}
        existing={items}
        lang={lang}
        onAdded={load}
      />
      <CustomItemDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        bookingId={bookingId!}
        lang={lang}
        onAdded={load}
      />
    </div>
  );
}

// ─── Samagri Row ──────────────────────────────────────────────────────────────
function SamagriRow({
  item,
  lang,
  expanded,
  onToggleExpand,
  onToggleMandatory,
  onUpdate,
  onRemove,
}: {
  item: SamagriItemRow;
  lang: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleMandatory: () => void;
  onUpdate: (p: Partial<SamagriItemRow>) => void;
  onRemove: () => void;
}) {
  const cat = item.category ? categoryMeta(item.category as Category) : null;
  return (
    <article
      className={`rounded-xl border transition-all duration-200 ${expanded ? "border-saffron-300 shadow-soft" : "border-temple-border/60"} bg-white`}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Serial */}
        {item.serial_no != null && (
          <span className="text-[10px] text-temple-muted/60 font-mono w-5 shrink-0 text-center">
            {item.serial_no}.
          </span>
        )}

        {/* Mandatory checkbox */}
        <button
          onClick={onToggleMandatory}
          className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${item.mandatory ? "bg-maroon-600 border-maroon-600" : "border-temple-border hover:border-saffron-400"}`}
          title={
            item.mandatory
              ? lang === "hi"
                ? "क्लिक करें → वैकल्पिक"
                : "Click → Optional"
              : lang === "hi"
                ? "क्लिक करें → अनिवार्य"
                : "Click → Required"
          }
          aria-pressed={item.mandatory}
          aria-label={item.mandatory ? "Required" : "Optional"}
        >
          {item.mandatory ? (
            <Check className="w-3 h-3 text-white" />
          ) : (
            <span className="w-2 h-2 rounded-sm bg-beige-300" />
          )}
        </button>

        {/* Names */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-deva font-semibold text-sm text-temple-ink">
              {item.hindi_name}
            </span>
            {item.english_name && (
              <span className="text-xs text-temple-muted">
                / {item.english_name}
              </span>
            )}
            {cat && <span className="text-base">{cat.emoji}</span>}
            <span
              className={`ps-chip text-[10px] ${item.mandatory ? "bg-maroon-100 text-maroon-800" : "bg-beige-100 text-beige-700"}`}
            >
              {item.mandatory
                ? lang === "hi"
                  ? "✓ अनिवार्य"
                  : "✓ Required"
                : lang === "hi"
                  ? "वैकल्पिक"
                  : "Optional"}
            </span>
          </div>
          <p className="text-[11px] text-temple-muted mt-0.5">
            {item.qty} {item.unit}
            {item.pandit_note ? ` · ${item.pandit_note}` : ""}
          </p>
        </div>

        {/* Expand + category */}
        <button
          onClick={onToggleExpand}
          className="p-1 rounded hover:bg-beige-100 text-temple-muted shrink-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-temple-border/40 animate-fade-in grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-temple-muted">
              {lang === "hi" ? "मात्रा" : "Quantity"}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdate({ qty: Math.max(0, (item.qty || 1) - 1) })
                }
                className="w-7 h-7 rounded bg-beige-100 hover:bg-beige-200 font-bold text-sm"
              >
                −
              </button>
              <span className="font-semibold text-temple-ink w-8 text-center">
                {item.qty}
              </span>
              <button
                onClick={() => onUpdate({ qty: (item.qty || 0) + 1 })}
                className="w-7 h-7 rounded bg-beige-100 hover:bg-beige-200 font-bold text-sm"
              >
                +
              </button>
              <input
                className="ps-input ml-1 max-w-[100px] py-1.5 text-xs font-deva"
                value={item.unit}
                onChange={(e) => onUpdate({ unit: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-temple-muted">
              {lang === "hi" ? "जिम्मेदार" : "Responsible"}
            </label>
            <div className="mt-1 flex gap-1">
              {(["Pandit", "Yajmaan", "Shared"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onUpdate({ responsible: r })}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors ${item.responsible === r ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted"}`}
                >
                  {lang === "hi"
                    ? r === "Pandit"
                      ? "पंडित"
                      : r === "Yajmaan"
                        ? "यजमान"
                        : "दोनों"
                    : r}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] uppercase tracking-wider text-temple-muted">
              {lang === "hi"
                ? "पंडित जी की टिप्पणी"
                : "Pandit's note to Yajmaan"}
            </label>
            <input
              className="ps-input mt-1 text-xs"
              value={item.pandit_note ?? ""}
              onChange={(e) => onUpdate({ pandit_note: e.target.value })}
              placeholder={
                lang === "hi"
                  ? "जैसे: ताजा लाना, मंदिर का ही लाना..."
                  : "e.g. Must be fresh, from temple only..."
              }
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={onRemove}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />{" "}
              {lang === "hi" ? "हटाएं" : "Remove"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Library Picker ───────────────────────────────────────────────────────────
function LibraryPicker({
  open,
  onClose,
  bookingId,
  existing,
  lang,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  existing: SamagriItemRow[];
  lang: string;
  onAdded: () => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const filtered = masterSamagriLibrary.filter((m) => {
    if (catFilter !== "all" && m.category !== catFilter) return false;
    if (
      search &&
      !`${m.hindiName} ${m.englishName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    if (existing.some((e) => e.master_item_id === m.id)) return false;
    return true;
  });

  function toggle(id: string) {
    setSelected((cur) => {
      const n = new Set(cur);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function selectAll() {
    setSelected(new Set(filtered.map((m) => m.id)));
  }

  async function add() {
    setAdding(true);
    const rows = Array.from(selected).map((mid) => {
      const m = masterSamagriLibrary.find((mm) => mm.id === mid)!;
      return {
        booking_id: bookingId,
        serial_no: m.serialNo,
        hindi_name: m.hindiName,
        english_name: m.englishName,
        category: m.category,
        qty: m.defaultQty,
        unit: m.defaultUnit,
        mandatory: m.mandatory,
        responsible: m.responsible,
        source: "library" as const,
        master_item_id: m.id,
      };
    });
    const { error } = await supabase.from("samagri_items").insert(rows);
    setAdding(false);
    if (error) {
      pushToast(lang === "hi" ? "त्रुटि" : "Error adding items", "error");
      return;
    }
    pushToast(
      lang === "hi"
        ? `${rows.length} वस्तुएं जोड़ी गईं`
        : `${rows.length} items added`,
    );
    setSelected(new Set());
    setSearch("");
    setCatFilter("all");
    onAdded();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        lang === "hi" ? "मास्टर सूची से जोड़ें" : "Add from Master Library"
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted" />
          <input
            className="ps-input pl-9"
            placeholder={
              lang === "hi" ? "हिंदी या English में खोजें..." : "Search..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <FilterChip
            active={catFilter === "all"}
            onClick={() => setCatFilter("all")}
          >
            {lang === "hi" ? "सभी" : "All"}
          </FilterChip>
          {categoryList.map((c) => (
            <FilterChip
              key={c.name}
              active={catFilter === c.name}
              onClick={() => setCatFilter(c.name)}
            >
              {c.emoji} {lang === "hi" ? c.hindi : c.name.split(" ")[0]}
            </FilterChip>
          ))}
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={selectAll}
              className="text-saffron-700 font-semibold flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />{" "}
              {lang === "hi" ? "सभी चुनें" : "Select All"}
            </button>
            <span className="text-temple-muted">
              {filtered.length} {lang === "hi" ? "उपलब्ध" : "available"}
            </span>
          </div>
        )}
        <div className="max-h-[50vh] overflow-y-auto ps-scrollbar space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-sm text-temple-muted">
              {lang === "hi"
                ? "सभी मिलती वस्तुएं जोड़ी जा चुकी हैं।"
                : "All matching items already added."}
            </p>
          ) : (
            filtered.map((m) => {
              const isSel = selected.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${isSel ? "border-saffron-400 bg-saffron-50" : "border-transparent hover:border-saffron-200 bg-white hover:bg-beige-50"}`}
                >
                  <span
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSel ? "bg-saffron-500 border-saffron-500" : "border-temple-border"}`}
                  >
                    {isSel ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Square className="w-2.5 h-2.5 text-beige-300" />
                    )}
                  </span>
                  <span className="text-[10px] text-temple-muted/60 w-5 font-mono shrink-0">
                    {m.serialNo}.
                  </span>
                  <span className="text-lg shrink-0">
                    {categoryMeta(m.category)?.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-deva font-medium text-sm text-temple-ink">
                      {m.hindiName}
                    </span>
                    <span className="text-xs text-temple-muted ml-2">
                      {m.englishName}
                    </span>
                    <p className="text-[10px] text-temple-muted">
                      {m.defaultQty} {m.defaultUnit}
                    </p>
                  </div>
                  <span
                    className={`ps-chip text-[10px] ${m.mandatory ? "bg-maroon-100 text-maroon-800" : "bg-beige-100 text-beige-700"}`}
                  >
                    {m.mandatory
                      ? lang === "hi"
                        ? "अनि"
                        : "Req"
                      : lang === "hi"
                        ? "वैक"
                        : "Opt"}
                  </span>
                </button>
              );
            })
          )}
        </div>
        <FloralDivider />
        <div className="flex items-center justify-between">
          <p className="text-xs text-temple-muted">
            {selected.size} {lang === "hi" ? "चुनी" : "selected"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="ps-btn-ghost">
              {lang === "hi" ? "रद्द" : "Cancel"}
            </button>
            <button
              onClick={add}
              disabled={selected.size === 0 || adding}
              className="ps-btn-primary"
            >
              <Plus className="w-4 h-4" />
              {adding
                ? "..."
                : lang === "hi"
                  ? `जोड़ें (${selected.size})`
                  : `Add (${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Custom Item Dialog ───────────────────────────────────────────────────────
function CustomItemDialog({
  open,
  onClose,
  bookingId,
  lang,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  lang: string;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    hindi_name: "",
    english_name: "",
    qty: 1,
    unit: "नग",
    mandatory: true,
    responsible: "Yajmaan" as const,
    pandit_note: "",
  });
  const [adding, setAdding] = useState(false);

  async function add() {
    if (!form.hindi_name) {
      pushToast(lang === "hi" ? "नाम आवश्यक है" : "Name required", "error");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("samagri_items").insert({
      booking_id: bookingId,
      hindi_name: form.hindi_name,
      english_name: form.english_name || null,
      qty: form.qty,
      unit: form.unit,
      mandatory: form.mandatory,
      responsible: form.responsible,
      pandit_note: form.pandit_note || null,
      source: "custom",
    });
    setAdding(false);
    if (error) {
      pushToast(lang === "hi" ? "त्रुटि" : "Error", "error");
      return;
    }
    pushToast(
      lang === "hi"
        ? `${form.hindi_name} जोड़ा गया`
        : `Added ${form.hindi_name}`,
    );
    setForm({
      hindi_name: "",
      english_name: "",
      qty: 1,
      unit: "नग",
      mandatory: true,
      responsible: "Yajmaan",
      pandit_note: "",
    });
    onAdded();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lang === "hi" ? "नई सामग्री वस्तु" : "Add Custom Item"}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="ps-label">
              {lang === "hi" ? "हिंदी नाम *" : "Hindi Name *"}
            </label>
            <input
              className="ps-input font-deva"
              value={form.hindi_name}
              onChange={(e) => setForm({ ...form, hindi_name: e.target.value })}
              placeholder="जैसे: चाँदी का सिक्का"
            />
          </div>
          <div>
            <label className="ps-label">English Name</label>
            <input
              className="ps-input"
              value={form.english_name}
              onChange={(e) =>
                setForm({ ...form, english_name: e.target.value })
              }
              placeholder="Silver Coin"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="ps-label">
              {lang === "hi" ? "मात्रा" : "Qty"}
            </label>
            <input
              type="number"
              min={0}
              className="ps-input"
              value={form.qty}
              onChange={(e) =>
                setForm({ ...form, qty: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="ps-label">
              {lang === "hi" ? "इकाई" : "Unit"}
            </label>
            <input
              className="ps-input font-deva"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <div>
            <label className="ps-label">
              {lang === "hi" ? "प्रकार" : "Type"}
            </label>
            <button
              onClick={() => setForm({ ...form, mandatory: !form.mandatory })}
              className={`ps-input flex items-center justify-center gap-1 cursor-pointer text-xs ${form.mandatory ? "bg-maroon-50 border-maroon-300 text-maroon-700" : ""}`}
            >
              {form.mandatory ? (
                <Check className="w-3 h-3" />
              ) : (
                <Square className="w-3 h-3" />
              )}
              {form.mandatory
                ? lang === "hi"
                  ? "अनिवार्य"
                  : "Required"
                : lang === "hi"
                  ? "वैकल्पिक"
                  : "Optional"}
            </button>
          </div>
        </div>
        <div>
          <label className="ps-label">
            {lang === "hi" ? "पंडित जी की टिप्पणी" : "Pandit's Note"}
          </label>
          <input
            className="ps-input"
            value={form.pandit_note}
            onChange={(e) => setForm({ ...form, pandit_note: e.target.value })}
            placeholder={
              lang === "hi"
                ? "यजमान के लिए निर्देश..."
                : "Instructions for Yajmaan..."
            }
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="ps-btn-ghost">
            {lang === "hi" ? "रद्द" : "Cancel"}
          </button>
          <button onClick={add} disabled={adding} className="ps-btn-primary">
            <Plus className="w-4 h-4" />{" "}
            {adding ? "..." : lang === "hi" ? "जोड़ें" : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FilterChip({
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
      className={`ps-chip cursor-pointer whitespace-nowrap transition-colors ${active ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted hover:bg-beige-200"}`}
    >
      {children}
    </button>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
