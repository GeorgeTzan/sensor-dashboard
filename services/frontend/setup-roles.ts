import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: "postgresql://admin:9d7de2b87a20cab4b04d5e540c7712fd@localhost:5432/sensor_dashboard",
})

const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()]
})

async function main() {
  try {
    // 1. Delete existing users to prevent dupes
    await pool.query("DELETE FROM \"user\" WHERE email IN ($1, $2)", ["admin@uoi.gr", "user@uoi.gr"])

    // 2. Create users (Standard signups)
    await auth.api.signUpEmail({
      body: {
        email: "admin@uoi.gr",
        password: "adminpassword",
        name: "UoI Admin"
      }
    })
    console.log("Admin account registered...")

    await auth.api.signUpEmail({
      body: {
        email: "user@uoi.gr",
        password: "userpassword",
        name: "UoI Student"
      }
    })
    console.log("User account registered...")

    // 3. Force update roles directly in the Database
    await pool.query("UPDATE \"user\" SET role = 'admin' WHERE email = 'admin@uoi.gr'")
    await pool.query("UPDATE \"user\" SET role = 'user' WHERE email = 'user@uoi.gr'")
    console.log("Roles successfully assigned in the database!")

    process.exit(0)
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}

main()