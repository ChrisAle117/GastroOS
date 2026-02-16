"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPerfilAndLink(restauranteId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user')

  // Crear el perfil
  const { error: createError } = await supabase
    .from('perfiles')
    .insert({
      id: user.id,
      restaurante_id: restauranteId,
      rol: 'dueño',
      nombre_completo: user.email?.split('@')[0]
    })

  if (createError) throw new Error(createError.message)

  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  
  redirect('/admin')
}
