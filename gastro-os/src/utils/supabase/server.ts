import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El middleware se encarga de esto
          }
        },
      },
    }
  )
}

// Obtiene el restaurante actual usando restaurante_id de perfiles
export async function getRestauranteActual() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('restaurante_id')
    .eq('id', user.id)
    .single()

  const restaurante_id = perfil?.restaurante_id
  if (!restaurante_id) return null

  const { data } = await supabase
    .from('restaurantes')
    .select('id, nombre, slug, logo')
    .eq('id', restaurante_id)
    .single()

  return data
}