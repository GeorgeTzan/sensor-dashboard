import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("Ingest request received")
  const apiKey = request.headers.get("x-sensor-api-key")
  if (apiKey !== process.env.SENSOR_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const res = await fetch("http://backend:8000/measurements/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status })
    }
    return NextResponse.json({ status: "success" }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}