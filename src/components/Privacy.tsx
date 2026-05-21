"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Server, Lock } from "lucide-react"

const tiers = [
  {
    icon: Eye,
    title: "Anonymized",
    description: "Access premier third-party models. All identifying metadata is stripped before processing.",
    level: "Tier 1",
  },
  {
    icon: Server,
    title: "Private",
    description: "Zero data retention on self-hosted open-source models. Your prompts are never stored.",
    level: "Tier 2",
  },
  {
    icon: Shield,
    title: "TEE (Trusted Execution)",
    description: "Hardware-secured enclaves ensure Venice itself cannot access your computation.",
    level: "Tier 3",
  },
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description: "Client-side encryption. Your prompts are encrypted before leaving your device.",
    level: "Tier 4",
  },
]

export default function Privacy() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            AI that respects your privacy
          </h2>
          <p className="text-lg text-[oklch(0.6_0.02_270)] max-w-2xl mx-auto">
            While others log and analyze your prompts, Zeno ensures your conversations remain yours alone.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {tiers.map((tier, index) => {
            const Icon = tier.icon
            return (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group perspective-1000"
              >
                <div className="p-6 rounded-2xl border border-[oklch(0.2_0.02_270/0.5)] glass h-full transition-all duration-300 hover:border-[oklch(0.65_0.25_290/0.3)] hover:shadow-[0_0_30px_oklch(0.65_0.25_290/0.08)] hover:scale-[1.03]">
                  <span className="text-xs font-mono text-[oklch(0.65_0.25_290)] mb-3 block">{tier.level}</span>
                  <Icon className="w-8 h-8 text-[oklch(0.65_0.25_290)] mb-3" />
                  <h3 className="text-base font-semibold mb-2">{tier.title}</h3>
                  <p className="text-sm text-[oklch(0.5_0.02_270)]">{tier.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
