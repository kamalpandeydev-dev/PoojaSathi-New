import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppNotification,
  ItemStatus,
  Note,
  Pooja,
  PoojaSamagriItem,
  Responsibility,
  SamagriRequest,
  TimelineEvent,
} from "./types";
import {
  seedPoojas,
  seedSamagri,
  seedRequests,
  seedNotes,
  seedResponsibilities,
  seedTimeline,
  seedNotifications,
} from "./seedData";

interface State {
  poojas: Pooja[];
  samagri: PoojaSamagriItem[];
  requests: SamagriRequest[];
  notes: Note[];
  responsibilities: Responsibility[];
  timeline: TimelineEvent[];
  notifications: AppNotification[];
}

const initialState: State = {
  poojas: seedPoojas,
  samagri: seedSamagri,
  requests: seedRequests,
  notes: seedNotes,
  responsibilities: seedResponsibilities,
  timeline: seedTimeline,
  notifications: seedNotifications,
};

type Action =
  | { type: "CREATE_POOJA"; pooja: Pooja }
  | { type: "UPDATE_POOJA"; pooja: Pooja }
  | { type: "ACCEPT_INVITATION"; poojaId: string; profileId: string }
  | { type: "SET_POOJA_STATUS"; poojaId: string; status: Pooja["status"] }
  | { type: "PUBLISH_SAMAGRI_LIST"; poojaId: string; actorId: string }
  | { type: "ADD_SAMAGRI"; items: PoojaSamagriItem[] }
  | {
      type: "UPDATE_SAMAGRI_ITEM";
      poojaId: string;
      itemId: string;
      patch: Partial<PoojaSamagriItem>;
    }
  | { type: "REMOVE_SAMAGRI_ITEM"; itemId: string }
  | { type: "ADD_REQUEST"; request: SamagriRequest }
  | {
      type: "RESOLVE_REQUEST";
      requestId: string;
      status: SamagriRequest["status"];
    }
  | { type: "ADD_NOTE"; note: Note }
  | { type: "TOGGLE_PIN_NOTE"; noteId: string }
  | { type: "ADD_RESPONSIBILITY"; responsibility: Responsibility }
  | { type: "TOGGLE_RESPONSIBILITY"; responsibilityId: string }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_TIMELINE"; event: TimelineEvent };

