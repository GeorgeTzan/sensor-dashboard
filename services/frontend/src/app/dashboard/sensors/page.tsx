"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Loader2, Plus, X, AlertTriangle, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

interface Category {
  id: string
  name: string
}

interface Sensor {
  id: string
  name: string
  description: string
  type: string
  categories: Category[]
}

const fetchSensors = async (): Promise<Sensor[]> => {
  const res = await fetch("/api/proxy/sensors")
  if (!res.ok) throw new Error("Failed to fetch sensors")
  return res.json()
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch("/api/proxy/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

interface SensorData {
    name: string
    description: string
    type: string
    category_ids: string[]
}

const createSensor = async (newSensor: SensorData) => {
  const res = await fetch("/api/proxy/sensors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSensor),
  })
  if (!res.ok) throw new Error("Failed to create sensor")
  return res.json()
}

const updateSensor = async ({ id, ...data }: SensorData & { id: string }) => {
  const res = await fetch(`/api/proxy/sensors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update sensor")
  return res.json()
}

const deleteSensor = async (id: string) => {
  const res = await fetch(`/api/proxy/sensors/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete sensor")
  return res.json()
}

export default function SensorsPage() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const isAdmin = session?.user?.role === "admin"
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null)
  const [formData, setFormData] = useState<SensorData>({
    name: "",
    description: "",
    type: "TEMPERATURE",
    category_ids: []
  })

  const { data: sensors, isLoading, isError } = useQuery({
    queryKey: ["sensors"],
    queryFn: fetchSensors
  })

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isAdmin
  })

  const createMutation = useMutation({
    mutationFn: createSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] })
      closeDrawer()
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] })
      closeDrawer()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] })
    }
  })

  const openCreate = () => {
    setEditingSensor(null)
    setFormData({ name: "", description: "", type: "TEMPERATURE", category_ids: [] })
    setIsDrawerOpen(true)
  }

  const openEdit = (sensor: Sensor) => {
    setEditingSensor(sensor)
    setFormData({
      name: sensor.name,
      description: sensor.description,
      type: sensor.type,
      category_ids: sensor.categories.map(c => c.id)
    })
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingSensor(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSensor) {
      updateMutation.mutate({ id: editingSensor.id, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const toggleCategory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(id) 
        ? prev.category_ids.filter(cid => cid !== id)
        : [...prev.category_ids, id]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Sensors</h1>
      </div>

      <div className="rounded-lg border border-slate-700 bg-[#1E293B] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-200">Active Sensors</h3>
          {isAdmin && (
            <button
              onClick={openCreate}
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
                  <th className="px-4 py-2">Node Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Categories</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sensors?.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-[#0B1120] transition-colors">
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-200">{sensor.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{sensor.id}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded bg-[#0f172a] border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-[#06b6d4] uppercase tracking-wider">
                        {sensor.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                        <div className="flex gap-1">
                            {sensor.categories?.map(c => (
                                <span key={c.id} className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                                    {c.name}
                                </span>
                            ))}
                        </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => openEdit(sensor)}
                              className="p-1.5 text-slate-400 hover:text-[#06b6d4] transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate(sensor.id) }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <Link 
                          href={`/dashboard/sensors/${sensor.id}`}
                          className="p-1.5 text-slate-400 hover:text-[#06b6d4] transition-colors"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && isDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {isAdmin && (
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-[#1E293B] border-l border-slate-700 p-6 shadow-xl transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">
                {editingSensor ? "Update Sensor" : "Add New Sensor"}
            </h2>
            <button
              onClick={closeDrawer}
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Base Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-[#0f172a] px-3 py-2 text-sm text-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
              >
                <option value="TEMPERATURE">TEMPERATURE</option>
                <option value="HUMIDITY">HUMIDITY</option>
                <option value="MULTI">MULTIPLE</option>
              </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Functional Categories</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {categories?.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                formData.category_ids.includes(cat.id)
                                    ? "bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]"
                                    : "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full flex items-center justify-center rounded-md bg-[#06b6d4] px-4 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#0891b2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  editingSensor ? "Update Details" : "Create Node"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
