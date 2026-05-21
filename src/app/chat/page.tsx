"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Settings, Plus } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getConfig } from "@/lib/ai"

type Message = {
  role: "user" | "assistant"
  content: string
  id: string
}

type Conversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("cbe_boy7_chats")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(chats: Conversation[]) {
  localStorage.setItem("cbe_boy7_chats", JSON.stringify(chats))
}

function newConversation(): Conversation {
  return {
    id: genId(),
    title: "New chat",
    messages: [{ role: "assistant", content: "Hello! I'm your private AI assistant. Ask me anything — your conversation stays completely private.", id: genId() }],
    createdAt: Date.now(),
  }
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const conversationsRef = useRef(conversations)

  useEffect(() => { conversationsRef.current = conversations }, [conversations])

  useEffect(() => {
    const saved = loadConversations()
    if (saved.length === 0) {
      const chat = newConversation()
      setConversations([chat])
      setActiveId(chat.id)
      saveConversations([chat])
    } else {
      setConversations(saved)
      setActiveId(saved[0].id)
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [streamContent])

  const activeConv = conversations.find((c) => c.id === activeId)
  const messages = activeConv?.messages || []

  function updateConversation(id: string, updater: (c: Conversation) => Conversation) {
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === id ? updater(c) : c))
      saveConversations(next)
      return next
    })
  }

  function handleNewChat() {
    const chat = newConversation()
    setConversations((prev) => {
      const next = [chat, ...prev]
      saveConversations(next)
      return next
    })
    setActiveId(chat.id)
    setStreamContent("")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleDeleteChat(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (next.length === 0) {
        const chat = newConversation()
        saveConversations([chat])
        return [chat]
      }
      saveConversations(next)
      return next
    })
    if (activeId === id) {
      const remaining = conversations.find((c) => c.id !== id)
      if (remaining) setActiveId(remaining.id)
    }
  }

  async function handleSend() {
    if (!input.trim() || streaming) return

    const inputText = input
    setInput("")

    const config = getConfig()

    const userMsg: Message = { role: "user", content: inputText, id: genId() }

    updateConversation(activeId, (c) => ({
      ...c,
      title: c.messages.length <= 1 ? inputText.slice(0, 50) : c.title,
      messages: [...c.messages, userMsg],
    }))

    setStreaming(true)
    setStreamContent("")

    if (!config.apiKey) {
      setStreamContent("⚠️ **No API key configured.** Go to **Settings** to add one.\n\nOpenRouter has free models — just get a key at [openrouter.ai/keys](https://openrouter.ai/keys) and paste it in Settings.")
      setStreaming(false)
      return
    }

    const currentConv = conversationsRef.current.find((c) => c.id === activeId)
    const allMessages = [...(currentConv?.messages || []), userMsg]

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.chatModel,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(data.error || "Request failed")
      }

      const contentType = res.headers.get("content-type") || ""

      if (contentType.includes("text/event-stream")) {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let fullContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.slice(6).trim()
              if (!json || json === "[DONE]") continue
              try {
                const parsed = JSON.parse(json)
                if (parsed.error) throw new Error(parsed.error)
                fullContent += parsed.content || ""
                setStreamContent(fullContent)
              } catch (e: any) {
                if (e.message) throw e
              }
            }
          }
        }

        updateConversation(activeId, (c) => ({
          ...c,
          messages: [...c.messages, { role: "assistant", content: fullContent, id: genId() }],
        }))
        setStreamContent("")
      } else {
        const data = await res.json()
        if (data.message) {
          updateConversation(activeId, (c) => ({
            ...c,
            messages: [...c.messages, data.message],
          }))
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setStreamContent(`**Error:** ${err.message}`)
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function handleStop() {
    abortRef.current?.abort()
    if (streamContent) {
      updateConversation(activeId, (c) => ({
        ...c,
        messages: [...c.messages, { role: "assistant", content: streamContent, id: genId() }],
      }))
      setStreamContent("")
    }
    setStreaming(false)
  }

  return (
    <div className="min-h-screen pt-16 flex">
      {sidebarOpen && (
        <div className="w-64 border-r border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.04_0.005_270)] flex flex-col">
          <div className="p-3 border-b border-[oklch(0.2_0.02_270/0.5)]">
            <button onClick={handleNewChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[oklch(0.2_0.02_270/0.5)] text-sm text-[oklch(0.5_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)] hover:text-[oklch(0.8_0.02_270)] transition-all">
              <Plus className="w-4 h-4" />
              New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => { setActiveId(conv.id); setStreamContent("") }} className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${conv.id === activeId ? "bg-[oklch(0.65_0.25_290/0.1)] text-[oklch(0.85_0.02_270)]" : "text-[oklch(0.5_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)]"}`}>
                <span className="truncate flex-1">{conv.title}</span>
                {(
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(conv.id) }} className="opacity-0 group-hover:opacity-100 text-[oklch(0.3_0.02_270)] hover:text-red-400 transition-all text-xs">✕</button>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[oklch(0.2_0.02_270/0.5)]">
            <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[oklch(0.5_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)] hover:text-[oklch(0.8_0.02_270)] transition-all">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="flex items-center gap-3 py-3 border-b border-[oklch(0.2_0.02_270/0.5)]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-[oklch(0.09_0.01_270/0.5)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[oklch(0.65_0.25_290)]" />
            <span className="font-semibold">{activeConv?.title || "Chat"}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 overflow-hidden ${msg.role === "user" ? "bg-gradient-to-r from-[oklch(0.65_0.25_290/0.2)] to-[oklch(0.55_0.2_250/0.2)] border border-[oklch(0.65_0.25_290/0.2)]" : "bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)]"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-[oklch(0.3_0.05_270)] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {streaming && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)] rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamContent || "▊"}</ReactMarkdown>
                </div>
                {streamContent && <span className="inline-block w-2 h-4 bg-[oklch(0.65_0.25_290)] animate-pulse ml-0.5" />}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="py-4 border-t border-[oklch(0.2_0.02_270/0.5)]">
          <div className="flex gap-3">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder={streaming ? "AI is responding..." : "Type a message..."} disabled={streaming} className="flex-1 px-4 py-3 rounded-xl bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors disabled:opacity-50" />
            {streaming ? (
              <button onClick={handleStop} className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all">■</button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-[oklch(0.4_0.02_270)] mt-3 text-center">API key is stored locally. No data is logged on our servers.</p>
        </div>
      </div>
    </div>
  )
}
