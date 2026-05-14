import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") // "pending" | "paid" | "all"
  const driver = searchParams.get("driver") // filter by driver name

  try {
    let query = `
      SELECT s.*, d.vehicle as driverVehicle 
      FROM schedules s 
      LEFT JOIN drivers d ON LOWER(TRIM(s.driver)) = LOWER(TRIM(d.name))
    `
    const params: string[] = []
    const conditions: string[] = []

    if (filter === "pending") {
      conditions.push("s.status = 'nunggak'")
    } else if (filter === "paid") {
      conditions.push("s.status = 'lunas'")
    }

    if (driver) {
      conditions.push("s.driver LIKE ?")
      params.push(`%${driver}%`)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY s.id DESC"

    const [rows] = await pool.execute(query, params)

    const schedules = (rows as Array<Record<string, unknown>>).map(row => ({
      ...row,
      vehicle: row.vehicle || row.driverVehicle || null,
    }))

    return NextResponse.json({
      schedules,
      count: schedules.length,
    })
  } catch (error) {
    console.error("DB Error:", error)
    return NextResponse.json({ error: `Database error: ${error}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driver, vehicle, date, origin, destination, rit, orderType, fare, notes } = body

    if (!driver || !fare) {
      return NextResponse.json({ error: "Driver dan fare wajib diisi" }, { status: 400 })
    }

    const companyShare = Math.round((fare || 0) * 0.4)

    const [result] = await pool.execute(
      `INSERT INTO schedules (driver, vehicle, date, origin, destination, rit, orderType, fare, status, companyShare, paidCompanyAmount, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'nunggak', ?, 0, ?, NOW())`,
      [
        driver,
        vehicle || null,
        date || new Date().toISOString().split("T")[0],
        origin || null,
        destination || null,
        rit || null,
        orderType || "online",
        fare,
        companyShare,
        notes || null,
      ]
    )

    const insertId = (result as { insertId: number }).insertId

    return NextResponse.json({ success: true, id: insertId }, { status: 201 })
  } catch (error) {
    console.error("DB Error:", error)
    return NextResponse.json({ error: `Database error: ${error}` }, { status: 500 })
  }
}
