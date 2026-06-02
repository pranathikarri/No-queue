import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { loginWithGoogle, loginAsGuest } = useAuth();

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 30% 30%, #1e1b4b 0%, #020617 60%)',
    }}>
      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40%', height: '40%',
        background: 'rgba(168,85,247,0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '40%', height: '40%',
        background: 'rgba(236,72,153,0.12)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          padding: '48px 40px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 64, height: 64,
          background: 'rgba(168,85,247,0.15)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          border: '1px solid rgba(168,85,247,0.3)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          margin: '0 0 8px',
          fontFamily: "'Outfit', system-ui, sans-serif",
          background: 'linear-gradient(135deg, #ffffff, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Welcome Back
        </h2>
        <p style={{ color: 'rgba(148,163,184,0.8)', marginBottom: 32, fontSize: '0.95rem' }}>
          Sign in to NoQueue to manage your turns effortlessly.
        </p>

        {/* Google Sign In */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: '#f0f0f0' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: '#ffffff',
            color: '#1e293b',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            marginBottom: 12,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: 20, height: 20 }}
          />
          Sign in with Google
        </motion.button>

        {/* Guest Login */}
        <motion.button
          whileHover={{ scale: 1.02, background: 'rgba(168,85,247,0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={loginAsGuest}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'rgba(168,85,247,0.12)',
            color: '#c084fc',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Continue as Guest
        </motion.button>

        <p style={{ marginTop: 24, fontSize: '0.75rem', color: 'rgba(100,116,139,0.7)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
