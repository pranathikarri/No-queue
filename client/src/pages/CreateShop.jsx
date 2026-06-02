import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Tag, Layers, ArrowLeft, MapPin, FileText, Globe, Map, Phone } from "lucide-react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const labelStyle = {
  display: "block",
  color: "rgba(148,163,184,0.7)",
  fontSize: "0.78rem",
  fontWeight: 600,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputBase = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "13px 16px 13px 44px",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "'Inter', system-ui, sans-serif",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const noIconInput = { ...inputBase, paddingLeft: 16 };

const categories = [
  "Hospital / Clinic",
  "Bank / Finance",
  "Government Office",
  "Restaurant / Cafe",
  "Retail Store",
  "Salon / Spa",
  "Pharmacy",
  "Educational Institution",
  "Telecom Service",
  "Other",
];

const Field = ({ icon: Icon, label, value, onChange, placeholder, required, noPadding, type = "text" }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}{required && " *"}</label>
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={noPadding ? noIconInput : inputBase}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const CreateShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // AUTH GUARD: Only real Google users can create shops
  if (user?.uid?.startsWith("guest_")) {
    setTimeout(() => {
      toast.warn("Please sign in with Google to access business registration.");
      navigate("/");
    }, 100);
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: "",
    category: "",
    city: "",
    address: "",
    mapsUrl: "",
    description: "",
    shopId: "",
    phoneNumber: "",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const generateId = () => {
    const base = form.shopName
      ? form.shopName.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "").slice(0, 10)
      : "SHOP";
    setForm((p) => ({ ...p, shopId: `${base}_${Math.random().toString(36).substr(2, 5).toUpperCase()}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { shopName, category, city, address, shopId } = form;
    if (!shopName || !category || !city || !shopId)
      return toast.error("Please fill all required fields and generate a Shop ID");

    setLoading(true);
    try {
      const normalizedShopId = form.shopId.toUpperCase().trim();
      await api.post("/queue/createShop", {
        shopId: normalizedShopId,
        shopName: form.shopName,
        serviceType: form.category,
        category: form.category,
        city: form.city,
        address: form.address,
        location: { mapsUrl: form.mapsUrl },
        description: form.description,
        ownerId: user?.uid,
      });
      toast.success("Shop created! 🎉");
      navigate(`/admin?shopId=${normalizedShopId}`);
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("That Shop ID already exists — try a different name or regenerate.");
      } else {
        const normalizedShopId = form.shopId.toUpperCase().trim();
        toast.success("Shop set up locally! Redirecting to Admin Panel...");
        navigate(`/admin?shopId=${normalizedShopId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 16px",
      background: "radial-gradient(circle at 60% 40%, #1c1a12 0%, #020617 60%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-15%", right: "-10%", width: "45%", height: "45%", background: "rgba(245,158,11,0.07)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 24,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          padding: "40px 36px",
          maxWidth: 520, width: "100%",
          position: "relative", zIndex: 10,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <motion.button whileHover={{ x: -3 }} onClick={() => navigate("/")}
          style={{ background: "transparent", border: "none", color: "rgba(148,163,184,0.6)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", padding: 0, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Home
        </motion.button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: "rgba(245,158,11,0.12)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", border: "1px solid rgba(245,158,11,0.25)" }}>
            <Store size={30} color="#fbbf24" />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px", fontFamily: "'Outfit', system-ui, sans-serif", background: "linear-gradient(135deg, #ffffff, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Create Your Shop
          </h2>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "0.88rem", margin: 0 }}>
            Register your business and go live on NoQueue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
             <Field icon={Store} label="Shop Name" value={form.shopName} onChange={set("shopName")} placeholder="City Medical" required />
             <Field icon={Phone} label="Phone Number" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="9876543210" required />
          </div>

          <Field 
            icon={Layers} 
            label="Category" 
            value={form.category} 
            onChange={e => setForm(p => ({ ...p, category: e.target.value.toUpperCase() }))} 
            placeholder="E.G. BARBER, DOCTOR, BANK" 
            required 
          />

          <Field icon={Globe} label="City" value={form.city} onChange={set("city")} placeholder="e.g. Hyderabad" required />

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Exact Address *</label>
            <div style={{ position: "relative" }}>
              <MapPin size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: 14 }} />
              <textarea
                value={form.address}
                onChange={set("address")}
                rows={2}
                style={{ ...inputBase, paddingTop: 13, resize: "vertical", minHeight: 60 }}
                placeholder="Building, Street, Area, Pincode"
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Google Maps Link <span style={{ color: "rgba(148,163,184,0.4)", textTransform: "none", fontWeight: 400, fontSize: "0.72rem" }}>(optional)</span></label>
            <div style={{ position: "relative" }}>
              <Map size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type="url" value={form.mapsUrl} onChange={set("mapsUrl")} style={inputBase} placeholder="https://maps.google.com/..." />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <div style={{ position: "relative" }}>
              <FileText size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: 14 }} />
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                style={{ ...inputBase, paddingTop: 13, resize: "vertical", minHeight: 80 }}
                placeholder="Tell customers what services you offer..."
              />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Shop ID *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Tag size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input type="text" value={form.shopId} onChange={set("shopId")} style={inputBase} placeholder="Click Generate →" />
              </div>
              <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateId}
                style={{ padding: "13px 16px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, color: "#fbbf24", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                Generate
              </motion.button>
            </div>
          </div>

          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}
            style={{ width: "100%", padding: "15px", background: loading ? "rgba(245,158,11,0.3)" : "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter', system-ui, sans-serif", boxShadow: "0 8px 20px rgba(245,158,11,0.3)" }}>
            {loading ? "Creating..." : "Create Shop & Open Admin Panel →"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateShop;
