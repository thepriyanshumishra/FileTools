"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheckIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { LogoIcon } from "@/components/ui/logo-icon";

interface AdminCredentials {
  username: string;
  password: string;
}

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple hardcoded check - in a real app, use proper authentication
    if (
      credentials.username === "thedarkpcm" &&
      credentials.password === "Priyanshu@2427"
    ) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm text-zinc-600 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
        >
          ← Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-8 shadow-xl"
        >
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
              <LogoIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              Secure Access Required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
              🔒 This is a secure admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
