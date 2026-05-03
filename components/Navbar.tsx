import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-primary h-20 flex items-center px-10 shadow-md">
      <Link href="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo do sistema" className="h-14 w-auto object-contain mr-3" />
        <span className="text-white text-xl font-semibold tracking-wide">Precifica+</span>
      </Link>
    </nav>
  )
}