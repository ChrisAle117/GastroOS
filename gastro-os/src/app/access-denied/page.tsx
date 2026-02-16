import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Acceso denegado</h1>
        <p className="text-zinc-400 mb-6">
          No tienes permisos para acceder a esta seccion.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            Ir al panel
          </Link>
          <Link
            href="/pos"
            className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Ir al POS
          </Link>
        </div>
      </div>
    </div>
  )
}
