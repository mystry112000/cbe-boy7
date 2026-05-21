import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider, apiKey, model } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured. Add one in Settings." }, { status: 400 })
    }

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
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter" ? { "HTTP-Referer": "https://zeno-ai-wine.vercel.app", "X-Title": "Zeno AI" } : {}),
      },
      body: JSON.stringify({
        model: model || "dall-e-3",
        prompt,
        n: 4,
        size: "1024x1024",
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
