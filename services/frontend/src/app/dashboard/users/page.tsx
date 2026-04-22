"use client"

import { useState, useEffect } from "react"
import { Edit2, X, UserPlus, Shield, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

interface User {
  id: string | number
  name: string
  email: string
  role: string
  status: string
}

export default function UsersPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (!sessionPending && session && (session.user as any).role !== "admin") {
      window.location.href = "/dashboard"
    }
  }, [session, sessionPending])

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/proxy/users")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedUser(null), 300)
  }

  if (sessionPending || (session && (session.user as any).role !== "admin")) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[#06b6d4]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Access Control</h1>
        <button 
          onClick={() => { setSelectedUser(null); setIsDrawerOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-[#06b6d4] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors hover:bg-cyan-400"
        >
          <UserPlus className="h-4 w-4" />
          Provision User
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 bg-[#1E293B] overflow-hidden">
        <div className="border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-200">System Personnel</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700 bg-[#0f172a] text-xs font-semibold text-slate-400">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Clearance</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading personnel data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-rose-400">Failed to load personnel data</td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No personnel found</td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-[#0B1120] transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-slate-400">{user.id}</td>
                    <td className="px-4 py-2 font-medium text-slate-200">{user.name}</td>
                    <td className="px-4 py-2 text-slate-400">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-1 text-xs text-slate-300">
                        <Shield className="h-3 w-3 text-[#06b6d4]" />
                        {(user as any).role || 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        (user.status || 'Active') === 'Active' 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : user.status === 'Offline'
                          ? 'border-slate-500/20 bg-slate-500/10 text-slate-400'
                          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="inline-flex items-center justify-center rounded p-1 text-slate-400 transition-colors hover:bg-[#0f172a] hover:text-[#06b6d4]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 transition-opacity" onClick={handleClose} />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-slate-700 bg-[#1E293B] shadow-2xl transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-200">
              {selectedUser ? "Edit Personnel Profile" : "Provision New User"}
            </h2>
            <button 
              onClick={handleClose}
              className="rounded p-1 text-slate-400 hover:bg-[#0f172a] hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleClose(); }}>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={selectedUser?.name}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={selectedUser?.email}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Clearance Level</label>
                <select 
                  defaultValue={(selectedUser as any)?.role || "Viewer"}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
                <select 
                  defaultValue={selectedUser?.status || "Active"}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                >
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full rounded-md bg-[#06b6d4] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors hover:bg-cyan-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
