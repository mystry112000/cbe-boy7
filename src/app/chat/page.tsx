"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Settings } from "lucide-react"
import Link from "next/link"
import { getConfig } from "@/lib/ai"

const models = ["Claude", "GPT-4", "Gemini", "DeepSeek", "Llama 3", "Mistral"]

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your private AI assistant. Ask me anything - your conversation stays completely private.",
    },
  ])
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [modelOpen, setModelOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    const config = getConfig()

    if (!config.apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ No API key configured. Go to **Settings** to add one. You can use OpenRouter with free models!" },
      ])
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.chatModel,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessages((prev) => [...prev, data.message])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 flex flex-col">
        <div className="flex items-center justify-between py-4 border-b border-[oklch(0.2_0.02_270/0.5)]">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[oklch(0.65_0.25_290)]" />
            <span className="font-semibold">Chat</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-[oklch(0.09_0.01_270/0.5)] transition-colors"
            >
              <Settings className="w-4 h-4 text-[oklch(0.5_0.02_270)]" />
            </Link>

            <div className="relative">
              <button
                onClick={() => setModelOpen(!modelOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[oklch(0.2_0.02_270/0.5)] text-sm text-[oklch(0.6_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[oklch(0.65_0.25_290)]" />
                {selectedModel}
              </button>
              {modelOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.06_0.01_270)] backdrop-blur-xl py-2 z-10">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => { setSelectedModel(model); setModelOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        model === selectedModel
                          ? "text-[oklch(0.65_0.25_290)]"
                          : "text-[oklch(0.6_0.02_270)] hover:text-[oklch(0.9_0.02_270)]"
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[oklch(0.65_0.25_290/0.2)] to-[oklch(0.55_0.2_250/0.2)] border border-[oklch(0.65_0.25_290/0.2)]"
                    : "bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)]"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-[oklch(0.3_0.05_270)] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)] rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.5_0.02_270)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.5_0.02_270)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.5_0.02_270)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="py-4 border-t border-[oklch(0.2_0.02_270/0.5)]">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={loading ? "Waiting for response..." : "Type a message..."}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[oklch(0.4_0.02_270)] mt-3 text-center">
            Your API key is stored locally. No data is logged on our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
