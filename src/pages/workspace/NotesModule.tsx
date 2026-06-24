import { useState } from "react";
import { useParams } from "react-router-dom";
import { Pin, PinOff, Send, StickyNote } from "lucide-react";
import { useStore, uid } from "../../lib/store";
import { currentUser, getProfile } from "../../lib/profiles";
import { relativeTime } from "../../lib/format";
import { Avatar, Badge, EmptyState, pushToast } from "../../components/ui";
import type { Note } from "../../lib/types";

export function NotesModule() {
  const { poojaId } = useParams();
  const { getPooja, notesForPooja, dispatch } = useStore();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  const [body, setBody] = useState("");

  if (!pooja) return null;
  const notes = notesForPooja(pooja.id);

  function add() {
    if (!body.trim()) {
      pushToast("Note is empty", "error");
      return;
    }
    const note: Note = {
      id: uid("note"),
      poojaId: pooja!.id,
      authorId: currentUser.id,
      body: body.trim(),
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_NOTE", note });
    setBody("");
    pushToast("Note added");
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <Badge tone="saffron">Notes</Badge>
        <h1 className="mt-2 font-display text-2xl text-maroon-900">
          Shared guidance
        </h1>
        <p className="text-sm text-temple-muted">
          Capture details, instructions and reminders visible to both
          participants.
        </p>
      </header>

      <div className="ps-card p-4">
        <label className="ps-label" htmlFor="note">
          Add a note
        </label>
        <textarea
          id="note"
          className="ps-input min-h-[90px] resize-y"
          placeholder="e.g. Please ensure the main door faces the pooja setup eastwards."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button onClick={add} className="ps-btn-primary">
            <Send className="w-4 h-4" /> Post note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="w-10 h-10 text-saffron-400" />}
          title="No notes yet"
          body="Share a guidance note above — Panditji can pin the most important ones."
        />
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => {
            const author = getProfile(n.authorId);
            return (
              <li
                key={n.id}
                className={`ps-card p-4 ${n.pinned ? "border-gold-300 bg-gold-50/40" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar initials={author.avatarInitials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-temple-ink">
                        {author.name}
                      </p>
                      {n.pinned && (
                        <Badge tone="gold">
                          <Pin className="w-3 h-3" /> Pinned
                        </Badge>
                      )}
                      <span className="text-[11px] text-temple-muted">
                        {relativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-temple-ink leading-relaxed whitespace-pre-wrap">
                      {n.body}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: "TOGGLE_PIN_NOTE", noteId: n.id })
                    }
                    className="p-1.5 rounded-lg text-temple-muted hover:bg-beige-100 hover:text-gold-600"
                    aria-label={n.pinned ? "Unpin note" : "Pin note"}
                  >
                    {n.pinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
