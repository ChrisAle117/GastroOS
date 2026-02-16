"use client"

import { createMesa } from './actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mesaSchema } from './schemas'

type Floor = {
  id: string
  nombre: string
}

export default function MesaForm({ floors, selectedFloorId }: { floors: Floor[]; selectedFloorId: string | null }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(mesaSchema),
    defaultValues: {
      capacidad: 4,
    },
  })

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <form onSubmit={handleSubmit(createMesa)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          {...register('nombre')}
          placeholder="Nombre de la mesa"
          className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
        />
        <input
          {...register('capacidad')}
          type="number"
          min={1}
          placeholder="Capacidad"
          className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
        />
        <select
          {...register('salon_floor_id')}
          defaultValue={selectedFloorId ?? ''}
          className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
        >
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
        >
          Crear mesa
        </button>
      </form>
    </div>
  )
}
