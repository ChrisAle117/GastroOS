'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  // Verificar si existe el perfil, si no, crearlo
  if (authData.user) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (!perfil) {
      await supabase
        .from('perfiles')
        .insert({
          id: authData.user.id,
        })
    }
  }

  // Si todo sale bien, mandamos al admin (el middleware decidirá si va a onboarding)
  redirect('/admin')
}