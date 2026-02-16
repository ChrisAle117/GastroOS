import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// Importa tus componentes de Shadcn (Stats, Cards, etc.)

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Obtenemos el perfil con el restaurante_id
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre_completo, restaurante_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.restaurante_id) {
    redirect('/onboarding')
  }

  // 3. Obtenemos los datos del restaurante
  const { data: restaurante } = await supabase
    .from('restaurantes')
    .select('id, nombre')
    .eq('id', perfil.restaurante_id)
    .single()

  if (!restaurante) {
    redirect('/onboarding')
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* Header Dinámico */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Panel de {restaurante.nombre}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {perfil.nombre_completo}.
        </p>
      </div>

      {/* Grid de Estadísticas (Placeholder para lo que sigue) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Ventas hoy</p>
          <h3 className="text-2xl font-bold">$0.00</h3>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Órdenes activas</p>
          <h3 className="text-2xl font-bold">0</h3>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Mesas ocupadas</p>
          <h3 className="text-2xl font-bold">0/0</h3>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Insumos críticos</p>
          <h3 className="text-2xl font-bold text-red-500">0</h3>
        </div>
      </div>

      {/* Aquí iría tu gráfico de ventas o lista de órdenes recientes */}
      <div className="h-[300px] w-full bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
        Gráfico de actividad (Próximamente)
      </div>
    </div>
  )
}