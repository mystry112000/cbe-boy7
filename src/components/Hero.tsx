"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

const models = [
  "Claude", "GPT-4", "Gemini", "DeepSeek", "Llama",
  "Mistral", "Qwen", "Grok", "Stable Diffusion", "Midjourney",
]

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[oklch(0.65_0.25_290/0.06)] blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[oklch(0.55_0.2_250/0.05)] blur-[120px] animate-breathe" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[oklch(0.7_0.2_150/0.03)] blur-[100px] animate-float" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.2_0.02_270/0.5)] glass text-sm text-[oklch(0.6_0.02_270)] mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[oklch(0.65_0.25_290)]" />
          Private AI for Unlimited Creative Freedom
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
          <span className="glow-text">Ask</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.65_0.25_290)] via-[oklch(0.6_0.2_250)] to-[oklch(0.7_0.2_150)] animate-gradient-shift">
            anything
          </span>
          ...
        </h1>

        <p className="text-lg sm:text-xl text-[oklch(0.6_0.02_270)] max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Access leading AI models with your privacy in mind. Create text, images, video, code,
          and more using fully private or anonymized models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/chat"
            className="group px-8 py-3.5 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium text-lg transition-all duration-300 glow hover:shadow-[0_0_40px_oklch(0.65_0.25_290/0.3)] hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Start Creating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3.5 rounded-xl border border-[oklch(0.2_0.02_270/0.5)] glass text-[oklch(0.8_0.02_270)] font-medium text-lg hover:border-[oklch(0.65_0.25_290/0.3)] hover:shadow-[0_0_30px_oklch(0.65_0.25_290/0.1)] transition-all duration-300 hover:scale-105"
          >
            View Pricing
          </Link>
        </div>

        <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-sm text-[oklch(0.4_0.02_270)] mb-4">Powered by leading models</p>
          <div className="flex flex-wrap justify-center gap-3">
            {models.map((model, i) => (
              <span
                key={model}
                className="px-4 py-2 rounded-lg border border-[oklch(0.2_0.02_270/0.4)] glass text-sm text-[oklch(0.6_0.02_270)] hover:border-[oklch(0.65_0.25_290/0.3)] hover:text-[oklch(0.8_0.02_270)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_oklch(0.65_0.25_290/0.1)]"
                style={{ animationDelay: `${i * 0.05}s`, transitionDelay: `${i * 0.03}s` }}
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
