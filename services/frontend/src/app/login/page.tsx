"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { GraduationCap, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard"
      }, {
        onSuccess: () => {
          router.push("/dashboard")
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid credentials")
        }
      })
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-[#003366] mb-4">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-[#003366] tracking-tight">Academic Portal</h1>
          <p className="text-slate-500 text-sm">IoT Sensor Research Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block" htmlFor="email">
              University Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-md focus:ring-2 focus:ring-[#003366] text-slate-900 transition-all outline-none"
              placeholder="e.g. researcher@uoi.gr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block" htmlFor="password">
              Security Token
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-md focus:ring-2 focus:ring-[#003366] text-slate-900 transition-all outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#003366] text-white rounded-md font-medium hover:bg-[#002244] focus:ring-4 focus:ring-[#003366]/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              "Authorize Access"
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            System monitored for research integrity and academic compliance.
          </p>
        </div>
      </div>
    </div>
  )
}
