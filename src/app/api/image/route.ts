import { NextRequest, NextResponse } from "next/server"

const sizeMap: Record<string, string> = {
  "1:1": "1024x1024",
  "16:9": "1024x576",
  "9:16": "576x1024",
  "4:3": "1024x768",
  "3:4": "768x1024",
}

const ratioMap: Record<string, string> = {
  "1:1": "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3": "4:3",
  "3:4": "3:4",
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider, apiKey, model, ratio } = await req.json()

    const key = apiKey || (provider === "openrouter" ? process.env.OPENROUTER_API_KEY : "")
    if (!key) {
      return NextResponse.json({ error: "API key not configured. Add one in Settings." }, { status: 400 })
    }

    if (provider === "openrouter") {
      const modelId = model || "google/gemini-2.5-flash-image"
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": "https://zeno-ai-wine.vercel.app",
          "X-Title": "Zeno AI",
        },
        body: JSON.stringify({
          model: modelId,
          modalities: ["image", "text"],
          messages: [{ role: "user", content: prompt }],
          ...(ratio ? { image_config: { aspect_ratio: ratioMap[ratio] || "1:1", image_size: "1K" } } : {}),
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `API error: ${err}` }, { status: res.status })
      }

      const data = await res.json()
      const images = data.choices?.[0]?.message?.images?.map((img: any) => ({
        url: img.image_url?.url || "",
      })) || []
      return NextResponse.json({ images })
    }

    const baseUrl = provider === "openai" ? "https://api.openai.com/v1" : "https://api.openai.com/v1"
    const size = sizeMap[ratio] || "1024x1024"

    const res = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model || "dall-e-3",
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
