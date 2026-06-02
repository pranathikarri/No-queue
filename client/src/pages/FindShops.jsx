import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowLeft, MapPin, Star, Info, Users,
  Clock, X, ExternalLink, QrCode, ChevronRight, Award, User, Phone
} from "lucide-react";
import { api } from "../utils/api";
import { toast } from "react-toastify";

const categories = [
  "All", "Hospital / Clinic", "Bank / Finance", "Government Office",
  "Restaurant / Cafe", "Retail Store", "Salon / Spa", "Pharmacy",
  "Educational Institution", "Telecom Service", "Other",
];

const StarRating = ({ rating, count }) => {
  const r = parseFloat(rating) || 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= Math.round(r) ? "#fbbf24" : "none"}
          color={s <= Math.round(r) ? "#fbbf24" : "rgba(148,163,184,0.3)"}
        />
      ))}
      <span style={{ color: "#fbbf24", fontSize: "0.8rem", fontWeight: 700, marginLeft: 2 }}>
        {r > 0 ? r.toFixed(1) : "New"}
      </span>
      {count > 0 && (
        <span style={{ color: "rgba(148,163,184,0.5)", fontSize: "0.75rem" }}>({count})</span>
      )}
    </div>
  );
};

// Floating info popup (description or map)
const InfoPopup = ({ title, children, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backdropFilter: "blur(4px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(15,23,42,0.98)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 20,
          padding: "28px 28px 24px",
          maxWidth: 460, width: "100%",
          boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "white", fontWeight: 800, margin: 0, fontFamily: "'Outfit', system-ui, sans-serif", fontSize: "1.1rem" }}>
            {title}
          </h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "5px 8px", color: "rgba(148,163,184,0.7)", cursor: "pointer", display: "flex" }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// Rate a shop
