import { motion } from "framer-motion";
import { User, Shield, PlusCircle, ArrowLeft, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 24,
  padding: '40px 32px',
  cursor: 'pointer',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  transition: 'all 0.3s ease',
};

const OrgLanding = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: "Enter Organisation Portal",
      desc: "View all departments, waiting times, and people in queue.",
      icon: User,
      color: "#60a5fa",
      path: "/org/user-entrance"
    },
    {
      title: "Create Organisation / Dept",
      desc: "Register a new master institution or link a service counter.",
      icon: PlusCircle,
      color: "#10b981",
      path: "/org/setup"
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #0c0a1f 0%, #020617 80%)',
      padding: '60px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => navigate("/")}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 20px', color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto 24px'
            }}
          >
            <ArrowLeft size={18} /> Back to Home
          </motion.button>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(168,85,247,0.1)', padding: '12px 24px', borderRadius: 20, border: '1px solid rgba(168,85,247,0.2)', marginBottom: 20 }}>
            <Building2 size={24} color="#a855f7" />
            <span style={{ fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Portal</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Choose Your Path</h1>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '1.1rem', marginTop: 12 }}>Specialized queue management for organizations and institutions.</p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {options.map((opt, i) => (
            <motion.div
              key={opt.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)', borderColor: opt.color }}
              onClick={() => navigate(opt.path)}
              style={cardStyle}
            >
              <div style={{ 
                width: 72, height: 72, borderRadius: 20, 
                background: `${opt.color}15`, border: `1px solid ${opt.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8
              }}>
                <opt.icon size={32} color={opt.color} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>{opt.title}</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>{opt.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default OrgLanding;
