import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "https://sensor.orailab.gr",
  plugins: [
    adminClient()
  ]
})
