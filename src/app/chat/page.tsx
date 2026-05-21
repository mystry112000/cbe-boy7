"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Settings, Plus, Square } from "lucide-react"
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
    const raw = localStorage.getItem("zeno_chats")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(chats: Conversation[]) {
  localStorage.setItem("zeno_chats", JSON.stringify(chats))
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
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" ? window.innerWidth >= 768 : true)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const conversationsRef = useRef(conversations)

  const activeConv = conversations.find((c) => c.id === activeId)
  const messages = activeConv?.messages || []

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
    if (!endRef.current) return
    const parent = endRef.current.parentElement
    if (parent && parent.scrollHeight - parent.scrollTop - parent.clientHeight < 200) {
      endRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [streamContent, messages])

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
        setActiveId(chat.id)
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

  function autoResize() {
    const el = inputRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = Math.min(el.scrollHeight, 160) + "px"
    }
  }

  async function handleSend() {
    let timedOut = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      if (!input.trim() || streaming) return

      const inputText = input
      setStreamContent("")

      const config = getConfig()

      const userMsg: Message = { role: "user", content: inputText, id: genId() }

      updateConversation(activeId, (c) => ({
        ...c,
        title: c.messages.length <= 1 ? inputText.slice(0, 50) : c.title,
        messages: [...c.messages, userMsg],
      }))

      setInput("")
      if (inputRef.current) inputRef.current.style.height = "auto"

      setStreaming(true)

      const currentConv = conversationsRef.current.find((c) => c.id === activeId)
      const allMessages = [...(currentConv?.messages || []), userMsg]

      const controller = new AbortController()
      abortRef.current = controller

      timeoutId = setTimeout(() => { timedOut = true; controller.abort() }, 30000)

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
      } else if (timedOut) {
        setStreamContent(`**Error:** Request timed out after 30s. OpenRouter free tier may be slow — try again or add an API key in Settings.`)
      }
    } finally {
      clearTimeout(timeoutId)
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
    <div className="min-h-screen pt-14 flex">
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="w-64 border-r border-[oklch(0.2_0.02_270/0.5)] glass-strong flex flex-col fixed md:relative z-40 inset-y-0 left-0 pt-14 md:pt-0 animate-slide-in-left">
            <div className="p-3 border-b border-[oklch(0.2_0.02_270/0.5)]">
              <button onClick={handleNewChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[oklch(0.2_0.02_270/0.5)] text-sm text-[oklch(0.5_0.02_270)] hover:bg-[oklch(0.65_0.25_290/0.1)] hover:text-[oklch(0.8_0.02_270)] hover:border-[oklch(0.65_0.25_290/0.3)] transition-all duration-200">
                <Plus className="w-4 h-4" />
                New chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {conversations.map((conv, i) => (
                <div key={conv.id} style={{ animationDelay: `${i * 30}ms` }} onClick={() => { setActiveId(conv.id); setStreamContent(""); window.innerWidth < 768 && setSidebarOpen(false) }} className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 animate-fade-in-up ${conv.id === activeId ? "bg-[oklch(0.65_0.25_290/0.12)] text-[oklch(0.85_0.02_270)] border border-[oklch(0.65_0.25_290/0.2)]" : "text-[oklch(0.5_0.02_270)] hover:bg-[oklch(0.65_0.25_290/0.05)] hover:text-[oklch(0.7_0.02_270)]"}`}>
                  <span className="truncate flex-1">{conv.title}</span>
                  {(
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(conv.id) }} className="opacity-0 group-hover:opacity-100 text-[oklch(0.3_0.02_270)] hover:text-red-400 transition-all text-xs">✕</button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[oklch(0.2_0.02_270/0.5)]">
              <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[oklch(0.5_0.02_270)] hover:bg-[oklch(0.65_0.25_290/0.08)] hover:text-[oklch(0.8_0.02_270)] transition-all duration-200">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="flex items-center gap-3 py-3 border-b border-[oklch(0.2_0.02_270/0.5)]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-[oklch(0.65_0.25_290/0.1)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold">{activeConv?.title || "Chat"}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`flex gap-3 animate-fade-in-up ${msg.role === "user" ? "justify-end" : ""}`} style={{ animationDelay: `${i * 50}ms` }}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-[oklch(0.65_0.25_290/0.2)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 overflow-hidden ${msg.role === "user" ? "bg-gradient-to-r from-[oklch(0.65_0.25_290/0.2)] to-[oklch(0.55_0.2_250/0.15)] border border-[oklch(0.65_0.25_290/0.15)] shadow-sm" : "glass border border-[oklch(0.2_0.02_270/0.4)]"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.4_0.05_270)] to-[oklch(0.3_0.05_270)] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {streaming && (
            <div className="flex gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-[oklch(0.65_0.25_290/0.2)]">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass border border-[oklch(0.2_0.02_270/0.4)] rounded-2xl px-4 py-3 max-w-[80%] min-w-[100px]">
                {streamContent ? (
                  <>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamContent}</ReactMarkdown>
                    </div>
                    <span className="inline-block w-2 h-4 bg-gradient-to-b from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] animate-pulse ml-0.5 rounded-sm" />
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.25_290/0.6)] typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.25_290/0.6)] typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.25_290/0.6)] typing-dot" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="py-4 border-t border-[oklch(0.2_0.02_270/0.5)]">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea ref={inputRef} value={input} onChange={(e) => { setInput(e.target.value); autoResize() }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder={streaming ? "AI is responding..." : "Type a message..."} disabled={streaming} rows={1} className="w-full px-4 py-3 pr-12 rounded-xl glass border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.4)] focus:shadow-[0_0_20px_oklch(0.65_0.25_290/0.08)] transition-all duration-200 disabled:opacity-50 resize-none max-h-40" />
            </div>
            {streaming ? (
              <button onClick={handleStop} className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 hover:shadow-[0_0_20px_oklch(0.6_0.2_0/0.15)] transition-all duration-200">
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white hover:shadow-[0_0_25px_oklch(0.65_0.25_290/0.3)] transition-all duration-200 disabled:opacity-40 disabled:hover:shadow-none">
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-[oklch(0.4_0.02_270)] mt-3 text-center">Powered by OpenRouter · No data is logged on our servers</p>
        </div>
      </div>
    </div>
  )
}
