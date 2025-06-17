import "./globals.css"
import "@worldcoin/mini-apps-ui-kit-react/styles.css"

import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { WorldAppProvider } from "@radish-la/world-auth"
import { Toaster as WorldToaster } from "@worldcoin/mini-apps-ui-kit-react"
import { Rubik, Sora } from "next/font/google"

import { validator } from "./session"

const fontRubik = Rubik({
  subsets: [],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

const fontSora = Sora({
  subsets: [],
  variable: "--font-display",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Fruit Smasher",
  description:
    "Fruit Smasher is a fun and interactive game where you can smash fruits to earn rewards",
}

const ErudaProvider = dynamic(
  () => import("../components/Eruda").then((r) => r.ErudaProvider),
  {
    ssr: false,
  }
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontRubik.variable} ${fontSora.variable} ${fontRubik.className} antialiased`}
      >
        <WorldToaster duration={2_500} />
        <WorldAppProvider appName="FruitSmasher" withValidator={validator}>
          <ErudaProvider>{children}</ErudaProvider>
        </WorldAppProvider>
      </body>
    </html>
  )
}
