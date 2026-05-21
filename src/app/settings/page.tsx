"use client"

import { useState, useEffect } from "react"
import { Sparkles, Save, RefreshCw, ExternalLink } from "lucide-react"
import { getConfig, saveConfig, type AIConfig } from "@/lib/ai"

const providers = [
  {
    id: "openrouter" as const,
    name: "OpenRouter",
    desc: "Access many models (including free ones) with one API",
    url: "https://openrouter.ai/keys",
    defaultChat: "openrouter/free",
    defaultImage: "black-forest-labs/flux-schnell",
  },
  {
    id: "openai" as const,
    name: "OpenAI",
    desc: "Official OpenAI API (GPT-4, DALL-E, etc.)",
    url: "https://platform.openai.com/api-keys",
    defaultChat: "gpt-3.5-turbo",
    defaultImage: "dall-e-3",
  },
  {
    id: "gemini" as const,
    name: "Google Gemini",
    desc: "Google's Gemini API with generous free tier",
    url: "https://aistudio.google.com/apikey",
    defaultChat: "gemini-2.0-flash",
    defaultImage: "",
  },
]

export default function SettingsPage() {
  const [config, setConfig] = useState<AIConfig>(getConfig())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfig(getConfig())
  }, [])

  function handleSave() {
    saveConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const currentProvider = providers.find((p) => p.id === config.provider)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-[oklch(0.65_0.25_290)]" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="rounded-2xl border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.09_0.01_270/0.3)] p-8 space-y-8">
          <div>
            <label className="block text-sm font-medium mb-3">AI Provider</label>
            <div className="grid gap-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setConfig({ ...config, provider: p.id, chatModel: p.defaultChat, imageModel: p.defaultImage })}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    config.provider === p.id
                      ? "border-[oklch(0.65_0.25_290)] bg-[oklch(0.65_0.25_290/0.08)]"
                      : "border-[oklch(0.2_0.02_270/0.5)] hover:bg-[oklch(0.09_0.01_270/0.5)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{p.name}</span>
                    {config.provider === p.id && (
                      <span className="text-xs text-[oklch(0.65_0.25_290)]">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-[oklch(0.5_0.02_270)]">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">API Key <span className="text-[oklch(0.4_0.02_270)] font-normal">(optional for OpenRouter)</span></label>
              {currentProvider && (
                <a
                  href={currentProvider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[oklch(0.65_0.25_290)] hover:underline flex items-center gap-1"
                >
                  Get a {currentProvider.name} key
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={config.provider === "openrouter" ? "Leave blank to use server key" : "sk-..."}
              className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm font-mono text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
            />
          </div>

          {config.provider !== "gemini" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Chat Model</label>
                <input
                  type="text"
                  value={config.chatModel}
                  onChange={(e) => setConfig({ ...config, chatModel: e.target.value })}
                  placeholder={currentProvider?.defaultChat}
                  className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm font-mono text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image Model</label>
                <input
                  type="text"
                  value={config.imageModel}
                  onChange={(e) => setConfig({ ...config, imageModel: e.target.value })}
                  placeholder={currentProvider?.defaultImage || "N/A"}
                  className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm font-mono text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
                />
              </div>
            </div>
          )}

          {config.provider === "gemini" && (
            <div>
              <label className="block text-sm font-medium mb-2">Gemini Model</label>
              <input
                type="text"
                value={config.chatModel}
                onChange={(e) => setConfig({ ...config, chatModel: e.target.value })}
                placeholder="gemini-2.0-flash"
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.06_0.01_270)] border border-[oklch(0.2_0.02_270/0.5)] text-sm font-mono text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>

          <div className="rounded-xl bg-[oklch(0.65_0.25_290/0.08)] border border-[oklch(0.65_0.25_290/0.15)] p-4">
            <p className="text-xs text-[oklch(0.6_0.02_270)]">
              <strong>Works out of the box!</strong> OpenRouter is pre-configured with a server-side key —
              just select it and start using the app. Chat model <code className="text-[oklch(0.65_0.25_290)]">openrouter/free</code>
              automatically routes to the best free model. If you want to use your own key or a different provider,
              paste it above and it'll be stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
