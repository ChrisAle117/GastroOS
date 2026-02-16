"use client"

import { createInsumo } from './actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insumoSchema } from './schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'

export default function InsumoForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(insumoSchema)
  })

  const onSubmit = (data: any) => {
    setError(null)
    startTransition(async () => {
      try {
        await createInsumo(data)
        reset()
      } catch (err: any) {
        setError(err.message || 'Error al crear el insumo')
      }
    })
  }

  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="text-lg font-semibold mb-4">Nuevo Insumo</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Input 
            {...register('nombre')} 
            placeholder="Nombre del insumo" 
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre.message as string}</p>
          )}
        </div>

        <div>
          <Input 
            {...register('unidad_medida')} 
            placeholder="Unidad de medida (kg, g, L, ml, unidades)" 
          />
          {errors.unidad_medida && (
            <p className="text-red-500 text-sm mt-1">{errors.unidad_medida.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Input 
              {...register('stock_actual')} 
              placeholder="Stock actual" 
              type="number" 
              step="0.01"
            />
            {errors.stock_actual && (
              <p className="text-red-500 text-sm mt-1">{errors.stock_actual.message as string}</p>
            )}
          </div>
          
          <div>
            <Input 
              {...register('stock_minimo')} 
              placeholder="Stock mínimo" 
              type="number" 
              step="0.01"
            />
            {errors.stock_minimo && (
              <p className="text-red-500 text-sm mt-1">{errors.stock_minimo.message as string}</p>
            )}
          </div>

          <div>
            <Input 
              {...register('costo_unitario')} 
              placeholder="Costo unitario ($)" 
              type="number" 
              step="0.01"
            />
            {errors.costo_unitario && (
              <p className="text-red-500 text-sm mt-1">{errors.costo_unitario.message as string}</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700">
          {isPending ? 'Creando...' : 'Crear insumo'}
        </Button>
      </form>
    </div>
  )
}
