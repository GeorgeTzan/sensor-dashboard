import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  database: pool,
  trustedOrigins: ["http://localhost:3000", "https://sensor.orailab.gr", "http://sensor.orailab.gr"],
  advanced: { 
    useRuntimeURL: true,
  },
  session: {
    cookieCache: {
        enabled: true,
        maxBatchSize: 100
    },
    cookieOptions: {
      domain: "sensor.orailab.gr",
      secure: true,
      sameSite: "lax"
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin()
  ]
})
