"use client"

import { useState } from 'react'
import { updateStock } from './actions'
import { TrendingUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Insumo = {
  id: number
  nombre: string
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  costo_unitario: number
  restaurante_id: string
  created_at: string
}

export default function AdjustStockDialog({ insumo }: { insumo: Insumo }) {
  const [open, setOpen] = useState(false)
  const [cantidad, setCantidad] = useState(insumo.stock_actual)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateStock(insumo.id, cantidad)
      setOpen(false)
      router.refresh()
    } catch (error) {
      alert('Error al ajustar el stock')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-blue-500"
        title="Ajustar stock"
      >
        <TrendingUp className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Ajustar Stock</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Insumo</label>
                <div className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg text-zinc-400">
                  {insumo.nombre}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock Actual</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
