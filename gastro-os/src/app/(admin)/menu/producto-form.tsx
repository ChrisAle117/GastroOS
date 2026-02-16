"use client"

import { createProducto } from './actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productoSchema } from './schemas'

export default function ProductoForm() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(productoSchema)
  })

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <form onSubmit={handleSubmit(createProducto)} className="flex flex-col gap-4">
        <input {...register('nombre')} placeholder="Nombre del producto" className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg" />
        <input {...register('precio', { valueAsNumber: true })} placeholder="Precio" type="number" className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg" />
        <button type="submit" disabled={formState.isSubmitting} className="bg-orange-600 text-white font-bold py-2 rounded-lg disabled:opacity-50">
          Crear producto
        </button>
      </form>
    </div>
  )
}
