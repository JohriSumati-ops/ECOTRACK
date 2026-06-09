"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

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

// ── Types ──
interface UserProfile {
  personas: Record<string, number>;
  carbon_breakdown: { transport: number; food: number; energy: number };
  top_persona: string;
  monthly_kg_co2: number;
  insight: string;
  streak: number;
  completed_actions: string[];
}

// ── Recommendation engine ──
const allRecommendations = [
  {
    id: "metro_wed",
    emoji: "🚇",
    title: "Metro Wednesdays",
    category: "Transport",
    save_kg: 18,
    effort: "Low effort",
    effort_time: "0 min setup",
    why_key: "transport",
    why_text: "Transport is your biggest emission source.",
    section: "recommended",
    tag: "Top Pick",
    tagColor: "text-green-400",
  },
  {
    id: "veg_thursday",
    emoji: "🥗",
    title: "Vegetarian Thursdays",
    category: "Food",
    save_kg: 12,
    effort: "Easy swap",
    effort_time: "1 meal change",
    why_key: "food",
    why_text: "Food choices are your second biggest lever.",
    section: "quick_wins",
    tag: "🔥 Trending",
    tagColor: "text-orange-400",
  },
  {
    id: "smart_charge",
    emoji: "🔌",
    title: "Smart Charging Habit",
    category: "Energy",
    save_kg: 6,
    effort: "Quick win",
    effort_time: "30 sec",
    why_key: "energy",
    why_text: "Small energy habits compound over months.",
    section: "quick_wins",
    tag: "⚡ Quick Win",
    tagColor: "text-yellow-400",
  },
  {
    id: "reusable_bag",
    emoji: "🛍️",
    title: "Reusable Bag Week",
    category: "Lifestyle",
    save_kg: 4,
    effort: "Zero friction",
    effort_time: "Already own one",
    why_key: "food",
    why_text: "Small habit signals, big mindset shift.",
    section: "weekend",
    tag: "🌱 Starter",
    tagColor: "text-green-400",
  },
  {
    id: "cold_wash",
    emoji: "🧺",
    title: "Cold Water Laundry",
    category: "Energy",
    save_kg: 8,
    effort: "One setting change",
    effort_time: "10 sec",
    why_key: "energy",
    why_text: "90% of laundry energy goes to heating water.",
    section: "low_effort",
    tag: "💡 Smart",
    tagColor: "text-blue-400",
  },
  {
    id: "carpool_friday",
    emoji: "🚗",
    title: "Carpool Fridays",
    category: "Transport",
    save_kg: 14,
    effort: "Social habit",
    effort_time: "One message",
    why_key: "transport",
    why_text: "Sharing rides halves transport emissions instantly.",
    section: "recommended",
    tag: "👥 Social",
    tagColor: "text-purple-400",
  },
];

const personaLabels: Record<string, string> = {
  urban_commuter: "Urban Commuter",
  budget_saver: "Budget Saver",
  busy_professional: "Busy Professional",
  conscious_beginner: "Conscious Beginner",
  eco_enthusiast: "Eco Enthusiast",
  convenience_seeker: "Convenience Seeker",
};

const personaEmojis: Record<string, string> = {
  urban_commuter: "🚇",
  budget_saver: "💰",
  busy_professional: "💼",
  conscious_beginner: "🌱",
  eco_enthusiast: "🌍",
  convenience_seeker: "⚡",
};

const sectionTitles: Record<string, string> = {
  recommended: "✨ Recommended For You",
  quick_wins: "⚡ Quick Wins",
  weekend: "🌅 Weekend Habits",
  low_effort: "💡 Low Effort, High Impact",
};

