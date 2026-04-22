"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Loader2, Plus, X, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

interface Sensor {
  id: string
  name: string
  description: string
  type: string
}

const fetchSensors = async (): Promise<Sensor[]> => {
  const res = await fetch("/api/proxy/sensors")
  if (!res.ok) throw new Error("Failed to fetch sensors")
  return res.json()
}

const createSensor = async (newSensor: { name: string; description: string; type: string }) => {
  const res = await fetch("/api/proxy/sensors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSensor),
  })
  if (!res.ok) throw new Error("Failed to create sensor")
  return res.json()
}

export default function SensorsPage() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "TEMPERATURE"
  })

  const { data: sensors, isLoading, isError } = useQuery({
    queryKey: ["sensors"],
    queryFn: fetchSensors
  })

  const createMutation = useMutation({
    mutationFn: createSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] })
      setIsDrawerOpen(false)
      setFormData({ name: "", description: "", type: "TEMPERATURE" })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Sensors</h1>
      </div>

      <div className="rounded-lg border border-slate-700 bg-[#1E293B] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-200">Active Sensors</h3>
          {((session?.user as any)?.role === "admin") && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded bg-[#06b6d4] px-3 py-1.5 text-xs font-semibold text-[#0f172a] hover:bg-[#0891b2] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Sensor
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#06b6d4]">
            <Loader2 className="mb-2 h-8 w-8 animate-spin" />
            <p className="text-xs font-medium text-slate-400">Loading sensors...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-rose-400">
            <AlertTriangle className="mb-2 h-8 w-8" />
            <p className="text-xs font-medium">Failed to load sensors</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700 bg-[#0f172a] text-xs font-semibold text-slate-400">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sensors?.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-[#0B1120] transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-slate-400">
                      {sensor.id}
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-200">
                      {sensor.name}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded bg-[#0f172a] border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-[#06b6d4] uppercase tracking-wider">
                        {sensor.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-400 truncate max-w-[200px]">
                      {sensor.description}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link 
                        href={`/dashboard/sensors/${sensor.id}`}
                        className="inline-flex items-center justify-center rounded p-1 text-slate-400 hover:bg-[#0f172a] hover:text-[#06b6d4] transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {((session?.user as any)?.role === "admin") && isDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {((session?.user as any)?.role === "admin") && (
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-[#1E293B] border-l border-slate-700 p-6 shadow-xl transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Add New Sensor</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-[#0f172a] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                placeholder="e.g., Temp Node A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-[#0f172a] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                placeholder="e.g., North sector thermal sensor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-[#0f172a] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
              >
                <option value="TEMPERATURE">TEMPERATURE</option>
                <option value="HUMIDITY">HUMIDITY</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full flex items-center justify-center rounded-md bg-[#06b6d4] px-4 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#0891b2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Sensor"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