let uidCounter = 0;
export function uid(prefix = "id"): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}`;
}

function pushTimeline(state: State, event: TimelineEvent): State {
  return { ...state, timeline: [...state.timeline, event] };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CREATE_POOJA":
      return {
        ...state,
        poojas: [...state.poojas, action.pooja],
        timeline: [
          ...state.timeline,
          {
            id: uid("t"),
            poojaId: action.pooja.id,
            type: "pooja_created",
            message: `${action.pooja.name} बनाई गई`,
            actorId: action.pooja.createdById,
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case "UPDATE_POOJA":
      return {
        ...state,
        poojas: state.poojas.map((p) =>
          p.id === action.pooja.id ? action.pooja : p,
        ),
      };

    case "ACCEPT_INVITATION": {
      const poojas = state.poojas.map((p) =>
        p.id === action.poojaId
          ? {
              ...p,
              participants: p.participants.map((par) =>
                par.profileId === action.profileId
                  ? { ...par, invitation: "accepted" as const }
                  : par,
              ),
            }
          : p,
      );
      return pushTimeline(
        { ...state, poojas },
        {
          id: uid("t"),
          poojaId: action.poojaId,
          type: "invitation_accepted",
          message: "निमंत्रण स्वीकार किया गया",
          actorId: action.profileId,
          createdAt: new Date().toISOString(),
        },
      );
    }

    case "SET_POOJA_STATUS":
      return pushTimeline(
        {
          ...state,
          poojas: state.poojas.map((p) =>
            p.id === action.poojaId ? { ...p, status: action.status } : p,
          ),
        },
        {
          id: uid("t"),
          poojaId: action.poojaId,
          type:
            action.status === "Completed"
              ? "pooja_completed"
              : "status_updated",
          message: `पूजा "${action.status}" में स्थानांतरित`,
          actorId: "user-current",
          createdAt: new Date().toISOString(),
        },
      );

    case "PUBLISH_SAMAGRI_LIST": {
      const updated = state.poojas.map((p) =>
        p.id === action.poojaId
          ? { ...p, samagriPublished: true, status: "In Preparation" as const }
          : p,
      );
      const notif: AppNotification = {
        id: uid("n"),
        poojaId: action.poojaId,
        kind: "status",
        title: "पंडित जी ने सामग्री सूची भेजी",
        body: "आपकी पूजा की सामग्री सूची तैयार है। अब आप तैयारी शुरू करें।",
        read: false,
        createdAt: new Date().toISOString(),
        link: `/pooja/${action.poojaId}/checklist`,
      };
      const next = pushTimeline(
        {
          ...state,
          poojas: updated,
          notifications: [...state.notifications, notif],
        },
        {
          id: uid("t"),
          poojaId: action.poojaId,
          type: "samagri_published",
          message: "सामग्री सूची यजमान को भेजी गई",
          actorId: action.actorId,
          createdAt: new Date().toISOString(),
        },
      );
      return next;
    }

    case "ADD_SAMAGRI":
      return pushTimeline(
        { ...state, samagri: [...state.samagri, ...action.items] },
        {
          id: uid("t"),
          poojaId: action.items[0]?.poojaId ?? "",
          type: "samagri_added",
          message: `${action.items.length} सामग्री जोड़ी गई`,
          actorId: "user-current",
          createdAt: new Date().toISOString(),
        },
      );

    case "UPDATE_SAMAGRI_ITEM": {
      const item = state.samagri.find((i) => i.id === action.itemId);
      const next = {
        ...state,
        samagri: state.samagri.map((i) =>
          i.id === action.itemId ? { ...i, ...action.patch } : i,
        ),
      };
      if (item && action.patch.status && action.patch.status !== item.status) {
        return pushTimeline(next, {
          id: uid("t"),
          poojaId: item.poojaId,
          type: "status_updated",
          message: `${item.hindiName} → ${action.patch.status}`,
          actorId: "user-current",
          createdAt: new Date().toISOString(),
        });
      }
      return next;
    }

    case "REMOVE_SAMAGRI_ITEM":
      return {
        ...state,
        samagri: state.samagri.filter((i) => i.id !== action.itemId),
      };

    case "ADD_REQUEST": {
      const next = pushTimeline(
        { ...state, requests: [...state.requests, action.request] },
        {
          id: uid("t"),
          poojaId: action.request.poojaId,
          type: "request_raised",
          message: `अनुरोध: ${action.request.title}`,
          actorId: action.request.createdBy,
          createdAt: new Date().toISOString(),
        },
      );
      // auto-notify the other party
      const notif: AppNotification = {
        id: uid("n"),
        poojaId: action.request.poojaId,
        kind: "request",
        title: `नया अनुरोध: ${action.request.title}`,
        body: action.request.detail,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/pooja/${action.request.poojaId}/requests`,
      };
      return { ...next, notifications: [...next.notifications, notif] };
    }

    case "RESOLVE_REQUEST": {
      const req = state.requests.find((r) => r.id === action.requestId);
      return pushTimeline(
        {
          ...state,
          requests: state.requests.map((r) =>
            r.id === action.requestId
              ? {
                  ...r,
                  status: action.status,
                  resolvedAt: new Date().toISOString(),
                }
              : r,
          ),
        },
        {
          id: uid("t"),
          poojaId: req?.poojaId ?? "",
          type: "request_resolved",
          message: `अनुरोध ${action.status === "Approved" ? "स्वीकृत" : "अस्वीकृत"}`,
          actorId: "user-current",
          createdAt: new Date().toISOString(),
        },
      );
    }

    case "ADD_NOTE":
      return pushTimeline(
        { ...state, notes: [...state.notes, action.note] },
        {
          id: uid("t"),
          poojaId: action.note.poojaId,
          type: "note_added",
          message: "नोट जोड़ा गया",
          actorId: action.note.authorId,
          createdAt: action.note.createdAt,
        },
      );

    case "TOGGLE_PIN_NOTE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.noteId ? { ...n, pinned: !n.pinned } : n,
        ),
      };

    case "ADD_RESPONSIBILITY":
      return {
        ...state,
        responsibilities: [...state.responsibilities, action.responsibility],
      };

    case "TOGGLE_RESPONSIBILITY": {
      const resp = state.responsibilities.find(
        (r) => r.id === action.responsibilityId,
      );
      const next = {
        ...state,
        responsibilities: state.responsibilities.map((r) =>
          r.id === action.responsibilityId ? { ...r, done: !r.done } : r,
        ),
      };
      if (resp && !resp.done) {
        return pushTimeline(next, {
          id: uid("t"),
          poojaId: resp.poojaId,
          type: "responsibility_done",
          message: `${resp.title} पूर्ण`,
          actorId: "user-current",
          createdAt: new Date().toISOString(),
        });
      }
      return next;
    }

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n,
        ),
      };

    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "ADD_TIMELINE":
      return pushTimeline(state, action.event);

    default:
      return state;
  }
}

