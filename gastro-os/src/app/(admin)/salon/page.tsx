import MesasMap from './mesas-map'
import MesasTable from './mesas-table'
import MesaForm from './mesa-form'
import { getMesas } from './actions'
import { Grid3x3 } from 'lucide-react'

export default async function SalonPage() {
  const mesas = await getMesas()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Gestión de Salón</h2>
        <p className="text-zinc-400">Administra las mesas de tu restaurante</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-5 h-5 text-orange-500" />
        <h3 className="text-xl font-semibold">Mesas</h3>
      </div>

      <MesaForm />
      <MesasTable mesas={mesas} />
      {/* <MesasMap mesas={mesas} /> */}
    </div>
  )
}
