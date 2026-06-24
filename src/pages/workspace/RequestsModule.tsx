import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Check,
  Clock,
  HandHeart,
  MessageSquareReply,
  Plus,
  Send,
} from "lucide-react";
import { useStore, uid } from "../../lib/store";
import { currentUser, getProfile } from "../../lib/profiles";
import { relativeTime } from "../../lib/format";
import {
  Avatar,
  Badge,
  EmptyState,
  Modal,
  pushToast,
} from "../../components/ui";
import { useLang } from "../../lib/i18n";
import type { RequestType, Role, SamagriRequest } from "../../lib/types";

const statusTone: Record<
  SamagriRequest["status"],
  "gold" | "success" | "error" | "neutral"
> = {
  Pending: "gold",
  Approved: "success",
  Declined: "error",
  Fulfilled: "neutral",
};

export function RequestsModule() {
  const { poojaId } = useParams();
  const { getPooja, requestsForPooja, dispatch } = useStore();
  const { lang } = useLang();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  const [open, setOpen] = useState(false);

  if (!pooja) return null;
  const requests = requestsForPooja(pooja.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const pending = requests.filter((r) => r.status === "Pending");

  function hiStatus(s: SamagriRequest["status"]) {
    const map: Record<string, string> = {
      Pending: "प्रतीक्षारत",
      Approved: "स्वीकृत",
      Declined: "अस्वीकृत",
      Fulfilled: "पूर्ण",
    };
    return lang === "hi" ? map[s] || s : s;
  }

  function hiType(t: RequestType) {
    const map: Record<string, string> = {
      "Add Item": "वस्तु जोड़ें",
      "Bring Item": "वस्तु लाएं",
      "Modify Item": "बदलाव",
      "Change Time": "समय बदलें",
      "Change Venue": "स्थान बदलें",
      Other: "अन्य",
    };
    return lang === "hi" ? map[t] || t : t;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
        <div>
          <Badge tone="saffron">{lang === "hi" ? "अनुरोध" : "Requests"}</Badge>
          <h1 className="mt-2 font-display text-2xl text-maroon-900">
            {lang === "hi" ? "आपसी अनुरोध" : "Requests between you"}
          </h1>
          <p className="text-sm text-temple-muted">
            {lang === "hi"
              ? "जो वस्तु नहीं मिली, पंडित जी से माँगें। बदलाव के लिए अनुरोध करें।"
              : "Ask Pandit to bring missing items or request changes."}
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="ps-btn-primary">
          <Plus className="w-4 h-4" />{" "}
          {lang === "hi" ? "नया अनुरोध" : "New Request"}
        </button>
      </header>

      {pending.length > 0 && (
        <div className="ps-card p-3.5 bg-gold-50 border-gold-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold-700" />
          <p className="text-sm text-gold-800">
            {lang === "hi"
              ? `${pending.length} अनुरोध प्रतीक्षारत`
              : `${pending.length} request(s) awaiting response`}
          </p>
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={<HandHeart className="w-10 h-10 text-saffron-400" />}
          title={lang === "hi" ? "कोई अनुरोध नहीं" : "No requests raised"}
          body={
            lang === "hi"
              ? "जब कोई वस्तु न मिले या बदलाव चाहिए — यहाँ अनुरोध करें।"
              : "When you need anything — extra samagri, a timing change — raise a request here."
          }
          action={
            <button onClick={() => setOpen(true)} className="ps-btn-primary">
              <Plus className="w-4 h-4" />{" "}
              {lang === "hi" ? "अनुरोध करें" : "Raise Request"}
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => {
            const author = getProfile(r.createdBy);
            const mine = r.assignedTo === currentUser.role;
            return (
              <li key={r.id} className="ps-card p-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={author.avatarInitials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="neutral">{hiType(r.type)}</Badge>
                      <p className="text-sm font-semibold text-temple-ink">
                        {r.title}
                      </p>
                      <Badge tone={statusTone[r.status]}>
                        {hiStatus(r.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-temple-muted">{r.detail}</p>
                    <p className="mt-1.5 text-[11px] text-temple-muted">
                      {author.name} →{" "}
                      {lang === "hi"
                        ? r.assignedTo === "Pandit"
                          ? "पंडित"
                          : "यजमान"
                        : r.assignedTo}
                      {" · "}
                      {relativeTime(r.createdAt)}
                      {r.resolvedAt &&
                        ` · ${lang === "hi" ? "हल" : "resolved"} ${relativeTime(r.resolvedAt)}`}
                    </p>

                    {r.status === "Pending" && mine && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            dispatch({
                              type: "RESOLVE_REQUEST",
                              requestId: r.id,
                              status: "Approved",
                            });
                            pushToast(
                              lang === "hi"
                                ? "अनुरोध स्वीकृत"
                                : "Request approved",
                            );
                          }}
                          className="ps-btn-ghost text-xs py-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />{" "}
                          {lang === "hi" ? "स्वीकार करें" : "Approve"}
                        </button>
                        <button
                          onClick={() => {
                            dispatch({
                              type: "RESOLVE_REQUEST",
                              requestId: r.id,
                              status: "Declined",
                            });
                            pushToast(
                              lang === "hi"
                                ? "अनुरोध अस्वीकृत"
                                : "Request declined",
                              "info",
                            );
                          }}
                          className="ps-btn-ghost text-xs py-1.5 text-rose-600"
                        >
                          {lang === "hi" ? "अस्वीकार करें" : "Decline"}
                        </button>
                        <button
                          onClick={() =>
                            pushToast(
                              lang === "hi"
                                ? "चैट अगले रिलीज में"
                                : "Chat in next release",
                              "info",
                            )
                          }
                          className="ps-btn-ghost text-xs py-1.5"
                        >
                          <MessageSquareReply className="w-3.5 h-3.5" />{" "}
                          {lang === "hi" ? "जवाब दें" : "Reply"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NewRequestModal
        open={open}
        onClose={() => setOpen(false)}
        poojaId={pooja.id}
        lang={lang}
      />
    </div>
  );
}

function NewRequestModal({
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
  const types: { key: RequestType; hi: string; en: string }[] = [
    { key: "Bring Item", hi: "वस्तु लाएं", en: "Bring Item" },
    { key: "Add Item", hi: "वस्तु जोड़ें", en: "Add Item" },
    { key: "Modify Item", hi: "बदलाव", en: "Modify Item" },
    { key: "Change Time", hi: "समय बदलें", en: "Change Time" },
    { key: "Other", hi: "अन्य", en: "Other" },
  ];
  const [type, setType] = useState<RequestType>("Bring Item");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [assignedTo, setAssignedTo] = useState<Role>(
    currentUser.role === "Pandit" ? "Yajmaan" : "Pandit",
  );

  function submit() {
    if (!title) {
      pushToast(
        lang === "hi" ? "शीर्षक आवश्यक है" : "Title is required",
        "error",
      );
      return;
    }
    const req: SamagriRequest = {
      id: uid("req"),
      poojaId,
      type,
      title,
      detail,
      createdBy: currentUser.id,
      assignedTo,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_REQUEST", request: req });
    pushToast(lang === "hi" ? "अनुरोध भेजा गया" : "Request raised");
    setTitle("");
    setDetail("");
    setType("Bring Item");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lang === "hi" ? "नया अनुरोध" : "Raise a Request"}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="ps-label">
            {lang === "hi" ? "प्रकार" : "Type"}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`ps-chip cursor-pointer ${type === t.key ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted hover:bg-beige-200"}`}
              >
                {lang === "hi" ? t.hi : t.en}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="ps-label">
            {lang === "hi" ? "शीर्षक" : "Title"}
          </label>
          <input
            className="ps-input"
            placeholder={
              lang === "hi"
                ? "जैसे: काला तिल लाएं"
                : "e.g. Bring black sesame seeds"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="ps-label">
            {lang === "hi" ? "विवरण" : "Detail"}
          </label>
          <textarea
            className="ps-input min-h-[80px] resize-y"
            placeholder={lang === "hi" ? "अधिक जानकारी..." : "More details..."}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </div>
        <div>
          <label className="ps-label">
            {lang === "hi" ? "किसे भेजें" : "Addressed to"}
          </label>
          <div className="flex gap-2">
            {(["Pandit", "Yajmaan"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setAssignedTo(r)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${assignedTo === r ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted"}`}
              >
                {lang === "hi" ? (r === "Pandit" ? "पंडित जी" : "यजमान") : r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="ps-btn-ghost">
            {lang === "hi" ? "रद्द" : "Cancel"}
          </button>
          <button onClick={submit} className="ps-btn-primary">
            <Send className="w-4 h-4" /> {lang === "hi" ? "भेजें" : "Send"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
