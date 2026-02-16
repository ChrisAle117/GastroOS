import { getRestauranteActual } from '@/utils/supabase/server'
import { Store, User } from 'lucide-react'

export default async function Header() {
  const restaurante = await getRestauranteActual()
  
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-orange-500" />
        <span className="text-lg font-semibold">
          {restaurante?.nombre || 'Restaurante'}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <User className="w-4 h-4" />
          <span>Admin</span>
        </div>
      </div>
    </header>
  )
}
