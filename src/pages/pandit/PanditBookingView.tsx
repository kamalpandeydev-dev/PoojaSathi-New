import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  MapPin,
  PhoneCall,
  Users,
  X,
  Clock,
} from "lucide-react";
import {
  supabase,
  type BookingRow,
  type SamagriRequestRow,
} from "../../lib/supabase";
import { useLang } from "../../lib/i18n";
import { pushToast } from "../../components/ui";
import { FloralDivider } from "../../components/SpiritualArt";

export function PanditBookingView() {
  const { bookingId } = useParams();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [requests, setRequests] = useState<SamagriRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    Promise.all([
      supabase
        .from("puja_bookings")
        .select("*, pandits(*)")
        .eq("id", bookingId)
        .maybeSingle(),
      supabase.from("samagri_requests").select("*").eq("booking_id", bookingId),
    ]).then(([b, r]) => {
      setBooking(b.data);
      setRequests(r.data ?? []);
      setLoading(false);
    });
  }, [bookingId]);

  async function updateStatus(status: BookingRow["status"]) {
    setWorking(true);
    const { error } = await supabase
      .from("puja_bookings")
      .update({ status })
      .eq("id", bookingId!);
    if (error) {
      pushToast(lang === "hi" ? "त्रुटि" : "Error", "error");
    } else {
      setBooking((b) => (b ? { ...b, status } : b));
      pushToast(
        status === "accepted"
          ? lang === "hi"
            ? "बुकिंग स्वीकार की!"
            : "Booking accepted!"
          : lang === "hi"
            ? "बुकिंग अस्वीकार की।"
            : "Booking declined.",
      );
      if (status === "accepted")
        navigate(`/pandit/booking/${bookingId}/samagri`);
    }
    setWorking(false);
  }

  async function resolveRequest(
    reqId: string,
    status: "approved" | "declined",
  ) {
    await supabase
      .from("samagri_requests")
      .update({ status, resolved_at: new Date().toISOString() })
      .eq("id", reqId);
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status } : r)),
    );
    pushToast(
      status === "approved"
        ? lang === "hi"
          ? "स्वीकृत — मैं लाऊंगा"
          : "Approved — I will bring it"
        : lang === "hi"
          ? "अस्वीकृत"
          : "Declined",
    );
  }

  if (loading) return <Loader />;
  if (!booking)
    return (
      <div className="text-center py-16 text-temple-muted">
        {lang === "hi" ? "बुकिंग नहीं मिली।" : "Not found."}
      </div>
    );

  const isPending = booking.status === "pending";
  const isAccepted =
    booking.status === "accepted" || booking.status === "in_preparation";
  const samagriDone = booking.samagri_published;
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-5 animate-fade-in">
      <Link
        to="/pandit"
        className="inline-flex items-center gap-1 text-sm text-temple-muted hover:text-temple-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" />{" "}
        {lang === "hi" ? "डैशबोर्ड" : "Dashboard"}
      </Link>

      {/* Accept / decline banner */}
      {isPending && (
        <div className="ps-card p-5 mb-4 bg-gold-50 border-gold-300">
          <h2 className="font-display text-lg text-maroon-900 mb-2">
            {lang === "hi" ? "नई बुकिंग आई है!" : "New Booking Request!"}
          </h2>
          <p className="text-sm text-temple-muted mb-4">
            {lang === "hi"
              ? `${booking.yajmaan_name} ने आपसे ${booking.puja_type} के लिए बुकिंग की है। क्या आप स्वीकार करेंगे?`
              : `${booking.yajmaan_name} has sent a booking for ${booking.puja_type}. Will you accept?`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus("accepted")}
              disabled={working}
              className="ps-btn-primary flex-1 justify-center"
            >
              <Check className="w-4 h-4" />{" "}
              {lang === "hi" ? "स्वीकार करें" : "Accept"} {working ? "..." : ""}
            </button>
            <button
              onClick={() => updateStatus("declined")}
              disabled={working}
              className="ps-btn-ghost flex-1 justify-center text-rose-600"
            >
              <X className="w-4 h-4" />{" "}
              {lang === "hi" ? "अस्वीकार करें" : "Decline"}
            </button>
          </div>
        </div>
      )}

      {/* Build list CTA */}
      {isAccepted && !samagriDone && (
        <div className="ps-card p-4 mb-4 bg-saffron-50 border-saffron-300">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-saffron-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-saffron-900">
                {lang === "hi"
                  ? "अब सामग्री सूची बनाएं!"
                  : "Now build the samagri list!"}
              </p>
              <p className="text-xs text-saffron-800">
                {lang === "hi"
                  ? "यजमान को भेजने के लिए सूची तैयार करें।"
                  : "Prepare the checklist to send to Yajmaan."}
              </p>
            </div>
            <Link
              to={`/pandit/booking/${bookingId}/samagri`}
              className="ps-btn-primary shrink-0"
            >
              {lang === "hi" ? "सूची बनाएं →" : "Build List →"}
            </Link>
          </div>
        </div>
      )}

      {samagriDone && (
        <div className="ps-card p-4 mb-4 bg-emerald-50 border-emerald-200 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">
            {lang === "hi"
              ? "सामग्री सूची यजमान को भेज दी गई है।"
              : "Samagri list has been sent to Yajmaan."}
          </p>
          <Link
            to={`/pandit/booking/${bookingId}/samagri`}
            className="ml-auto text-xs font-semibold text-saffron-700 hover:text-saffron-800"
          >
            {lang === "hi" ? "देखें / बदलें" : "View / Edit"}
          </Link>
        </div>
      )}

      {/* Pending requests from Yajmaan */}
      {pendingRequests.length > 0 && (
        <div className="ps-card p-4 mb-4">
          <h3 className="font-display text-base text-temple-ink mb-3">
            {lang === "hi"
              ? `यजमान के ${pendingRequests.length} अनुरोध`
              : `${pendingRequests.length} request(s) from Yajmaan`}
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gold-50 border border-gold-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-temple-ink font-deva">
                    {r.item_hindi_name}
                  </p>
                  {r.message && (
                    <p className="text-xs text-temple-muted">{r.message}</p>
                  )}
                </div>
                <button
                  onClick={() => resolveRequest(r.id, "approved")}
                  className="ps-btn-ghost text-xs py-1.5 text-emerald-700"
                >
                  <Check className="w-3 h-3" />{" "}
                  {lang === "hi" ? "लाऊंगा" : "Will bring"}
                </button>
                <button
                  onClick={() => resolveRequest(r.id, "declined")}
                  className="ps-btn-ghost text-xs py-1.5 text-rose-600"
                >
                  <X className="w-3 h-3" /> {lang === "hi" ? "नहीं" : "No"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking details */}
      <div className="ps-card p-5 space-y-3">
        <h3 className="font-display text-base text-temple-ink">
          {lang === "hi" ? "बुकिंग विवरण" : "Booking Details"}
        </h3>
        <FloralDivider />
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <dt className="text-[11px] text-temple-muted uppercase">
            {lang === "hi" ? "यजमान" : "Yajmaan"}
          </dt>
          <dd className="font-medium text-temple-ink font-deva">
            {booking.yajmaan_name}
          </dd>

          <dt className="text-[11px] text-temple-muted uppercase">
            {lang === "hi" ? "मोबाइल" : "Phone"}
          </dt>
          <dd>
            <a
              href={`tel:${booking.yajmaan_phone}`}
              className="font-semibold text-saffron-700 flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" /> {booking.yajmaan_phone}
            </a>
          </dd>

          <dt className="text-[11px] text-temple-muted uppercase">
            {lang === "hi" ? "पूजा" : "Pooja"}
          </dt>
          <dd className="font-medium text-temple-ink">{booking.puja_type}</dd>

          <dt className="text-[11px] text-temple-muted uppercase">
            {lang === "hi" ? "दिनांक" : "Date"}
          </dt>
          <dd className="flex items-center gap-1 font-medium">
            <CalendarDays className="w-3.5 h-3.5" /> {booking.puja_date}
          </dd>

          <dt className="text-[11px] text-temple-muted uppercase">
            {lang === "hi" ? "समय" : "Time"}
          </dt>
          <dd className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> {booking.puja_time}
          </dd>

          {booking.expected_guests && (
            <>
              <dt className="text-[11px] text-temple-muted uppercase">
                {lang === "hi" ? "मेहमान" : "Guests"}
              </dt>
              <dd className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5" /> {booking.expected_guests}
              </dd>
            </>
          )}

          <dt className="text-[11px] text-temple-muted uppercase sm:col-span-2">
            {lang === "hi" ? "स्थान" : "Venue"}
          </dt>
          <dd className="sm:col-span-2 flex items-start gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 mt-0.5" /> {booking.venue}
          </dd>

          {booking.notes && (
            <>
              <dt className="text-[11px] text-temple-muted uppercase sm:col-span-2">
                {lang === "hi" ? "नोट" : "Notes"}
              </dt>
              <dd className="sm:col-span-2 text-temple-muted italic">
                {booking.notes}
              </dd>
            </>
          )}
        </dl>
      </div>
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
