import { createClient } from '@/utils/supabase/server'
import { createPerfilAndLink } from './actions'

export default async function DebugPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div className="p-6 text-white">No hay usuario autenticado</div>
  }

  // Verificar si existe el perfil
  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Buscar restaurantes asociados (todos para ver si hay alguno sin vincular)
  const { data: restaurantes } = await supabase
    .from('restaurantes')
    .select('*')

  return (
    <div className="p-6 text-white bg-zinc-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">Usuario Auth:</h2>
        <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">Perfil en DB:</h2>
        {perfilError && <p className="text-red-500">Error: {perfilError.message}</p>}
        {perfil ? (
          <pre className="text-xs">{JSON.stringify(perfil, null, 2)}</pre>
        ) : (
          <p className="text-yellow-500">⚠️ No existe perfil para este usuario</p>
        )}
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">Restaurantes:</h2>
        <pre className="text-xs">{JSON.stringify(restaurantes, null, 2)}</pre>
      </div>

      {!perfil && restaurantes && restaurantes.length > 0 && (
        <div className="mt-4 bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🔧 Acción requerida:</h3>
          <p className="mb-4">Existe un restaurante pero no hay perfil vinculado. Crea el perfil y vincúlalo:</p>
          <form action={createPerfilAndLink.bind(null, restaurantes[0].id)}>
            <button 
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold"
            >
              Crear perfil y vincular a {restaurantes[0].nombre}
            </button>
          </form>
        </div>
      )}

      {!perfil && (!restaurantes || restaurantes.length === 0) && (
        <div className="mt-4">
          <a href="/onboarding" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg inline-block">
            Ir a Onboarding
          </a>
        </div>
      )}

      {perfil && perfil.restaurante_id && (
        <div className="mt-4">
          <a href="/admin" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-block">
            ✓ Todo configurado - Ir al Dashboard
          </a>
        </div>
      )}
    </div>
  )
}
