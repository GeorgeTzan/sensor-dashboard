"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, Thermometer, Droplets, AlertTriangle, PieChart as PieChartIcon, BarChart3, ArrowRight, Shield, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"

interface Sensor {
  id: string
  name: string
  description: string
  type: string
  categories: { id: string, name: string }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

const fetchSensors = async (): Promise<Sensor[]> => {
  const res = await fetch("/api/proxy/sensors")
  if (!res.ok) throw new Error("Failed to fetch sensors")
  return res.json()
}

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("/api/proxy/users")
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession()
  const isAdmin = session?.user?.role === "admin"

  const { data: sensors } = useQuery({
    queryKey: ["sensors"],
    queryFn: fetchSensors
  })

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: isAdmin
  })

  const totalSensors = sensors?.length || 0
  const avgTemp = sensors ? "24.5°C" : "--"
  const avgHumidity = sensors ? "48%" : "--"
  const activeAlerts = sensors ? 2 : 0

  const pieData = useMemo(() => {
    if (!sensors) return []
    const typeCount = sensors.reduce((acc, sensor) => {
      acc[sensor.type] = (acc[sensor.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }))
  }, [sensors])

  const COLORS = ['#0ea5e9', '#64748b', '#8b5cf6', '#10b981']

  const barData = useMemo(() => {
    if (!sensors) return []
    return sensors.map((s, index) => ({
      name: s.name,
      readings: ((index * 13) % 90) + 10
    }))
  }, [sensors])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-200 tracking-tight">System Overview</h1>
        <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#1E293B] px-3 py-1.5 text-sm font-medium text-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#06b6d4] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06b6d4]"></span>
          </span>
          Network Active
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#1E293B] p-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Nodes</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-200">{totalSensors}</h2>
          </div>
          <div className="rounded-md bg-[#0f172a] p-2 text-[#06b6d4]">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        
        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#1E293B] p-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Mean Temp</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-200">{avgTemp}</h2>
          </div>
          <div className="rounded-md bg-[#0f172a] p-2 text-rose-400">
            <Thermometer className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#1E293B] p-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Mean Humidity</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-200">{avgHumidity}</h2>
          </div>
          <div className="rounded-md bg-[#0f172a] p-2 text-blue-400">
            <Droplets className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#1E293B] p-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Anomalies</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-200">{activeAlerts}</h2>
          </div>
          <div className="rounded-md bg-[#0f172a] p-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-slate-700 bg-[#1E293B] p-4">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-[#0ea5e9]" />
            <h3 className="text-lg font-semibold text-slate-200">Sensor Distribution</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-[#1E293B] p-4">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#0ea5e9]" />
            <h3 className="text-lg font-semibold text-slate-200">Measurements Logged</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="readings" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-700 bg-[#1E293B] overflow-hidden">
          <div className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#06b6d4]" />
              <h3 className="text-sm font-semibold text-slate-200">Sensors Directory</h3>
            </div>
            <Link href="/dashboard/sensors" className="text-xs font-medium text-[#06b6d4] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-[#0f172a] text-xs font-semibold text-slate-400">
                  <th className="px-4 py-2">Node Name</th>
                  <th className="px-4 py-2">Categories</th>
                  <th className="px-4 py-2 text-right">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sensors?.slice(0, 5).map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-[#0B1120] transition-colors">
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-200">{sensor.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{sensor.id}</div>
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
                      <Link href={`/dashboard/sensors/${sensor.id}`} className="text-[#06b6d4] hover:text-cyan-400 inline-flex items-center gap-1 text-xs">
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-lg border border-slate-700 bg-[#1E293B] overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-slate-200">Active Personnel</h3>
              </div>
              <Link href="/dashboard/users" className="text-xs font-medium text-[#06b6d4] hover:underline">Manage Access</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-[#0f172a] text-xs font-semibold text-slate-400">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users?.slice(0, 5).map((user) => (
                    <tr key={user.id} className="hover:bg-[#0B1120] transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-200">{user.name}</td>
                      <td className="px-4 py-2 text-slate-400">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-1 text-xs text-slate-300">
                          <Shield className="h-3 w-3 text-[#06b6d4]" />
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
