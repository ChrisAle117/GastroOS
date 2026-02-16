"use client"

import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { addOrderItem, createOrder } from './actions'

type Mesa = { id: number; nombre: string }
type Producto = { id: number; nombre: string; precio: number }

type OrderItem = {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

type Props = {
  mesas: Mesa[]
  productos: Producto[]
}

export default function PosBoard({ mesas, productos }: Props) {
  const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isPending, startTransition] = useTransition()

  const [optimisticItems, addOptimisticItem] = useOptimistic(
    orderItems,
    (state: OrderItem[], item: OrderItem) => [...state, item]
  )

  const total = useMemo(
    () => optimisticItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [optimisticItems]
  )

  const handleAddProduct = (producto: Producto) => {
    if (!selectedMesaId) return

    startTransition(async () => {
      let currentOrderId = orderId
      if (!currentOrderId) {
        currentOrderId = await createOrder(selectedMesaId)
        setOrderId(currentOrderId)
      }

      const item: OrderItem = {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
      }

      addOptimisticItem(item)
      await addOrderItem(currentOrderId!, producto.id, 1, producto.precio)
      setOrderItems((prev) => [...prev, item])
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 text-white">
      <h1 className="text-2xl font-bold">Comandero</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-2">Mesas</h2>
          <div className="grid grid-cols-2 gap-2">
            {mesas.map((mesa) => (
              <button
                key={mesa.id}
                onClick={() => {
                  setSelectedMesaId(mesa.id)
                  setOrderId(null)
                  setOrderItems([])
                }}
                className={`p-3 rounded-lg border transition ${
                  selectedMesaId === mesa.id
                    ? 'bg-orange-600 border-orange-500'
                    : 'bg-zinc-900 border-zinc-800 hover:border-orange-500'
                }`}
              >
                {mesa.nombre}
              </button>
            ))}
          </div>
        </section>

        <section className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-2">Productos</h2>
          <div className="flex flex-col gap-2 max-h-[520px] overflow-auto pr-2">
            {productos.map((producto) => (
              <button
                key={producto.id}
                onClick={() => handleAddProduct(producto)}
                disabled={!selectedMesaId || isPending}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-orange-500 disabled:opacity-50"
              >
                <span>{producto.nombre}</span>
                <span>${producto.precio}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-2">Comanda</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-h-[320px]">
            {optimisticItems.length === 0 ? (
              <p className="text-zinc-400">Agrega productos para iniciar la comanda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {optimisticItems.map((item, index) => (
                  <div key={`${item.producto_id}-${index}`} className="flex justify-between">
                    <span>{item.nombre} x{item.cantidad}</span>
                    <span>${item.precio * item.cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4 text-lg font-semibold">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </section>
      </div>
    </div>
  )
}
