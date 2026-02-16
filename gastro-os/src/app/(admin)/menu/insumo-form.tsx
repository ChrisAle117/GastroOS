"use client"

import { createInsumo } from './actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insumoSchema } from './schemas'

export default function InsumoForm() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(insumoSchema)
  })

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <form onSubmit={handleSubmit(createInsumo)} className="flex flex-col gap-4">
        <input {...register('nombre')} placeholder="Nombre del insumo" className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg" />
        <input {...register('stock', { valueAsNumber: true })} placeholder="Stock" type="number" className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg" />
        <button type="submit" disabled={formState.isSubmitting} className="bg-orange-600 text-white font-bold py-2 rounded-lg disabled:opacity-50">
          Crear insumo
        </button>
      </form>
    </div>
  )
}
