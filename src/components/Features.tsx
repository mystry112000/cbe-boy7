"use client"

import { motion } from "framer-motion"
import { MessageSquare, Image, Video, Music, Code, Lock } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Text Generation",
    description: "Chat, reason, write, and build with powerful open-source language models. Uncensored and private.",
    gradient: "from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)]",
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Generate, edit, upscale, and remove backgrounds. From photorealism to abstract art.",
    gradient: "from-[oklch(0.6_0.2_250)] to-[oklch(0.5_0.25_290)]",
  },
  {
    icon: Video,
    title: "Video Generation",
    description: "Create videos from text or images with access to Sora, Kling, Runway, and more.",
    gradient: "from-[oklch(0.7_0.2_150)] to-[oklch(0.55_0.2_250)]",
  },
  {
    icon: Music,
    title: "Audio & Music",
    description: "Text-to-speech, music generation, and sound effects for studio-quality audio.",
    gradient: "from-[oklch(0.6_0.25_30)] to-[oklch(0.55_0.2_250)]",
  },
  {
    icon: Code,
    title: "Built for Agents",
    description: "OpenAI-compatible API plugs into any agent stack with function calling and web search.",
    gradient: "from-[oklch(0.55_0.2_250)] to-[oklch(0.65_0.25_290)]",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Zero data retention on self-hosted open-source models. Your prompts are never stored.",
    gradient: "from-[oklch(0.5_0.25_290)] to-[oklch(0.6_0.2_250)]",
  },
]

export default function Features() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Capabilities
          </h2>
          <p className="text-lg text-[oklch(0.6_0.02_270)] max-w-2xl mx-auto">
            Text, image, video, audio, code, and search in one place, all private or anonymous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group perspective-1000"
              >
                <div className="relative p-6 rounded-2xl border border-[oklch(0.2_0.02_270/0.5)] glass hover:border-[oklch(0.65_0.25_290/0.3)] transition-all duration-300 hover:shadow-[0_0_30px_oklch(0.65_0.25_290/0.08)] hover:scale-[1.02]">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 mb-4 shadow-lg`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[oklch(0.5_0.02_270)]">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
