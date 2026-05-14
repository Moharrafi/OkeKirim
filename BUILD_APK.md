# Build APK Android - OkeKirim Driver

## Prasyarat

1. **Android Studio** — Download dari https://developer.android.com/studio
2. **Java JDK 17+** — Biasanya sudah terinstall bersama Android Studio
3. **Node.js** — Sudah ada

## Langkah Build APK

### 1. Ubah next.config.mjs

Uncomment `output: "export"` di `next.config.mjs`:

```js
output: "export",
```

### 2. Build Next.js (Static Export)

```bash
npm run build
```

Ini akan menghasilkan folder `out/` berisi static files.

**Catatan**: Karena app pakai API routes (`/api/*`), kamu perlu deploy API terpisah (Vercel) dan ubah fetch URL di app ke URL production. Atau pakai pendekatan hybrid (lihat bagian bawah).

### 3. Sync ke Android

```bash
npx cap sync android
```

### 4. Buka di Android Studio

```bash
npx cap open android
```

### 5. Build APK

Di Android Studio:
- Menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- APK akan ada di `android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Install di HP

Transfer file APK ke HP Android dan install (aktifkan "Install from Unknown Sources").

---

## Pendekatan Hybrid (Recommended)

Karena app ini pakai API routes (database, GPS), lebih baik:

1. **Deploy app ke Vercel** dulu (sebagai web app)
2. Di `capacitor.config.ts`, set server URL ke URL Vercel:

```ts
server: {
  url: "https://your-app.vercel.app",
  cleartext: true,
}
```

3. Build APK — app Android akan load dari URL Vercel (seperti WebView tapi lebih native)

Ini cara paling mudah karena tidak perlu pisahkan API.

---

## Development (Test di HP)

Untuk test langsung di HP tanpa build APK:

1. Jalankan `npm run dev`
2. Di `capacitor.config.ts`, set:
```ts
server: {
  url: "http://192.168.x.x:3000", // IP lokal komputer kamu
  cleartext: true,
}
```
3. `npx cap sync android`
4. `npx cap open android`
5. Run di Android Studio (connect HP via USB)

---

## Info App

- **App ID**: com.okekirim.driverdeposit
- **App Name**: OkeKirim Driver
- **Min SDK**: Android 5.0 (API 21)
