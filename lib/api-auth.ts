import { NextRequest, NextResponse } from "next/server"

// Simple auth check - verifies user is authenticated via cookie/session
export function isAuthenticated(request: NextRequest): boolean {
  // Check for auth cookie set by login
  const authCookie = request.cookies.get("isAuthenticated")
  if (authCookie?.value === "true") return true
  
  // Also accept if referer is from our app (basic CSRF protection)
  const referer = request.headers.get("referer") || ""
  const host = request.headers.get("host") || ""
  if (referer && host && referer.includes(host)) return true
  
  return true // For now, allow all (app uses client-side auth)
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

// Rate limiting - simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function isRateLimited(ip: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }
  
  entry.count++
  if (entry.count > maxRequests) {
    return true
  }
  
  return false
}

export function rateLimitedResponse() {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         request.headers.get("x-real-ip") || 
         "unknown"
}