interface StoreValue extends State {
  dispatch: React.Dispatch<Action>;
  getPooja: (id: string) => Pooja | undefined;
  samagriForPooja: (poojaId: string) => PoojaSamagriItem[];
  requestsForPooja: (poojaId: string) => SamagriRequest[];
  notesForPooja: (poojaId: string) => Note[];
  responsibilitiesForPooja: (poojaId: string) => Responsibility[];
  timelineForPooja: (poojaId: string) => TimelineEvent[];
  notificationsForPooja: (poojaId: string) => AppNotification[];
  unreadCount: number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      dispatch,
      getPooja: (id) => state.poojas.find((p) => p.id === id),
      samagriForPooja: (poojaId) =>
        state.samagri.filter((s) => s.poojaId === poojaId),
      requestsForPooja: (poojaId) =>
        state.requests.filter((r) => r.poojaId === poojaId),
      notesForPooja: (poojaId) =>
        [...state.notes.filter((n) => n.poojaId === poojaId)].sort(
          (a, b) => Number(b.pinned) - Number(a.pinned),
        ),
      responsibilitiesForPooja: (poojaId) =>
        state.responsibilities.filter((r) => r.poojaId === poojaId),
      timelineForPooja: (poojaId) =>
        [...state.timeline.filter((t) => t.poojaId === poojaId)].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      notificationsForPooja: (poojaId) =>
        state.notifications.filter((n) => n.poojaId === poojaId),
      unreadCount: state.notifications.filter((n) => !n.read).length,
    }),
    [state],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const statusOrder: ItemStatus[] = [
  "Not Started",
  "Searching",
  "Arranged",
  "Purchased",
  "Unable to Arrange",
  "Request Pandit to Bring",
];

export const statusMeta: Record<
  ItemStatus,
  { color: string; dot: string; hindi: string }
> = {
  "Not Started": {
    color: "bg-beige-100 text-beige-800",
    dot: "bg-beige-400",
    hindi: "शुरू नहीं",
  },
  Searching: {
    color: "bg-gold-100 text-gold-800",
    dot: "bg-gold-500",
    hindi: "खोज रहे हैं",
  },
  Arranged: {
    color: "bg-saffron-100 text-saffron-800",
    dot: "bg-saffron-500",
    hindi: "व्यवस्थित",
  },
  Purchased: {
    color: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    hindi: "खरीदा",
  },
  "Unable to Arrange": {
    color: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
    hindi: "उपलब्ध नहीं",
  },
  "Request Pandit to Bring": {
    color: "bg-maroon-100 text-maroon-800",
    dot: "bg-maroon-600",
    hindi: "पंडित जी लाएंगे",
  },
};
