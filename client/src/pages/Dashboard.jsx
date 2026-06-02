import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, MapPin, Users, Timer, 
  ChevronRight, RefreshCcw, Bell, CheckCircle2,
  X, QrCode as QrIcon, ArrowLeft, History
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api, socket } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const glassCard = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 24,
  padding: 24,
};

const StatusBadge = ({ status }) => {
  const colors = {
    waiting: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', label: 'Waiting' },
    serving: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', label: 'Now Serving' },
    completed: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', label: 'Completed' },
    skipped: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', label: 'Missed' },
  };
  const c = colors[status] || colors.waiting;
  return (
    <span style={{ 
      padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800,
      background: c.bg, color: c.text, border: `1px solid ${c.text}30`, textTransform: 'uppercase'
    }}>{c.label}</span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async (isSilent = false) => {
    if (!user?.uid && !localStorage.getItem("myQueueEntry")) {
      setLoading(false);
      return;
    }
    
    if (!isSilent) setLoading(true);
    try {
      const userId = user?.uid || "guest";
      const { data } = await api.get(`/queue/userAppointments/${userId}`);
      
      // Merge with local storage for guests
      const localEntry = JSON.parse(localStorage.getItem("myQueueEntry"));
      let finalData = data;
      if (localEntry && !data.find(a => a.id === localEntry.id)) {
        finalData = [localEntry, ...data];
      }
      
      setAppointments(finalData);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    socket.connect();
    socket.on("update_status", () => fetchAppointments(true));
    return () => {
      socket.off("update_status");
    };
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const activeTokens = appointments.filter(a => a.status === 'waiting' || a.status === 'serving');
  const pastTokens = appointments.filter(a => a.status === 'completed' || a.status === 'skipped');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, #0c0a1f 0%, #020617 70%)',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <button onClick={() => navigate("/")} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, color: 'white', cursor: 'pointer' }}><ArrowLeft size={18} /></button>
             <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, fontFamily: "'Outfit', sans-serif" }}>My Tokens</h1>
                <p style={{ color: 'rgba(148,163,184,0.6)', margin: 0, fontSize: '0.9rem' }}>Real-time queue tracking</p>
             </div>
          </div>
          <motion.button 
            whileHover={{ rotate: 180 }}
            animate={refreshing ? { rotate: 360 } : {}}
            transition={{ repeat: refreshing ? Infinity : 0, duration: 1 }}
            onClick={handleRefresh}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: refreshing ? '#a855f7' : '#60a5fa'
            }}
          >
            <RefreshCcw size={20} />
          </motion.button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
             <RefreshCcw size={40} className="animate-spin" style={{ color: '#a855f7', opacity: 0.5 }} />
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ ...glassCard, textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(168,85,247,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
               <QrIcon size={40} color="rgba(168,85,247,0.3)" />
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 800 }}>No Active Tokens</h3>
            <p style={{ color: 'rgba(148,163,184,0.6)', margin: '0 0 32px', lineHeight: 1.6 }}>You haven't joined any queues yet. Scan a QR code or search for a shop to get started.</p>
            <button onClick={() => navigate("/user-portal")} style={{ padding: '14px 28px', background: '#a855f7', border: 'none', borderRadius: 14, color: 'white', fontWeight: 800, cursor: 'pointer' }}>Join a Queue</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            
            {/* Active Section */}
            {activeTokens.length > 0 && (
               <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                     <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
                     <h2 style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.8)' }}>Active Tokens</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {activeTokens.map(app => (
                        <motion.div key={app.id} layoutId={app.id} onClick={() => setSelectedApp(app)} whileHover={{ scale: 1.01 }} style={{ ...glassCard, background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px' }}>
                           <div>
                              <div style={{ marginBottom: 6 }}><StatusBadge status={app.status} /></div>
                              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{app.shopName}</h3>
                              <div style={{ display: 'flex', gap: 16, color: 'rgba(148,163,184,0.6)', fontSize: '0.85rem', marginTop: 8 }}>
                                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {app.scheduledDate}</span>
                                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {app.timeSlot}</span>
                              </div>
                           </div>
                           <div style={{ textAlign: 'center', background: 'rgba(168,85,247,0.1)', padding: '12px 20px', borderRadius: 20, border: '1px solid rgba(168,85,247,0.2)' }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>Token No</div>
                              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#a855f7', lineHeight: 1 }}>#{app.queueNumber}</div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </section>
            )}

            {/* History Section */}
            {pastTokens.length > 0 && (
               <section>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                     <History size={16} color="rgba(148,163,184,0.5)" />
                     <h2 style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.5)' }}>Recent History</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                     {pastTokens.map(app => (
                        <div key={app.id} style={{ ...glassCard, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <CheckCircle2 size={18} color="#94a3b8" />
                              </div>
                              <div>
                                 <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{app.shopName}</h4>
                                 <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.5)' }}>{app.scheduledDate} • {app.timeSlot}</div>
                              </div>
                           </div>
                           <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'rgba(148,163,184,0.5)', alignSelf: 'center' }}>Token #{app.queueNumber}</div>
                        </div>
                     ))}
                  </div>
               </section>
            )}

          </div>
        )}
      </div>

      {/* Appointment Detail Modal (The QR code for Admin to scan) */}
      <AnimatePresence>
        {selectedApp && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <motion.div layoutId={selectedApp.id} style={{ ...glassCard, width: '100%', maxWidth: 420, position: 'relative', background: '#0f172a', border: '1px solid rgba(168,85,247,0.3)', padding: '40px 32px' }}>
              <button onClick={() => setSelectedApp(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(148,163,184,0.5)', cursor: 'pointer' }}><X size={24} /></button>

              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <StatusBadge status={selectedApp.status} />
                <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '16px 0 6px', fontFamily: "'Outfit', sans-serif" }}>{selectedApp.shopName}</h2>
                <div style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.9rem' }}>{selectedApp.scheduledDate} • {selectedApp.timeSlot}</div>
              </div>

              <div style={{ 
                background: 'white', padding: 28, borderRadius: 28, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)', marginBottom: 24
              }}>
                <QRCodeSVG value={selectedApp.id} size={180} level="H" includeMargin={false} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Token Number</div>
                  <div style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>#{selectedApp.queueNumber}</div>
                </div>
              </div>

              {selectedApp.status === 'waiting' && (
                 <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 16, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>People Ahead</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#60a5fa' }}>{selectedApp.peopleAhead}</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 16, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>Est. Wait</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fb923c' }}>{selectedApp.peopleAhead * 10}m</div>
                    </div>
                 </div>
              )}

              <p style={{ textAlign: 'center', color: 'rgba(148,163,184,0.4)', fontSize: '0.75rem', marginTop: 24, lineHeight: 1.5 }}>
                Present this QR code to the admin and keep this screen open when your turn arrives.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
