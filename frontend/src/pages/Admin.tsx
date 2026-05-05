import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { Plus, Trash2, Edit } from "lucide-react";

export default function Admin() {
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Slot Form
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        api.get("/slots"),
        api.get("/bookings")
      ]);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/slots", { location, price_per_hour: parseFloat(price) });
      setLocation("");
      setPrice("");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to add slot");
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/slots/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete slot");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Manage Slots */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Manage Slots</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-fit">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Plus size={20} className="text-indigo-400" /> Add New Slot
              </h3>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Location / Label</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Price per Hour (₹)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Save Slot
                </button>
              </form>
            </div>

            <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-neutral-300">
                <thead className="bg-neutral-800/50 text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {slots.map((slot) => (
                    <tr key={slot.slot_id} className="hover:bg-neutral-800/50">
                      <td className="px-6 py-4">{slot.slot_id}</td>
                      <td className="px-6 py-4">{slot.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${slot.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {slot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">₹{slot.price_per_hour}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteSlot(slot.slot_id)} className="text-red-400 hover:text-red-300 p-2">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* View Bookings */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">All Bookings Overview</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-neutral-300">
                <thead className="bg-neutral-800/50 text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Start</th>
                    <th className="px-6 py-4 font-medium">End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {bookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-neutral-800/50">
                      <td className="px-6 py-4">#{b.booking_id}</td>
                      <td className="px-6 py-4">{b.user_name} <br/><span className="text-xs text-neutral-500">{b.user_email}</span></td>
                      <td className="px-6 py-4">{b.location}</td>
                      <td className="px-6 py-4">{new Date(b.start_time).toLocaleString()}</td>
                      <td className="px-6 py-4">{new Date(b.end_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
