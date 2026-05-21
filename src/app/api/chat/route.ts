import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages, provider, apiKey, model } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured. Add one in Settings." }, { status: 400 })
    }

    let baseUrl: string
    switch (provider) {
      case "openrouter":
        baseUrl = "https://openrouter.ai/api/v1"
        break
      case "gemini":
        baseUrl = "https://generativelanguage.googleapis.com/v1beta"
        break
      default:
        baseUrl = "https://api.openai.com/v1"
    }

    if (provider === "gemini") {
      const geminiModel = model.includes("gemini") ? model : "gemini-2.0-flash"
      const url = `${baseUrl}/models/${geminiModel}:generateContent?key=${apiKey}`
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `Gemini API error: ${err}` }, { status: res.status })
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
      return NextResponse.json({ message: { role: "assistant", content: text } })
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter" ? { "HTTP-Referer": "https://cbe-boy7.vercel.app", "X-Title": "cbe_boy7" } : {}),
      },
      body: JSON.stringify({
        model: model || "mistralai/mistral-7b-instruct:free",
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `API error: ${err}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ message: data.choices[0].message })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
