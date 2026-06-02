import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, Clock, ArrowLeft, ArrowRight, 
  MapPin, RefreshCw, ChevronRight, Info
} from "lucide-react";
import { api } from "../utils/api";
import { toast } from "react-toastify";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1
  }}>
    <div style={{ background: `${color}15`, padding: 8, borderRadius: 10, border: `1px solid ${color}30` }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', fontWeight: 800 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'white' }}>{value}</p>
    </div>
  </div>
);

const OrgDashboard = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [orgInfo, setOrgInfo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedOrg = JSON.parse(sessionStorage.getItem("currentOrg"));
      setOrgInfo(storedOrg);
      
      const { data } = await api.get(`/org/departments/${orgId}`);
      setDepartments(data);
    } catch (err) {
      toast.error("Failed to load institution data. Please login again.");
      navigate("/org/user-entrance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 60% 0%, #1e1b4b 0%, #020617 80%)',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
           <button onClick={() => navigate("/org/user-entrance")} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '8px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Exit Portal
           </button>
           <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '8px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
           </button>
        </div>

        <div style={{ marginBottom: 48, textAlign: 'center' }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(96,165,250,0.1)', padding: '10px 20px', borderRadius: 14, border: '1px solid rgba(96,165,250,0.2)', marginBottom: 20 }}>
              <Building2 size={24} color="#60a5fa" />
              <span style={{ fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institution Dashboard</span>
           </div>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{orgInfo?.name || "Loading..."}</h1>
           <p style={{ color: 'rgba(148,163,184,0.6)', marginTop: 8 }}>{departments.length} departments currently serving.</p>
        </div>

        {/* Dept List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           {departments.map((dept, i) => (
             <motion.div
               key={dept.shopId}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               style={{
                 background: 'rgba(255,255,255,0.03)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,0.08)',
                 borderRadius: 24,
                 padding: 28,
                 transition: 'all 0.3s ease',
                 cursor: 'pointer'
               }}
               whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(96,165,250,0.4)' }}
               onClick={() => navigate(`/join?shopId=${dept.shopId}`)}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                   <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>{dept.shopName}</h3>
                      <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: '4px 0 0' }}>{dept.category}</p>
                   </div>
                   <div style={{ background: 'rgba(96,165,250,0.1)', padding: '8px 16px', borderRadius: 10, color: '#60a5fa', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Join Queue <ChevronRight size={14} />
                   </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                   <StatCard icon={Users} label="People Waiting" value={dept.waitingCount} color="#60a5fa" />
                   <StatCard icon={Clock} label="Est. Wait Time" value={`${dept.waitingCount * 5} min`} color="#f59e0b" />
                </div>
             </motion.div>
           ))}

           {!loading && departments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 28, border: '1px dashed rgba(255,255,255,0.1)' }}>
                 <Info size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                 <p style={{ color: 'rgba(148,163,184,0.4)' }}>No departments are currently active for this institution.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default OrgDashboard;
