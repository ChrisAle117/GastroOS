"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productoSchema } from './schemas'
import { createProducto, updateProducto, deleteProducto, getReceta, saveReceta, getModificadoresByProducto, saveProductoModificadores } from './actions'
import { Edit, X, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Insumo = {
  id: number
  nombre: string
  unidad_medida: string
  costo_unitario: number
  stock_actual: number
}

type Categoria = {
  id: number
  nombre: string
  color: string | null
  icono: string | null
}

type Modificador = {
  id: number
  nombre: string
  tipo: 'extra' | 'exclusion'
  precio: number
}

type RecetaItem = {
  insumo_id: number
  cantidad: number
  es_critico: boolean
}

type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  categoria_id: number | null
  imagen_url: string | null
}

type Props = {
  producto?: Producto
  insumos: Insumo[]
  categorias: Categoria[]
  modificadores: Modificador[]
}

export default function ProductoDialog({ producto, insumos, categorias, modificadores }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [recetaItems, setRecetaItems] = useState<RecetaItem[]>([])
  const [selectedInsumo, setSelectedInsumo] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState<string>('')
  const [esCritico, setEsCritico] = useState(false)
  const [selectedModificadores, setSelectedModificadores] = useState<number[]>([])
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: producto ? {
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria_id: producto.categoria_id,
      imagen_url: producto.imagen_url || '',
    } : {}
  })

  // Cargar receta, modificadores y datos si es edición
  useEffect(() => {
    if (!open) return

    if (producto) {
      reset({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        categoria_id: producto.categoria_id,
        imagen_url: producto.imagen_url || '',
      })
      loadReceta()
      loadModificadores()
      return
    }

    reset({ nombre: '', descripcion: '', precio: 0, categoria_id: null, imagen_url: '' })
    setRecetaItems([])
    setSelectedModificadores([])
  }, [open, producto, reset])

  const loadReceta = async () => {
    if (!producto) return
    const receta = await getReceta(producto.id)
    const items = receta.map((r: any) => ({
      insumo_id: r.insumo.id,
      cantidad: r.cantidad,
      es_critico: r.es_critico
    }))
    setRecetaItems(items)
  }

  const loadModificadores = async () => {
    if (!producto) return
    const mods = await getModificadoresByProducto(producto.id)
    setSelectedModificadores(mods.map((m: any) => m.id))
  }

  const calcularCosto = () => {
    return recetaItems.reduce((total, item) => {
      const insumo = insumos.find(i => i.id === item.insumo_id)
      if (!insumo) return total
      return total + (item.cantidad * insumo.costo_unitario)
    }, 0)
  }

  const agregarIngrediente = () => {
    if (!selectedInsumo || !cantidad || parseFloat(cantidad) <= 0) return

    const existe = recetaItems.find(item => item.insumo_id === selectedInsumo)
    if (existe) {
      alert('Este ingrediente ya está en la receta')
      return
    }

    setRecetaItems([...recetaItems, {
      insumo_id: selectedInsumo,
      cantidad: parseFloat(cantidad),
      es_critico: esCritico
    }])

    setSelectedInsumo(null)
    setCantidad('')
    setEsCritico(false)
  }

  const eliminarIngrediente = (insumo_id: number) => {
    setRecetaItems(recetaItems.filter(item => item.insumo_id !== insumo_id))
  }

  const onSubmit = async (data: any) => {
    setPending(true)
    try {
      let productoId = producto?.id
      
      if (producto) {
        await updateProducto(producto.id, data)
        await saveReceta(producto.id, recetaItems)
        await saveProductoModificadores(producto.id, selectedModificadores)
      } else {
        const newProducto = await createProducto(data)
        if (newProducto?.id) {
          const newProductoId = newProducto.id
          if (recetaItems.length > 0) {
            await saveReceta(newProductoId, recetaItems)
          }
          if (selectedModificadores.length > 0) {
            await saveProductoModificadores(newProductoId, selectedModificadores)
          }
        }
      }
      router.refresh()
      setOpen(false)
      reset()
      setRecetaItems([])
      setSelectedModificadores([])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el producto')
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async () => {
    if (!producto) return
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    setPending(true)
    try {
      await deleteProducto(producto.id)
      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el producto')
    } finally {
      setPending(false)
    }
  }

  const costoTotal = calcularCosto()
  const precioVenta = Number(watch('precio') ?? 0)
  const margen = precioVenta - costoTotal
  const margenPorcentaje = precioVenta > 0 ? (margen / precioVenta) * 100 : 0

  return (
    <>
      {producto ? (
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-orange-500"
          title="Editar producto"
        >
          <Edit className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {producto ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Información del Producto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Producto</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre *</label>
                    <input
                      {...register('nombre')}
                      className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Ej: Pizza Margherita"
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm mt-1">{errors.nombre.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Precio de Venta *</label>
                    <input
                      {...register('precio')}
                      type="number"
                      step="0.01"
                      className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="0.00"
                    />
                    {errors.precio && (
                      <p className="text-red-500 text-sm mt-1">{errors.precio.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    {...register('categoria_id')}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL de Imagen (opcional)</label>
                  <input
                    {...register('imagen_url')}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    {...register('descripcion')}
                    rows={2}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    placeholder="Descripción breve del producto"
                  />
                </div>
              </div>

              {/* Receta (Escandallo) */}
              {producto && (
                <div className="space-y-4 border-t border-zinc-800 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Receta (Escandallo)</h3>
                    <div className="text-sm text-zinc-400">
                      Costo Total: <span className="font-bold text-white">${costoTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Agregar Ingrediente */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <select
                          value={selectedInsumo || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            setSelectedInsumo(value ? parseInt(value, 10) : null)
                          }}
                          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="">Seleccionar insumo...</option>
                          {insumos.map(insumo => (
                            <option key={insumo.id} value={insumo.id}>
                              {insumo.nombre} ({insumo.unidad_medida})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                          placeholder="Cantidad"
                          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={esCritico}
                            onChange={(e) => setEsCritico(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800"
                          />
                          <span className="text-sm text-zinc-400">Crítico</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={agregarIngrediente}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Ingredientes */}
                  {recetaItems.length > 0 ? (
                    <div className="space-y-2">
                      {recetaItems.map(item => {
                        const insumo = insumos.find(i => i.id === item.insumo_id)
                        if (!insumo) return null
                        const costoItem = item.cantidad * insumo.costo_unitario

                        return (
                          <div key={item.insumo_id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {insumo.nombre}
                                  {item.es_critico && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
                                      <AlertCircle className="w-3 h-3" />
                                      Crítico
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-zinc-400">
                                  {item.cantidad} {insumo.unidad_medida} × ${insumo.costo_unitario.toFixed(2)} = ${costoItem.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarIngrediente(item.insumo_id)}
                              className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-700 rounded-lg">
                      No hay ingredientes en la receta. Agrega el primer ingrediente.
                    </div>
                  )}
                </div>
              )}

              {/* Modificadores (Extras y Exclusiones) */}
              <div className="space-y-4 border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-semibold">Modificadores Disponibles</h3>
                <p className="text-sm text-zinc-400">
                  Selecciona los extras y exclusiones que los clientes pueden elegir para este producto
                </p>

                {modificadores.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modificadores.map(mod => {
                      const isSelected = selectedModificadores.includes(mod.id)
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModificadores([...selectedModificadores, mod.id])
                              } else {
                                setSelectedModificadores(selectedModificadores.filter(id => id !== mod.id))
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{mod.nombre}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                mod.tipo === 'extra' 
                                  ? 'bg-green-900/50 text-green-400' 
                                  : 'bg-red-900/50 text-red-400'
                              }`}>
                                {mod.tipo === 'extra' ? 'Extra' : 'Exclusión'}
                              </span>
                            </div>
                            {mod.tipo === 'extra' && mod.precio > 0 && (
                              <div className="text-sm text-zinc-400">
                                +${mod.precio.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-700 rounded-lg">
                    No hay modificadores disponibles. Crea modificadores primero en el módulo de menú.
                  </div>
                )}
              </div>

              {/* Análisis de Costos */}
              {producto && recetaItems.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold mb-3">Análisis de Costos</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Costo de Ingredientes:</span>
                    <span className="font-medium">${costoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Precio de Venta:</span>
                    <span className="font-medium">${precioVenta.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Margen de Ganancia:</span>
                      <span className={`font-bold ${margenPorcentaje >= 60 ? 'text-green-500' : margenPorcentaje >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        ${margen.toFixed(2)} ({margenPorcentaje.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                {producto && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pending}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {pending ? 'Guardando...' : producto ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
