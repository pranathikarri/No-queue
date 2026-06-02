import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 16,
  padding: '18px 20px',
  color: 'white',
  fontSize: '1.2rem',
  textAlign: 'center',
  letterSpacing: '0.2em',
  outline: 'none',
  fontFamily: "'Courier New', Courier, monospace",
  fontWeight: 'bold',
  boxSizing: 'border-box'
};

const OrgUserEntrance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!orgId || !accessCode) return toast.warning("Please enter both credentials.");

    setLoading(true);
    try {
      const { data } = await api.post("/org/lookup", { 
        orgId, 
        accessCode
      });
      sessionStorage.setItem("currentOrg", JSON.stringify(data));
      toast.success(`Welcome to ${data.name}!`);
      navigate(`/org/dashboard/${data.orgId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)',
      padding: '40px 20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 420, width: '100%' }}>
        
        <button onClick={() => navigate("/org")} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto 32px' }}>
          <ArrowLeft size={18} /> Cancel and Exit
        </button>

        <div style={{ 
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28,
          padding: '40px 32px', textAlign: 'center'
        }}>
           <div style={{ width: 64, height: 64, background: 'rgba(96,165,250,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(96,165,250,0.2)' }}>
              <Lock size={28} color="#60a5fa" />
           </div>

           <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px' }}>Security Check</h1>
           <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.5 }}>
              Enter the unique credentials provided by your institution to unlock its private services.
           </p>

           <form onSubmit={handleLookup}>
              <div style={{ marginBottom: 20 }}>
                 <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em' }}>Organization ID</label>
                 <input 
                    style={inputStyle} 
                    placeholder="E.G. MIT_LIB" 
                    value={orgId} 
                    onChange={e => setOrgId(e.target.value.toUpperCase())}
                    autoFocus
                 />
              </div>

              <div style={{ marginBottom: 32 }}>
                 <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em' }}>Organisation PIN</label>
                 <input 
                    type="password" 
                    style={inputStyle} 
                    placeholder="••••" 
                    value={accessCode} 
                    onChange={e => setAccessCode(e.target.value)}
                 />
              </div>

              <button disabled={loading} type="submit" style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', color: 'white', border: 'none', borderRadius: 18, fontWeight: 900, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 30px rgba(59,130,246,0.3)' }}>
                {loading ? "VERIFYING..." : <><ArrowRight size={20} /> ENTER PORTAL</>}
              </button>
           </form>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', opacity: 0.5 }}>
           <ShieldAlert size={14} />
           <span style={{ fontSize: '0.75rem' }}>Encrypted Institutional Gateway</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OrgUserEntrance;