// ── Action Card ──
function ActionCard({
  rec,
  profile,
  completed,
  onComplete,
}: {
  rec: typeof allRecommendations[0];
  profile: UserProfile;
  completed: boolean;
  onComplete: (id: string) => void;
}) {
  const breakdownValue =
    profile.carbon_breakdown[rec.why_key as keyof typeof profile.carbon_breakdown] || 30;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-[#141414] border rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 ${
        completed
          ? "border-green-500/40 opacity-60"
          : "border-[#2a2a2a] hover:border-green-500/40"
      }`}
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <span className="text-3xl">{rec.emoji}</span>
        <span className={`text-xs font-semibold ${rec.tagColor}`}>{rec.tag}</span>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-white font-bold text-base">{rec.title}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{rec.category}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="bg-[#0a0a0a] rounded-lg px-3 py-2 flex-1 text-center">
          <p className="text-green-400 font-bold text-sm">{rec.save_kg}kg</p>
          <p className="text-gray-600 text-xs">CO₂/month</p>
        </div>
        <div className="bg-[#0a0a0a] rounded-lg px-3 py-2 flex-1 text-center">
          <p className="text-blue-400 font-bold text-sm">{rec.effort_time}</p>
          <p className="text-gray-600 text-xs">{rec.effort}</p>
        </div>
      </div>

      {/* Why this for YOU */}
      <div className="bg-[#0f1f0f] border border-green-900/40 rounded-lg px-3 py-2">
        <p className="text-green-500 text-xs font-semibold mb-0.5">
          Why for YOU?
        </p>
        <p className="text-gray-400 text-xs">
          {rec.why_text}{" "}
          <span className="text-green-400 font-semibold">
            ({breakdownValue}% of your footprint)
          </span>
        </p>
      </div>

      {/* CTA */}
      {completed ? (
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="text-green-500 text-sm font-semibold">✓ Committed</span>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onComplete(rec.id)}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          I'll Try This
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Main Dashboard ──
export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState("there");
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("recommended");
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName?.split(" ")[0] || "there");
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            setCompleted(data.completed_actions || []);
          }
        } catch (e) {
          console.warn("Firestore read failed, using demo data");
          setProfile(demoProfile);
        }
      } else {
        setProfile(demoProfile);
        setUserName("Demo");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleComplete = async (id: string) => {
    const newCompleted = [...completed, id];
    setCompleted(newCompleted);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          completed_actions: arrayUnion(id),
          streak: (profile?.streak || 0) + 1,
        });
      }
    } catch (e) {
      console.warn("Could not update Firestore");
    }
  };

  if (loading) {
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

  if (!profile) return null;

  const topPersonas = Object.entries(profile.personas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const biggestCategory = Object.entries(profile.carbon_breakdown).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const filteredRecs = allRecommendations.filter(
    (r) => r.section === activeSection
  );

  const totalSaved = completed.reduce((acc, id) => {
    const rec = allRecommendations.find((r) => r.id === id);
    return acc + (rec?.save_kg || 0);
  }, 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 max-w-2xl mx-auto">

      {/* ── Confetti moment ── */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black font-bold px-6 py-3 rounded-full shadow-lg"
          >
            🌱 Habit committed! +1 streak
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-gray-500 text-sm">{greeting}</p>
          <h1 className="text-white text-xl font-bold">
            {userName} 🌱
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] rounded-full px-4 py-2">
          <span className="text-orange-400">🔥</span>
          <span className="text-white font-bold text-sm">
            {(profile.streak || 0) + completed.length}
          </span>
          <span className="text-gray-500 text-xs">day streak</span>
        </div>
      </motion.div>

      {/* ── Hero insight card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-900/40 to-[#141414] border border-green-800/40 rounded-2xl p-6 mb-6"
      >
        <p className="text-gray-400 text-sm mb-1">Based on your lifestyle</p>
        <h2 className="text-white text-lg font-bold leading-snug">
          {profile.insight}
        </h2>
        <div className="flex items-center gap-4 mt-4">
          <div>
            <p className="text-gray-500 text-xs">Biggest impact area</p>
            <p className="text-green-400 font-bold capitalize text-sm mt-0.5">
              {biggestCategory[0] === "transport" ? "🚗" : biggestCategory[0] === "food" ? "🍽️" : "⚡"}{" "}
              {biggestCategory[0]} — {biggestCategory[1]}%
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-gray-500 text-xs">Monthly footprint</p>
            <p className="text-white font-bold text-sm mt-0.5">
              {profile.monthly_kg_co2} kg CO₂
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Progress this month ── */}
      {completed.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 mb-6"
        >
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Your impact so far
          </p>
          <div className="flex gap-4">
            <div className="text-center flex-1">
              <p className="text-green-400 text-2xl font-black">{totalSaved}</p>
              <p className="text-gray-500 text-xs">kg CO₂ committed</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-blue-400 text-2xl font-black">{completed.length}</p>
              <p className="text-gray-500 text-xs">habits started</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-purple-400 text-2xl font-black">
                🌳 {Math.floor(totalSaved / 15)}
              </p>
              <p className="text-gray-500 text-xs">trees equivalent</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Sustainability DNA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 mb-6"
      >
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Your Sustainability DNA
        </p>
        <div className="flex flex-col gap-3">
          {topPersonas.map(([key, value], i) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-white text-sm">
                  {personaEmojis[key]} {personaLabels[key]}
                </span>
                <span className="text-green-400 text-sm font-bold">{value}%</span>
              </div>
              <div className="w-full bg-[#0a0a0a] rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Carbon breakdown ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 mb-6"
      >
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Carbon Breakdown
        </p>
        <div className="flex gap-3">
          {Object.entries(profile.carbon_breakdown).map(([key, val]) => (
            <div key={key} className="flex-1 bg-[#0a0a0a] rounded-xl p-3 text-center">
              <p className="text-2xl">
                {key === "transport" ? "🚗" : key === "food" ? "🍽️" : "⚡"}
              </p>
              <p className="text-white font-bold text-lg mt-1">{val}%</p>
              <p className="text-gray-500 text-xs capitalize">{key}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Recommendation feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {Object.entries(sectionTitles).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeSection === key
                  ? "bg-green-500 text-black"
                  : "bg-[#141414] text-gray-400 border border-[#2a2a2a] hover:border-green-500/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {filteredRecs.map((rec) => (
              <ActionCard
                key={rec.id}
                rec={rec}
                profile={profile}
                completed={completed.includes(rec.id)}
                onComplete={handleComplete}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Footer ── */}
      <div className="mt-12 text-center">
        <p className="text-gray-700 text-xs">
          🌿 EcoTrack — built for real habits, real impact
        </p>
      </div>

    </main>
  );
}

// ── Demo fallback data ──
const demoProfile: UserProfile = {
  personas: {
    urban_commuter: 78,
    budget_saver: 65,
    busy_professional: 55,
    conscious_beginner: 44,
    eco_enthusiast: 30,
    convenience_seeker: 70,
  },
  carbon_breakdown: {
    transport: 48,
    food: 32,
    energy: 20,
  },
  top_persona: "urban_commuter",
  monthly_kg_co2: 320,
  insight:
    "Your commute is your biggest carbon opportunity — small changes here have outsized impact.",
  streak: 3,
  completed_actions: [],
};