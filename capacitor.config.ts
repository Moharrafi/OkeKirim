import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.okekirim.driverdeposit",
  appName: "OkeKirim Driver",
  webDir: "out",
  server: {
    // Untuk development, arahkan ke server lokal
    // Hapus/comment ini untuk production build
    // url: "http://192.168.x.x:3000",
    // cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#ffffff",
    },
  },
}

export default config
