import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, vehicle, vehicleType, vehicleYear, phone, email, address, status, joinDate FROM drivers WHERE status = 'aktif' ORDER BY name ASC"
    )
    return NextResponse.json({ drivers: rows })
  } catch (error) {
    console.error("DB Error:", error)
    return NextResponse.json({ error: `Database error: ${error}` }, { status: 500 })
  }
}
