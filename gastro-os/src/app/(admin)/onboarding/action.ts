'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createRestaurant(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const nombre = formData.get('nombre') as string
  // Generamos un slug y le añadimos un código aleatorio de 4 caracteres
  const randomCode = Math.random().toString(36).substring(2, 6);
  const slugBase = nombre.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const slug = `${slugBase}-${randomCode}`;

  // 1. Insertar el restaurante
  const { data: restaurant, error: restError } = await supabase
    .from('restaurantes')
    .insert([{ nombre, slug }])
    .select()
    .single()

  if (restError) throw new Error(restError.message)

  // 2. Verificar o crear el perfil
  const { data: existingProfile } = await supabase
    .from('perfiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    // Crear el perfil si no existe
    const { error: createProfileError } = await supabase
      .from('perfiles')
      .insert({
        id: user.id,
        restaurante_id: restaurant.id,
        rol: 'dueño',
        nombre_completo: user.email?.split('@')[0]
      })

    if (createProfileError) throw new Error(createProfileError.message)
  } else {
    // Actualizar el perfil existente
    const { error: profileError } = await supabase
      .from('perfiles')
      .update({ 
        restaurante_id: restaurant.id,
        rol: 'dueño',
        nombre_completo: user.email?.split('@')[0]
      })
      .eq('id', user.id)

    if (profileError) throw new Error(profileError.message)
  }

  // 3. Verificar que se actualizó correctamente
  const { data: updatedProfile } = await supabase
    .from('perfiles')
    .select('restaurante_id')
    .eq('id', user.id)
    .single()

  if (!updatedProfile?.restaurante_id) {
    throw new Error('No se pudo vincular el restaurante al perfil')
  }

  // 4. Revalidar rutas antes de redirigir
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/onboarding')
  
  redirect('/admin')
}