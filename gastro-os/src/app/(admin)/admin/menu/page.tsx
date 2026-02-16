import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProductos, getInsumos, calcularCostoProducto, getCategorias, getModificadores } from './actions'
import { UtensilsCrossed, Plus, DollarSign, TrendingUp, Tag, Layers } from 'lucide-react'
import ProductoDialog from './producto-dialog'
import CategoriaDialog from './categoria-dialog'
import ModificadorDialog from './modificador-dialog'

type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  categoria_id: number | null
  imagen_url: string | null
  disponible: boolean
  restaurante_id: string
  created_at: string
}

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const [productos, insumos, categorias, modificadores] = await Promise.all([
    getProductos(),
    getInsumos(),
    getCategorias(),
    getModificadores()
  ])

  // Calcular costos para cada producto
  const productosConCosto = await Promise.all(
    productos.map(async (producto: Producto) => {
      const costo = await calcularCostoProducto(producto.id)
      const margen = producto.precio - costo
      const margenPorcentaje = producto.precio > 0 ? (margen / producto.precio) * 100 : 0

      return {
        ...producto,
        costo_ingredientes: costo,
        margen,
        margen_porcentaje: margenPorcentaje
      }
    })
  )

  // KPIs
  const totalProductos = productos.length
  const ventasTotales = productosConCosto.reduce((sum, p) => sum + p.precio, 0)
  const costosTotales = productosConCosto.reduce((sum, p) => sum + p.costo_ingredientes, 0)
  const margenPromedio = ventasTotales > 0 ? ((ventasTotales - costosTotales) / ventasTotales) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Menú e Ingeniería de Costos</h2>
          <p className="text-zinc-400">Gestiona tus productos, categorías y modificadores</p>
        </div>
        <div className="flex gap-3">
          <CategoriaDialog />
          <ModificadorDialog />
          <ProductoDialog insumos={insumos} categorias={categorias} modificadores={modificadores} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-zinc-400">Total Productos</span>
          </div>
          <div className="text-3xl font-bold">{totalProductos}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-zinc-400">Margen Promedio</span>
          </div>
          <div className="text-3xl font-bold text-green-500">{margenPromedio.toFixed(1)}%</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-zinc-400">Ingresos Potenciales</span>
          </div>
          <div className="text-3xl font-bold">${ventasTotales.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Costo Ingredientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Precio Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Margen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {productosConCosto.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-400">
                    No hay productos registrados. Agrega tu primer producto para comenzar.
                  </td>
                </tr>
              ) : (
                productosConCosto.map((producto) => {
                  const margenColor = producto.margen_porcentaje >= 60 ? 'text-green-500' : 
                                     producto.margen_porcentaje >= 40 ? 'text-yellow-500' : 
                                     'text-red-500'

                  return (
                    <tr key={producto.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{producto.nombre}</div>
                        {producto.descripcion && (
                          <div className="text-sm text-zinc-400 mt-1">{producto.descripcion}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {categorias.find(c => c.id === producto.categoria_id)?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        ${producto.costo_ingredientes.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        ${producto.precio.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-semibold ${margenColor}`}>
                        ${producto.margen.toFixed(2)} ({producto.margen_porcentaje.toFixed(1)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {producto.disponible ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                            Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                            No Disponible
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ProductoDialog producto={producto} insumos={insumos} categorias={categorias} modificadores={modificadores} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid de dos columnas para Categorías y Modificadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Categorías */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/50">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Categorías</h3>
            </div>
            <span className="text-sm text-zinc-400">{categorias.length} categorías</span>
          </div>
          <div className="p-4">
            {categorias.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                No hay categorías. Crea la primera categoría.
              </div>
            ) : (
              <div className="space-y-2">
                {categorias.map((categoria: any) => (
                  <div
                    key={categoria.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoria.color || '#666' }}
                      />
                      <div>
                        <div className="font-medium">{categoria.nombre}</div>
                        {categoria.descripcion && (
                          <div className="text-sm text-zinc-400">{categoria.descripcion}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Orden: {categoria.orden}</span>
                      <CategoriaDialog categoria={categoria} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Modificadores */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/50">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Modificadores</h3>
            </div>
            <span className="text-sm text-zinc-400">{modificadores.length} modificadores</span>
          </div>
          <div className="p-4">
            {modificadores.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                No hay modificadores. Crea el primer modificador.
              </div>
            ) : (
              <div className="space-y-2">
                {modificadores.map((mod: any) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mod.nombre}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            mod.tipo === 'extra'
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {mod.tipo === 'extra' ? 'Extra' : 'Exclusión'}
                        </span>
                      </div>
                      {mod.tipo === 'extra' && mod.precio > 0 && (
                        <div className="text-sm text-zinc-400 mt-1">
                          +${mod.precio.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <ModificadorDialog modificador={mod} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

