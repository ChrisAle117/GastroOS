'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

  // 2. Vincular el usuario como dueño
  const { error: profileError } = await supabase
    .from('perfiles')
    .update({ 
      restaurante_id: restaurant.id,
      rol: 'dueño',
      nombre_completo: user.email?.split('@')[0] // Nombre provisional
    })
    .eq('id', user.id)

  if (profileError) throw new Error(profileError.message)

  redirect('/admin')
}