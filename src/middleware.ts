import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const protectedRoutes = createRouteMatcher(["/chat(.*)", "/image(.*)", "/settings(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) await auth.protect()
})

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
}
