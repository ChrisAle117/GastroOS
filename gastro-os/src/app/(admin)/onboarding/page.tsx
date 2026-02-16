"use client"
import { useState } from 'react'
import { createRestaurant } from './action'

export default function OnboardingPage() {
  const [pending, setPending] = useState(false)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
      <div className="max-w-md w-full p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido a GastroOS!</h1>
        <p className="text-zinc-400 mb-8">Comencemos por registrar tu negocio para configurar tu panel.</p>
        
        <form 
          action={async (formData) => {
            setPending(true)
            try {
              await createRestaurant(formData)
            } catch (e) {
              const digest = (e as { digest?: string } | null)?.digest
              if (digest && digest.startsWith('NEXT_REDIRECT')) {
                throw e
              }
              setPending(false)
              alert("Error al crear el restaurante")
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Nombre del Restaurante</label>
            <input 
              name="nombre" 
              placeholder="Ej. Pizzería El Boom" 
              required 
              className="bg-zinc-800 border-zinc-700 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button 
            disabled={pending}
            className={`bg-orange-600 text-white font-bold py-3 rounded-lg transition-all ${pending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700'}`}
          >
            {pending ? 'Creando...' : 'Crear mi Restaurante'}
          </button>
        </form>
      </div>
    </div>
  )
}