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
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">

      {/* Logo */}
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

      {/* Tagline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl md:text-6xl font-bold text-white text-center max-w-2xl leading-tight"
      >
        Your personal{" "}
        <span className="text-green-500">carbon coach</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-4 text-gray-400 text-lg text-center max-w-md"
      >
        Personalized actions. Real impact. No guilt.
        Built for how you actually live.
      </motion.p>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex gap-8 mt-10 mb-10"
      >
        {[
          { value: "2.4T", label: "kg CO₂ tracked" },
          { value: "180K", label: "actions completed" },
          { value: "94%", label: "users stay consistent" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-green-500 text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Google Sign In Button */}
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

    </main>
  );
}