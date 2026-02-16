"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mermaSchema } from './schemas'
import { createMerma } from './actions'

export default function MermaForm() {
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(mermaSchema)
  })

  const onSubmit = async (data: any) => {
    await createMerma(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        {...register('motivo')}
        placeholder="Motivo de la merma"
        className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
      />
      <input
        {...register('costo', { valueAsNumber: true })}
        placeholder="Costo"
        type="number"
        className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
      />
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="bg-orange-600 text-white font-bold py-2 rounded-lg disabled:opacity-50"
      >
        Registrar merma
      </button>
    </form>
  )
}
