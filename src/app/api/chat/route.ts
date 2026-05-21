import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { messages, provider, apiKey, model } = await req.json()

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
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
      const url = `${baseUrl}/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`
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
        return new Response(JSON.stringify({ error: `Gemini API error: ${err}` }), {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        })
      }

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body!.getReader()
          const decoder = new TextDecoder()
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
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`))
                  }
                } catch {}
              }
            }
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
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter"
          ? { "HTTP-Referer": "https://cbe-boy7.vercel.app", "X-Title": "cbe_boy7" }
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
      return new Response(JSON.stringify({ error: `API error: ${err}` }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
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
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
