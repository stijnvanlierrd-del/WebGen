import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Order, PaymentStatusType, UserProfile } from "../types";
import { 
  Plus, 
  Trash2, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Save, 
  Percent, 
  LogOut, 
  Sparkles, 
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomerDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

export function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // New project creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newPrice, setNewPrice] = useState("€250");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatusType>("Nog niet betaald");

  useEffect(() => {
    fetchOrders();
  }, [user.uid]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query all orders since this is an employee portal
      const q = query(
        collection(db, "orders")
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedOrders.push({
          id: doc.id,
          userId: data.userId || "",
          email: data.email || "",
          title: data.title || "",
          progress: typeof data.progress === "number" ? data.progress : 0,
          notes: data.notes || "",
          paymentStatus: data.paymentStatus || "Nog niet betaald",
          price: data.price || "€250",
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      
      // Sort client-side by date
      fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error("Error loading orders from Firestore:", err);
      setError("Fout bij het laden van uw orders. Controleer uw Firestore rechten.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const orderId = "order_" + Math.random().toString(36).substr(2, 9);
      const clientEmail = newClientEmail.trim() || user.email || "info@webgen.nl";
      const newOrderData = {
        userId: user.uid,
        email: clientEmail,
        title: newTitle,
        progress: 10, // Starts at 10%
        notes: "Welkom bij uw nieuwe WebGen project! Voeg hier uw notities of eisen toe.",
        paymentStatus: newPaymentStatus,
        price: newPrice,
        createdAt: new Date().toISOString()
      };

      // In Firestore, save inside the document
      await setDoc(doc(db, "orders", orderId), newOrderData);
      
      // Update local state
      setOrders(prev => [{ id: orderId, ...newOrderData }, ...prev]);
      setShowAddModal(false);
      setNewTitle("");
      setNewClientEmail("");
      setNewPrice("€250");
      setNewPaymentStatus("Nog niet betaald");
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError("Kan project niet aanmaken. Probeer het opnieuw.");
    }
  };

  const handeQuickSeed = async () => {
    try {
      setError(null);
      const sampleProjects = [
        {
          title: "Webdesign Portfolio - WebGen Professional",
          progress: 35,
          notes: "Conceptfase afgerond. Momenteel bezig met het ontwerpen van de wireframes en kleurschema's.",
          paymentStatus: "Betaald" as PaymentStatusType,
          price: "€250"
        },
        {
          title: "Logo en Huisstijl Ontwerp",
          progress: 80,
          notes: "3 logo concepten opgeleverd. Wachten op uw feedback over het gekozen typografie-ontwerp.",
          paymentStatus: "In behandeling" as PaymentStatusType,
          price: "€75"
        }
      ];

      for (const proj of sampleProjects) {
        const orderId = "order_" + Math.random().toString(36).substr(2, 9);
        const orderData = {
          userId: user.uid,
          email: user.email || "",
          title: proj.title,
          progress: proj.progress,
          notes: proj.notes,
          paymentStatus: proj.paymentStatus,
          price: proj.price,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "orders", orderId), orderData);
      }
      
      await fetchOrders();
    } catch (err) {
      console.error("Error seeding projects:", err);
      setError("Niet gelukt om voorbeeldprojecten aan te maken.");
    }
  };

  const handleUpdateNotes = async (orderId: string, updatedNotes: string) => {
    setSavingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { notes: updatedNotes });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes: updatedNotes } : o));
    } catch (err) {
      console.error("Error updating notes:", err);
      setError("Niet gelukt om de notities op te slaan.");
    } finally {
      setTimeout(() => setSavingId(null), 800);
    }
  };

  const handleUpdateProgress = async (orderId: string, newProgress: number) => {
    const boundedProgress = Math.min(100, Math.max(0, newProgress));
    try {
      await updateDoc(doc(db, "orders", orderId), { progress: boundedProgress });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, progress: boundedProgress } : o));
    } catch (err) {
      console.error("Error updating progress:", err);
      setError("Niet gelukt om de voortgang bij te werken.");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: PaymentStatusType) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { paymentStatus: status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError("Niet gelukt om de betaalstatus aan te passen.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Weet u zeker dat u dit project wilt verwijderen?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Niet gelukt om het project te verwijderen. Controleer Firestore Rules.");
    }
  };

  const getStatusBadgeColor = (status: PaymentStatusType) => {
    switch (status) {
      case "Betaald":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "In behandeling":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      default:
        return "bg-red-500/10 text-red-700 border-red-200";
    }
  };

  const getStatusIcon = (status: PaymentStatusType) => {
    switch (status) {
      case "Betaald":
        return <CheckCircle className="w-4 h-4" />;
      case "In behandeling":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full px-16 py-12 space-y-10">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 backdrop-blur-md p-8 rounded-[3rem] border border-white/50 shadow-xl">
        <div className="flex items-center gap-5">
          {user.photoURL ? (
            <img 
              referrerPolicy="no-referrer"
              src={user.photoURL} 
              alt={user.displayName || "User avatar"} 
              className="w-16 h-16 rounded-full border-2 border-white/80 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-serif italic">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
          )}
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2563eb] bg-[#eff6ff] px-3 py-1 rounded-full">WebGen Medewerker</span>
            </div>
            <h2 className="text-3xl font-serif italic text-gray-900">
              Welkom terug, {user.displayName || user.email?.split("@")[0]}
            </h2>
            <p className="text-sm text-gray-600 font-medium">Medewerkersportaal • {user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#2563eb] text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nieuw project registreren
          </button>
          
          <button
            onClick={fetchOrders}
            className="p-3 bg-white/60 hover:bg-white text-gray-700 rounded-full border border-gray-100 transition-all shadow-sm flex items-center justify-center hover:rotate-90 duration-300"
            title="Vernieuwen"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="px-6 py-3 bg-white/80 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-red-100 rounded-full font-bold transition-all flex items-center gap-2 text-sm active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Uitloggen
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100/80 backdrop-blur-md border border-red-200 rounded-2xl text-red-700 font-medium text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold hover:text-red-900 text-xs">Sluiten</button>
        </div>
      )}

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-serif italic text-lg">Projecten laden vanuit Firestore...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md p-16 rounded-[40px] text-center space-y-6 border border-white/30 shadow-xl max-w-3xl mx-auto">
          <FolderOpen className="w-20 h-20 text-blue-400 mx-auto animate-bounce mb-2" />
          <h3 className="text-3xl font-serif italic text-gray-900">Geen actieve projecten gevonden</h3>
          <p className="text-gray-700 max-w-md mx-auto leading-relaxed">
            Er zijn op dit moment geen actieve projecten of ingediende bestellingen geregistreerd in de cloud database van WebGen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Voeg een project toe
            </button>
            <button
              onClick={handeQuickSeed}
              className="px-8 py-4 bg-white/80 text-gray-800 border border-gray-100 rounded-full font-bold shadow-sm hover:bg-white transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-500" /> Genereer voorbeeldprojecten
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
            <h3 className="text-4xl font-serif italic text-gray-900">Projecten & Bestellingen ({orders.length})</h3>
            <p className="text-sm text-slate-600 font-medium">Beheer hier de voortgang, betaalstatus en klantnotities namens het WebGen team.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-lg rounded-[40px] border border-white/50 p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all"
              >
                {/* Header info of project */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-gray-200/50 pb-6">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3">
                      <h4 className="text-4xl font-serif italic text-gray-900">{order.title}</h4>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Project verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                      <span>Prijs: <strong className="text-gray-900">{order.price}</strong></span>
                      <span>•</span>
                      <span>Klant e-mail: <strong className="text-blue-600 font-sans bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">{order.email}</strong></span>
                      <span>•</span>
                      <span>Aanmelddatum: {new Date(order.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Payment status manager */}
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/80 shadow-sm">
                    <span className="text-xs font-bold text-slate-500">Betaalstatus:</span>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as PaymentStatusType)}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${getStatusBadgeColor(order.paymentStatus)} focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer`}
                    >
                      <option value="Betaald">Betaald</option>
                      <option value="In behandeling">In behandeling</option>
                      <option value="Nog niet betaald">Nog niet betaald</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-8 items-start">
                  {/* Progress Manager */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2 text-gray-800 font-bold">
                        <Percent className="w-5 h-5 text-blue-600" />
                        <span>Voortgang & Ontwikkeling</span>
                      </div>
                      <span className="text-3xl font-serif italic font-bold text-blue-600">{order.progress}%</span>
                    </div>

                    <div className="space-y-4">
                      {/* Interactive slide input to increase/adjust progress */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block">Voortgang Handmatig Bijgeven / Instellen:</label>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={order.progress}
                          onChange={(e) => handleUpdateProgress(order.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      {/* Quick progress presets */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Snelinstelling:</span>
                        {[25, 50, 75, 100].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleUpdateProgress(order.id, val)}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                              order.progress === val 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white'
                            }`}
                          >
                            {val === 100 ? 'Afgerond (100%)' : `${val}%`}
                          </button>
                        ))}
                      </div>

                      {/* Visual progress stages */}
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${order.progress >= 10 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <span className="text-[10px] text-gray-500 block font-bold">Concept</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${order.progress >= 40 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <span className="text-[10px] text-gray-500 block font-bold">Ontwerp</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${order.progress >= 70 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <span className="text-[10px] text-gray-500 block font-bold">Bouw</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${order.progress >= 100 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <span className="text-[10px] text-gray-500 block font-bold font-serif italic text-blue-600">Oplevering</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Specs Editor */}
                  <div className="space-y-4 text-left bg-white/30 backdrop-blur-md p-6 rounded-3xl border border-white/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-800 font-bold">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>Projectoverleg & Notities (Zelf typen)</span>
                      </div>
                      
                      <AnimatePresence>
                        {savingId === order.id && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm border border-green-200"
                          >
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Opgeslagen
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <textarea
                      value={order.notes}
                      onChange={(e) => setOrders(prev => prev.map(o => o.id === order.id ? { ...o, notes: e.target.value } : o))}
                      placeholder="Typ hier uw opmerkingen, gewenste aanpassingen of contactnotities voor de website..."
                      className="w-full h-36 p-4 bg-white border border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium text-sm resize-none shadow-inner"
                    />

                    <button
                      onClick={() => handleUpdateNotes(order.id, order.notes)}
                      disabled={savingId === order.id}
                      className="px-6 py-2.5 bg-white text-gray-800 border border-gray-200 text-xs font-extrabold rounded-full flex items-center gap-2 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> Bewaar notities in cloud database
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* NEW ORDER MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#d0e1f9] rounded-[40px] shadow-3xl max-w-lg w-full p-8 md:p-10 border border-white/50 relative z-10 space-y-6 text-left"
            >
              <div className="space-y-2">
                <h4 className="text-3xl font-serif italic text-gray-950">Nieuw project aanmelden</h4>
                <p className="text-slate-700 text-sm font-medium">Vul de gegevens in om direct een nieuw webproject op Firestore te persistenten.</p>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Project / Site Titel:</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., Webshop voor Bloemenwinkel, Logo Ontwerp"
                    className="w-full p-4 bg-white rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">E-mail van de klant:</label>
                  <input 
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="E.g., klant@voorbeeld.nl"
                    className="w-full p-4 bg-white rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Schatting Prijs:</label>
                    <select
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full p-4 bg-white rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                    >
                      <option value="€250">€250 (Basis Site)</option>
                      <option value="€310">€310 (Site + AI chatbot)</option>
                      <option value="€450">€450 (Webshop Pakket)</option>
                      <option value="€75">€75 (Logo Design)</option>
                      <option value="Op maat">Op maat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Betaalstatus:</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatusType)}
                      className="w-full p-4 bg-white rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                    >
                      <option value="Nog niet betaald">Nog niet betaald</option>
                      <option value="In behandeling">In behandeling</option>
                      <option value="Betaald">Betaald</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Project Toevoegen (Cloud)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-4 bg-white text-gray-700 border border-gray-100 rounded-full font-bold shadow-sm hover:bg-gray-100 transition-all"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
