import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, paymentNotes } = body

    // Support single id or array of ids (batch)
    const scheduleIds: number[] = Array.isArray(ids) ? ids : [ids]

    if (scheduleIds.length === 0) {
      return NextResponse.json({ error: "ID orderan wajib" }, { status: 400 })
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ")

    for (const id of scheduleIds) {
      // Get current schedule to calculate full payment
      const [rows] = await pool.execute(
        "SELECT companyShare FROM schedules WHERE id = ?",
        [id]
      ) as any

      if (rows.length === 0) continue

      const companyShare = rows[0].companyShare

      // Update to lunas
      await pool.execute(
        `UPDATE schedules 
         SET status = 'lunas', 
             paidCompanyAmount = ?, 
             lastPaidAt = ?, 
             paidOffAt = ?, 
             payment_notes = ?
         WHERE id = ?`,
        [companyShare, now, now, paymentNotes || "Lunas", id]
      )
    }

    return NextResponse.json({
      success: true,
      updated: scheduleIds.length,
    })
  } catch (error) {
    console.error("Pay error:", error)
    return NextResponse.json({ error: `Database error: ${error}` }, { status: 500 })
  }
}
