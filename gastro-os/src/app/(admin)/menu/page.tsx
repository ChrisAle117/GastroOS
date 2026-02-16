import ProductosTable from './productos-table'
import InsumosTable from './insumos-table'
import ProductoForm from './producto-form'
import InsumoForm from './insumo-form'

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Menú y Insumos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ProductoForm />
          <ProductosTable />
        </div>
        <div>
          <InsumoForm />
          <InsumosTable />
        </div>
      </div>
    </div>
  )
}
