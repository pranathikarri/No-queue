import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Store, User, Calendar, Clock, ChevronRight, Users, Timer, Info, RefreshCw, CalendarCheck, Lock } from "lucide-react";
import { api, socket } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '13px 16px 13px 42px',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: "'Inter', system-ui, sans-serif",
  boxSizing: 'border-box',
};

const InfoCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px',
    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flex: 1
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

const JoinQueue = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shopId, setShopId] = useState((searchParams.get("shopId") || "").toUpperCase());
  const [shopDetails, setShopDetails] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [name, setName] = useState(user?.displayName || "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA')); 
  const [slot, setSlot] = useState("");
  const [pin, setPin] = useState("");
  const [pinRequired, setPinRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Filter slots based on selected date
  const selectedDateSlots = availableSlots.filter(s => s.date.trim() === date.trim());

  useEffect(() => {
    const sid = shopId.toUpperCase().trim();
    if (sid) {
      socket.connect();
      socket.emit("join_shop", sid);
      socket.on("update_status", fetchShopData);
    }
    const handler = setTimeout(fetchShopData, 500);
    return () => {
      clearTimeout(handler);
      socket.off("update_status", fetchShopData);
    };
  }, [shopId]);

  // SMART AUTO-DATE SELECTION
  useEffect(() => {
     if (availableSlots.length > 0) {
        const today = new Date().toLocaleDateString('en-CA');
        const hasToday = availableSlots.some(s => s.date.trim() === today);
        
        // If today has no slots, and a date is selected that has no slots, 
        // switch to the first available date automatically
        if (!hasToday && selectedDateSlots.length === 0) {
           setDate(availableSlots[0].date);
        }
     }
  }, [availableSlots]);

  const fetchShopData = async () => {
    const sid = shopId.toUpperCase().trim();
    if (sid.length < 3) return;
    
    setFetchingDetails(true);
    try {
      const [detailsRes, slotsRes] = await Promise.all([
        api.get(`/queue/shopDetails/${sid}`),
        api.get(`/queue/getAvailableSlots/${sid}`)
      ]);
      setShopDetails(detailsRes.data);
      setPinRequired(!!detailsRes.data.orgId);
      setAvailableSlots(slotsRes.data);
    } catch (err) {
      console.error("[FETCH ERROR]", err);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const sid = shopId.toUpperCase().trim();
    if (!sid || !name || !date || !slot) {
      return toast.error("Please fill all fields");
    }

    if (pinRequired && !pin) {
      return toast.warning("Please enter the Organization Access PIN");
    }

    setLoading(true);
    try {
      const response = await api.post("/queue/joinQueue", {
        shopId: sid,
        userId: user?.uid || "guest",
        customerName: name,
        description: description,
        scheduledDate: date,
        timeSlot: slot,
        pin: pin // Send PIN for validation
      });

      // Improvement 4: Persistence is handled by the backend fetching, 
      // but we still store locally for immediate redirection fallback.
      localStorage.setItem("myQueueEntry", JSON.stringify(response.data));
      socket.emit("queue_updated", sid);

      toast.success("Token generated successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to join queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', background: 'radial-gradient(circle at 70% 60%, #1e1b4b 0%, #020617 60%)', color: 'white'
    }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 24, padding: '32px', maxWidth: 480, width: '100%', position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(168,85,247,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(168,85,247,0.2)' }}>
            <UserPlus size={24} color="#a855f7" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Get Your Token</h2>
        </div>

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Shop ID</label>
              {fetchingDetails && <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>Verifying...</span>}
            </div>
            <div style={{ position: 'relative' }}>
              <Store size={16} color="rgba(148,163,184,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={shopId} onChange={e => setShopId(e.target.value.toUpperCase())} style={inputStyle} placeholder="E.G. KM161161" />
            </div>
          </div>

          <AnimatePresence>
            {shopDetails && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ background: 'rgba(168,85,247,0.08)', borderRadius: 16, padding: 16, border: '1px solid rgba(168,85,247,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>{shopDetails.shopName}</span>
                    </div>
                    <button onClick={fetchShopData} type="button" style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer' }}><RefreshCw size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <InfoCard icon={Users} label="People Ahead" value={shopDetails.waitingCount} color="#60a5fa" />
                    <InfoCard icon={Timer} label="Est. Wait" value={`${shopDetails.approxWaitTime}m`} color="#fb923c" />
                  </div>

                  {pinRequired && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(168,85,247,0.1)' }}>
                       <label style={{ display: 'block', color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization Access PIN *</label>
                       <div style={{ position: 'relative' }}>
                          <Lock size={16} color="#a855f7" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                          <input 
                            type="password" 
                            value={pin} 
                            onChange={e => setPin(e.target.value)} 
                            style={{ ...inputStyle, border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.05)' }} 
                            placeholder="Enter institutional code" 
                          />
                       </div>
                       <p style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.4)', marginTop: 8 }}>This queue is private. Authorization required.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Your Display Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="rgba(148,163,184,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Enter your full name" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Reason for Visit (Optional)</label>
            <div style={{ position: 'relative' }}>
              <Info size={16} color="rgba(148,163,184,0.4)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                style={{ ...inputStyle, paddingLeft: 42, height: 80, resize: 'none' }} 
                placeholder="Briefly describe why you're coming"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} color="rgba(148,163,184,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="date" value={date} min={new Date().toLocaleDateString('en-CA')} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, paddingRight: 8, paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Select Slot</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} color="rgba(148,163,184,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                <select value={slot} onChange={e => setSlot(e.target.value)} style={{ ...inputStyle, paddingLeft: 42, appearance: 'none', background: '#020617' }}>
                  <option value="">{fetchingDetails ? "Loading..." : "Choose Slot"}</option>
                  {selectedDateSlots.length > 0 ? (
                    selectedDateSlots.map(s => <option key={s.id} value={s.timeRange}>{s.timeRange} (Cap: {s.capacity})</option>)
                  ) : (
                    <option disabled>No slots for {date}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {availableSlots.length > 0 && selectedDateSlots.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: '12px 16px', marginBottom: 20, color: '#fbbf24', fontSize: '0.85rem', display: 'flex', gap: 10, alignItems: 'center'
              }}>
                <CalendarCheck size={18} />
                <span>Next availability found on <b>{availableSlots[0].date}</b></span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} style={{
            width: '100%', padding: '18px', background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: 'white', border: 'none', borderRadius: 14, fontWeight: 900, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 25px rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {loading ? "Please wait..." : "Confirm & Generate Token"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinQueue;
