import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch("http://backend:8000/sensors")
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const res = await fetch("http://backend:8000/sensors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(errorData, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}