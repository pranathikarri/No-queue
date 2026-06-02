import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, SkipForward, RotateCcw, LogOut, ArrowLeft, 
  ShieldCheck, X, CheckCircle, AlertCircle, Calendar, Clock, Plus, Users, Edit3, Save, RefreshCw, Smartphone, Lock, QrCode as QrIcon, Download, Printer, ExternalLink, Camera, Building2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api, socket } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Html5Qrcode } from "html5-qrcode";

const card = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  padding: 32,
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '12px 14px',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none',
  marginBottom: 16
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [shopId, setShopId] = useState((searchParams.get("shopId") || "").toUpperCase().trim());
  const [isEditingShopId, setIsEditingShopId] = useState(false);
  const [tempShopId, setTempShopId] = useState(shopId);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(shopId ? true : false);
  const [isOwner, setIsOwner] = useState(false);
  const [orgDepartments, setOrgDepartments] = useState([]);
  const [isOrg, setIsOrg] = useState(false);
  const [shopName, setShopName] = useState("");
  
  // Modals
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [waitingCustomers, setWaitingCustomers] = useState([]);
  const [isReordering, setIsReordering] = useState(false);

  const [slots, setSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    timeRange: "09:00 AM - 10:00 AM",
    capacity: 10
  });

  const fetchAllData = async (targetId = shopId) => {
    if (!targetId) {
      setFetching(false);
      return;
    }
    if (!user) return;
    setFetching(true);
    
    // Reset temporary states
    setIsOrg(false);
    setIsOwner(false);
    setOrgDepartments([]);
    setShopName("");
    setStatus(null);

    try {
      // Use the unified discovery endpoint
      const discoverRes = await api.get(`/admin/discover/${targetId}`);
      const data = discoverRes.data;

      if (data.type === 'shop') {
        // Handle Shop Logic
        setShopName(data.shopName);
        
        if (data.ownerId !== user.uid) {
           setIsOwner(false);
           setFetching(false);
           return;
        }

        setIsOwner(true);
        const [statusRes, slotsRes, waitingRes] = await Promise.all([
          api.get(`/queue/queueStatus/${targetId}`),
          api.get(`/admin/getSlots/${targetId}`),
          api.get(`/admin/waitingCustomers/${targetId}`)
        ]);
        setStatus(statusRes.data);
        setSlots(slotsRes.data);
        setWaitingCustomers(waitingRes.data);
      } 
      else if (data.type === 'org') {
        // Handle Org Logic
        setIsOrg(true);
        setOrgDepartments(data.departments);
        setIsOwner(false);
      }
    } catch (error) {
      console.error("[DISCOVER ERROR]", error);
      setIsOrg(false);
      setIsOwner(false);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    socket.connect();
    socket.emit("join_shop", shopId);
    socket.on("update_status", () => fetchAllData());
    return () => {
      socket.off("update_status");
      socket.disconnect();
    };
  }, [shopId, user]);

  useEffect(() => {
    let html5QrCode;
    if (showScanner) {
      html5QrCode = new Html5Qrcode("reader");
      const qrCodeSuccessCallback = async (decodedText) => {
        try {
          html5QrCode.stop().then(() => {
            handleVerifyToken(decodedText);
          }).catch(err => {
            console.error(err);
            handleVerifyToken(decodedText);
          });
        } catch (e) {
            handleVerifyToken(decodedText);
        }
      };
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
    }
    
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.log("Stop error", e));
      }
    };
  }, [showScanner]);

  const handleVerifyToken = async (tokenId) => {
    setLoading(true);
    try {
      const { data } = await api.post("/admin/verifyToken", {
        shopId,
        userId: user.uid,
        tokenId
      });
      setScannedData(data.tokenDetails);
      setShowScanner(false);
      toast.success("Token Verified!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid Token");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShopId = () => {
    const newId = tempShopId.toUpperCase().trim();
    if (!newId) return toast.warning("Shop ID cannot be empty");
    setShopId(newId);
    setIsEditingShopId(false);
    navigate(`/admin?shopId=${newId}`);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/createSlot", { 
        shopId: shopId, 
        userId: user.uid,
        ...slotForm 
      });
      socket.emit("queue_updated", shopId); 
      toast.success("Slot defined successfully!");
      setShowSlotModal(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint, payload = {}) => {
    setLoading(true);
    try {
      await api.post(`/admin/${endpoint}`, { 
        shopId, 
        userId: user.uid,
        ...payload 
      });
      socket.emit("queue_updated", shopId);
      toast.success("Done!");
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (index, direction) => {
    const newList = [...waitingCustomers];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newList.length) return;
    
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setWaitingCustomers(newList);
    setIsReordering(true);
  };

  const saveNewOrder = async () => {
    setLoading(true);
    try {
      await api.post("/admin/reorderQueue", {
        shopId,
        userId: user.uid,
        orderedIds: waitingCustomers.map(c => c.id)
      });
      socket.emit("queue_updated", shopId);
      toast.success("Order updated!");
      setIsReordering(false);
      fetchAllData();
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/join?shopId=${shopId}`;

  if (fetching) {
     return (
       <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
             <RefreshCw size={40} className="animate-spin" style={{ color: '#a855f7', marginBottom: 16 }} />
             <p style={{ opacity: 0.6 }}>Authenticating Management Access...</p>
          </div>
       </div>
     );
  }

  if (!shopId) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, maxWidth: 450, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(168,85,247,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(168,85,247,0.2)' }}>
               <ShieldCheck size={40} color="#a855f7" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>Identity Verification</h2>
            <p style={{ color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: 32 }}>
               Enter your unique Shop or Organization ID to authenticate management access.
            </p>
            <div style={{ marginBottom: 24 }}>
               <input 
                 autoFocus 
                 placeholder="ENTER ID (E.G. SHOP_01)" 
                 value={tempShopId} 
                 onChange={e => setTempShopId(e.target.value.toUpperCase().trim())} 
                 style={{ ...inputStyle, textAlign: 'center', background: '#0c0a1f', border: '1px solid #a855f7', py: 16, fontSize: '1.1rem' }} 
               />
               <button 
                 onClick={handleUpdateShopId} 
                 style={{ width: '100%', padding: 18, background: '#a855f7', border: 'none', borderRadius: 14, fontWeight: 900, fontSize: '1.1rem', color: 'white', cursor: 'pointer', boxShadow: '0 10px 30px rgba(168,85,247,0.3)' }}
               >
                 VALIDATE ACCESS
               </button>
            </div>
            <button onClick={() => navigate("/")} style={{ background: 'none', border: 'none', color: 'rgba(148,163,184,0.5)', cursor: 'pointer', fontSize: '0.9rem' }}>Return to home screen</button>
         </motion.div>
      </div>
    );
  }

  if (!isOwner) {
    const isNotFound = !shopName && !isOrg;
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, maxWidth: isOrg ? 600 : 450, textAlign: 'center' }}>
            
            {!isOrg ? (
              <>
                <div style={{ width: 80, height: 80, background: isNotFound ? 'rgba(148,163,184,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: `1px solid ${isNotFound ? 'rgba(148,163,184,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                   {isNotFound ? <AlertCircle size={40} color="#94a3b8" /> : <Lock size={40} color="#f87171" />}
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>{isNotFound ? "ID Not Found" : "Restricted Access"}</h2>
                <p style={{ color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: 32 }}>
                   {isNotFound 
                     ? `The ID "${shopId}" does not exist. Please enter a valid Shop ID or Organization ID.`
                     : "This can be viewed only with registered email ID"}
                </p>
              </>
            ) : (
              <>
                <div style={{ width: 80, height: 80, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(59,130,246,0.3)' }}>
                   <Building2 size={40} color="#60a5fa" />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>Institution Detected</h2>
                <p style={{ color: 'rgba(148,163,184,0.7)', marginBottom: 24 }}>Select a department to manage. You must be the registered owner.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
                  {orgDepartments.map(dept => (
                    <motion.button 
                      key={dept.shopId}
                      whileHover={{ scale: 1.02, background: 'rgba(59,130,246,0.1)' }}
                      onClick={() => {
                        setShopId(dept.shopId);
                        navigate(`/admin?shopId=${dept.shopId}`);
                      }}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: 'white', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{dept.shopName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(59,130,246,0.6)', marginTop: 4 }}>{dept.shopId}</div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
               <button onClick={() => setIsEditingShopId(true)} style={{ flex: 1, padding: 14, background: '#a855f7', border: 'none', borderRadius: 12, fontWeight: 800, color: 'white', cursor: 'pointer' }}>Enter Different ID</button>
               <button onClick={() => navigate("/")} style={{ flex: 1, padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontWeight: 800, color: 'white', cursor: 'pointer' }}>Exit Portal</button>
            </div>

            {isEditingShopId && (
               <div style={{ marginTop: 24, pt: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <input autoFocus placeholder="ENTER ID" value={tempShopId} onChange={e => setTempShopId(e.target.value)} style={{ ...inputStyle, textAlign: 'center', background: '#020617', border: '1px solid #a855f7', marginTop: 24 }} />
                  <button onClick={handleUpdateShopId} style={{ width: '100%', padding: 12, background: '#a855f7', border: 'none', borderRadius: 8, fontWeight: 800, color: 'white', cursor: 'pointer' }}>VALIDATE ACCESS</button>
               </div>
            )}
         </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 60% 20%, #0c0a1f 0%, #020617 70%)',
      padding: '32px 16px',
      color: 'white'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* TOP STATUS BAR */}
        <div style={{ 
          background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', 
          borderRadius: 16, padding: '12px 20px', marginBottom: 32, display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#a855f7', padding: 8, borderRadius: 10 }}>
              <Smartphone size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.6)', fontWeight: 800, textTransform: 'uppercase' }}>Secure Management Mode</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>{shopId}</span>
                  <button onClick={() => setIsEditingShopId(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#a855f7', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Edit3 size={14} /> SWITCH STORE
                  </button>
                </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <button onClick={() => setShowQrModal(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrIcon size={20} color="#a855f7" /> SHARE QR
             </button>
             <motion.button onClick={() => setShowSlotModal(true)} style={{ background: '#a855f7', border: 'none', borderRadius: 12, padding: '12px 24px', color: 'white', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}>
              <Plus size={20} /> CREATE SLOTS
            </motion.button>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, color: 'white', cursor: 'pointer' }}><LogOut size={20} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
          {/* Realtime Status */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, textAlign: 'center' }}>
            <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.2em' }}>People Waiting</div>
            <div style={{ fontSize: '7rem', fontWeight: 900, color: '#a855f7', lineHeight: 1, margin: '20px 0' }}>#{status?.currentServing || 0}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 20 }}>
               <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{status?.waitingCount || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', fontWeight: 700 }}>WAITING</div>
               </div>
               <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{status?.totalInQueue || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', fontWeight: 700 }}>TOTAL TOKENS</div>
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 20 }}>
             <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Camera size={20} /> Verification Tool
             </h3>
             <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', margin: 0 }}>Scan the customer's QR code to verify their token instantly.</p>
             <button onClick={() => setShowScanner(true)} style={{ width: '100%', padding: 18, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 16, color: '#a855f7', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Camera size={20} /> SCAN CUSTOMER QR
             </button>
             
             {scannedData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: 16, position: 'relative' }}>
                   <button onClick={() => setScannedData(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><X size={16} /></button>
                   <div style={{ fontSize: '0.7rem', color: 'rgba(16,185,129,0.7)', fontWeight: 800, textTransform: 'uppercase' }}>Verified Token</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <div>
                         <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>{scannedData.customerName}</div>
                         <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Slot: {scannedData.time}</div>
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>#{scannedData.queueNumber}</div>
                   </div>
                </motion.div>
             )}
          </motion.div>
        </div>

        {/* QUEUE MANAGEMENT SECTION */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={20} /> Waiting Queue
            </h3>
            {isReordering && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                onClick={saveNewOrder} 
                style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Save size={16} /> SAVE NEW ORDER
              </motion.button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {waitingCustomers.length > 0 ? (
              waitingCustomers.map((customer, index) => (
                <div key={customer.id} style={{ 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#a855f7', minWidth: 40 }}>#{customer.queueNumber}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{customer.customerName}</div>
                    {customer.description && (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.6)', marginTop: 2 }}>
                        {customer.description}
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.4)', marginTop: 4, display: 'flex', gap: 12 }}>
                       <span><Calendar size={10} style={{marginRight: 4}}/>{customer.scheduledDate}</span>
                       <span><Clock size={10} style={{marginRight: 4}}/>{customer.timeSlot}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                     <button 
                        onClick={() => handleMove(index, -1)} 
                        disabled={index === 0}
                        style={{ 
                          width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(168,85,247,0.1)', 
                          color: '#a855f7', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1
                        }}
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => handleMove(index, 1)} 
                        disabled={index === waitingCustomers.length - 1}
                        style={{ 
                          width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(168,85,247,0.1)', 
                          color: '#a855f7', cursor: index === waitingCustomers.length - 1 ? 'not-allowed' : 'pointer', opacity: index === waitingCustomers.length - 1 ? 0.3 : 1
                        }}
                      >
                        ▼
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(148,163,184,0.5)', fontSize: '0.9rem' }}>
                No customers waiting in queue.
              </div>
            )}
          </div>
        </div>

        <div style={{ ...card, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <motion.button onClick={() => handleAction('nextCustomer')} whileHover={{ scale: 1.02 }} style={{ flex: 2, minWidth: 280, padding: 22, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white', border: 'none', borderRadius: 20, fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Play size={24} fill="white" /> CALL NEXT IN LINE
          </motion.button>
          <motion.button onClick={() => handleAction('skipCustomer')} whileHover={{ scale: 1.02 }} style={{ flex: 1, minWidth: 200, padding: 22, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, fontWeight: 800, cursor: 'pointer' }}>
            SKIP
          </motion.button>
          <motion.button onClick={() => window.confirm("Reset all queue data?") && handleAction('resetQueue')} style={{ padding: '0 24px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, cursor: 'pointer' }}>
             <RotateCcw size={18} />
          </motion.button>
        </div>
      </div>

      {/* MODAL: QR Scanner */}
      <AnimatePresence>
        {showScanner && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowScanner(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ ...card, width: '100%', maxWidth: 450, position: 'relative', background: '#0f172a', padding: 24 }}>
              <button onClick={() => setShowScanner(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', zIndex: 10 }}><X size={24} /></button>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>Scan Customer Token</h3>
              <div id="reader" style={{ width: '100%', borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(168,85,247,0.3)', background: 'black' }}></div>
              <p style={{ textAlign: 'center', color: 'rgba(148,163,184,0.6)', fontSize: '0.85rem', marginTop: 20 }}>Point your camera at the customer's QR code</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: QR Code View */}
      <AnimatePresence>
        {showQrModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQrModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ ...card, width: '100%', maxWidth: 400, position: 'relative', background: 'white', textAlign: 'center', padding: '40px 32px' }}>
              <button onClick={() => setShowQrModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
              
              <div style={{ marginBottom: 24 }}>
                 <div style={{ width: 44, height: 44, background: 'rgba(168,85,247,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <QrIcon size={24} color="#a855f7" />
                 </div>
                 <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{shopName || "Queue Dashboard"}</h2>
                 <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Scan this code to join the queue</p>
              </div>

              <div style={{ background: '#f8f9fa', padding: 24, borderRadius: 24, marginBottom: 24, display: 'inline-block' }}>
                <QRCodeSVG 
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ textAlign: 'left' }}>
                   <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Shop ID</div>
                   <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{shopId}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(shopId); toast.success("ID Copied!"); }} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Copy ID</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                 <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, cursor: 'pointer' }}>
                   <Printer size={16} /> Print
                 </button>
                 <a href={shareUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 14, fontWeight: 700, textDecoration: 'none' }}>
                   <ExternalLink size={16} /> Visit Link
                 </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSlotModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSlotModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ ...card, width: '100%', maxWidth: 440, position: 'relative', background: '#0f172a', border: '1px solid rgba(168,85,247,0.3)' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'white' }}>Define Availability</h2>
                <div style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, marginTop: 8 }}>
                   {shopId} Management
                </div>
              </div>
              
              <form onSubmit={handleCreateSlot}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Pick Date</label>
                  <input type="date" value={slotForm.date} onChange={e => setSlotForm(p=>({...p, date: e.target.value}))} style={{...inputStyle, background: '#020617'}} min={new Date().toLocaleDateString('en-CA')} required />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Time Window</label>
                  <select value={slotForm.timeRange} onChange={e => setSlotForm(p=>({...p, timeRange: e.target.value}))} style={{...inputStyle, background: '#020617'}}>
                    {["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 30 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Max Capacity</label>
                  <input type="number" value={slotForm.capacity} onChange={e => setSlotForm(p=>({...p, capacity: parseInt(e.target.value)}))} style={{...inputStyle, background: '#020617'}} min="1" required />
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} style={{ width: '100%', padding: 20, background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(168,85,247,0.4)' }}>
                  {loading ? "SAVING..." : "CONFIRM & PUBLISH"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
