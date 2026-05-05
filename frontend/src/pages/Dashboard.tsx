import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  Clock,
  MapPin,
  CheckCircle2,
  CarFront,
  Star,
  Zap,
  Circle,
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";
import { Entropy } from "../components/ui/entropy";

/* ─── types ─────────────────────────────────────────────────────────── */
interface Slot {
  slot_id: number;
  location: string;
  type: "premium" | "semi" | "basic";
  status: "available" | "booked";
  price_per_hour: number;
}

interface Booking {
  booking_id: number;
  slot_id: number;
  location: string;
  start_time: string;
  end_time: string;
  status: string;
  price_per_hour: number;
}

/* ─── category config ────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    key: "premium",
    label: "Premium",
    icon: Star,
    gradient: "from-amber-500/20 via-amber-400/10 to-transparent",
    border: "border-amber-500/40",
    headerBg: "bg-amber-500/15",
    headerText: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/40",
    badgeAvail: "bg-amber-500/10 text-amber-300",
    accentBtn: "bg-amber-600 hover:bg-amber-500",
    glow: "shadow-amber-900/30",
    dot: "bg-amber-400",
  },
  {
    key: "semi",
    label: "Semi-Premium",
    icon: Zap,
    gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
    border: "border-blue-500/40",
    headerBg: "bg-blue-500/15",
    headerText: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
    badgeAvail: "bg-blue-500/10 text-blue-300",
    accentBtn: "bg-blue-600 hover:bg-blue-500",
    glow: "shadow-blue-900/30",
    dot: "bg-blue-400",
  },
  {
    key: "basic",
    label: "Basic",
    icon: Circle,
    gradient: "from-neutral-500/20 via-neutral-400/10 to-transparent",
    border: "border-neutral-600/40",
    headerBg: "bg-neutral-700/30",
    headerText: "text-neutral-300",
    badge: "bg-neutral-600/30 text-neutral-300 border border-neutral-600/40",
    badgeAvail: "bg-neutral-700/30 text-neutral-400",
    accentBtn: "bg-neutral-600 hover:bg-neutral-500",
    glow: "shadow-neutral-900/30",
    dot: "bg-neutral-400",
  },
] as const;

/* ─── checkout confirmation modal ────────────────────────────────────── */
function CheckoutModal({
  booking,
  onConfirm,
  onCancel,
  loading,
}: {
  booking: Booking;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-500/30">
            <CarFront className="text-orange-400" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Take Your Car Out</h3>
            <p className="text-neutral-400 text-sm">Confirm checkout from parking</p>
          </div>
        </div>

        <div className="bg-neutral-800/60 rounded-xl p-4 mb-6 border border-neutral-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-400 text-sm">Location</span>
            <span className="text-white font-semibold">{booking.location}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-400 text-sm">Booking #</span>
            <span className="font-mono text-neutral-300">{booking.booking_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-400 text-sm">Parked since</span>
            <span className="text-neutral-300 text-sm">
              {new Date(booking.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-6">
          <AlertTriangle size={14} />
          This will mark your session complete and free the slot.
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors font-medium"
          >
            Stay Longer
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />
            ) : (
              <>
                <LogOut size={16} />
                Checkout Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentStatus, setAssignmentStatus] = useState<
    "idle" | "assigning" | "success"
  >("idle");
  const [assignedSlot, setAssignedSlot] = useState<any>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        api.get("/slots"),
        api.get("/bookings/mybookings"),
      ]);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId: number) => {
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
      await api.post("/bookings", {
        slot_id: slotId,
        start_time: startTime.toISOString().slice(0, 19).replace("T", " "),
        end_time: endTime.toISOString().slice(0, 19).replace("T", " "),
      });
      alert("Booking successful!");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to book slot");
    }
  };

  const autoAssignSlot = async () => {
    try {
      setAssignmentStatus("assigning");
      const res = await api.post("/bookings/auto-assign");
      setTimeout(() => {
        setAssignedSlot(res.data);
        setAssignmentStatus("success");
        fetchData();
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to auto-assign slot");
      setAssignmentStatus("idle");
    }
  };

  const confirmCheckout = async () => {
    if (!checkoutBooking) return;
    try {
      setCheckoutLoading(true);
      await api.patch(`/bookings/${checkoutBooking.booking_id}/checkout`);
      setCheckoutBooking(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* derive active booking (latest non-completed booking) */
  const activeBooking = bookings.find((b) => b.status !== "completed") ?? null;

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-black relative">
      {/* ── auto-assign overlay ── */}
      {assignmentStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <Entropy size={800} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            {assignmentStatus === "assigning" && (
              <h2 className="text-3xl md:text-5xl font-bold text-white animate-pulse tracking-widest uppercase">
                Initializing Auto-Assignment...
              </h2>
            )}
            {assignmentStatus === "success" && assignedSlot && (
              <div className="bg-neutral-900/80 backdrop-blur-md p-10 rounded-3xl border border-emerald-500/30 text-center shadow-2xl shadow-emerald-900/20">
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 mb-6">
                  Slot Assigned Successfully
                </h2>
                <div className="text-7xl md:text-9xl font-black text-white mb-4 tracking-tighter">
                  {assignedSlot.location}
                </div>
                <div className="text-neutral-400 mb-8 font-mono text-sm">
                  BOOKING_REF: #{assignedSlot.booking_id}
                </div>
                <button
                  onClick={() => setAssignmentStatus("idle")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 w-full"
                >
                  Confirm & Proceed
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── checkout modal ── */}
      {checkoutBooking && (
        <CheckoutModal
          booking={checkoutBooking}
          onConfirm={confirmCheckout}
          onCancel={() => setCheckoutBooking(null)}
          loading={checkoutLoading}
        />
      )}

      <Navbar />

      {/* ── "Take My Car Out" sticky top banner ── */}
      {activeBooking && (
        <div className="bg-gradient-to-r from-orange-950/80 via-orange-900/60 to-orange-950/80 border-b border-orange-500/30 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                <CarFront className="text-orange-400" size={20} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Your car is currently parked at{" "}
                  <span className="text-orange-400 font-bold">
                    {activeBooking.location}
                  </span>
                </p>
                <p className="text-orange-200/60 text-xs">
                  Booking #{activeBooking.booking_id} &nbsp;•&nbsp; Parked since{" "}
                  {new Date(activeBooking.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutBooking(activeBooking)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/40 whitespace-nowrap"
            >
              <LogOut size={16} />
              Take My Car Out
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* ── header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-1 tracking-tight">
              Welcome to Phoenix Mall,{" "}
              <span className="text-indigo-400">{user.name}</span>
            </h1>
            <p className="text-neutral-400 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" />
              Browse and book a parking slot below
            </p>
          </div>
          <button
            onClick={autoAssignSlot}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Zap size={18} />
            Park My Car (Auto-Assign)
          </button>
        </div>

        {/* ── slot categories ── */}
        {CATEGORIES.map((cat) => {
          const catSlots = slots.filter((s) => s.type === cat.key);
          const available = catSlots.filter((s) => s.status === "available").length;
          const Icon = cat.icon;

          return (
            <section
              key={cat.key}
              className={`rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.gradient} overflow-hidden shadow-xl ${cat.glow}`}
            >
              {/* category header */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 ${cat.headerBg} border-b ${cat.border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${cat.badge}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${cat.headerText}`}>
                      {cat.label}
                    </h2>
                    <p className="text-neutral-500 text-xs">{catSlots.length} total slots</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* available count pill */}
                  <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl border border-white/10">
                    <span className={`w-2 h-2 rounded-full ${cat.dot} animate-pulse`} />
                    <span className="text-white font-bold text-lg leading-none">
                      {available}
                    </span>
                    <span className="text-neutral-400 text-xs">
                      / {catSlots.length} available
                    </span>
                  </div>

                  {/* progress bar */}
                  <div className="hidden sm:block w-32">
                    <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.dot} transition-all duration-500`}
                        style={{
                          width: `${catSlots.length ? (available / catSlots.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* slot grid */}
              <div className="p-6">
                {catSlots.length === 0 ? (
                  <p className="text-neutral-500 text-center py-6">
                    No {cat.label} slots configured.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catSlots.map((slot) => {
                      const isAvail = slot.status === "available";
                      return (
                        <div
                          key={slot.slot_id}
                          className={`relative p-5 rounded-xl border transition-all duration-200 ${
                            isAvail
                              ? `bg-neutral-900/70 ${cat.border} hover:border-opacity-80 hover:shadow-lg cursor-default`
                              : "bg-neutral-900/30 border-neutral-800/40 opacity-50"
                          }`}
                        >
                          {/* status dot */}
                          <span
                            className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                              isAvail
                                ? "bg-green-400 shadow-sm shadow-green-400/50"
                                : "bg-red-500"
                            }`}
                          />

                          <div className="flex items-center gap-2 mb-3">
                            <MapPin size={16} className={cat.headerText} />
                            <span className="text-white font-bold text-lg">
                              {slot.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-neutral-400 text-sm mb-4">
                            <Clock size={13} />
                            <span>₹{slot.price_per_hour} / hr</span>
                          </div>

                          {isAvail ? (
                            <button
                              onClick={() => bookSlot(slot.slot_id)}
                              className={`w-full py-2 rounded-lg text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${cat.accentBtn}`}
                            >
                              Book Now
                            </button>
                          ) : (
                            <div className="w-full py-2 rounded-lg bg-neutral-800/60 text-neutral-500 text-sm font-medium text-center">
                              Occupied
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {/* ── booking history ── */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" />
            My Booking History
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-neutral-300">
                <thead className="bg-neutral-800/50 text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Start Time</th>
                    <th className="px-6 py-4 font-medium">End Time</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {bookings.map((booking) => {
                    const isActive = booking.status !== "completed";
                    return (
                      <tr
                        key={booking.booking_id}
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">
                          {booking.location}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(booking.start_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(booking.end_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isActive && (
                            <button
                              onClick={() => setCheckoutBooking(booking)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <LogOut size={12} />
                              Checkout
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {bookings.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-neutral-500"
                      >
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
