import { getRestauranteActual } from '@/utils/supabase/server'

export default async function Header() {
  const restaurante = await getRestauranteActual()
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
      <div className="text-lg font-semibold">
        {restaurante?.nombre || 'Restaurante'}
      </div>
      {/* Aquí puedes agregar el switch de tema y otros controles */}
    </header>
  )
}