const RatingInput = ({ shopId, onRated }) => {
  const [hovered, setHovered] = useState(0);
  const [rated, setRated] = useState(false);

  const handleRate = async (val) => {
    if (rated) return;
    try {
      await api.post("/queue/rateShop", { shopId, rating: val });
      setRated(true);
      toast.success("Rating submitted! ⭐");
      onRated();
    } catch { toast.error("Could not submit rating"); }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ color: "rgba(148,163,184,0.5)", fontSize: "0.78rem", marginBottom: 6 }}>
        {rated ? "Thanks for rating!" : "Rate this shop:"}
      </p>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.button key={s} whileHover={{ scale: 1.2 }}
            onClick={() => handleRate(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            disabled={rated}
            style={{ background: "transparent", border: "none", cursor: rated ? "default" : "pointer", padding: 2 }}>
            <Star size={20} fill={s <= (hovered || 0) ? "#fbbf24" : "none"} color={s <= (hovered || 0) ? "#fbbf24" : "rgba(148,163,184,0.3)"} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Individual shop card
const ShopCard = ({ shop, onJoin }) => {
  const [showDesc, setShowDesc] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const rating = shop.avgRating || (shop.rating?.count > 0 ? (shop.rating.total / shop.rating.count).toFixed(1) : null);

  const categoryColors = {
    "Hospital / Clinic": { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.25)" },
    "Bank / Finance": { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
    "Government Office": { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.25)" },
    "Restaurant / Cafe": { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
    "Retail Store": { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
    "Salon / Spa": { bg: "rgba(236,72,153,0.12)", color: "#f472b6", border: "rgba(236,72,153,0.25)" },
    "Pharmacy": { bg: "rgba(20,184,166,0.12)", color: "#2dd4bf", border: "rgba(20,184,166,0.25)" },
  };
  const catStyle = categoryColors[shop.category] || { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: "22px 24px",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Top row: name + info btn */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.05rem", margin: 0, fontFamily: "'Outfit', system-ui, sans-serif" }}>
                {shop.shopName}
              </h3>
              {shop.phoneNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Phone size={12} color="#fbbf24" />
                  <span style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.8rem", fontWeight: 600 }}>{shop.phoneNumber}</span>
                </div>
              )}
              {/* ⓘ Info Button (Description, Doctor, Experience) */}
              {(shop.description || shop.doctorName || shop.experienceYears > 0) && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  title="Show details"
                  onClick={() => setShowDesc(true)}
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "50%", width: 22, height: 22, color: "#c084fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <Info size={13} />
                </motion.button>
              )}
            </div>

            {/* Category badge */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
              <span style={{ padding: "2px 10px", background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                {shop.category}
              </span>
              {shop.organization && (
                <span style={{ padding: "2px 10px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, fontSize: "0.72rem", fontWeight: 800 }}>
                  (Organization: {shop.organization.name})
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <StarRating rating={rating} count={shop.rating?.count} />
          </div>
        </div>

        {/* Address row + map btn */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 10 }}>
          <MapPin size={13} color="rgba(148,163,184,0.5)" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: "rgba(148,163,184,0.65)", fontSize: "0.83rem", flex: 1 }}>
            {shop.address || shop.city}
            {shop.city && shop.address && <span style={{ color: "rgba(148,163,184,0.4)" }}> · {shop.city}</span>}
          </span>
          {/* ⓘ Location Button (Always visible to provide professional context) */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            title="Location Details"
            onClick={() => setShowMap(true)}
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "50%", width: 22, height: 22, color: "#34d399", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Info size={13} />
          </motion.button>
        </div>


        {/* Queue info */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(148,163,184,0.6)", fontSize: "0.8rem" }}>
            <Users size={13} color="#60a5fa" />
            <span><strong style={{ color: "white" }}>{shop.waitingCount ?? 0}</strong> waiting</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(148,163,184,0.6)", fontSize: "0.8rem" }}>
            <Clock size={13} color="#fb923c" />
            <span>~{(shop.waitingCount ?? 0) * 5} min wait</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onJoin(shop.shopId)}
            style={{ flex: 1, padding: "10px 0", background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <QrCode size={15} /> Join Queue
          </motion.button>
          <RatingInput shopId={shop.shopId} onRated={() => setRefresh(r => r + 1)} />
        </div>
      </motion.div>

      {/* Description popup */}
      {showDesc && (
        <InfoPopup title={`About ${shop.shopName}`} onClose={() => setShowDesc(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shop.doctorName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(59,130,246,0.1)', padding: '12px 16px', borderRadius: 14, border: '1px solid rgba(59,130,246,0.2)' }}>
                <User size={20} color="#60a5fa" />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', fontWeight: 800 }}>Consultant</p>
                  <p style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700 }}>{shop.doctorName}</p>
                </div>
              </div>
            )}
            
            {shop.experienceYears > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16,185,129,0.1)', padding: '12px 16px', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)' }}>
                <Award size={20} color="#34d399" />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', fontWeight: 800 }}>Experience</p>
                  <p style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700 }}>{shop.experienceYears} Years</p>
                </div>
              </div>
            )}

            <div style={{ padding: '0 4px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Description / Specialization</p>
              <p style={{ color: "rgba(148,163,184,0.9)", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>
                {shop.description || "No specific details provided."}
              </p>
            </div>
          </div>
        </InfoPopup>
      )}

      {/* Map popup */}
      {showMap && (
        <InfoPopup title="Location" onClose={() => setShowMap(false)}>
          <div style={{ color: "rgba(148,163,184,0.8)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16 }}>
              <MapPin size={16} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: "white" }}>{shop.shopName}</strong>
                <p style={{ margin: "4px 0 0", color: "rgba(148,163,184,0.7)" }}>{shop.address}</p>
                <p style={{ margin: "2px 0 0", color: "rgba(148,163,184,0.5)", fontSize: "0.8rem" }}>{shop.city}</p>
              </div>
            </div>

            {shop.mapsUrl ? (
              <a
                href={shop.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "12px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, color: "#34d399", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}
              >
                <ExternalLink size={16} /> Open in Google Maps
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent((shop.address || "") + " " + (shop.city || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "12px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, color: "#34d399", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}
              >
                <ExternalLink size={16} /> Search on Google Maps
              </a>
            )}
          </div>
        </InfoPopup>
      )}
    </>
  );
};

// ─── Main FindShops page ──────────────────────────────────────────────────────
const FindShops = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (category && category !== "All") params.category = category;
      if (city.trim()) params.city = city.trim();
      const { data } = await api.get("/queue/findShops", { params });
      setResults(data);
      setSearched(true);
      if (data.length === 0) toast.info("No shops found. Try different filters.");
    } catch {
      toast.error("Could not fetch shops. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (shopId) => {
    navigate(`/join?shopId=${shopId}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 30% 30%, #0f1a2e 0%, #020617 65%)",
      padding: "32px 16px",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate("/")}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 10px", color: "rgba(148,163,184,0.7)", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} />
          </motion.button>
          <div>
            <h1 style={{ color: "white", fontWeight: 900, margin: 0, fontSize: "1.8rem", fontFamily: "'Outfit', system-ui, sans-serif" }}>
              Find Shops
            </h1>
            <p style={{ color: "rgba(148,163,184,0.5)", margin: "3px 0 0", fontSize: "0.88rem" }}>
              Search by category and city to discover shops near you
            </p>
          </div>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 20,
            padding: "24px 24px",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {/* Category */}
            <div>
              <label style={{ display: "block", color: "rgba(148,163,184,0.7)", fontSize: "0.75rem", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: "0.9rem", outline: "none", cursor: "pointer", appearance: "none" }}
              >
                {categories.map((c) => <option key={c} value={c} style={{ background: "#0f172a" }}>{c}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label style={{ display: "block", color: "rgba(148,163,184,0.7)", fontSize: "0.75rem", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white", border: "none", borderRadius: 12,
              fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Search size={17} /> {loading ? "Searching..." : "Search Shops"}
          </motion.button>
        </motion.form>

        {/* Results */}
        {searched && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: "white", fontWeight: 700, margin: 0, fontSize: "1rem" }}>
                {results.length > 0 ? `${results.length} shop${results.length !== 1 ? "s" : ""} found` : "No shops found"}
              </h2>
              {results.length > 0 && (
                <span style={{ color: "rgba(148,163,184,0.4)", fontSize: "0.8rem" }}>
                  {category !== "All" ? category : "All categories"} · {city || "All cities"}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {results.map((shop) => (
                <ShopCard key={shop.shopId} shop={shop} onJoin={handleJoin} />
              ))}
            </div>

            {results.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "48px 0", color: "rgba(148,163,184,0.4)" }}>
                <Search size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: "0.95rem" }}>Try searching with different category or city filters.</p>
              </motion.div>
            )}
          </div>
        )}

        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
            style={{ textAlign: "center", padding: "48px 0", color: "rgba(148,163,184,0.3)" }}>
            <Search size={48} style={{ marginBottom: 14, opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Select a category and city, then click Search</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FindShops;
