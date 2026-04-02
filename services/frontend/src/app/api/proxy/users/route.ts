import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://backend:8000/users", {
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
