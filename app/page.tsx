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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

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
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-card border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-4 relative">
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Pendapatan Perusahaan Bulan Ini (40%)" : "Pendapatan Bulan Ini (60%)"}
            </p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {loading ? "..." : `Rp ${formatRupiah(isAdmin ? (data?.monthlyCompanyShare || 0) : (data?.monthlyDriverShare || 0))}`}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {data ? (() => {
                const current = isAdmin ? data.monthlyCompanyShare : data.monthlyDriverShare
                const last = isAdmin ? data.lastMonthCompanyShare : data.lastMonthDriverShare
                const pct = last > 0 ? Math.round(((current - last) / last) * 100) : 0
                const isUp = current >= last
                return (
                  <>
                    {isUp ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                    <span className={cn("text-sm font-medium", isUp ? "text-success" : "text-destructive")}>
                      {isUp ? "+" : ""}{pct}%
                    </span>
                    <span className="text-sm text-muted-foreground">dari bulan lalu</span>
                  </>
                )
              })() : (
                <span className="text-sm text-muted-foreground">Memuat...</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border active:scale-95 transition-transform"
            >
              <div className={cn("p-2.5 rounded-xl", action.color)}>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                {data && data.lastMonthCompanyShare > 0 && (
                  <div className="flex items-center gap-0.5">
                    {data.monthlyCompanyShare >= data.lastMonthCompanyShare ? (
                      <ArrowUpRight className="h-3 w-3 text-success" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                    <span className={cn("text-xs font-medium", data.monthlyCompanyShare >= data.lastMonthCompanyShare ? "text-success" : "text-destructive")}>
                      {Math.abs(Math.round(((data.monthlyCompanyShare - data.lastMonthCompanyShare) / data.lastMonthCompanyShare) * 100))}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg font-bold text-foreground mt-2">
                {loading ? "..." : `Rp ${formatRupiah(data?.monthlyCompanyShare || 0)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Masuk Perusahaan (40%)" : "Wajib Setor (40%)"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-chart-2/10">
                  {isAdmin ? <Users className="h-4 w-4 text-chart-2" /> : <Car className="h-4 w-4 text-chart-2" />}
                </div>
              </div>
              <p className="text-lg font-bold text-foreground mt-2">
                {loading ? "..." : isAdmin ? (data?.activeDrivers || 0) : (data?.monthlyCount || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Driver Aktif" : "Trip Bulan Ini"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-warning/10">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                {data && data.pendingTotal > 0 && (
                  <div className="flex items-center gap-0.5">
                    <ArrowDownRight className="h-3 w-3 text-warning" />
                    <span className="text-xs font-medium text-warning">
                      Rp {formatRupiah(data.pendingTotal)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg font-bold text-foreground mt-2">
                {loading ? "..." : data?.pendingCount || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Belum Disetor" : "Hutang Setoran"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                {data && data.todayCount > 0 && (
                  <div className="flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3 text-success" />
                    <span className="text-xs font-medium text-success">
                      +{data.todayCount} trip
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg font-bold text-foreground mt-2">
                {loading ? "..." : `Rp ${formatRupiah(data?.todayTotal || 0)}`}
              </p>
              <p className="text-xs text-muted-foreground">Hari Ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        {data && data.monthlyChart && data.monthlyChart.length > 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Pendapatan Bulanan</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.monthlyChart.map(d => ({
                      month: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][d.month - 1],
                      total: d.total / 1000000,
                    }))}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}Jt`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => [`Rp ${value.toFixed(1)} Juta`, 'Setoran']}
                    />
                    <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart - Driver Income (admin) or Order Type (driver) */}
        {data && ((data.driverIncome && data.driverIncome.length > 0) || (data.orderTypeBreakdown && data.orderTypeBreakdown.length > 0)) && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-4">
                {isAdmin ? "Setoran per Driver" : "Berdasarkan Tipe Order"}
              </h3>
              {(() => {
                const pieData = isAdmin
                  ? data.driverIncome.map((d, i) => ({
                      name: d.driver,
                      value: d.total,
                      color: ["#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"][i % 5],
                    }))
                  : (data.orderTypeBreakdown || []).map((d, i) => ({
                      name: d.type,
                      value: d.total,
                      color: ["#14b8a6", "#f59e0b"][i % 2],
                    }))
                const totalAll = pieData.reduce((s, x) => s + x.value, 0)
                if (totalAll === 0) return null
                return (
                  <div className="flex items-center gap-4">
                    <div className="h-36 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(value: number) => [`Rp ${formatRupiah(value)}`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-xs text-muted-foreground">{d.name}</span>
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            {totalAll > 0 ? Math.round((d.value / totalAll) * 100) : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
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
