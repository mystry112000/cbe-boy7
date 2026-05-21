"use client"

import { useState } from "react"
import { Sparkles, Download, RefreshCw, Settings } from "lucide-react"
import Link from "next/link"
import { getConfig } from "@/lib/ai"

const styles = ["Photorealistic", "Anime", "Oil Painting", "3D Render", "Pixel Art", "Watercolor"]
const ratios = ["1:1", "16:9", "9:16", "4:3", "3:4"]

export default function ImagePage() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState(styles[0])
  const [ratio, setRatio] = useState(ratios[0])
  const [generating, setGenerating] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState("")

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError("")

    const config = getConfig()

    if (!config.apiKey) {
      setError("No API key configured. Go to Settings to add one.")
      setGenerating(false)
      return
    }

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${style}: ${prompt}`,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.imageModel,
          ratio,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setImages(data.images.map((img: any) => img.url))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload(imgUrl: string) {
    try {
      const res = await fetch(imgUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "zeno-image.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {}
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[oklch(0.65_0.25_290)]" />
            <h1 className="text-2xl font-bold">Image Generation</h1>
          </div>
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-[oklch(0.09_0.01_270/0.5)] transition-colors"
          >
            <Settings className="w-4 h-4 text-[oklch(0.5_0.02_270)]" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.09_0.01_270/0.3)] p-6 min-h-[400px] flex items-center justify-center">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full">
                  {images.map((img, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-[oklch(0.06_0.01_270)]">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDownload(img)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[oklch(0.4_0.02_270)]">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Enter a prompt and generate to see images here</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.09_0.01_270/0.5)] border border-[oklch(0.2_0.02_270/0.5)] text-sm text-foreground placeholder-[oklch(0.4_0.02_270)] outline-none focus:border-[oklch(0.65_0.25_290/0.5)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      style === s
                        ? "border-[oklch(0.65_0.25_290)] bg-[oklch(0.65_0.25_290/0.1)] text-[oklch(0.75_0.2_290)]"
                        : "border-[oklch(0.2_0.02_270/0.5)] text-[oklch(0.6_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                {ratios.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      ratio === r
                        ? "border-[oklch(0.65_0.25_290)] bg-[oklch(0.65_0.25_290/0.1)] text-[oklch(0.75_0.2_290)]"
                        : "border-[oklch(0.2_0.02_270/0.5)] text-[oklch(0.6_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
