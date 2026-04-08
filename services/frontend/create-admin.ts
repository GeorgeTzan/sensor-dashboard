import { betterAuth } from "better-auth"
import pg from "pg"

const auth = betterAuth({
  database: new pg.Pool({
    connectionString: "postgresql://admin:9d7de2b87a20cab4b04d5e540c7712fd@localhost:5432/sensor_dashboard",
  }),
  emailAndPassword: {
    enabled: true,
  },
})

async function main() {
  try {
    await auth.api.signUpEmail({
      body: {
        email: "gtzan@orailab.gr",
        password: "kyrite123",
        name: "George Tzan"
      }
    })
    console.log("Admin created successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Failed to create admin:", error)
    process.exit(1)
  }
}

main()