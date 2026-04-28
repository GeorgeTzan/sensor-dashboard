"use client"

import { useState, useEffect } from "react"
import { Edit2, X, UserPlus, Shield, Loader2, Trash2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  })

  useEffect(() => {
    if (!sessionPending && session && session.user?.role !== "admin") {
      window.location.href = "/dashboard"
    }
  }, [session, sessionPending])

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
        const res = await authClient.admin.listUsers({
            query: { limit: 100 }
        })
        if (res.error) throw new Error(res.error.message)
        return res.data.users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || 'user'
        }))
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
        const res = await authClient.admin.createUser({
            email: data.email,
            password: data.password,
            name: data.name,
            role: data.role
        })
        if (res.error) throw new Error(res.error.message)
        return res.data
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] })
        handleClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
        if (!selectedUser) return
        const res = await authClient.admin.setRole({
            userId: selectedUser.id,
            role: data.role
        })
        if (res.error) throw new Error(res.error.message)
        return res.data
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] })
        handleClose()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
        const res = await authClient.admin.removeUser({ userId })
        if (res.error) throw new Error(res.error.message)
        return res.data
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role
    })
    setIsDrawerOpen(true)
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    setTimeout(() => {
        setSelectedUser(null)
        setFormData({ name: "", email: "", password: "", role: "user" })
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUser) {
        updateMutation.mutate(formData)
    } else {
        createMutation.mutate(formData)
    }
  }

  if (sessionPending || (session && session.user?.role !== "admin")) {
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
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Clearance</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading personnel data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-rose-400">Failed to load personnel data</td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No personnel found</td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-[#0B1120] transition-colors">
                    <td className="px-4 py-2 font-medium text-slate-200">{user.name}</td>
                    <td className="px-4 py-2 text-slate-400">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-1 text-xs text-slate-300">
                        <Shield className="h-3 w-3 text-[#06b6d4]" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-[#06b6d4] transition-colors"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => { if(confirm("Remove this user?")) deleteMutation.mutate(user.id) }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!!selectedUser}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!!selectedUser}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4] disabled:opacity-50"
                />
              </div>
              {!selectedUser && (
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Initial Password</label>
                    <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                    />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Clearance Level</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full rounded-md border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                >
                  <option value="admin">Administrator</option>
                  <option value="user">Operator</option>
                </select>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full rounded-md bg-[#06b6d4] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors hover:bg-cyan-400 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Syncing..." : selectedUser ? "Save Changes" : "Provision User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
