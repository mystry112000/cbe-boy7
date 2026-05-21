import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Chat", href: "/chat" },
      { label: "Images", href: "/image" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-[oklch(0.2_0.02_270/0.5)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Zeno</span>
            </Link>
            <p className="text-sm text-[oklch(0.5_0.02_270)] max-w-xs">
              Private, uncensored AI for unlimited creative freedom.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[oklch(0.5_0.02_270)] hover:text-[oklch(0.9_0.02_270)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-[oklch(0.2_0.02_270/0.5)] text-center text-sm text-[oklch(0.4_0.02_270)]">
          <p>&copy; {new Date().getFullYear()} Zeno. All rights reserved.</p>
          <p className="mt-2 text-xs text-[oklch(0.35_0.02_270)]">Made by Adhithya</p>
        </div>
      </div>
    </footer>
  )
}
