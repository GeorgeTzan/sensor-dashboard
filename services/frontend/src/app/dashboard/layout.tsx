"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Radio, Users, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/sensors", label: "Sensors", icon: Radio },
    ...(session?.user?.role === "admin" ? [{ href: "/dashboard/users", label: "Users", icon: Users }] : []),
  ]

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login"
        },
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-[#0B1120]">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-[#0f172a] flex flex-col">
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4 flex-grow">
          <div className="mb-6 px-3 py-2 text-xl font-bold tracking-wider text-[#06b6d4]">
            SensorHub
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#1E293B] text-[#06b6d4]"
                      : "text-slate-400 hover:bg-[#1E293B] hover:text-slate-200"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-900/50 hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
