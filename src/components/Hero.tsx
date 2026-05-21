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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.65_0.25_290/0.08)] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[oklch(0.55_0.2_250/0.06)] blur-[100px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.09_0.01_270/0.5)] text-sm text-[oklch(0.6_0.02_270)] mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[oklch(0.65_0.25_290)]" />
          Private AI for Unlimited Creative Freedom
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="glow-text">Ask</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)]">
            anything
          </span>
          ...
        </h1>

        <p className="text-lg sm:text-xl text-[oklch(0.6_0.02_270)] max-w-2xl mx-auto mb-10">
          Access leading AI models with your privacy in mind. Create text, images, video, code,
          and more using fully private or anonymized models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/chat"
            className="group px-8 py-3.5 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium text-lg hover:opacity-90 transition-all glow"
          >
            <span className="flex items-center gap-2">
              Start Creating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3.5 rounded-xl border border-[oklch(0.2_0.02_270/0.5)] text-[oklch(0.8_0.02_270)] font-medium text-lg hover:bg-[oklch(0.09_0.01_270/0.5)] transition-all"
          >
            View Pricing
          </Link>
        </div>

        <div className={`transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <p className="text-sm text-[oklch(0.4_0.02_270)] mb-4">Powered by leading models</p>
          <div className="flex flex-wrap justify-center gap-3">
            {models.map((model) => (
              <span
                key={model}
                className="px-4 py-2 rounded-lg border border-[oklch(0.2_0.02_270/0.4)] bg-[oklch(0.09_0.01_270/0.3)] text-sm text-[oklch(0.6_0.02_270)]"
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
