"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Sparkles } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/image", label: "Images" },
  { href: "/pricing", label: "Pricing" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.2_0.02_270/0.5)] backdrop-blur-xl bg-[oklch(0.021_0.008_270/0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">cbe_boy7</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[oklch(0.6_0.02_270)] hover:text-[oklch(0.9_0.02_270)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/chat"
                  className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Link>
                <UserButton />
              </div>
            ) : (
              <>
                <button
                  onClick={() => openSignIn()}
                  className="text-sm text-[oklch(0.6_0.02_270)] hover:text-[oklch(0.9_0.02_270)] transition-colors"
                >
                  Log in
                </button>
                <Link
                  href="/auth/signup"
                  className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[oklch(0.2_0.02_270/0.5)]">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-[oklch(0.6_0.02_270)] hover:text-[oklch(0.9_0.02_270)] transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[oklch(0.2_0.02_270/0.5)] space-y-3">
              {isSignedIn ? (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-[oklch(0.6_0.02_270)]">{user?.emailAddresses?.[0]?.emailAddress}</span>
                  <UserButton />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { openSignIn(); setOpen(false) }}
                    className="block w-full text-left text-sm text-[oklch(0.6_0.02_270)]"
                  >
                    Log in
                  </button>
                  <Link
                    href="/auth/signup"
                    className="block text-center text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] text-white font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function UserButton() {
  const { user, signOut } = useClerk()
  return (
    <div className="relative group">
      <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] flex items-center justify-center text-white text-sm font-medium overflow-hidden">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"
        )}
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[oklch(0.2_0.02_270/0.5)] bg-[oklch(0.06_0.01_270)] backdrop-blur-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        <div className="px-4 py-2 border-b border-[oklch(0.2_0.02_270/0.5)]">
          <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
          <p className="text-xs text-[oklch(0.5_0.02_270)] truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
        </div>
        <Link href="/settings" className="block px-4 py-2 text-sm text-[oklch(0.6_0.02_270)] hover:text-[oklch(0.9_0.02_270)] hover:bg-[oklch(0.09_0.01_270/0.5)]">
          Settings
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[oklch(0.09_0.01_270/0.5)]"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
