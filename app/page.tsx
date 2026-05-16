"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wallet,
  Users,
  Car,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Smartphone,
  Banknote,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useUser } from "@/lib/user-context"
import dynamic from "next/dynamic"

// Lazy load chart components - only loaded when visible
const DashboardCharts = dynamic(() => import("@/components/dashboard-charts"), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center">
      <div className="animate-pulse bg-muted rounded-xl w-full h-full" />
    </div>
  ),
})

interface DashboardData {
  monthlyCompanyShare: number
  monthlyDriverShare: number
  monthlyFare: number
  monthlyCount: number
  lastMonthCompanyShare: number
  lastMonthDriverShare: number
  lastMonthFare: number
  pendingTotal: number
  pendingCount: number
  todayTotal: number
  todayCount: number
  activeDrivers: number
  recentTransactions: Array<{
    id: number
    driver: string
    origin: string
    destination: string
    fare: number
    companyShare: number
    status: string
    orderType: string
    date: string
    driverVehicle?: string
    vehicle?: string
  }>
  monthlyChart: Array<{ month: number; total: number }>
  driverIncome: Array<{ driver: string; total: number }>
  orderTypeBreakdown: Array<{ type: string; total: number; count: number }>
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAdmin, user, isAuthenticated } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const params = new URLSearchParams()
    if (!isAdmin && user.name) {
      params.set("driver", user.name)
    }
    fetch(`/api/dashboard?${params.toString()}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAdmin, user.name])

  if (!isAuthenticated) return null

  const quickActions = isAdmin
    ? [
        { label: "Input Orderan", href: "/deposit", icon: Wallet, color: "bg-primary" },
        { label: "Cek Lokasi", href: "/lokasi", icon: Car, color: "bg-chart-2" },
        { label: "Riwayat", href: "/history", icon: TrendingUp, color: "bg-chart-3" },
      ]
    : [
        { label: "Setor", href: "/deposit", icon: Wallet, color: "bg-primary" },
        { label: "Riwayat", href: "/history", icon: TrendingUp, color: "bg-chart-2" },
        { label: "Profil", href: "/profile", icon: Users, color: "bg-chart-3" },
      ]

  return (
    <div className="min-h-screen pb-24">
      <MobileHeader showGreeting />

      <div className="px-4 py-4 space-y-5">
        {/* Balance Card - Premium gradient */}
        <Card className="bg-gradient-to-br from-primary via-primary/90 to-emerald-700 dark:from-primary dark:via-primary/80 dark:to-emerald-900 border-0 overflow-hidden relative shadow-xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">
                  {isAdmin ? "Pendapatan Perusahaan Bulan Ini (40%)" : "Pendapatan Bulan Ini (60%)"}
                </p>
                <p className="text-3xl font-bold text-white mt-1 tracking-tight">
                  {loading ? "..." : `Rp ${formatRupiah(isAdmin ? (data?.monthlyCompanyShare || 0) : (data?.monthlyDriverShare || 0))}`}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm">
                <Wallet className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {data ? (() => {
                const current = isAdmin ? data.monthlyCompanyShare : data.monthlyDriverShare
                const last = isAdmin ? data.lastMonthCompanyShare : data.lastMonthDriverShare
                const pct = last > 0 ? Math.round(((current - last) / last) * 100) : 0
                const isUp = current >= last
                return (
                  <>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", isUp ? "bg-white/20 text-emerald-100" : "bg-red-500/20 text-red-200")}>
                      {isUp ? "↑" : "↓"} {Math.abs(pct)}%
                    </span>
                    <span className="text-sm text-white/60">dari bulan lalu</span>
                  </>
                )
              })() : (
                <span className="text-sm text-white/60">Memuat...</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Glassmorphism style */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 active:scale-95 transition-all shadow-sm"
            >
              <div className={cn("p-3 rounded-xl shadow-lg", action.color)}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          </div>
        )}

        {!loading && (
        <>
        {/* Stats Grid - More vibrant */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border bg-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                {data && data.lastMonthCompanyShare > 0 && (
                  <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-md", data.monthlyCompanyShare >= data.lastMonthCompanyShare ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {data.monthlyCompanyShare >= data.lastMonthCompanyShare ? "↑" : "↓"}
                    {Math.abs(Math.round(((data.monthlyCompanyShare - data.lastMonthCompanyShare) / data.lastMonthCompanyShare) * 100))}%
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-foreground mt-2.5">
                {loading ? "..." : `Rp ${formatRupiah(data?.monthlyCompanyShare || 0)}`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdmin ? "Masuk Perusahaan (40%)" : "Wajib Setor (40%)"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  {isAdmin ? <Users className="h-4 w-4 text-blue-500" /> : <Car className="h-4 w-4 text-blue-500" />}
                </div>
              </div>
              <p className="text-lg font-bold text-foreground mt-2.5">
                {loading ? "..." : isAdmin ? (data?.activeDrivers || 0) : (data?.monthlyCount || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdmin ? "Driver Aktif" : "Trip Bulan Ini"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                {data && data.pendingTotal > 0 && (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Rp {formatRupiah(data.pendingTotal)}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-foreground mt-2.5">
                {loading ? "..." : data?.pendingCount || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdmin ? "Belum Disetor" : "Hutang Setoran"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                {data && data.todayCount > 0 && (
                  <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                    +{data.todayCount} trip
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-foreground mt-2.5">
                {loading ? "..." : `Rp ${formatRupiah(data?.todayTotal || 0)}`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Hari Ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Lazy loaded for performance */}
        {data && (
          <DashboardCharts
            monthlyChart={data.monthlyChart}
            driverIncome={data.driverIncome}
            orderTypeBreakdown={data.orderTypeBreakdown}
            isAdmin={isAdmin}
            formatRupiah={formatRupiah}
          />
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Transaksi Terbaru</h2>
            <Link href="/history" className="flex items-center text-sm text-primary">
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <Card className="border-border bg-card">
            <CardContent className="p-0 divide-y divide-border">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Memuat...</div>
              ) : data?.recentTransactions && data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-xl",
                          tx.orderType === "online" ? "bg-primary/10" : "bg-chart-3/10"
                        )}
                      >
                        {tx.orderType === "online" ? (
                          <Smartphone className="h-4 w-4 text-primary" />
                        ) : (
                          <Banknote className="h-4 w-4 text-chart-3" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.driver}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.origin} → {tx.destination}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        Rp {formatRupiah(tx.companyShare)}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          tx.status === "lunas" ? "text-success" : "text-warning"
                        )}
                      >
                        {tx.status === "lunas" ? "Lunas" : "Nunggak"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Belum ada transaksi
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
