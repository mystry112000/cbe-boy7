import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider, apiKey, model, ratio } = await req.json()

    const key = apiKey || (provider === "openrouter" ? process.env.OPENROUTER_API_KEY : "")
    if (!key) {
      return NextResponse.json({ error: "API key not configured. Add one in Settings." }, { status: 400 })
    }

    const sizeMap: Record<string, string> = {
      "1:1": "1024x1024",
      "16:9": "1024x576",
      "9:16": "576x1024",
      "4:3": "1024x768",
      "3:4": "768x1024",
    }
    const size = sizeMap[ratio] || "1024x1024"

    let baseUrl: string
    switch (provider) {
      case "openrouter":
        baseUrl = "https://openrouter.ai/api/v1"
        break
      case "gemini":
        return NextResponse.json({ error: "Gemini image generation not supported via this endpoint. Use OpenAI-compatible providers." }, { status: 400 })
      default:
        baseUrl = "https://api.openai.com/v1"
    }

    const res = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        ...(provider === "openrouter" ? { "HTTP-Referer": "https://zeno-ai-wine.vercel.app", "X-Title": "Zeno AI" } : {}),
      },
      body: JSON.stringify({
        model: model || (provider === "openrouter" ? "black-forest-labs/flux-schnell" : "dall-e-3"),
        prompt,
        n: 4,
        size,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `API error: ${err}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ images: data.data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
