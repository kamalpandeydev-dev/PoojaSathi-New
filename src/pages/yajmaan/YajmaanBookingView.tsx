import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  PhoneCall,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { supabase, type BookingRow } from "../../lib/supabase";
import { useLang } from "../../lib/i18n";
import { FloralDivider } from "../../components/SpiritualArt";

export function YajmaanBookingView() {
  const { bookingId } = useParams();
  const { lang } = useLang();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    supabase
      .from("puja_bookings")
      .select("*, pandits(*)")
      .eq("id", bookingId)
      .maybeSingle()
      .then(({ data }) => {
        setBooking(data);
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) return <Loader />;
  if (!booking)
    return (
      <div className="text-center py-16 text-temple-muted">
        {lang === "hi" ? "बुकिंग नहीं मिली।" : "Booking not found."}
      </div>
    );

  const pandit = booking.pandits;
  const samagriReady = booking.samagri_published;

  const statusFlow = [
    { key: "pending", hi: "बुकिंग भेजी गई", en: "Booking Sent", icon: "📋" },
    {
      key: "accepted",
      hi: "पंडित जी ने स्वीकारा",
      en: "Pandit Accepted",
      icon: "✅",
    },
    {
      key: "in_preparation",
      hi: "तैयारी शुरू",
      en: "Preparation Started",
      icon: "🏗️",
    },
    { key: "ready", hi: "सब तैयार", en: "All Ready", icon: "🎉" },
    { key: "completed", hi: "पूजा पूर्ण", en: "Pooja Completed", icon: "🙏" },
  ];
  const currentIdx = statusFlow.findIndex((s) => s.key === booking.status);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 animate-fade-in">
      <Link
        to="/yajmaan"
        className="inline-flex items-center gap-1 text-sm text-temple-muted hover:text-temple-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" />{" "}
        {lang === "hi" ? "मेरी पूजाएँ" : "My Poojas"}
      </Link>

      {/* Status timeline */}
      <div className="ps-card p-5 mb-4 bg-gradient-to-br from-saffron-50 to-ivory-100">
        <h2 className="font-display text-base text-maroon-900 mb-4">
          {lang === "hi" ? "बुकिंग की स्थिति" : "Booking Status"}
        </h2>
        <div className="relative flex items-start">
          <div className="absolute left-4 top-5 bottom-0 w-0.5 bg-temple-border/50" />
          <div className="space-y-4 w-full">
            {statusFlow.map((s, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div
                  key={s.key}
                  className={`flex items-center gap-3 pl-8 relative ${done ? "" : "opacity-40"}`}
                >
                  <span
                    className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${current ? "bg-saffron-500 text-white ring-4 ring-saffron-200" : done ? "bg-emerald-500 text-white" : "bg-beige-200 text-beige-600"}`}
                  >
                    {done && !current ? "✓" : s.icon}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${current ? "text-saffron-700" : done ? "text-emerald-700" : "text-temple-muted"}`}
                    >
                      {lang === "hi" ? s.hi : s.en}
                    </p>
                    {current && s.key === "pending" && (
                      <p className="text-xs text-temple-muted">
                        {lang === "hi"
                          ? "पंडित जी के जवाब का इंतजार करें"
                          : "Waiting for Pandit to accept"}
                      </p>
                    )}
                    {current && s.key === "accepted" && !samagriReady && (
                      <p className="text-xs text-temple-muted">
                        {lang === "hi"
                          ? "पंडित जी सामग्री सूची तैयार कर रहे हैं"
                          : "Pandit is building the samagri list"}
                      </p>
                    )}
                    {samagriReady && s.key === "in_preparation" && current && (
                      <p className="text-xs text-saffron-700 font-medium">
                        {lang === "hi"
                          ? "सामग्री सूची तैयार है — अभी शुरू करें!"
                          : "Samagri list is ready — start now!"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Samagri CTA */}
      {samagriReady && (
        <div className="ps-card p-4 bg-saffron-50 border-saffron-300 mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-saffron-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-saffron-900">
                {lang === "hi"
                  ? "पंडित जी ने सामग्री सूची भेज दी है!"
                  : "Pandit has sent the samagri list!"}
              </p>
              <p className="text-xs text-saffron-800">
                {lang === "hi"
                  ? "अब आप हर वस्तु की तैयारी अपडेट कर सकते हैं।"
                  : "You can now mark each item as arranged."}
              </p>
            </div>
            <Link
              to={`/yajmaan/booking/${booking.id}/samagri`}
              className="ps-btn-primary shrink-0"
            >
              <ClipboardCheck className="w-4 h-4" />
              {lang === "hi" ? "सूची देखें" : "View List"}
            </Link>
          </div>
        </div>
      )}

      {/* Booking details */}
      <div className="ps-card p-5 space-y-4">
        <h3 className="font-display text-base text-temple-ink">
          {lang === "hi" ? "बुकिंग विवरण" : "Booking Details"}
        </h3>
        <FloralDivider />
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <Detail
            label={lang === "hi" ? "पूजा" : "Pooja"}
            value={booking.puja_type}
          />
          <Detail
            label={lang === "hi" ? "दिनांक" : "Date"}
            value={booking.puja_date}
            icon={<CalendarDays className="w-3.5 h-3.5" />}
          />
          <Detail
            label={lang === "hi" ? "समय" : "Time"}
            value={booking.puja_time}
            icon={<Clock className="w-3.5 h-3.5" />}
          />
          <Detail
            label={lang === "hi" ? "शहर" : "City"}
            value={booking.city ?? "—"}
          />
          <div className="sm:col-span-2">
            <Detail
              label={lang === "hi" ? "स्थान" : "Venue"}
              value={booking.venue}
              icon={<MapPin className="w-3.5 h-3.5" />}
            />
          </div>
          {booking.notes && (
            <div className="sm:col-span-2">
              <Detail
                label={lang === "hi" ? "नोट" : "Notes"}
                value={booking.notes}
              />
            </div>
          )}
          {booking.budget && (
            <Detail
              label={lang === "hi" ? "बजट" : "Budget"}
              value={`₹${booking.budget.toLocaleString("en-IN")}`}
            />
          )}
          <Detail
            label={lang === "hi" ? "कोड" : "Invite Code"}
            value={booking.invite_code ?? "—"}
          />
        </dl>

        {pandit && (
          <>
            <FloralDivider />
            <h4 className="text-sm font-semibold text-temple-ink">
              {lang === "hi" ? "पंडित जी" : "Your Pandit"}
            </h4>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-50">
              <div className="w-10 h-10 rounded-full bg-maroon-700 text-white font-deva font-bold flex items-center justify-center shrink-0">
                {pandit.avatar_initials}
              </div>
              <div className="flex-1">
                <p className="font-deva font-bold text-sm text-maroon-900">
                  {pandit.name}
                </p>
                {pandit.qualifications && (
                  <p className="text-xs text-saffron-700">
                    {pandit.qualifications}
                  </p>
                )}
              </div>
              {pandit.phone && (
                <a
                  href={`tel:${pandit.phone}`}
                  className="flex items-center gap-1 text-xs font-semibold text-saffron-700 ps-btn-ghost py-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />{" "}
                  {lang === "hi" ? "कॉल" : "Call"}
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-temple-muted flex items-center gap-1">
        {icon}
        {label}
      </dt>
      <dd className="text-temple-ink font-medium mt-0.5">{value}</dd>
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
