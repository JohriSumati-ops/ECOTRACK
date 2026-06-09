"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
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
const db = getFirestore(app);

const questions = [
  {
    id: "transport",
    emoji: "🚗",
    question: "How do you usually get around?",
    options: [
      { label: "Personal car daily", value: "car_daily" },
      { label: "Car sometimes, metro sometimes", value: "car_mixed" },
      { label: "Mostly metro / bus", value: "public_transport" },
      { label: "I walk or cycle", value: "walk_cycle" },
    ],
  },
  {
    id: "food",
    emoji: "🍽️",
    question: "How would you describe your diet?",
    options: [
      { label: "Heavy meat eater", value: "meat_heavy" },
      { label: "Meat a few times a week", value: "meat_moderate" },
      { label: "Mostly vegetarian", value: "vegetarian" },
      { label: "Fully vegan", value: "vegan" },
    ],
  },
  {
    id: "budget",
    emoji: "💰",
    question: "How do you feel about eco-friendly spending?",
    options: [
      { label: "Free options only", value: "free_only" },
      { label: "Small cost is okay", value: "small_cost" },
      { label: "Worth paying more", value: "willing_to_pay" },
      { label: "Premium if it helps", value: "premium" },
    ],
  },
  {
    id: "time",
    emoji: "⏰",
    question: "How much time can you give to green habits?",
    options: [
      { label: "Under 5 minutes a day", value: "minimal" },
      { label: "15–30 minutes a day", value: "moderate" },
      { label: "I can restructure routines", value: "flexible" },
      { label: "Fully committed", value: "committed" },
    ],
  },
  {
    id: "motivation",
    emoji: "🌍",
    question: "What drives your sustainability interest?",
    options: [
      { label: "Save money", value: "save_money" },
      { label: "Health and lifestyle", value: "health" },
      { label: "Climate impact", value: "climate" },
      { label: "Just curious", value: "curious" },
    ],
  },
];

// Fallback if Groq fails
const getFallbackData = (answers: Record<string, string>) => {
  const isCarUser = answers.transport === "car_daily" || answers.transport === "car_mixed";
  const isMeatEater = answers.food === "meat_heavy" || answers.food === "meat_moderate";

  return {
    personas: {
      urban_commuter: isCarUser ? 80 : 40,
      budget_saver: answers.budget === "free_only" ? 85 : 50,
      busy_professional: answers.time === "minimal" ? 80 : 40,
      conscious_beginner: 65,
      eco_enthusiast: answers.motivation === "climate" ? 80 : 35,
      convenience_seeker: answers.time === "minimal" ? 75 : 40,
    },
    carbon_breakdown: {
      transport: isCarUser ? 48 : 20,
      food: isMeatEater ? 35 : 20,
      energy: 30,
    },
    top_persona: isCarUser ? "urban_commuter" : "conscious_beginner",
    monthly_kg_co2: isCarUser ? 320 : isMeatEater ? 280 : 180,
    insight: isCarUser
      ? "Your commute is your biggest carbon opportunity — small changes here have outsized impact."
      : "Your food choices are your biggest lever for reducing emissions.",
  };
};

export default function Onboarding() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing your profile...");

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [questions[current].id]: value };
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      await analyzeAndSave(newAnswers);
    }
  };

  const analyzeAndSave = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    setLoadingText("Analyzing your profile...");

    let result;

    try {
      setLoadingText("Talking to AI...");

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: `You are a sustainability AI. Based on these answers, return ONLY a valid JSON object with no extra text.

User answers:
- Transport: ${finalAnswers.transport}
- Food: ${finalAnswers.food}
- Budget: ${finalAnswers.budget}
- Time: ${finalAnswers.time}
- Motivation: ${finalAnswers.motivation}

Return exactly this JSON:
{
  "personas": {
    "urban_commuter": 0,
    "budget_saver": 0,
    "busy_professional": 0,
    "conscious_beginner": 0,
    "eco_enthusiast": 0,
    "convenience_seeker": 0
  },
  "carbon_breakdown": {
    "transport": 0,
    "food": 0,
    "energy": 0
  },
  "top_persona": "",
  "monthly_kg_co2": 0,
  "insight": ""
}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      result = JSON.parse(cleaned);

    } catch (err) {
      console.warn("Groq failed, using fallback:", err);
      result = getFallbackData(finalAnswers);
    }

    try {
      setLoadingText("Saving your profile...");
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          answers: finalAnswers,
          personas: result.personas,
          carbon_breakdown: result.carbon_breakdown,
          top_persona: result.top_persona,
          monthly_kg_co2: result.monthly_kg_co2,
          insight: result.insight,
          streak: 0,
          completed_actions: [],
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Firestore save failed:", err);
    }

    router.push("/dashboard");
  };

  const progress = (current / questions.length) * 100;
  const q = questions[current];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-5xl"
        >
          🌿
        </motion.div>
        <p className="text-white text-xl font-semibold">{loadingText}</p>
        <p className="text-gray-500 text-sm">Building your personal carbon plan</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">

      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-green-500 font-semibold text-sm">🌿 EcoTrack</span>
          <span className="text-gray-500 text-sm">{current + 1} / {questions.length}</span>
        </div>
        <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
          <motion.div
            className="bg-green-500 h-1.5 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <span className="text-6xl">{q.emoji}</span>
            <h2 className="text-white text-2xl font-bold mt-4">{q.question}</h2>
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option.value)}
                className="w-full bg-[#141414] border border-[#2a2a2a] hover:border-green-500 hover:bg-[#1a2a1a] text-white text-left px-6 py-4 rounded-xl transition-all duration-200 font-medium"
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

    </main>
  );
}