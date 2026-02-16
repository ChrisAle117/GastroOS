"use client"

import { useState, useTransition, useEffect } from 'react'
import { X, Plus, Minus, Send, Trash2 } from 'lucide-react'
import { createOrder, addOrderItem, getOrderItems } from './actions'

type Mesa = {
  id: string
  nombre: string
  estado: 'libre' | 'ocupada' | 'sucia'
  capacidad: number
}

type Producto = {
  id: number
  nombre: string
  precio: number
  categoria_id?: number | null
}

type Categoria = {
  id: number
  nombre: string
}

type OrderItem = {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

type Props = {
  mesa: Mesa
  productos: Producto[]
  categorias: Categoria[]
  onClose: () => void
}

export default function ComanderoModal({ mesa, productos, categorias, onClose }: Props) {
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(categorias[0]?.id ?? null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [isPending, startTransition] = useTransition()

  // Load existing order for this mesa if any
  useEffect(() => {
    // TODO: Load existing order items when available
  }, [mesa.id])

  const productosFiltrados = selectedCategoria
    ? productos.filter((p) => p.categoria_id === selectedCategoria)
    : productos

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const addItem = (producto: Producto) => {
    const existingItem = items.find((item) => item.producto_id === producto.id)
    
    if (existingItem) {
      setItems(items.map((item) =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setItems([...items, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
      }])
    }
  }

  const updateQuantity = (productoId: number, delta: number) => {
    setItems(items.map((item) => {
      if (item.producto_id === productoId) {
        const newCantidad = item.cantidad + delta
        return newCantidad > 0 ? { ...item, cantidad: newCantidad } : item
      }
      return item
    }).filter((item) => item.cantidad > 0))
  }

  const removeItem = (productoId: number) => {
    setItems(items.filter((item) => item.producto_id !== productoId))
  }

  const sendOrder = () => {
    if (items.length === 0) return

    startTransition(async () => {
      try {
        let currentOrderId = orderId
        
        if (!currentOrderId) {
          currentOrderId = await createOrder(Number(mesa.id))
          setOrderId(currentOrderId)
        }

        for (const item of items) {
          await addOrderItem(currentOrderId, item.producto_id, item.cantidad, item.precio)
        }

        alert('Orden enviada a cocina')
        onClose()
      } catch (error) {
        alert('Error al enviar la orden')
        console.error(error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold">Mesa {mesa.nombre}</h2>
            <p className="text-sm text-zinc-400">{mesa.capacidad} personas</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Product Selection */}
          <div className="flex-1 flex flex-col border-r border-zinc-800">
            {/* Categories */}
            <div className="p-4 border-b border-zinc-800">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategoria(null)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategoria === null
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Todos
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoria(cat.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategoria === cat.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => addItem(producto)}
                    className="flex flex-col items-start p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-orange-500 transition-all"
                  >
                    <span className="font-medium text-sm mb-2">{producto.nombre}</span>
                    <span className="text-orange-500 font-bold">${producto.precio.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-96 flex flex-col bg-zinc-950/50">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-semibold text-lg">Orden Actual</h3>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {items.length === 0 ? (
                <p className="text-zinc-500 text-center mt-8">
                  Selecciona productos para iniciar la orden
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.nombre}</div>
                        <div className="text-xs text-zinc-400">${item.precio.toFixed(2)} c/u</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.producto_id, -1)}
                          className="p-1 rounded bg-zinc-700 hover:bg-zinc-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.producto_id, 1)}
                          className="p-1 rounded bg-zinc-700 hover:bg-zinc-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.producto_id)}
                          className="p-1 rounded bg-red-900/50 hover:bg-red-900 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="ml-4 font-bold min-w-[80px] text-right">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Action */}
            <div className="p-4 border-t border-zinc-800 space-y-4">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total</span>
                <span className="text-orange-500">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={sendOrder}
                disabled={items.length === 0 || isPending}
                className="w-full py-4 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:text-zinc-500 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                {isPending ? 'Enviando...' : 'Enviar a Cocina'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
