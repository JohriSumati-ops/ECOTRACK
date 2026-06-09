"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

const PERSONA_META: Record<string, { label: string; emoji: string; color: string }> = {
  urban_commuter:     { label: "Urban Commuter",      emoji: "🚇", color: "bg-blue-500" },
  budget_saver:       { label: "Budget Saver",         emoji: "💰", color: "bg-yellow-500" },
  busy_professional:  { label: "Busy Professional",    emoji: "💼", color: "bg-purple-500" },
  conscious_beginner: { label: "Conscious Beginner",   emoji: "🌱", color: "bg-green-500" },
  eco_enthusiast:     { label: "Eco Enthusiast",       emoji: "🌍", color: "bg-emerald-500" },
  convenience_seeker: { label: "Convenience Seeker",   emoji: "⚡", color: "bg-orange-500" },
};

const ACTION_CARDS = [
  { id: "carpool",      title: "Carpool once this week",        impact: "Save 3.2 kg CO₂", effort: "Low effort",    emoji: "🚗", category: "transport", tag: "Quick Win",   tagColor: "bg-green-500"  },
  { id: "meatless",     title: "Try a meatless Monday",         impact: "Save 2.5 kg CO₂", effort: "Low effort",    emoji: "🥗", category: "food",      tag: "Popular",     tagColor: "bg-blue-500"   },
  { id: "coldwash",     title: "Wash clothes in cold water",    impact: "Save 0.6 kg CO₂", effort: "Zero effort",   emoji: "🧺", category: "energy",    tag: "Zero Effort", tagColor: "bg-purple-500" },
  { id: "metro",        title: "Take metro instead of car",     impact: "Save 4.1 kg CO₂", effort: "Medium effort", emoji: "🚇", category: "transport", tag: "High Impact", tagColor: "bg-red-500"    },
  { id: "thermostat",   title: "Lower thermostat by 2°C",       impact: "Save 1.8 kg CO₂", effort: "Zero effort",   emoji: "🌡️", category: "energy",    tag: "Quick Win",   tagColor: "bg-green-500"  },
  { id: "localproduce", title: "Buy local produce this week",   impact: "Save 1.2 kg CO₂", effort: "Low effort",    emoji: "🥦", category: "food",      tag: "Trending",    tagColor: "bg-yellow-500" },
];

function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        borderRadius: "9999px",
        padding: "4px 12px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("ecotrack-theme") as "dark" | "light";
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ecotrack-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleComplete = (id: string) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <main style={{ backgroundColor: "var(--bg)" }} className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="text-5xl">
          🌿
        </motion.div>
      </main>
    );
  }

  const persona = userData?.top_persona || "conscious_beginner";
  const personaMeta = PERSONA_META[persona];
  const co2 = userData?.monthly_kg_co2 || 220;
  const insight = userData?.insight || "Start small — every action compounds.";
  const breakdown = userData?.carbon_breakdown || { transport: 40, food: 35, energy: 25 };

  return (
    <main style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }} className="min-h-screen px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <span style={{ color: "var(--text-primary)" }} className="text-xl font-bold">
          🌿 Eco<span className="text-green-500">Track</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <button onClick={() => router.push("/insights")} className="text-green-500 text-sm font-semibold hover:underline">
            View Wrapped →
          </button>
          <span style={{ color: "var(--text-muted)" }} className="text-sm">🔥 {completed.length} done today</span>
        </div>
      </motion.div>

      {/* Persona Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        className="border rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className={`${personaMeta.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {personaMeta.emoji} {personaMeta.label}
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm leading-relaxed">"{insight}"</p>
      </motion.div>

      {/* Carbon Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        className="border rounded-2xl p-5 mb-4"
      >
        <p style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-widest mb-1">Your monthly footprint</p>
        <p style={{ color: "var(--text-primary)" }} className="text-4xl font-bold">
          {co2} <span className="text-green-500 text-lg">kg CO₂</span>
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {Object.entries(breakdown).map(([key, val]: any) => (
            <div key={key}>
              <div style={{ color: "var(--text-muted)" }} className="flex justify-between text-xs mb-1">
                <span className="capitalize">{key}</span>
                <span>{val}%</span>
              </div>
              <div style={{ backgroundColor: "var(--border)" }} className="w-full rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-green-500 h-1.5 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-lg mb-3">Your Actions Today</h2>
        <div className="flex flex-col gap-3">
          {ACTION_CARDS.map((card, i) => {
            const done = completed.includes(card.id);
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => toggleComplete(card.id)}
                style={{
                  background: done ? "var(--bg-card-done)" : "var(--bg-card)",
                  borderColor: done ? "#22c55e" : "var(--border)",
                }}
                className="cursor-pointer border rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:border-green-500"
              >
                <span className="text-3xl">{card.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${card.tagColor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                      {card.tag}
                    </span>
                  </div>
                  <p style={{ color: done ? "var(--text-muted)" : "var(--text-primary)" }}
                     className={`font-semibold text-sm ${done ? "line-through" : ""}`}>
                    {card.title}
                  </p>
                  <p className="text-green-500 text-xs mt-0.5">{card.impact}</p>
                  <p style={{ color: "var(--text-dimmed)" }} className="text-xs">{card.effort}</p>
                </div>
                <div style={{ borderColor: done ? "#22c55e" : "var(--text-muted)", backgroundColor: done ? "#22c55e" : "transparent" }}
                     className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                  {done && <span className="text-white text-xs">✓</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </main>
  );
}