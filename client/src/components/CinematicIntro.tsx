import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);

  useEffect(() => {
    if (isSkipping) return;

    const timings = [3000, 3500, 3500, 3500, 4000, 2500];
    
    if (phase < 6) {
      const timer = setTimeout(() => {
        setPhase(phase + 1);
      }, timings[phase] || 3000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [phase, isSkipping, onComplete]);

  const handleSkip = () => {
    setIsSkipping(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-50 text-white/50 hover:text-white text-sm tracking-widest uppercase transition-colors"
          data-testid="button-skip-intro"
        >
          Overslaan
        </button>

        <div className="absolute bottom-6 left-6 z-50">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="h-0.5 w-8 rounded-full"
                initial={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                animate={{
                  backgroundColor: phase >= i ? "rgba(208,167,96,1)" : "rgba(255,255,255,0.2)",
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>

        {/* Phase 0: Opening - Sound waves */}
        <AnimatePresence>
          {phase === 0 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-[#d0a760]/30"
                    style={{
                      width: 100 + i * 80,
                      height: 100 + i * 80,
                      left: -(50 + i * 40),
                      top: -(50 + i * 40),
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [0.8, 1.2, 0.8], 
                      opacity: [0, 0.6, 0] 
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Volume2 className="w-12 h-12 text-[#d0a760]" />
                </motion.div>
              </div>
              <motion.p
                className="absolute bottom-1/3 text-white/60 text-lg tracking-[0.3em] uppercase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
              >
                Geluid voelen
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1: Precision / Craftsmanship */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative w-80 h-80">
                <motion.div
                  className="absolute inset-0 border border-[#d0a760]/20 rounded-full"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-8 border border-[#d0a760]/40 rounded-full"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: -360 }}
                  transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
                />
                <motion.div
                  className="absolute inset-16 border-2 border-[#d0a760]/60 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="w-1 h-16 bg-gradient-to-b from-transparent via-[#d0a760] to-transparent mx-auto mb-4"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.5, duration: 0.8 }}
                    />
                    <p className="text-[#d0a760] text-sm tracking-[0.4em] uppercase">Precisie</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: Premium Materials */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="absolute w-[200%] h-1 bg-gradient-to-r from-transparent via-[#d0a760] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-1 h-[200%] bg-gradient-to-b from-transparent via-[#d0a760]/50 to-transparent"
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
              />
              <div className="grid grid-cols-3 gap-8">
                {["Alpine", "Audison", "OEM"].map((brand, i) => (
                  <motion.div
                    key={brand}
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.3, duration: 0.8 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-3 border border-[#d0a760]/30 rounded-lg flex items-center justify-center">
                      <motion.div
                        className="w-2 h-2 bg-[#d0a760] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    </div>
                    <p className="text-white/60 text-xs tracking-[0.2em] uppercase">{brand}</p>
                  </motion.div>
                ))}
              </div>
              <motion.p
                className="absolute bottom-1/4 text-white/40 text-sm tracking-[0.3em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
              >
                Premium kwaliteit
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3: Installation Excellence */}
        <AnimatePresence>
          {phase === 3 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative">
                <svg width="300" height="200" viewBox="0 0 300 200" className="overflow-visible">
                  <motion.path
                    d="M 50 150 Q 100 50 150 100 Q 200 150 250 80"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d0a760" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#d0a760" stopOpacity="1" />
                      <stop offset="100%" stopColor="#d0a760" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <motion.circle
                    cx="50"
                    cy="150"
                    r="4"
                    fill="#d0a760"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  <motion.circle
                    cx="150"
                    cy="100"
                    r="4"
                    fill="#d0a760"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  />
                  <motion.circle
                    cx="250"
                    cy="80"
                    r="4"
                    fill="#d0a760"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  />
                </svg>
                <motion.p
                  className="text-center mt-8 text-white/60 text-sm tracking-[0.3em] uppercase"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                >
                  Fabriekskwaliteit installatie
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: The Experience */}
        <AnimatePresence>
          {phase === 4 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative">
                <motion.div
                  className="w-64 h-40 border border-[#d0a760]/20 rounded-2xl relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d0a760]/20 via-[#d0a760] to-[#d0a760]/20"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[#d0a760] rounded-full"
                        animate={{
                          height: [8, 20 + Math.random() * 30, 8],
                        }}
                        transition={{
                          duration: 0.8 + Math.random() * 0.4,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
                <motion.p
                  className="text-center mt-8 text-white/80 text-lg tracking-[0.2em]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                >
                  Beleef het verschil
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 5: Brand Reveal */}
        <AnimatePresence>
          {phase === 5 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                >
                  <motion.h1
                    className="text-4xl md:text-6xl font-light text-white tracking-wider"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1 }}
                  >
                    Car Audio
                  </motion.h1>
                  <motion.h1
                    className="text-4xl md:text-6xl font-light text-[#d0a760] tracking-wider"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1 }}
                  >
                    Limburg
                  </motion.h1>
                </motion.div>
                <motion.div
                  className="w-24 h-px bg-gradient-to-r from-transparent via-[#d0a760] to-transparent mx-auto mb-6"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
                <motion.p
                  className="text-white/60 text-sm tracking-[0.4em] uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                >
                  De specialist in premium car audio
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
