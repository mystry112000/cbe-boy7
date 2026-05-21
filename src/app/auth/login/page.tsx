"use client"

import Link from "next/link"
import { useState } from "react"
import { Sparkles, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="rounded-2xl border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.09_0.01_270/0.3)] p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-[oklch(0.5_0.02_270)] mt-1">Sign in to your account</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.4_0.02_270)] hover:text-[oklch(0.6_0.02_270)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.06_0.01_270)]" />
                <span className="text-xs text-[oklch(0.5_0.02_270)]">Remember me</span>
              </label>
              <a href="#" className="text-xs text-[oklch(0.65_0.25_290)] hover:underline">Forgot password?</a>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-[oklch(0.5_0.02_270)] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[oklch(0.65_0.25_290)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
