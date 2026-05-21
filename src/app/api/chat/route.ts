import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages, provider, apiKey, model } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 400 })
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
      const geminiModel = model || "gemini-2.0-flash"
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
        return Response.json({ error: `Gemini error: ${err}` }, { status: res.status })
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
      return Response.json({ message: { role: "assistant", content: text } })
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter"
          ? { "HTTP-Referer": "https://zeno-ai-wine.vercel.app", "X-Title": "Zeno AI" }
          : {}),
      },
      body: JSON.stringify({
        model: model || "mistralai/mistral-7b-instruct:free",
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `API error: ${err}` }, { status: res.status })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = res.body!.getReader()
          let buffer = ""

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
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch {}
              }
            }
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (err: any) {
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
