import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
        Gastro<span className="text-orange-500">OS</span>
      </h1>
      <p className="text-zinc-400 mb-8 text-center max-w-md">
        El sistema operativo para tu restaurante. Gestión de inventarios, mesas y pagos en tiempo real.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors"
        >
          Entrar al Sistema
        </Link>
      </div>
    </div>
  )
}