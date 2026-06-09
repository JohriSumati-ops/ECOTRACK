"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";

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
const googleProvider = new GoogleAuthProvider();

const trendingActions = [
  {
    emoji: "🥗",
    title: "Vegetarian Thursdays",
    tag: "🔥 Trending 6 days",
    desc: "Popular among students",
    save: "12kg CO₂/mo",
  },
  {
    emoji: "🚇",
    title: "Metro Mondays",
    tag: "🔥 Trending this week",
    desc: "Popular among commuters",
    save: "18kg CO₂/mo",
  },
  {
    emoji: "♻️",
    title: "Shared Laundry Days",
    tag: "📈 Rising fast",
    desc: "Trending among city dwellers",
    save: "8kg CO₂/mo",
  },
  {
    emoji: "🔌",
    title: "Smart Charging",
    tag: "⚡ Quick win",
    desc: "30 seconds effort",
    save: "6kg CO₂/mo",
  },
  {
    emoji: "🛍️",
    title: "Reusable Bag Week",
    tag: "🌱 Community favourite",
    desc: "Easy starter habit",
    save: "4kg CO₂/mo",
  },
];

const steps = [
  {
    step: "01",
    emoji: "🌍",
    title: "Understand Your Footprint",
    desc: "Quick onboarding reveals your biggest emission sources instantly.",
    example: "Transport = 48% of your emissions",
    color: "from-green-500/20 to-transparent",
  },
  {
    step: "02",
    emoji: "🧠",
    title: "Get Smart Recommendations",
    desc: "AI recommends realistic habits based on YOUR lifestyle — not generic advice.",
    example: "Metro Wednesdays → Save 18kg CO₂/month",
    color: "from-blue-500/20 to-transparent",
  },
  {
    step: "03",
    emoji: "📈",
    title: "Track Real Progress",
    desc: "Build sustainable habits without guilt. Small actions, measurable impact.",
    example: "🌳 Equivalent of 4 trees saved this month",
    color: "from-purple-500/20 to-transparent",
  },
];

export default function Home() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/onboarding");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 pb-20">

      {/* ── HERO SECTION ── */}
      <section className="flex flex-col items-center justify-center min-h-screen w-full max-w-3xl text-center">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center gap-2"
        >
          <span className="text-green-500 text-4xl">🌿</span>
          <span className="text-white text-3xl font-bold tracking-tight">
            Eco<span className="text-green-500">Track</span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white leading-tight"
        >
          Your personal{" "}
          <span className="text-green-500">carbon coach</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-gray-400 text-lg max-w-md"
        >
          Personalized actions. Real impact. No guilt.
          Built for how you actually live.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex gap-8 mt-10 mb-10"
        >
          {[
            { value: "6.4", label: "kg CO₂ tracked" },
            { value: "500+", label: "actions completed" },
            { value: "74%", label: "users stay consistent" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-green-500 text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          className="flex items-center gap-3 bg-white text-black font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-gray-600 text-sm"
        >
          Takes 2 minutes. No credit card. No spam.
        </motion.p>

        {/* scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-gray-600 text-sm flex flex-col items-center gap-1"
        >
          <span>scroll to explore</span>
          <span>↓</span>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full max-w-4xl mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-green-500 text-sm font-semibold uppercase tracking-widest">
            How it works
          </span>
          <h2 className="text-white text-3xl md:text-4xl font-bold mt-2">
            Your personalized sustainability journey
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            From understanding to action in under 2 minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden"
            >
              {/* background glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-40 pointer-events-none`} />

              <span className="text-gray-700 text-5xl font-black absolute top-4 right-5">
                {s.step}
              </span>

              <span className="text-4xl">{s.emoji}</span>
              <h3 className="text-white font-bold text-lg mt-3">{s.title}</h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">{s.desc}</p>

              <div className="mt-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2">
                <p className="text-green-400 text-xs font-mono">{s.example}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRENDING THIS WEEK ── */}
      <section className="w-full max-w-4xl mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="text-2xl">🔥</span>
          <h2 className="text-white text-2xl font-bold">Trending This Week</h2>
          <span className="text-gray-600 text-sm ml-2">across all users</span>
        </motion.div>

        {/* horizontal scroll row */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {trendingActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="min-w-[200px] bg-[#141414] border border-[#2a2a2a] hover:border-green-500/50 rounded-2xl p-5 flex-shrink-0 cursor-pointer transition-colors duration-200"
            >
              <span className="text-3xl">{action.emoji}</span>
              <h3 className="text-white font-semibold mt-3 text-sm">{action.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{action.desc}</p>

              <div className="mt-3 flex flex-col gap-1">
                <span className="text-xs text-orange-400 font-medium">{action.tag}</span>
                <span className="text-green-500 text-xs font-semibold">
                  Save {action.save}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mt-24 text-center bg-[#141414] border border-[#2a2a2a] rounded-3xl p-12"
      >
        <span className="text-5xl">🌿</span>
        <h2 className="text-white text-3xl font-bold mt-4">
          Ready to make a real impact?
        </h2>
        <p className="text-gray-400 mt-3">
          Join thousands building sustainable habits — one small action at a time.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          className="mt-8 flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-full text-lg mx-auto transition-colors"
        >
          Start Free — 2 Minutes
        </motion.button>
      </motion.section>

    </main>
  );
}