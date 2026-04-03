"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, Activity, Database, Loader2, AlertTriangle, Radio } from "lucide-react"
import Link from "next/link"

interface Measurement {
  id: string
  value: number
  timestamp: string
}

interface SensorDetails {
  id: string
  name: string
  type: string
  measurements: Measurement[]
}

const fetchSensorDetails = async (id: string): Promise<SensorDetails> => {
  const res = await fetch(`/api/proxy/sensors/${id}`)
  if (!res.ok) throw new Error("Failed to fetch sensor details")
  return res.json()
}

export default function SensorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const { data: sensor, isLoading, isError } = useQuery({
    queryKey: ["sensor", id],
    queryFn: () => fetchSensorDetails(id),
    refetchInterval: 3000,
    enabled: !!id
  })

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const chartData = sensor?.measurements?.map(m => ({
    time: formatTime(m.timestamp),
    value: m.value,
    rawTimestamp: m.timestamp
  })).sort((a, b) => new Date(a.rawTimestamp).getTime() - new Date(b.rawTimestamp).getTime()) || []

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-[#06b6d4]">
        <Loader2 className="mb-4 h-12 w-12 animate-spin" />
        <p className="text-sm font-medium tracking-tight">Syncing node telemetry...</p>
      </div>
    )
  }

  if (isError || !sensor) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-rose-400">
        <AlertTriangle className="mb-4 h-12 w-12" />
        <h2 className="mb-2 text-xl font-semibold">Telemetry Error</h2>
        <p className="mb-6 text-sm text-slate-400">Failed to retrieve data for node ID: {id}</p>
        <Link 
          href="/dashboard"
          className="rounded-md bg-[#1E293B] border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-[#0f172a] hover:text-[#06b6d4]"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const reversedMeasurements = [...(sensor.measurements || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center rounded-md border border-slate-700 bg-[#1E293B] p-2 text-slate-400 transition-colors hover:text-[#06b6d4]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-200 tracking-tight">{sensor.name}</h1>
              <span className="inline-flex items-center rounded bg-[#0f172a] border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-[#06b6d4] uppercase tracking-wider">
                {sensor.type}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">ID: {sensor.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#1E293B] px-3 py-1.5 text-sm font-medium text-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Live Feed Active
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:h-[700px]">
        <div className="flex flex-col rounded-lg border border-slate-700 bg-[#1E293B] lg:w-[70%]">
          <div className="border-b border-slate-700 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-200">Telemetry Visualization</h3>
          </div>
          <div className="flex-1 p-6 h-[400px] min-h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '8px', 
                      border: '1px solid #334155', 
                      color: '#e2e8f0'
                    }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 600 }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#06b6d4", stroke: "#0f172a", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <Database className="mb-4 h-12 w-12 opacity-20" />
                <p className="text-sm font-medium">Awaiting telemetry data...</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:w-[30%] h-full">
          <div className="rounded-lg border border-slate-700 bg-[#1E293B] p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-200 border-b border-slate-700 pb-2">Node Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#0f172a] p-2 text-[#06b6d4]">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-medium text-slate-200">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#0f172a] p-2 text-[#06b6d4]">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Readings</p>
                  <p className="text-sm font-medium text-slate-200">{sensor.measurements.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-slate-700 bg-[#1E293B] flex-1 overflow-hidden">
            <div className="border-b border-slate-700 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-200">Live Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {reversedMeasurements.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-md bg-[#0f172a] p-3 border border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#06b6d4]">{m.value}</span>
                    <span className="text-xs font-mono text-slate-500">{formatTime(m.timestamp)}</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#06b6d4] opacity-50"></div>
                </div>
              ))}
              {reversedMeasurements.length === 0 && (
                <p className="text-center text-xs text-slate-500 mt-4">No data points</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
