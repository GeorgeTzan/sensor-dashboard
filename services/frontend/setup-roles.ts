import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: "postgresql://admin:9d7de2b87a20cab4b04d5e540c7712fd@db:5432/sensor_dashboard",
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
    await pool.query("DELETE FROM \"user\" WHERE email IN (\$1, \$2, \$3, \$4)", ["admin@uoi.gr", "user@uoi.gr", "admin@orailab.gr", "user@orailab.gr"])

    await auth.api.signUpEmail({
      body: {
        email: "admin@orailab.gr",
        password: "adminpassword",
        name: "Administrator"
      }
    })
    console.log("Admin account registered...")

    await auth.api.signUpEmail({
      body: {
        email: "user@orailab.gr",
        password: "userpassword",
        name: "Operator"
      }
    })
    console.log("User account registered...")

    await pool.query("UPDATE \"user\" SET role = 'admin', username = 'admin' WHERE email = 'admin@orailab.gr'")
    await pool.query("UPDATE \"user\" SET role = 'user', username = 'user' WHERE email = 'user@orailab.gr'")
    console.log("Roles and usernames successfully assigned in the database!")

    process.exit(0)
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}

main()