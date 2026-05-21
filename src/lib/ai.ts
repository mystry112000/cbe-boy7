export interface AIConfig {
  provider: "openai" | "openrouter" | "gemini"
  apiKey: string
  chatModel: string
  imageModel: string
}

const DEFAULTS: AIConfig = {
  provider: "openrouter",
  apiKey: "",
  chatModel: "openrouter/free",
  imageModel: "black-forest-labs/flux-schnell",
}

export function getConfig(): AIConfig {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const stored = localStorage.getItem("zeno_config")
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch {}
  return DEFAULTS
}

export function saveConfig(config: Partial<AIConfig>) {
  const current = getConfig()
  const updated = { ...current, ...config }
  localStorage.setItem("zeno_config", JSON.stringify(updated))
  return updated
}

export function getBaseUrl(provider: string): string {
  switch (provider) {
    case "openrouter":
      return "https://openrouter.ai/api/v1"
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta"
    default:
      return "https://api.openai.com/v1"
  }
}
