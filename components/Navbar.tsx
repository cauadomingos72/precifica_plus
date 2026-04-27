import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/logo.png" alt="Logo do sistema" className="logo" />
        <span className="brand">Precifica+</span>
      </div>
    </nav>
  )
}