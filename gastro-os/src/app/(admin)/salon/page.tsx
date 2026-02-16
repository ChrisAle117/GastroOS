import MesasMap from './mesas-map'
import MesasTable from './mesas-table'
import MesaForm from './mesa-form'

export default function SalonPage() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Gestión de Salón</h2>
      <MesaForm />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MesasMap />
        <MesasTable />
      </div>
    </div>
  )
}
