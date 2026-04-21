import { betterAuth } from "better-auth"
import pg from "pg"

const auth = betterAuth({
  database: new pg.Pool({
    connectionString: "postgresql://admin:9d7de2b87a20cab4b04d5e540c7712fd@db:5432/sensor_dashboard",
  }),
  emailAndPassword: {
    enabled: true,
  },
})

async function createAccount(email: string, name: string, password: string) {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    })
    console.log(`Account created: ${email} with password: ${password}`)
  } catch (error) {
    console.error(`Failed to create ${email}:`, error)
  }
}

async function main() {
  await createAccount("admin@uoi.gr", "UoI Admin", "adminpassword")
  await createAccount("user@uoi.gr", "UoI Student", "userpassword")
  process.exit(0)
}

main()
