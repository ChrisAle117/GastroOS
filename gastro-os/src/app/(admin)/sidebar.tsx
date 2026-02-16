export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4">
      <div className="text-xl font-bold mb-8">GastroOS</div>
      <nav className="flex flex-col gap-4">
        <a href="/admin" className="hover:text-orange-500">Dashboard</a>
        <a href="/admin/inventario" className="hover:text-orange-500">Inventario</a>
        <a href="/admin/menu" className="hover:text-orange-500">Menú</a>
        <a href="/admin/personal" className="hover:text-orange-500">Personal</a>
        <a href="/admin/finanzas" className="hover:text-orange-500">Finanzas</a>
      </nav>
    </aside>
  )
}
