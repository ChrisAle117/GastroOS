import Sidebar from '../(admin)/sidebar'
import Header from '../(admin)/header'

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
