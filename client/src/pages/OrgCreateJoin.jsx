import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Plus, Users, ArrowLeft, CheckCircle2, 
  ShieldCheck, Key, ArrowRight, Store, Tag, 
  Layers, MapPin, Globe, FileText, Lock, ShieldAlert, Award, User, Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const categories = [
  "Hospital / Clinic",
  "Bank / Finance",
  "Government Office",
  "Educational Institution",
  "Telecom Service",
  "Billing / Helpdesk",
  "Other",
];

const labelStyle = {
  display: "block",
  color: "rgba(148,163,184,0.7)",
  fontSize: "0.75rem",
  fontWeight: 800,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const inputBase = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: "14px 16px 14px 44px",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s",
};

const noIconInput = { ...inputBase, paddingLeft: 16 };

const Field = ({ icon: Icon, label, value, onChange, placeholder, required, noPadding, type = "text", rows }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={labelStyle}>{label}{required && " *"}</label>
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: rows ? 14 : "50%", transform: rows ? "none" : "translateY(-50%)" }} />}
      {rows ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          style={{ ...inputBase, paddingLeft: Icon ? 44 : 16, paddingTop: 14, resize: "vertical" }}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={noPadding ? noIconInput : inputBase}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  </div>
);

const OrgCreateJoin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [step, setStep] = useState(1); // For Join mode: 1 (Auth), 2 (Create Shop)
  const [loading, setLoading] = useState(false);

  // Form State for Org Creation
  const [orgForm, setOrgForm] = useState({
    name: "",
    orgId: "",
    accessCode: "",
    adminPassword: "",
    description: ""
  });

  // Form State for Department Creation (Joining)
  const [deptForm, setDeptForm] = useState({
    shopId: "",
    shopName: "",
    category: "Other",
    city: "",
    address: "",
    description: "",
    mapsUrl: "",
    doctorName: "",
    experienceYears: "",
    phoneNumber: ""
  });

  // Auth state for Joining
  const [joinAuth, setJoinAuth] = useState({
    orgId: "",
    adminPassword: ""
  });

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/org/create", { ...orgForm, ownerId: user.uid });
      toast.success("Organization Established! Welcome to the network.");
      navigate("/org");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/org/verifyAdmin", joinAuth);
      toast.success(`Connected to ${data.orgName}! Now setup your department.`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials for this organization");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sid = deptForm.shopId.toUpperCase().trim();
      await api.post("/org/createDepartment", {
        ...deptForm,
        shopId: sid,
        orgId: joinAuth.orgId,
        ownerId: user.uid
      });
      toast.success("Department created and secured! Opening management panel...");
      navigate(`/admin?shopId=${sid}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Creation failed. Try a different Department ID.");
    } finally {
      setLoading(false);
    }
  };

  const generateOrgId = () => {
    const base = orgForm.name ? orgForm.name.toUpperCase().replace(/\s+/g, "").slice(0, 8) : "ORG";
    setOrgForm({ ...orgForm, orgId: `${base}_${Math.floor(1000 + Math.random() * 9000)}` });
  };

  const generateDeptId = () => {
    const base = deptForm.shopName ? deptForm.shopName.toUpperCase().replace(/\s+/g, "").slice(0, 8) : "DEPT";
    setDeptForm({ ...deptForm, shopId: `${base}_${Math.floor(100 + Math.random() * 900)}` });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #0c0a1f 0%, #020617 80%)',
      padding: '40px 20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: mode === 'create' || (mode === 'join' && step === 2) ? 600 : 500, width: '100%' }}>
        
        {/* Navigation */}
        <button 
          onClick={() => mode ? (step === 2 ? setStep(1) : setMode(null)) : navigate("/org")} 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 20px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
        >
          <ArrowLeft size={18} /> {mode ? (step === 2 ? "Back to Authentication" : "Back to Choice") : "Back to Portal"}
        </button>

        <AnimatePresence mode="wait">
          {!mode ? (
            <motion.div key="choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                 <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 8 }}>Institutional Gateway</h1>
                 <p style={{ color: 'rgba(148,163,184,0.6)' }}>Define your presence or expand your reach within the organization.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <motion.div 
                  whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                  onClick={() => setMode('create')} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 28, padding: 32, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: 20, borderRadius: 20, border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Building2 size={40} color="#10b981" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Create New Organization</h3>
                      <p style={{ margin: '6px 0 0', color: 'rgba(148,163,184,0.6)', fontSize: '0.95rem', lineHeight: 1.5 }}>Initialize a master entity to manage multiple departments and private queues.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                  onClick={() => setMode('join')} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 28, padding: 32, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ background: 'rgba(96,165,250,0.1)', padding: 20, borderRadius: 20, border: '1px solid rgba(96,165,250,0.2)' }}>
                      <Store size={40} color="#60a5fa" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Join as Department</h3>
                      <p style={{ margin: '6px 0 0', color: 'rgba(148,163,184,0.6)', fontSize: '0.95rem', lineHeight: 1.5 }}>Link a new service counter or office to an existing organization's network.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : mode === 'create' ? (
            <motion.div key="create" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 32, padding: '48px 40px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
                  <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Building2 size={40} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>Onboard Institution</h2>
                    <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '1rem', marginTop: 8 }}>Register your master organization today.</p>
                  </div>

                  <form onSubmit={handleCreateOrg}>
                    <Field icon={Building2} label="Organization Name" value={orgForm.name} onChange={e=>setOrgForm({...orgForm, name: e.target.value})} placeholder="e.g. Apollo Hospitals Group" required />
                    
                    <div style={{ marginBottom: 24 }}>
                      <label style={labelStyle}>Organization ID (Unique Code) *</label>
                      <div style={{ display: 'flex', gap: 12 }}>
                         <div style={{ position: 'relative', flex: 1 }}>
                            <Tag size={16} color="rgba(148,163,184,0.5)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={inputBase} placeholder="e.g. APOLLO_MAIN" value={orgForm.orgId} onChange={e=>setOrgForm({...orgForm, orgId: e.target.value.toUpperCase()})} required />
                         </div>
                         <button type="button" onClick={generateOrgId} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '0 16px', color: '#10b981', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>Generate</button>
                      </div>
                    </div>

                    <Field icon={FileText} label="Description" value={orgForm.description} onChange={e=>setOrgForm({...orgForm, description: e.target.value})} placeholder="Briefly describe your institution..." rows={3} />

                    <div style={{ marginBottom: 24 }}>
                       <Field icon={Lock} type="password" label="Organisation PIN (Password) *" value={orgForm.adminPassword} onChange={e=>setOrgForm({...orgForm, adminPassword: e.target.value})} placeholder="Set a unique password" required />
                       <p style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.7rem', marginTop: -8 }}>This PIN will be used for both administration and user access.</p>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, boxShadow: '0 12px 30px rgba(16,185,129,0.3)' }}>
                      {loading ? "INITIALIZING..." : <><CheckCircle2 size={24} /> ESTABLISH ORGANIZATION</>}
                    </motion.button>
                  </form>
               </div>
            </motion.div>
          ) : (
            <motion.div key="join" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 32, padding: step === 1 ? '48px 40px' : '40px 32px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div key="join-auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                         <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ width: 80, height: 80, background: 'rgba(96,165,250,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(96,165,250,0.2)' }}>
                              <ShieldCheck size={40} color="#60a5fa" />
                            </div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>Organisation Access</h2>
                            <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '1rem', marginTop: 8 }}>Enter PIN to link a new department counter.</p>
                         </div>

                         <form onSubmit={handleVerifyJoin}>
                            <Field icon={Building2} label="Organization ID" value={joinAuth.orgId} onChange={e=>setJoinAuth({...joinAuth, orgId: e.target.value.toUpperCase()})} placeholder="e.g. AP_MAIN" required />
                            <Field icon={Lock} type="password" label="Organisation PIN" value={joinAuth.adminPassword} onChange={e=>setJoinAuth({...joinAuth, adminPassword: e.target.value})} placeholder="••••" required />

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" style={{ width: '100%', padding: '20px', background: '#60a5fa', color: 'white', border: 'none', borderRadius: 16, fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, boxShadow: '0 12px 30px rgba(96,165,250,0.3)' }}>
                               {loading ? "VERIFYING..." : <><ArrowRight size={24} /> ACCESS NETWORK</>}
                            </motion.button>
                         </form>
                      </motion.div>
                    ) : (
                      <motion.div key="join-create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: '0 8px' }}>
                            <div style={{ background: 'rgba(251,191,36,0.1)', padding: 12, borderRadius: 14, border: '1px solid rgba(251,191,36,0.2)' }}>
                              <Store size={24} color="#fbbf24" />
                            </div>
                            <div>
                              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>Setup Department</h2>
                              <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem', margin: 0 }}>Linking to: <b>{joinAuth.orgId}</b></p>
                            </div>
                         </div>

                         <form onSubmit={handleCreateDept} style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 8px' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
                               <Field icon={Store} label="Department Name" value={deptForm.shopName} onChange={e=>setDeptForm({...deptForm, shopName: e.target.value})} placeholder="e.g. Cardiology" required />
                               <Field icon={Phone} label="Department Ph.No" value={deptForm.phoneNumber} onChange={e=>setDeptForm({...deptForm, phoneNumber: e.target.value})} placeholder="9876543210" required />
                            </div>
                               <Field 
                                  icon={Layers} 
                                  label="Category" 
                                  value={deptForm.category} 
                                  onChange={e=>setDeptForm({...deptForm, category: e.target.value.toUpperCase()})} 
                                  placeholder="E.G. PHARMACY" 
                                  required 
                                />


                            <Field icon={Globe} label="City" value={deptForm.city} onChange={e=>setDeptForm({...deptForm, city: e.target.value})} placeholder="e.g. Hyderabad" required />
                            <Field icon={MapPin} label="Exact Address" value={deptForm.address} onChange={e=>setDeptForm({...deptForm, address: e.target.value})} placeholder="Floor, Wing, Building Name" rows={2} required />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                               <Field icon={User} label="Name of the Doctor" value={deptForm.doctorName} onChange={e=>setDeptForm({...deptForm, doctorName: e.target.value})} placeholder="e.g. Dr. Sarah Smith" />
                               <Field icon={Award} type="number" label="Years of Experience" value={deptForm.experienceYears} onChange={e=>setDeptForm({...deptForm, experienceYears: e.target.value})} placeholder="e.g. 12" />
                            </div>
                            <Field icon={FileText} label="Description / Specialization" value={deptForm.description} onChange={e=>setDeptForm({...deptForm, description: e.target.value})} placeholder="e.g. Specialized in Pediatric Cardiology" rows={2} />
                            <Field icon={Globe} label="Google Maps Link" value={deptForm.mapsUrl} onChange={e=>setDeptForm({...deptForm, mapsUrl: e.target.value})} placeholder="https://maps.google.com/..." />

                            <div style={{ marginBottom: 28 }}>
                              <label style={labelStyle}>Department ID *</label>
                              <div style={{ display: "flex", gap: 8 }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                  <Tag size={16} color="rgba(148,163,184,0.5)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                  <input type="text" value={deptForm.shopId} onChange={e=>setDeptForm({...deptForm, shopId: e.target.value.toUpperCase()})} style={inputBase} placeholder="e.g. CARDIO_01" required />
                                </div>
                                <button type="button" onClick={generateDeptId} style={{ padding: "0 16px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 12, color: "#fbbf24", cursor: "pointer", fontWeight: 800, fontSize: "0.8rem", whiteSpace: "nowrap" }}>Generate</button>
                              </div>
                            </div>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" style={{ width: "100%", padding: "18px", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", border: "none", borderRadius: 16, fontWeight: 900, fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 8px 30px rgba(245,158,11,0.3)", marginBottom: 20 }}>
                              {loading ? "LAUNCHING..." : "LAUNCH DEPARTMENT PORTAL →"}
                            </motion.button>
                         </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrgCreateJoin;
