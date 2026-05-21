"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="rounded-2xl border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.09_0.01_270/0.3)] p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-[oklch(0.5_0.02_270)] mt-1">Start creating with privacy</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First name</label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-[oklch(0.5_0.02_270)] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[oklch(0.65_0.25_290)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
