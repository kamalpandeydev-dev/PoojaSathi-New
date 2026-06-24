import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, QrCode, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import { currentUser, getProfile } from "../lib/profiles";
import {
  CoverIllustration,
  FloralDivider,
  LotusIcon,
  MandalaIcon,
} from "../components/SpiritualArt";
import { Avatar, pushToast } from "../components/ui";

export function AcceptInvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { poojas, dispatch } = useStore();
  const pooja =
    poojas.find((p) => p.inviteCode === code) ??
    poojas.find(
      (p) => p.status === "Planning" || p.status === "Invitation Pending",
    );
  const [accepted, setAccepted] = useState(false);

  if (!pooja) {
    return (
      <div className="mx-auto max-w-md py-20 text-center px-4 animate-fade-in">
        <QrCode className="w-12 h-12 mx-auto text-temple-muted" />
        <h1 className="mt-4 font-display text-2xl text-temple-ink">
          Invitation not found
        </h1>
        <p className="mt-2 text-sm text-temple-muted">
          This code may have expired or is invalid. Ask your pandit/ji yajmaan
          to resend.
        </p>
        <Link to="/" className="mt-6 ps-btn-primary">
          Go home
        </Link>
      </div>
    );
  }

  function accept() {
    if (!pooja) return;
    dispatch({
      type: "ACCEPT_INVITATION",
      poojaId: pooja.id,
      profileId: currentUser.id,
    });
    setAccepted(true);
    pushToast("Invitation accepted. Workspace ready.");
    setTimeout(() => navigate(`/pooja/${pooja.id}`), 1200);
  }

  const partner = pooja.participants.find(
    (p) => p.profileId !== currentUser.id,
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron-100 to-gold-100 mb-3">
            <MandalaIcon className="w-10 h-10" spin />
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-temple-muted">
            Pooja Invitation
          </p>
          <p className="font-deva text-saffron-600 text-sm mt-1">
            ॥ शुभ स्वागतम् ॥
          </p>
        </div>

        <div className="ps-card p-6 sm:p-8 shadow-lift relative overflow-hidden">
          <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
            <LotusIcon className="w-44 h-44" />
          </div>

          {accepted ? (
            <div className="text-center py-6 animate-scale-in">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="mt-4 font-display text-xl text-temple-ink">
                Welcome to the workspace
              </h2>
              <p className="mt-1 text-sm text-temple-muted">
                Taking you to your pooja...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-50 to-gold-100 flex items-center justify-center shrink-0">
                  <CoverIllustration
                    cover={pooja.coverIllustration}
                    className="w-9 h-9"
                  />
                </div>
                <div>
                  <h1 className="font-display text-xl text-maroon-900 leading-tight">
                    {pooja.name}
                  </h1>
                  <p className="text-xs text-temple-muted">{pooja.type}</p>
                </div>
              </div>

              <FloralDivider className="my-5" />

              <div className="flex items-center gap-3 mb-5">
                <Avatar
                  initials={getProfile(pooja.createdById).avatarInitials}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-temple-ink">
                    {getProfile(pooja.createdById).name}
                  </p>
                  <p className="text-xs text-temple-muted">
                    has invited you to collaborate on this pooja as{" "}
                    <span className="font-medium text-saffron-700">
                      {partner?.role ?? "participant"}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div className="p-3 rounded-xl bg-beige-50">
                  <dt className="text-[11px] text-temple-muted">Date</dt>
                  <dd className="text-temple-ink font-medium">{pooja.date}</dd>
                </div>
                <div className="p-3 rounded-xl bg-beige-50">
                  <dt className="text-[11px] text-temple-muted">City</dt>
                  <dd className="text-temple-ink font-medium">{pooja.city}</dd>
                </div>
              </dl>

              <button onClick={accept} className="ps-btn-primary w-full">
                <Sparkles className="w-4 h-4" /> Accept invitation{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="mt-3 text-center text-[11px] text-temple-muted">
                Invitation code:{" "}
                <span className="font-mono font-semibold text-temple-ink">
                  {pooja.inviteCode}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
