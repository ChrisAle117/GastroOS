"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insumoSchema } from './schemas'
import { createInsumo } from './actions'
import { Plus, X } from 'lucide-react'

export default function InsumoDialog() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(insumoSchema)
  })

  const onSubmit = async (data: any) => {
    try {
      await createInsumo(data)
      reset()
      setOpen(false)
      window.location.reload() // Refrescar la página para ver el nuevo insumo
    } catch (error) {
      alert('Error al crear el insumo')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar Insumo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nuevo Insumo</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Insumo</label>
                <input
                  {...register('nombre')}
                  placeholder="Ej. Harina 000"
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Unidad de Medida</label>
                  <select
                    {...register('unidad_medida')}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="L">Litro (L)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="unidad">Unidad</option>
                    <option value="paquete">Paquete</option>
                  </select>
                  {errors.unidad_medida && (
                    <p className="text-red-500 text-sm mt-1">{errors.unidad_medida.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Costo Unitario</label>
                  <input
                    {...register('costo_unitario', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  {errors.costo_unitario && (
                    <p className="text-red-500 text-sm mt-1">{errors.costo_unitario.message as string}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Actual</label>
                  <input
                    {...register('stock_actual', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  {errors.stock_actual && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock_actual.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Mínimo</label>
                  <input
                    {...register('stock_minimo', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  {errors.stock_minimo && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock_minimo.message as string}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
