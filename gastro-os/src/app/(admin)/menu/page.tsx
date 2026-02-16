import ProductosTable from './productos-table'
import InsumosTable from './insumos-table'
import ProductoForm from './producto-form'
import InsumoForm from './insumo-form'
import { getInsumos, getProductos } from './actions'
import { Package } from 'lucide-react'

export default async function MenuPage() {
  const [insumos, productos] = await Promise.all([
    getInsumos(),
    getProductos()
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Menú e Inventario</h2>
        <p className="text-zinc-400">Gestiona tus productos e insumos</p>
      </div>

      {/* Insumos Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-orange-500" />
          <h3 className="text-xl font-semibold">Inventario de Insumos</h3>
        </div>
        <InsumoForm />
        <InsumosTable insumos={insumos} />
      </div>

      {/* Productos Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Productos del Menú</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductoForm />
          <ProductosTable />
        </div>
      </div>
    </div>
  )
}
