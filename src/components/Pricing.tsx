"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic access",
    features: [
      "Basic AI models",
      "50 text prompts per day",
      "10 images per day",
      "Standard resolution",
      "Community support",
    ],
    cta: "Get Started",
    href: "/auth/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "$18",
    period: "/mo",
    description: "Full access to all AI models and features",
    features: [
      "All AI models (Pro & Advanced)",
      "Unlimited text prompts",
      "1,000 images per day",
      "$10 in credits per month",
      "Hi-res upscaling",
      "Character creation",
      "API access",
    ],
    cta: "Get Pro",
    href: "/auth/signup",
    featured: true,
  },
  {
    name: "Pro+",
    price: "$68",
    period: "/mo",
    description: "Everything in Pro, plus massive credit allocation",
    features: [
      "Everything in Pro",
      "$75 in credits per month",
      "10% credit bonus vs. retail",
      "2-month credit banking",
      "Video generation via credits",
      "Higher API limits",
    ],
    cta: "Get Pro+",
    href: "/auth/signup",
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section className="py-24 relative" id="pricing">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple pricing. No surprises.
          </h2>
          <p className="text-lg text-[oklch(0.6_0.02_270)] max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. Every tier includes uncensored models and full privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.featured
                  ? "border-2 border-[oklch(0.65_0.25_290/0.5)] bg-[oklch(0.09_0.01_270/0.8)] glow"
                  : "border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.09_0.01_270/0.3)]"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-[oklch(0.5_0.02_270)] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-[oklch(0.5_0.02_270)]">{plan.period}</span>
                  )}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[oklch(0.6_0.02_270)]">
                    <Check className="w-4 h-4 mt-0.5 text-[oklch(0.65_0.25_290)] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-medium transition-all ${
                  plan.featured
                    ? "bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white hover:opacity-90"
                    : "border border-[oklch(0.2_0.02_270/0.5)] text-[oklch(0.8_0.02_270)] hover:bg-[oklch(0.12_0.01_270/0.5)]"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
