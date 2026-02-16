'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  UtensilsCrossed, 
  Grid3x3, 
  ShoppingCart, 
  ChefHat,
  DollarSign,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/admin/salon', label: 'Mesas', icon: Grid3x3 },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/kitchen', label: 'Cocina', icon: ChefHat },
  { href: '/admin/finanzas', label: 'Finanzas', icon: DollarSign },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4">
      <div className="text-xl font-bold mb-8 text-orange-500">GastroOS</div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-zinc-400 hover:text-orange-500 hover:bg-zinc-800"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <button 
          onClick={() => window.location.href = '/login'}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  )
}
