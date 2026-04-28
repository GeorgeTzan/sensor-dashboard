import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const resolution = searchParams.get("resolution") || "hour"
    
    const res = await fetch(`http://backend:8000/sensors/${id}?resolution=${resolution}`)
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const res = await fetch(`http://backend:8000/sensors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id } = await params
    const res = await fetch(`http://backend:8000/sensors/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status })
    }
    return NextResponse.json({ status: "success" })
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}