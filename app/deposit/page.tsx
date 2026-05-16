"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Smartphone,
  Banknote,
  CheckCircle2,
  Upload,
  ChevronRight,
  MapPin,
  FileText,
  Clock,
  X,
  Image as ImageIcon,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/user-context"
import { fetchSchedules, fetchPendingSchedules, fetchDrivers, createOrder, type Schedule, type Driver } from "@/lib/okekirim-api"

type MainTab = "orderan" | "setoran"
type OrderType = "online" | "offline"

interface Order {
  id: string
  driver: string
  driverId: string
  vehicle: string
  lokasiMuat: string
  lokasiBongkar: string
  argo: number
  companyShare: number
  paidAmount: number
  sisa: number
  type: OrderType
  date: string
  time: string
  status: string
}

export default function DepositPage() {
  const router = useRouter()
  const { isAdmin, isDriver, user, isAuthenticated } = useUser()
  const [mainTab, setMainTab] = useState<MainTab>("orderan")
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }
  
  // Input Orderan States
  const [selectedDriver, setSelectedDriver] = useState("")
  const [lokasiMuat, setLokasiMuat] = useState("")
  const [lokasiBongkar, setLokasiBongkar] = useState("")
  const [argo, setArgo] = useState("")
  const [orderType, setOrderType] = useState<OrderType>("online")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)

  // Setoran States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [showBatchPayment, setShowBatchPayment] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false)
  const [showDepositSuccess, setShowDepositSuccess] = useState(false)
  const [batchTotal, setBatchTotal] = useState(0)

  // Fetch real data from OkeKirim API
  const [apiOrders, setApiOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [apiDrivers, setApiDrivers] = useState<Driver[]>([])
  const [filterDriver, setFilterDriver] = useState<string>("")

  // Fetch drivers on mount
  useEffect(() => {
    fetchDrivers().then(setApiDrivers).catch(() => {})
  }, [])

  useEffect(() => {
    if (mainTab === "setoran") {
      setLoadingOrders(true)
      // If driver is logged in, auto-filter by their name
      const driverName = isDriver ? user.name : (filterDriver || undefined)
      fetchPendingSchedules(driverName)
        .then((schedules) => {
          const mapped: Order[] = schedules.map(s => ({
            id: `SCH${String(s.id).padStart(3, "0")}`,
            driver: s.driver || "Unknown",
            driverId: String(s.id),
            vehicle: s.vehicle || s.driverVehicle || "-",
            lokasiMuat: s.origin || "-",
            lokasiBongkar: s.destination || "-",
            argo: s.fare || 0,
            companyShare: s.companyShare || Math.round((s.fare || 0) * 0.4),
            paidAmount: s.paidCompanyAmount || 0,
            sisa: (s.companyShare || Math.round((s.fare || 0) * 0.4)) - (s.paidCompanyAmount || 0),
            type: (s.orderType === "offline" ? "offline" : "online") as OrderType,
            date: s.date ? new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
            time: "",
            status: "pending",
          }))
          setApiOrders(mapped)
        })
        .catch(() => setApiOrders([]))
        .finally(() => setLoadingOrders(false))
    }
  }, [mainTab, filterDriver, isDriver, user.name])

  const orders = apiOrders

  const handleSubmitOrder = async () => {
    setIsSubmittingOrder(true)
    
    const driverData = apiDrivers.find(d => String(d.id) === selectedDriver)
    const result = await createOrder({
      driver: driverData?.name || user.name,
      vehicle: driverData?.vehicle || undefined,
      origin: lokasiMuat,
      destination: lokasiBongkar,
      orderType: orderType,
      fare: parseInt(argo || "0"),
    })

    setIsSubmittingOrder(false)
    if (result.success) {
      setShowOrderSuccess(true)
      setTimeout(() => {
        setShowOrderSuccess(false)
        setSelectedDriver("")
        setLokasiMuat("")
        setLokasiBongkar("")
        setArgo("")
        setOrderType("online")
      }, 2000)
    }
  }

  const handleSubmitDeposit = () => {
    setIsSubmittingDeposit(true)
    setTimeout(() => {
      setIsSubmittingDeposit(false)
      setShowDepositSuccess(true)
      setTimeout(() => {
        setShowDepositSuccess(false)
        setSelectedOrder(null)
        setSelectedOrders([])
        setIsBatchMode(false)
        setShowBatchPayment(false)
        setUploadedFile(null)
        setUploadedImage(null)
      }, 2000)
    }, 1500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file.name)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSelection = prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
      
      const total = newSelection.reduce((sum, id) => {
        const order = orders.find(o => o.id === id)
        return sum + (order?.sisa || order?.argo || 0)
      }, 0)
      setBatchTotal(total)
      
      return newSelection
    })
  }

  const handleBatchPayment = () => {
    if (selectedOrders.length > 0) {
      setShowBatchPayment(true)
    }
  }

  // Success screens
  if (showOrderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Orderan Berhasil!</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Orderan telah berhasil dicatat
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            Rp {parseInt(argo || "0").toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    )
  }

  if (showDepositSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Setoran Berhasil!</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            {selectedOrders.length > 1 
              ? `${selectedOrders.length} setoran telah dikonfirmasi`
              : "Setoran telah berhasil dikonfirmasi"
            }
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            Rp {(showBatchPayment ? batchTotal : selectedOrder?.sisa || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    )
  }

  // Batch Payment View
  if (showBatchPayment) {
    const selectedOrderItems = orders.filter(o => selectedOrders.includes(o.id))
    
    return (
      <div className="min-h-screen">
        <MobileHeader 
          title="Pembayaran Batch" 
          showBack 
          onBack={() => setShowBatchPayment(false)} 
        />
        
        <div className="px-4 py-4 pb-28 space-y-4">
          {/* Selected Orders Summary */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Orderan Terpilih</h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {selectedOrders.length} orderan
                </span>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrderItems.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{order.id}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        order.type === "online" ? "bg-primary/10 text-primary" : "bg-chart-3/10 text-chart-3"
                      )}>
                        {order.type === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Argo: Rp {order.argo.toLocaleString("id-ID")}</p>
                      <p className="text-sm font-semibold text-primary">
                        Sisa: Rp {order.sisa.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Total Argo</span>
                  <span className="text-sm font-medium text-foreground">
                    Rp {batchTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Sisa Setoran</span>
                  <span className="text-xl font-bold text-primary">
                    Rp {batchTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Bukti Transfer */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <Label className="text-sm font-medium text-foreground">Upload Bukti Transfer</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Upload bukti transfer untuk {selectedOrders.length} orderan sekaligus
              </p>
              
              {uploadedFile ? (
                <div className="space-y-3">
                  {uploadedImage && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={uploadedImage} alt="Bukti transfer" className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                        <ImageIcon className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{uploadedFile}</p>
                        <p className="text-xs text-success">Berhasil diupload</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setUploadedFile(null); setUploadedImage(null) }}
                      className="p-1.5 rounded-full hover:bg-secondary"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Ketuk untuk upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25"
            disabled={!uploadedFile || isSubmittingDeposit}
            onClick={handleSubmitDeposit}
          >
            {isSubmittingDeposit ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Memproses...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Konfirmasi {selectedOrders.length} Setoran
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Single Setoran Detail View
  if (selectedOrder) {
    return (
      <div className="min-h-screen">
        <MobileHeader 
          title="Konfirmasi Setoran" 
          showBack 
          onBack={() => setSelectedOrder(null)} 
        />
        
        <div className="px-4 py-4 pb-28 space-y-4">
          {/* Order Detail Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{selectedOrder.id}</span>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  selectedOrder.type === "online" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-chart-3/10 text-chart-3"
                )}>
                  {selectedOrder.type === "online" ? "Online" : "Offline"}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedOrder.driver}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    <div className="w-0.5 h-8 bg-border" />
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Lokasi Muat</p>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.lokasiMuat}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lokasi Bongkar</p>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.lokasiBongkar}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Nilai Argo</span>
                    <span className="text-base font-semibold text-foreground">
                      Rp {selectedOrder.argo.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Setoran (40%)</span>
                    <span className="text-sm text-foreground">
                      Rp {selectedOrder.companyShare.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {selectedOrder.paidAmount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Terbayar</span>
                      <span className="text-sm text-success">
                        Rp {selectedOrder.paidAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Sisa</span>
                    <span className="text-xl font-bold text-primary">
                      Rp {selectedOrder.sisa.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Bukti Transfer */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <Label className="text-sm font-medium text-foreground">Upload Bukti Transfer</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Upload bukti transfer atau pembayaran untuk konfirmasi setoran
              </p>
              
              {uploadedFile ? (
                <div className="space-y-3">
                  {uploadedImage && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={uploadedImage} alt="Bukti transfer" className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                        <ImageIcon className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{uploadedFile}</p>
                        <p className="text-xs text-success">Berhasil diupload</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setUploadedFile(null); setUploadedImage(null) }}
                      className="p-1.5 rounded-full hover:bg-secondary"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Ketuk untuk upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Driver</span>
                  <span className="font-medium text-foreground">{selectedOrder.driver}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipe Orderan</span>
                  <span className="font-medium text-foreground">
                    {selectedOrder.type === "online" ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bukti Transfer</span>
                  <span className={cn(
                    "font-medium",
                    uploadedFile ? "text-success" : "text-warning"
                  )}>
                    {uploadedFile ? "Sudah diupload" : "Belum diupload"}
                  </span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Nilai Argo</span>
                    <span className="text-sm font-medium text-foreground">
                      Rp {selectedOrder.argo.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {selectedOrder.paidAmount > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Sudah Terbayar</span>
                      <span className="text-sm text-success">
                        Rp {selectedOrder.paidAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Sisa Setoran</span>
                    <span className="text-2xl font-bold text-primary">
                      Rp {selectedOrder.sisa.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25"
            disabled={!uploadedFile || isSubmittingDeposit}
            onClick={handleSubmitDeposit}
          >
            {isSubmittingDeposit ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Memproses...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Konfirmasi Setoran
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <MobileHeader title="Deposit" />
      
      <div className="px-4 py-4 space-y-4">
        {/* Main Tab Switcher - For both Admin and Driver */}
        <div className="flex gap-2 p-1 rounded-2xl bg-secondary">
          <button
            onClick={() => setMainTab("orderan")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all",
              mainTab === "orderan"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Input Orderan
          </button>
          <button
            onClick={() => setMainTab("setoran")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all",
              mainTab === "setoran"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground"
            )}
          >
            <Banknote className="h-4 w-4" />
            Setoran
          </button>
        </div>

        {/* Input Orderan Tab - For both Admin and Driver */}
        {mainTab === "orderan" && (
          <>
            {/* Driver Selection - Only for Admin */}
            {isAdmin ? (
              <Card className="border-border bg-card">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Pilih Driver</Label>
                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                      <SelectTrigger className="bg-secondary border-0 h-12 rounded-xl">
                        <SelectValue placeholder="Pilih driver..." />
                      </SelectTrigger>
                      <SelectContent>
                        {apiDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={String(driver.id)}>
                            <div className="flex flex-col items-start">
                              <span>{driver.name}</span>
                              <span className="text-xs text-muted-foreground">{driver.vehicle || "-"}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">B 1234 ABC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Input */}
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Lokasi Muat</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                    <Input
                      placeholder="Masukkan lokasi muat..."
                      value={lokasiMuat}
                      onChange={(e) => setLokasiMuat(e.target.value)}
                      className="bg-secondary border-0 pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Lokasi Bongkar</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                    <Input
                      placeholder="Masukkan lokasi bongkar..."
                      value={lokasiBongkar}
                      onChange={(e) => setLokasiBongkar(e.target.value)}
                      className="bg-secondary border-0 pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Argo Input */}
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Nilai Argo</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      Rp
                    </span>
                    <Input
                      type="text"
                      placeholder="0"
                      value={argo ? parseInt(argo).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setArgo(value)
                      }}
                      className="bg-secondary border-0 pl-12 h-14 text-2xl font-bold rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Type */}
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm font-medium text-foreground">Tipe Orderan</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOrderType("online")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                      orderType === "online"
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-secondary border-2 border-transparent"
                    )}
                  >
                    <Smartphone
                      className={cn(
                        "h-6 w-6",
                        orderType === "online" ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        orderType === "online" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Online
                    </span>
                  </button>
                  <button
                    onClick={() => setOrderType("offline")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                      orderType === "offline"
                        ? "bg-chart-3/10 border-2 border-chart-3"
                        : "bg-secondary border-2 border-transparent"
                    )}
                  >
                    <Banknote
                      className={cn(
                        "h-6 w-6",
                        orderType === "offline" ? "text-chart-3" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        orderType === "offline" ? "text-chart-3" : "text-muted-foreground"
                      )}
                    >
                      Offline
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-card">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Driver</span>
                    <span className="font-medium text-foreground">
                      {isAdmin 
                        ? (selectedDriver ? apiDrivers.find((d) => String(d.id) === selectedDriver)?.name : "-")
                        : user.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rute</span>
                    <span className="font-medium text-foreground text-right max-w-[200px] truncate">
                      {lokasiMuat && lokasiBongkar 
                        ? `${lokasiMuat} - ${lokasiBongkar}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipe</span>
                    <span className="font-medium text-foreground">
                      {orderType === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Nilai Argo</span>
                      <span className="text-2xl font-bold text-primary">
                        Rp {argo ? parseInt(argo).toLocaleString("id-ID") : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25"
              disabled={(isAdmin && !selectedDriver) || !lokasiMuat || !lokasiBongkar || !argo || isSubmittingOrder}
              onClick={handleSubmitOrder}
            >
              {isSubmittingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Simpan Orderan
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </>
        )}

        {/* Setoran Tab - For both Admin and Driver */}
        {mainTab === "setoran" && (
          <>
            {/* Driver Filter */}
            {isAdmin && (
              <Select value={filterDriver} onValueChange={(v) => setFilterDriver(v === "all" ? "" : v)}>
                <SelectTrigger className="bg-card border-border h-11 rounded-xl">
                  <SelectValue placeholder="Semua Supir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Supir</SelectItem>
                  {apiDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name} ({d.vehicle || "-"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Memuat data...</p>
                </div>
              </div>
            ) : (
            <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {isDriver ? "Orderan Belum Disetor" : "Orderan Belum Disetor"}
              </h3>
              <div className="flex items-center gap-2">
                {orders.length > 1 && (
                  <button
                    onClick={() => {
                      setIsBatchMode(!isBatchMode)
                      if (isBatchMode) {
                        setSelectedOrders([])
                        setBatchTotal(0)
                      }
                    }}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full transition-all",
                      isBatchMode 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      Batch
                    </div>
                  </button>
                )}
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {orders.length} orderan
                </span>
              </div>
            </div>

            {/* Batch Selection Info */}
            {isBatchMode && selectedOrders.length > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {selectedOrders.length} orderan dipilih
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total: Rp {batchTotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground rounded-xl"
                      onClick={handleBatchPayment}
                    >
                      Bayar Sekaligus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  className={cn(
                    "border-border bg-card transition-all",
                    isBatchMode && selectedOrders.includes(order.id) && "border-primary bg-primary/5",
                    !isBatchMode && "active:scale-[0.98] cursor-pointer"
                  )}
                  onClick={() => {
                    if (isBatchMode) {
                      toggleOrderSelection(order.id)
                    } else {
                      setSelectedOrder(order)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isBatchMode && (
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => toggleOrderSelection(order.id)}
                            className="mr-1"
                          />
                        )}
                        <span className="text-xs font-medium text-muted-foreground">#{order.id}</span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          order.type === "online" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-chart-3/10 text-chart-3"
                        )}>
                          {order.type === "online" ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {order.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          order.type === "online" ? "bg-primary/10" : "bg-chart-3/10"
                        )}>
                          {order.type === "online" ? (
                            <Smartphone className="h-4 w-4 text-primary" />
                          ) : (
                            <Banknote className="h-4 w-4 text-chart-3" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.driver}</p>
                          <p className="text-xs text-muted-foreground">{order.vehicle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3 text-success flex-shrink-0" />
                      <span className="truncate">{order.lokasiMuat}</span>
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      <MapPin className="h-3 w-3 text-destructive flex-shrink-0" />
                      <span className="truncate">{order.lokasiBongkar}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Argo: Rp {order.argo.toLocaleString("id-ID")}</p>
                        <p className="text-sm font-bold text-primary">
                          Sisa: Rp {order.sisa.toLocaleString("id-ID")}
                        </p>
                      </div>
                      {order.paidAmount > 0 && (
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          Terbayar: Rp {order.paidAmount.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Tidak ada orderan yang perlu disetor</p>
              </div>
            )}
            </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
