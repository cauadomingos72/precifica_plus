import "./styles/theme.css"
import "./styles/navbar.css"
import "./globals.css"
import Navbar from "@/components/Navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        <Navbar/>
        {children}
      </body>
    </html>
  )
}