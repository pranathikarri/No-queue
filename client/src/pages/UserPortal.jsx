import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { QrCode, LayoutDashboard, Search, ArrowLeft } from "lucide-react";

const options = [
  {
    id: "join",
    title: "Join a Queue",
    description: "Scan a QR code or enter a Shop ID to get your queue number instantly.",
    icon: <QrCode size={36} />,
    route: "/join",
    gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
    glow: "rgba(168,85,247,0.4)",
    border: "rgba(168,85,247,0.3)",
    iconBg: "rgba(168,85,247,0.2)",
    iconColor: "#c084fc",
  },
  {
    id: "status",
    title: "My Queue Status",
    description: "Check your live queue position, estimated wait time, and get notified when it's your turn.",
    icon: <LayoutDashboard size={36} />,
    route: "/dashboard",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glow: "rgba(59,130,246,0.4)",
    border: "rgba(59,130,246,0.3)",
    iconBg: "rgba(59,130,246,0.2)",
    iconColor: "#60a5fa",
  },
  {
    id: "find",
    title: "Find Shops",
    description: "Search nearby shops by category and city, see ratings, descriptions, and join their queue.",
    icon: <Search size={36} />,
    route: "/find-shops",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    glow: "rgba(6,182,212,0.4)",
    border: "rgba(6,182,212,0.3)",
    iconBg: "rgba(6,182,212,0.2)",
    iconColor: "#22d3ee",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const UserPortal = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 40% 20%, #0c0a1f 0%, #020617 65%)",
      padding: "40px 16px",
      color: "white"
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Back Button & Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
           <motion.button 
             whileHover={{ x: -4 }}
             onClick={() => navigate("/")}
             style={{ 
               background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
               borderRadius: 12, padding: 10, color: 'white', cursor: 'pointer', display: 'flex' 
             }}
           >
             <ArrowLeft size={20} />
           </motion.button>
           <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, fontFamily: "'Outfit', sans-serif" }}>User Portal</h1>
              <p style={{ color: 'rgba(148,163,184,0.6)', margin: 0 }}>Select a customer service to continue</p>
           </div>
        </div>

        {/* Sub-options Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {options.map((opt) => (
            <motion.div
              key={opt.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 20px 40px ${opt.glow}`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(opt.route)}
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${opt.border}`,
                borderRadius: 24,
                padding: "32px",
                cursor: "pointer",
                transition: "box-shadow 0.3s ease",
              }}
            >
              <div style={{
                width: 60, height: 60,
                background: opt.iconBg,
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: opt.iconColor,
                marginBottom: 20
              }}>
                {opt.icon}
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 10px", color: "white" }}>
                {opt.title}
              </h3>
              <p style={{ color: "rgba(148,163,184,0.65)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                {opt.description}
              </p>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: opt.iconColor }}>
                Start Now →
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default UserPortal;
