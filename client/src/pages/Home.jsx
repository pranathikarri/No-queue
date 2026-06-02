import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, ShieldCheck, PlusCircle, LogOut, Building2 } from "lucide-react";
import QueueToken3D from "../components/QueueToken3D";

const options = [
  {
    id: "user",
    title: "User Portal",
    description: "Join queues, check your status, and find nearby shops for a seamless experience.",
    icon: <User size={36} />,
    route: "/user-portal",
    gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
    glow: "rgba(168,85,247,0.4)",
    border: "rgba(168,85,247,0.3)",
    iconBg: "rgba(168,85,247,0.2)",
    iconColor: "#c084fc",
  },
  {
    id: "admin",
    title: "Admin Dashboard",
    description: "Manage your existing shop, call next customers, and define availability slots.",
    icon: <ShieldCheck size={36} />,
    route: "/admin",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.4)",
    border: "rgba(16,185,129,0.3)",
    iconBg: "rgba(16,185,129,0.2)",
    iconColor: "#34d399",
  },
  {
    id: "create",
    title: "Create a Shop",
    description: "New here? Register your business on NoQueue and start managing your first queue.",
    icon: <PlusCircle size={36} />,
    route: "/create-shop",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.4)",
    border: "rgba(245,158,11,0.3)",
    iconBg: "rgba(245,158,11,0.2)",
    iconColor: "#fbbf24",
  },
  {
    id: "org",
    title: "Create Organisation / Department",
    description: "Launch institutional networks or link new service departments.",
    icon: <Building2 size={36} />,
    route: "/org",
    gradient: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    glow: "rgba(59,130,246,0.4)",
    border: "rgba(59,130,246,0.3)",
    iconBg: "rgba(59,130,246,0.15)",
    iconColor: "#60a5fa",
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

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 40% 20%, #1e1b4b 0%, #020617 65%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <QueueToken3D />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          position: "relative",
          zIndex: 10,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "0.9rem", color: "white",
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}>NQ</div>
          <span style={{
            fontSize: "1.3rem", fontWeight: 800,
            fontFamily: "'Outfit', system-ui, sans-serif",
            background: "linear-gradient(135deg, #ffffff, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            NoQueue
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt="avatar"
              style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(168,85,247,0.5)" }}
            />
          )}
          <span style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.9rem" }}>
            {user?.displayName || user?.email}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={logout}
            title="Sign Out"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "7px 10px",
              color: "rgba(148,163,184,0.7)", cursor: "pointer",
              display: "flex", alignItems: "center",
            }}
          >
            <LogOut size={17} />
          </motion.button>
        </div>
      </motion.header>

      {/* Hero section */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px", position: "relative", zIndex: 10 }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: "#a855f7", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}
        >
          Welcome Back
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            fontFamily: "'Outfit', system-ui, sans-serif",
            margin: "0 0 12px",
            background: "linear-gradient(135deg, #ffffff 0%, #c084fc 60%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Select Your Portal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: "rgba(148,163,184,0.6)", fontSize: "1rem", margin: 0 }}
        >
          Choose how you would like to proceed today
        </motion.p>
      </div>

      {/* 3 Main Role Option Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 60px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {options.map((opt) => {
          const isCreateShop = opt.id === "create";
          const isGuest = user?.uid?.startsWith("guest_");
          const isDisabled = isCreateShop && isGuest;

          return (
            <motion.div
              key={opt.id}
              variants={cardVariants}
              whileHover={isDisabled ? {} : {
                scale: 1.03,
                boxShadow: `0 30px 60px ${opt.glow}`,
              }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onClick={() => {
                if (isDisabled) {
                  toast.info("Please sign in with Google to create a shop!");
                } else {
                  navigate(opt.route);
                }
              }}
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${opt.border}`,
                borderRadius: 32,
                padding: "48px 32px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 20,
                opacity: isDisabled ? 0.7 : 1,
                position: "relative"
              }}
            >
              {isDisabled && (
                <div style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(245,158,11,0.2)",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: "0.7rem",
                  color: "#fbbf24",
                  fontWeight: 800,
                  border: "1px solid rgba(245,158,11,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <ShieldCheck size={12} /> Google Login Required
                </div>
              )}

              {/* Icon */}
              <div style={{
                width: 80, height: 80,
                background: isDisabled ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${opt.iconBg}, rgba(0,0,0,0.1))`,
                borderRadius: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${opt.border}`,
                color: isDisabled ? "rgba(148,163,184,0.4)" : opt.iconColor,
              }}>
                {opt.icon}
              </div>
  
              <div>
                <h3 style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  margin: "0 0 12px",
                  color: isDisabled ? "rgba(255,255,255,0.7)" : "white",
                }}>
                  {opt.title}
                </h3>
                <p style={{
                  color: "rgba(148,163,184,0.65)",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {opt.description}
                </p>
              </div>
  
              <motion.div
                whileHover={isDisabled ? {} : { x: 4 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: isDisabled ? "rgba(148,163,184,0.4)" : opt.iconColor,
                }}
              >
                {isDisabled ? "Locked for Guests" : "Enter Portal →"}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Home;
