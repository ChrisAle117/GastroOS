"use client"

import { useState } from 'react'
import { deleteInsumo } from './actions'
import { Trash2, X } from 'lucide-react'
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

export default function DeleteInsumoDialog({ insumo }: { insumo: Insumo }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInsumo(insumo.id)
      setOpen(false)
      router.refresh()
    } catch (error) {
      alert('Error al eliminar el insumo')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-red-500"
        title="Eliminar insumo"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-500">Eliminar Insumo</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-300 mb-6">
              ¿Estás seguro que deseas eliminar <span className="font-bold">{insumo.nombre}</span>? 
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
