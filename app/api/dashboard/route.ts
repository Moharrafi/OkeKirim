import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const driverFilter = searchParams.get("driver")

  try {
    // Get current month stats
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const todayStr = now.toISOString().split("T")[0]

    // Last month range for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}-01`

    // Build WHERE clause for driver filter
    const driverWhere = driverFilter ? " AND driver LIKE ?" : ""
    const driverParam = driverFilter ? [`%${driverFilter}%`] : []

    // Last month same period for fair comparison
    const currentDay = now.getDate()
    const lastMonthSamePeriodEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, currentDay)
    const lastMonthSamePeriodEndStr = `${lastMonthSamePeriodEnd.getFullYear()}-${String(lastMonthSamePeriodEnd.getMonth() + 1).padStart(2, "0")}-${String(lastMonthSamePeriodEnd.getDate()).padStart(2, "0")}`

    // Total pendapatan bulan ini (SEMUA trip: lunas + nunggak) - karena driver langsung terima uang
    const [monthlyRows] = await pool.execute(
      `SELECT COALESCE(SUM(companyShare), 0) as totalCompany, COALESCE(SUM(fare), 0) as totalFare, COUNT(*) as count FROM schedules WHERE date >= ?${driverWhere}`,
      [monthStart, ...driverParam]
    ) as [Array<{ totalCompany: number; totalFare: number; count: number }>]

    // Total pendapatan bulan lalu same period (SEMUA trip)
    const [lastMonthRows] = await pool.execute(
      `SELECT COALESCE(SUM(companyShare), 0) as totalCompany, COALESCE(SUM(fare), 0) as totalFare FROM schedules WHERE date >= ? AND date <= ?${driverWhere}`,
      [lastMonthStart, lastMonthSamePeriodEndStr, ...driverParam]
    ) as [Array<{ totalCompany: number; totalFare: number }>]

    // Total belum disetor (nunggak) - hitung SISA (companyShare - paidCompanyAmount)
    const [pendingRows] = await pool.execute(
      `SELECT COALESCE(SUM(companyShare - paidCompanyAmount), 0) as total, COUNT(*) as count FROM schedules WHERE status = 'nunggak'${driverWhere}`,
      [...driverParam]
    ) as [Array<{ total: number; count: number }>]

    // Hari ini
    const [todayRows] = await pool.execute(
      `SELECT COALESCE(SUM(companyShare), 0) as total, COUNT(*) as count FROM schedules WHERE date = ?${driverWhere}`,
      [todayStr, ...driverParam]
    ) as [Array<{ total: number; count: number }>]

    // Driver aktif
    const [driverRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM drivers WHERE status = 'aktif'"
    ) as [Array<{ count: number }>]

    // Recent transactions (last 5)
    const [recentRows] = await pool.execute(
      `SELECT s.*, d.vehicle as driverVehicle 
       FROM schedules s 
       LEFT JOIN drivers d ON LOWER(TRIM(s.driver)) = LOWER(TRIM(d.name))
       ${driverFilter ? "WHERE s.driver LIKE ?" : ""}
       ORDER BY s.id DESC LIMIT 5`,
      driverFilter ? [`%${driverFilter}%`] : []
    )

    // Monthly data for chart (current year) - semua trip
    const [monthlyChart] = await pool.execute(
      `SELECT MONTH(date) as month, CAST(SUM(companyShare) AS UNSIGNED) as total 
       FROM schedules 
       WHERE YEAR(date) = ?${driverWhere}
       GROUP BY MONTH(date) 
       ORDER BY month`,
      [now.getFullYear(), ...driverParam]
    )

    // Per driver income this month (only for admin) - semua orderan (lunas + nunggak)
    const [driverIncome] = driverFilter
      ? [[] as Array<{ driver: string; total: string | number }>]
      : await pool.execute(
          `SELECT s.driver, CAST(SUM(s.companyShare) AS UNSIGNED) as total 
           FROM schedules s 
           WHERE s.date >= ?
           GROUP BY s.driver 
           ORDER BY total DESC 
           LIMIT 5`,
          [monthStart]
        ) as [Array<{ driver: string; total: string | number }>]

    // Order type breakdown (for driver view)
    const [orderTypeBreakdown] = await pool.execute(
      `SELECT orderType, CAST(SUM(fare) AS UNSIGNED) as total, COUNT(*) as count
       FROM schedules 
       WHERE date >= ?${driverWhere}
       GROUP BY orderType`,
      [monthStart, ...driverParam]
    ) as [Array<{ orderType: string; total: string | number; count: string | number }>]

    // Convert string values to numbers
    const chartData = (monthlyChart as Array<{ month: number; total: string | number }>).map(r => ({
      month: Number(r.month),
      total: Number(r.total),
    }))

    const driverData = (driverIncome as Array<{ driver: string; total: string | number }>).map(r => ({
      driver: String(r.driver).trim(),
      total: Number(r.total),
    }))

    const monthlyCompany = Number((monthlyRows[0] as { totalCompany: number }).totalCompany)
    const monthlyFare = Number((monthlyRows[0] as { totalFare: number }).totalFare)
    const lastMonthCompany = Number((lastMonthRows[0] as { totalCompany: number }).totalCompany)
    const lastMonthFare = Number((lastMonthRows[0] as { totalFare: number }).totalFare)

    return NextResponse.json({
      // 40% = pendapatan perusahaan (admin)
      monthlyCompanyShare: monthlyCompany,
      // 60% = pendapatan supir
      monthlyDriverShare: monthlyFare - monthlyCompany,
      // Total argo
      monthlyFare: monthlyFare,
      monthlyCount: Number((monthlyRows[0] as { count: number }).count),
      // Bulan lalu untuk perbandingan
      lastMonthCompanyShare: lastMonthCompany,
      lastMonthDriverShare: lastMonthFare - lastMonthCompany,
      lastMonthFare: lastMonthFare,
      // Pending
      pendingTotal: Number((pendingRows[0] as { total: number }).total),
      pendingCount: Number((pendingRows[0] as { count: number }).count),
      // Hari ini
      todayTotal: Number((todayRows[0] as { total: number }).total),
      todayCount: Number((todayRows[0] as { count: number }).count),
      // Drivers
      activeDrivers: Number((driverRows[0] as { count: number }).count),
      recentTransactions: recentRows,
      monthlyChart: chartData,
      driverIncome: driverData,
      orderTypeBreakdown: (orderTypeBreakdown as Array<{ orderType: string; total: string | number; count: string | number }>).map(r => ({
        type: r.orderType === "offline" ? "Offline" : "Online",
        total: Number(r.total),
        count: Number(r.count),
      })),
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
