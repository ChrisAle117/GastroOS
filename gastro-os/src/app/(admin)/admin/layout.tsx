import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// Importa tus componentes de Sidebar/Navbar aquí

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Consultamos el perfil y el nombre del restaurante del usuario logueado
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, restaurantes(nombre)')
    .single()

  // Si no hay restaurante asignado, el middleware debería mandarlo a onboarding, 
  // pero aquí aseguramos que la UI no rompa.
  const nombreRestaurante = perfil?.restaurantes?.nombre || "Mi Restaurante"

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar con navegación */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-orange-500">GastroOS</h2>
        <nav className="flex flex-col gap-2">
          <a href="/admin" className="text-zinc-400 hover:text-white py-2">Dashboard</a>
          <a href="/admin/inventario" className="text-zinc-400 hover:text-white py-2">Inventario</a>
          <a href="/admin/menu" className="text-zinc-400 hover:text-white py-2">Menú</a>
          <a href="/admin/mesas" className="text-zinc-400 hover:text-white py-2">Mesas</a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Navbar superior dinámica */}
        <header className="h-16 border-b border-zinc-800 flex items-center px-8 justify-between bg-zinc-950">
          <span className="font-semibold text-zinc-200">
            {nombreRestaurante} 
          </span>
          <div className="h-8 w-8 rounded-full bg-zinc-800" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}