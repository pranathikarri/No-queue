import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingIntro from "./components/LandingIntro";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JoinQueue from "./pages/JoinQueue";
import UserPortal from "./pages/UserPortal";
import CreateShop from "./pages/CreateShop";
import FindShops from "./pages/FindShops";
import OrgLanding from "./pages/OrgLanding";
import OrgCreateJoin from "./pages/OrgCreateJoin";
import OrgUserEntrance from "./pages/OrgUserEntrance";
import OrgDashboard from "./pages/OrgDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { user, loading } = useAuth();

  if (showIntro) {
    return <LandingIntro onComplete={() => setShowIntro(false)} />;
  }

  if (loading) return null;

  return (
    <Router>
      <div style={{ minHeight: "100vh" }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/join" element={<JoinQueue />} />
          <Route path="/user-portal" element={<UserPortal />} />

          {/* Protected routes — redirect to /login if not signed in */}
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/create-shop" element={user ? <CreateShop /> : <Navigate to="/login" />} />
          <Route path="/find-shops" element={user ? <FindShops /> : <Navigate to="/login" />} />
          <Route path="/org" element={user ? <OrgLanding /> : <Navigate to="/login" />} />
          <Route path="/org/setup" element={user ? <OrgCreateJoin /> : <Navigate to="/login" />} />
          <Route path="/org/user-entrance" element={user ? <OrgUserEntrance /> : <Navigate to="/login" />} />
          <Route path="/org/dashboard/:orgId" element={user ? <OrgDashboard /> : <Navigate to="/login" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer theme="dark" position="bottom-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
