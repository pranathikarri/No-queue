import { motion } from "framer-motion";

const LandingIntro = ({ onComplete }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      overflow: 'hidden'
    }}>
      {/* Background Particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              height: 3, width: 3,
              borderRadius: '50%',
              background: 'rgba(168,85,247,0.6)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: [0, 1, 1, 1, 0],
          scale: [0.8, 1.05, 1, 1, 1.1],
          y: [20, 0, 0, 0, -20],
        }}
        transition={{
          duration: 3,
          times: [0, 0.25, 0.5, 0.8, 1],
          ease: "easeInOut"
        }}
        onAnimationComplete={onComplete}
        style={{ textAlign: 'center' }}
      >
        <motion.h1
          style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}
          animate={{
            filter: [
              "drop-shadow(0 0 10px rgba(168,85,247,0.5))",
              "drop-shadow(0 0 30px rgba(168,85,247,0.9))",
              "drop-shadow(0 0 10px rgba(168,85,247,0.5))",
            ],
            y: [-8, 8, -8]
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 1.5, repeat: Infinity }
          }}
        >
          No Queue Today
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: 3, times: [0, 0.4, 0.8, 1] }}
          style={{
            color: 'rgba(148,163,184,0.8)',
            marginTop: 16,
            fontSize: '1.1rem',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          AI Smart Queue Management
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingIntro;
