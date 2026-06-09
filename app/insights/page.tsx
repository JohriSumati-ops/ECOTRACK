"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const firebaseConfig = {
  apiKey: "AIzaSyBvp7ToXJ8TrnjhI0dYvWYZ2WT6DIZyx6Q",
  authDomain: "carbon-app-5d418.firebaseapp.com",
  projectId: "carbon-app-5d418",
  storageBucket: "carbon-app-5d418.firebasestorage.app",
  messagingSenderId: "288264505101",
  appId: "1:288264505101:web:d82ce76051e682c28d5244",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const PERSONA_META: Record<string, { label: string; emoji: string; gradient: string; description: string }> = {
  urban_commuter:     { label: "Urban Commuter",     emoji: "🚇", gradient: "from-blue-600 to-blue-900",     description: "You move fast. Your commute is your biggest opportunity." },
  budget_saver:       { label: "Budget Saver",        emoji: "💰", gradient: "from-yellow-500 to-yellow-800", description: "Smart with money. Green choices that save cash too." },
  busy_professional:  { label: "Busy Professional",   emoji: "💼", gradient: "from-purple-600 to-purple-900", description: "Time is your currency. Quick wins are your superpower." },
  conscious_beginner: { label: "Conscious Beginner",  emoji: "🌱", gradient: "from-green-600 to-green-900",   description: "Every expert was once a beginner. You're already ahead." },
  eco_enthusiast:     { label: "Eco Enthusiast",      emoji: "🌍", gradient: "from-emerald-500 to-emerald-900", description: "You care deeply. Channel that into lasting habits." },
  convenience_seeker: { label: "Convenience Seeker",  emoji: "⚡", gradient: "from-orange-500 to-orange-900", description: "You want results without friction. We've got you." },
};

const SLIDES = [
  "intro",
  "footprint",
  "biggest_source",
  "persona",
  "potential",
  "cta",
];

export default function Insights() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || !userData) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-5xl"
        >
          🌿
        </motion.div>
      </main>
    );
  }

  const persona = userData.top_persona || "conscious_beginner";
  const personaMeta = PERSONA_META[persona];
  const co2 = userData.monthly_kg_co2 || 220;
  const breakdown = userData.carbon_breakdown || { transport: 40, food: 35, energy: 25 };
  const insight = userData.insight || "Start small — every action compounds.";

  const biggestSource = Object.entries(breakdown).sort((a: any, b: any) => b[1] - a[1])[0][0];
  const potentialSaving = Math.round(co2 * 0.3);
  const yearlyKg = co2 * 12;

  const nextSlide = () => {
    if (slide < SLIDES.length - 1) setSlide(slide + 1);
  };

  const slideContent: Record<string, JSX.Element> = {
    intro: (
      <SlideWrapper gradient="from-[#0a0a0a] to-[#1a2a1a]" onClick={nextSlide}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-green-500 text-sm font-bold uppercase tracking-widest mb-4"
        >
          Your Eco Wrapped 🌿
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white text-5xl font-black leading-tight text-center"
        >
          Let's talk about your <span className="text-green-400">carbon story</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-400 mt-6 text-center"
        >
          Tap anywhere to continue
        </motion.p>
      </SlideWrapper>
    ),

    footprint: (
      <SlideWrapper gradient="from-[#0a0a0a] to-[#1a0a2a]" onClick={nextSlide}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4"
        >
          Your footprint
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 text-xl text-center mb-4"
        >
          You're producing about
        </motion.p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <span className="text-green-400 text-8xl font-black">{co2}</span>
          <p className="text-white text-2xl font-bold mt-2">kg CO₂ per month</p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-gray-500 text-center mt-6"
        >
          That's <span className="text-white font-bold">{yearlyKg.toLocaleString()} kg</span> per year
        </motion.p>
      </SlideWrapper>
    ),

    biggest_source: (
      <SlideWrapper gradient="from-[#0a0a0a] to-[#2a1a0a]" onClick={nextSlide}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-orange-400 text-sm font-bold uppercase tracking-widest mb-4"
        >
          Biggest source
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 text-xl text-center mb-6"
        >
          Your #1 carbon driver is
        </motion.p>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="text-center"
        >
          <span className="text-8xl">
            {biggestSource === "transport" ? "🚗" : biggestSource === "food" ? "🍽️" : "⚡"}
          </span>
          <p className="text-white text-4xl font-black mt-4 capitalize">{biggestSource}</p>
          <p className="text-orange-400 text-xl mt-2">{breakdown[biggestSource]}% of your emissions</p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-gray-500 text-center mt-6 text-sm max-w-xs"
        >
          "{insight}"
        </motion.p>
      </SlideWrapper>
    ),

    persona: (
      <SlideWrapper gradient={`from-[#0a0a0a] to-[#0a1a0a] bg-gradient-to-b`} onClick={nextSlide}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4"
        >
          Your eco persona
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 text-xl text-center mb-6"
        >
          You are a...
        </motion.p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
          className={`bg-gradient-to-br ${personaMeta.gradient} rounded-3xl p-8 text-center mx-4`}
        >
          <span className="text-7xl">{personaMeta.emoji}</span>
          <p className="text-white text-3xl font-black mt-4">{personaMeta.label}</p>
          <p className="text-white/70 text-sm mt-3">{personaMeta.description}</p>
        </motion.div>
      </SlideWrapper>
    ),

    potential: (
      <SlideWrapper gradient="from-[#0a0a0a] to-[#0a2a1a]" onClick={nextSlide}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4"
        >
          Your potential
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 text-xl text-center mb-4"
        >
          With EcoTrack habits, you could save
        </motion.p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="text-center"
        >
          <span className="text-green-400 text-8xl font-black">{potentialSaving}</span>
          <p className="text-white text-2xl font-bold mt-2">kg CO₂ per month</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 bg-[#141414] border border-green-900 rounded-2xl p-4 mx-4"
        >
          <p className="text-green-400 text-center text-sm">
            That's like planting <span className="font-black text-white text-lg">{Math.round(potentialSaving / 21)} trees</span> every month 🌳
          </p>
        </motion.div>
      </SlideWrapper>
    ),

    cta: (
      <SlideWrapper gradient="from-[#0a1a0a] to-[#0a0a0a]" onClick={() => {}}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-center"
        >
          <span className="text-7xl">🌿</span>
          <h2 className="text-white text-4xl font-black mt-6 leading-tight">
            Ready to start your journey?
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Your actions are waiting on the dashboard.
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard")}
          className="mt-10 bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-4 rounded-full text-lg transition-colors"
        >
          Go to my Dashboard →
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-600 text-xs mt-4"
        >
          Slide {slide + 1} of {SLIDES.length}
        </motion.p>
      </SlideWrapper>
    ),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Progress dots */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === slide ? 24 : 8, opacity: i <= slide ? 1 : 0.3 }}
            className="h-1.5 bg-green-500 rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          {slideContent[SLIDES[slide]]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SlideWrapper({
  children,
  gradient,
  onClick,
}: {
  children: React.ReactNode;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`min-h-screen bg-gradient-to-b ${gradient} flex flex-col items-center justify-center px-6 cursor-pointer`}
    >
      {children}
    </div>
  );
}