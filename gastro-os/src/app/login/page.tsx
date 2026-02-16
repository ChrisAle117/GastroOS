import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form action={login} className="p-8 border rounded-lg shadow-md w-96 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-center">Entrar a GastroOS</h1>
        <input name="email" type="email" placeholder="Correo" required className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Contraseña" required className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Iniciar Sesión
        </button>
      </form>
    </div>
  )
}