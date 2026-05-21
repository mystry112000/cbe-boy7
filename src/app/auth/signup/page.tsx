import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

export default function SignupPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10">
        <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              card: "bg-[oklch(0.09_0.01_270/0.3)] border border-[oklch(0.2_0.02_270/0.5)] shadow-none",
              headerTitle: "text-foreground",
              headerSubtitle: "text-[oklch(0.5_0.02_270)]",
              formButtonPrimary: "bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.55_0.2_250)] hover:opacity-90",
              formFieldInput: "bg-[oklch(0.06_0.01_270)] border-[oklch(0.2_0.02_270/0.5)] text-foreground",
              formFieldLabel: "text-[oklch(0.5_0.02_270)]",
              footerActionLink: "text-[oklch(0.65_0.25_290)]",
              socialButtonsBlockButton: "border-[oklch(0.2_0.02_270/0.5)] text-[oklch(0.8_0.02_270)] hover:bg-[oklch(0.12_0.01_270/0.5)]",
              dividerLine: "bg-[oklch(0.2_0.02_270/0.5)]",
              dividerText: "text-[oklch(0.4_0.02_270)]",
            },
          }}
          signInUrl="/auth/login"
        />
      </div>
    </div>
  )
}
