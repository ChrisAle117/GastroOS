"use client"

import { createProducto } from './actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productoSchema } from './schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'

export default function ProductoForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(productoSchema)
  })

  const onSubmit = (data: any) => {
    setError(null)
    startTransition(async () => {
      try {
        await createProducto(data)
        reset()
      } catch (err: any) {
        setError(err.message || 'Error al crear el producto')
      }
    })
  }

  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="text-lg font-semibold mb-4">Nuevo Producto</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Input 
            {...register('nombre')} 
            placeholder="Nombre del producto" 
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre.message as string}</p>
          )}
        </div>

        <div>
          <Input 
            {...register('descripcion')} 
            placeholder="Descripción (opcional)" 
          />
          {errors.descripcion && (
            <p className="text-red-500 text-sm mt-1">{errors.descripcion.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input 
              {...register('precio')} 
              placeholder="Precio de venta" 
              type="number" 
              step="0.01"
            />
            {errors.precio && (
              <p className="text-red-500 text-sm mt-1">{errors.precio.message as string}</p>
            )}
          </div>

          <div>
            <Input 
              {...register('categoria')} 
              placeholder="Categoría (opcional)" 
            />
            {errors.categoria && (
              <p className="text-red-500 text-sm mt-1">{errors.categoria.message as string}</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700">
          {isPending ? 'Creando...' : 'Crear producto'}
        </Button>
      </form>
    </div>
  )
}
