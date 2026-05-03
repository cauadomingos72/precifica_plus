import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning={true} lang="pt-br">
      <body className="antialiased min-h-screen bg-background">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

