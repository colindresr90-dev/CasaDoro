import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
      >
        {children}
      </motion.div>
      
      {/* Cinematic Curtain Wipe */}
      <motion.div
        className="curtain"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#1A1A1A', // Obsidian
          zIndex: 10000,
          transformOrigin: 'top',
          pointerEvents: 'none'
        }}
      />
      <motion.div
        className="curtain-reveal"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#1A1A1A',
          zIndex: 10000,
          transformOrigin: 'bottom',
          pointerEvents: 'none'
        }}
      />
    </>
  );
};

export default PageTransition;
