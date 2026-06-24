import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BookOpen,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Search,
  Send,
  Square,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useStore, uid } from "../../lib/store";
import {
  masterSamagriLibrary,
  categories as categoryList,
  categoryMeta,
} from "../../lib/masterLibrary";
import { currentUser } from "../../lib/profiles";
import { Modal, Badge, pushToast, EmptyState } from "../../components/ui";
import { FloralDivider } from "../../components/SpiritualArt";
import { statusMeta } from "../../lib/store";
import { useLang } from "../../lib/i18n";
import type {
  Category,
  PoojaSamagriItem,
  ResponsibleParty,
} from "../../lib/types";

export function MasterSamagriModule() {
  const { poojaId } = useParams();
  const { getPooja, samagriForPooja, dispatch } = useStore();
  const { t, lang } = useLang();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!pooja) return null;
  const items = samagriForPooja(pooja.id);
  const isPandit = currentUser.role === "Pandit";
  const isPublished = !!pooja.samagriPublished;

  const filtered =
    catFilter === "all" ? items : items.filter((i) => i.category === catFilter);

  const requiredCount = items.filter((i) => i.mandatory).length;
  const optionalCount = items.filter((i) => !i.mandatory).length;

  function publishList() {
    if (items.length === 0) {
      pushToast("पहले सामग्री जोड़ें", "error");
      return;
    }
    dispatch({
      type: "PUBLISH_SAMAGRI_LIST",
      poojaId: pooja!.id,
      actorId: currentUser.id,
    });
    pushToast(t("listPublished"));
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header — Pandit's samagri sheet branding */}
      <div className="ps-card p-5 bg-gradient-to-br from-maroon-50 to-saffron-50 border-maroon-200">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-deva text-xs text-saffron-700 font-semibold">
                ॐ हरी ओम् · श्री गणेशाय नमः
              </span>
            </div>
            <h1 className="font-display text-xl text-maroon-900">
              {lang === "hi"
                ? "संक्षिप्त पूजन सामग्री"
                : "Brief Pooja Samagri List"}
            </h1>
            <p className="text-sm text-maroon-700 font-semibold mt-0.5">
              {lang === "hi"
                ? "पंडित विजय कुमार मिश्रा · शास्त्री एम.ए."
                : "Pandit Vijay Kumar Mishra · Shastri M.A."}
            </p>
            <p className="text-xs text-temple-muted">📞 9899769768</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="ps-chip bg-maroon-100 text-maroon-800">
              {lang === "hi"
                ? `${requiredCount} अनिवार्य`
                : `${requiredCount} Required`}
            </span>
            <span className="ps-chip bg-beige-100 text-beige-800">
              {lang === "hi"
                ? `${optionalCount} वैकल्पिक`
                : `${optionalCount} Optional`}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {isPandit ? (
            <>
              <button
                onClick={() => setPickerOpen(true)}
                className="ps-btn-ghost"
              >
                <Plus className="w-4 h-4" />
                {lang === "hi" ? "सूची से जोड़ें" : "Add from Library"}
              </button>
              <button
                onClick={() => setCustomOpen(true)}
                className="ps-btn-ghost"
              >
                <Plus className="w-4 h-4" />
                {lang === "hi" ? "नई वस्तु" : "Custom Item"}
              </button>
              {!isPublished ? (
                <button onClick={publishList} className="ps-btn-maroon">
                  <Send className="w-4 h-4" />
                  {lang === "hi" ? "यजमान को भेजें" : "Send to Yajmaan"}
                </button>
              ) : (
                <span className="ps-chip bg-emerald-100 text-emerald-800">
                  <Check className="w-3 h-3" />
                  {lang === "hi" ? "सूची भेजी गई" : "List Sent"}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-saffron-50 border border-saffron-200">
              <AlertCircle className="w-4 h-4 text-saffron-700 shrink-0" />
              <p className="text-xs text-saffron-900">
                {isPublished
                  ? lang === "hi"
                    ? "पंडित जी ने सामग्री सूची भेजी है। चेकलिस्ट में जाकर तैयारी करें।"
                    : "Pandit has sent the samagri list. Go to Checklist to track preparation."
                  : lang === "hi"
                    ? "पंडित जी सामग्री सूची तैयार कर रहे हैं..."
                    : "Pandit is preparing the samagri list..."}
              </p>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <Filter className="w-3.5 h-3.5 text-temple-muted shrink-0" />
          <FilterChip
            active={catFilter === "all"}
            onClick={() => setCatFilter("all")}
          >
            {lang === "hi" ? "सभी" : "All"}
          </FilterChip>
          {categoryList.map((c) => {
            const count = items.filter((i) => i.category === c.name).length;
            if (count === 0) return null;
            return (
              <FilterChip
                key={c.name}
                active={catFilter === c.name}
                onClick={() => setCatFilter(c.name)}
              >
                {c.emoji} {lang === "hi" ? c.hindi : c.name.split(" ")[0]}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* Samagri list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-saffron-400" />}
          title={lang === "hi" ? "कोई सामग्री नहीं" : "No Samagri Yet"}
          body={
            isPandit
              ? lang === "hi"
                ? "मास्टर सूची से वस्तुएं जोड़ें या नई वस्तु बनाएं।"
                : "Add items from master library or create a custom item."
              : lang === "hi"
                ? "पंडित जी सामग्री सूची तैयार कर रहे हैं।"
                : "Pandit is preparing the list."
          }
          action={
            isPandit ? (
              <button
                onClick={() => setPickerOpen(true)}
                className="ps-btn-primary"
              >
                <Plus className="w-4 h-4" />{" "}
                {lang === "hi" ? "जोड़ें" : "Add Items"}
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <SamagriRow
              key={item.id}
              item={item}
              lang={lang}
              isPandit={isPandit}
              expanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              onUpdate={(patch) =>
                dispatch({
                  type: "UPDATE_SAMAGRI_ITEM",
                  poojaId: pooja.id,
                  itemId: item.id,
                  patch,
                })
              }
              onRemove={() => {
                dispatch({ type: "REMOVE_SAMAGRI_ITEM", itemId: item.id });
                pushToast(lang === "hi" ? "हटाया गया" : "Removed");
              }}
            />
          ))}
        </div>
      )}

      <LibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        poojaId={pooja.id}
        existing={items}
        lang={lang}
      />
      <CustomItemDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        poojaId={pooja.id}
        lang={lang}
      />
    </div>
  );
}

// ─── Samagri Row ──────────────────────────────────────────────────────────────
function SamagriRow({
  item,
  lang,
  isPandit,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  item: PoojaSamagriItem;
  lang: string;
  isPandit: boolean;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<PoojaSamagriItem>) => void;
  onRemove: () => void;
}) {
  const meta = statusMeta[item.status];
  const cat = categoryMeta(item.category);

  return (
    <article
      className={`rounded-xl border transition-all duration-200 ${expanded ? "border-saffron-300 shadow-soft" : "border-temple-border/60 hover:border-saffron-200"} bg-white`}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Serial number */}
        {item.serialNo && (
          <span className="text-[11px] text-temple-muted/70 w-5 shrink-0 text-center font-mono">
            {item.serialNo}
          </span>
        )}

        {/* Mandatory checkbox — Pandit toggles */}
        <button
          onClick={() => isPandit && onUpdate({ mandatory: !item.mandatory })}
          className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            item.mandatory
              ? "bg-maroon-600 border-maroon-600"
              : "border-temple-border hover:border-saffron-400"
          } ${!isPandit ? "cursor-default" : "cursor-pointer"}`}
          title={
            isPandit
              ? item.mandatory
                ? lang === "hi"
                  ? "वैकल्पिक करें"
                  : "Set Optional"
                : lang === "hi"
                  ? "अनिवार्य करें"
                  : "Set Required"
              : ""
          }
          aria-label={item.mandatory ? "Required" : "Optional"}
        >
          {item.mandatory && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Names */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-deva text-sm font-semibold text-temple-ink">
              {item.hindiName}
            </span>
            <span className="text-xs text-temple-muted">
              / {item.englishName}
            </span>
            <span className="text-[10px] text-temple-muted/70">
              {cat.emoji}
            </span>
            {item.mandatory ? (
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
          <p className="text-[11px] text-temple-muted mt-0.5">
            {item.qty} {item.unit}
            {item.responsible !== "Shared" &&
              ` · ${lang === "hi" ? (item.responsible === "Pandit" ? "पंडित" : "यजमान") : item.responsible}`}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`ps-chip ${meta.color} shrink-0 text-[10px] hidden sm:flex`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
          {lang === "hi" ? meta.hindi : item.status}
        </span>

        {/* Expand toggle */}
        {isPandit && (
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-beige-100 text-temple-muted shrink-0"
            aria-label="Expand"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Expanded edit panel — Pandit only */}
      {expanded && isPandit && (
        <div className="px-4 pb-4 pt-2 border-t border-temple-border/40 animate-fade-in grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-temple-muted">
              {lang === "hi" ? "मात्रा" : "Quantity"}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => onUpdate({ qty: Math.max(0, item.qty - 1) })}
                className="w-7 h-7 rounded-lg bg-beige-100 hover:bg-beige-200 font-bold"
              >
                −
              </button>
              <span className="font-medium text-temple-ink min-w-[2ch] text-center">
                {item.qty}
              </span>
              <button
                onClick={() => onUpdate({ qty: item.qty + 1 })}
                className="w-7 h-7 rounded-lg bg-beige-100 hover:bg-beige-200 font-bold"
              >
                +
              </button>
              <input
                className="ps-input ml-1 max-w-[110px] py-1.5 text-xs"
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
              {(["Pandit", "Yajmaan", "Shared"] as ResponsibleParty[]).map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => onUpdate({ responsible: r })}
                    className={`flex-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${item.responsible === r ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted hover:bg-beige-200"}`}
                  >
                    {lang === "hi"
                      ? r === "Pandit"
                        ? "पंडित"
                        : r === "Yajmaan"
                          ? "यजमान"
                          : "दोनों"
                      : r}
                  </button>
                ),
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-temple-muted">
              {lang === "hi" ? "नोट" : "Note"}
            </label>
            <input
              className="ps-input mt-1 text-xs"
              value={item.note ?? ""}
              onChange={(e) => onUpdate({ note: e.target.value })}
              placeholder={
                lang === "hi" ? "पंडित जी की टिप्पणी..." : "Pandit's note..."
              }
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={onRemove}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {lang === "hi" ? "हटाएं" : "Remove"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Library Picker (select from all 75 items) ────────────────────────────────
function LibraryPicker({
  open,
  onClose,
  poojaId,
  existing,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  poojaId: string;
  existing: PoojaSamagriItem[];
  lang: string;
}) {
  const { dispatch } = useStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return masterSamagriLibrary.filter((m) => {
      if (catFilter !== "all" && m.category !== catFilter) return false;
      if (
        search &&
        !`${m.hindiName} ${m.englishName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (existing.some((e) => e.masterItemId === m.id)) return false;
      return true;
    });
  }, [search, catFilter, existing]);

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

  function add() {
    const newItems: PoojaSamagriItem[] = Array.from(selected).map((mid) => {
      const m = masterSamagriLibrary.find((mm) => mm.id === mid)!;
      return {
        id: uid(`psi-${poojaId}-${mid}`),
        poojaId,
        masterItemId: m.id,
        serialNo: m.serialNo,
        hindiName: m.hindiName,
        englishName: m.englishName,
        category: m.category,
        qty: m.defaultQty,
        unit: m.defaultUnit,
        mandatory: m.mandatory,
        responsible: m.responsible,
        status: "Not Started",
        source: "library",
      };
    });
    if (newItems.length) {
      dispatch({ type: "ADD_SAMAGRI", items: newItems });
      pushToast(
        lang === "hi"
          ? `${newItems.length} वस्तुएं जोड़ी गईं`
          : `${newItems.length} items added`,
      );
    }
    setSelected(new Set());
    setSearch("");
    setCatFilter("all");
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
        {/* Search */}
        <div className="relative">
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
          />
        </div>
        {/* Category filter */}
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

        {/* Select all */}
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

        {/* Item list */}
        <div className="max-h-[52vh] overflow-y-auto ps-scrollbar space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-sm text-temple-muted">
              {lang === "hi"
                ? "सभी वस्तुएं पहले से जुड़ी हैं।"
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
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="text-xs text-temple-muted/60 w-5 shrink-0">
                    {m.serialNo}
                  </span>
                  <span className="text-xl shrink-0">
                    {categoryMeta(m.category).emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-deva text-sm font-medium text-temple-ink">
                      {m.hindiName}
                    </span>
                    <span className="text-xs text-temple-muted ml-2">
                      {m.englishName}
                    </span>
                    <p className="text-[11px] text-temple-muted">
                      {m.defaultQty} {m.defaultUnit} ·{" "}
                      {lang === "hi"
                        ? categoryMeta(m.category).hindi
                        : m.category}
                    </p>
                  </div>
                  {m.mandatory ? (
                    <Badge tone="maroon">
                      <span className="text-[10px]">
                        {lang === "hi" ? "अनिवार्य" : "Req"}
                      </span>
                    </Badge>
                  ) : (
                    <Badge tone="neutral">
                      <span className="text-[10px]">
                        {lang === "hi" ? "वैकल्पिक" : "Opt"}
                      </span>
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>

        <FloralDivider />
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-temple-muted">
            {selected.size} {lang === "hi" ? "चुनी गई" : "selected"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="ps-btn-ghost">
              {lang === "hi" ? "रद्द" : "Cancel"}
            </button>
            <button
              onClick={add}
              disabled={selected.size === 0}
              className="ps-btn-primary"
            >
              <Plus className="w-4 h-4" />
              {lang === "hi"
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
  poojaId,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  poojaId: string;
  lang: string;
}) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({
    hindiName: "",
    englishName: "",
    category: "Miscellaneous" as Category,
    qty: 1,
    unit: "नग",
    mandatory: true,
    responsible: "Yajmaan" as ResponsibleParty,
  });

  function add() {
    if (!form.hindiName && !form.englishName) {
      pushToast(lang === "hi" ? "नाम आवश्यक है" : "Name is required", "error");
      return;
    }
    const item: PoojaSamagriItem = {
      id: uid(`psi-${poojaId}-custom`),
      poojaId,
      masterItemId: "custom",
      hindiName: form.hindiName,
      englishName: form.englishName,
      category: form.category,
      qty: form.qty,
      unit: form.unit,
      mandatory: form.mandatory,
      responsible: form.responsible,
      status: "Not Started",
      source: "custom",
    };
    dispatch({ type: "ADD_SAMAGRI", items: [item] });
    pushToast(
      lang === "hi"
        ? `${form.hindiName || form.englishName} जोड़ा गया`
        : `Added ${form.englishName || form.hindiName}`,
    );
    setForm({
      hindiName: "",
      englishName: "",
      category: "Miscellaneous",
      qty: 1,
      unit: "नग",
      mandatory: true,
      responsible: "Yajmaan",
    });
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
              {lang === "hi" ? "हिंदी नाम" : "Hindi Name"}
            </label>
            <input
              className="ps-input font-deva"
              value={form.hindiName}
              onChange={(e) => setForm({ ...form, hindiName: e.target.value })}
              placeholder="जैसे: चाँदी का सिक्का"
            />
          </div>
          <div>
            <label className="ps-label">
              {lang === "hi" ? "English नाम" : "English Name"}
            </label>
            <input
              className="ps-input"
              value={form.englishName}
              onChange={(e) =>
                setForm({ ...form, englishName: e.target.value })
              }
              placeholder="e.g. Silver Coin"
            />
          </div>
        </div>
        <div>
          <label className="ps-label">
            {lang === "hi" ? "श्रेणी" : "Category"}
          </label>
          <select
            className="ps-input"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as Category })
            }
          >
            {categoryList.map((c) => (
              <option key={c.name} value={c.name}>
                {c.emoji} {lang === "hi" ? c.hindi : c.name}
              </option>
            ))}
          </select>
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
              className={`ps-input flex items-center justify-center gap-1 cursor-pointer ${form.mandatory ? "bg-maroon-50 border-maroon-300 text-maroon-700" : "text-temple-muted"}`}
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
            {lang === "hi" ? "जिम्मेदार" : "Responsible"}
          </label>
          <div className="flex gap-1">
            {(["Pandit", "Yajmaan", "Shared"] as ResponsibleParty[]).map(
              (r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, responsible: r })}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${form.responsible === r ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted"}`}
                >
                  {lang === "hi"
                    ? r === "Pandit"
                      ? "पंडित"
                      : r === "Yajmaan"
                        ? "यजमान"
                        : "दोनों"
                    : r}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="ps-btn-ghost">
            {lang === "hi" ? "रद्द" : "Cancel"}
          </button>
          <button onClick={add} className="ps-btn-primary">
            <Plus className="w-4 h-4" /> {lang === "hi" ? "जोड़ें" : "Add"}
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
