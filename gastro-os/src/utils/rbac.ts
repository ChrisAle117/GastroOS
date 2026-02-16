export type Role = 'dueño' | 'gerente' | 'mesero' | 'cocinero'

type AccessRule = {
  prefix: string
  roles: Role[]
}

const ACCESS_RULES: AccessRule[] = [
  { prefix: '/admin/configuracion', roles: ['dueño'] },
  { prefix: '/admin/finanzas', roles: ['dueño', 'gerente'] },
  { prefix: '/admin/inventario', roles: ['dueño', 'gerente'] },
  { prefix: '/admin/menu', roles: ['dueño', 'gerente'] },
  { prefix: '/admin/salon', roles: ['dueño', 'gerente'] },
  { prefix: '/admin', roles: ['dueño', 'gerente'] },
  { prefix: '/pos', roles: ['dueño', 'gerente', 'mesero'] },
  { prefix: '/kitchen', roles: ['dueño', 'gerente', 'cocinero'] },
]

export function normalizeRole(value: string | null | undefined): Role {
  if (value === 'dueño' || value === 'gerente' || value === 'mesero' || value === 'cocinero') {
    return value
  }
  return 'mesero'
}

export function canAccessPath(role: Role, pathname: string): boolean {
  const rule = ACCESS_RULES.find((item) => pathname.startsWith(item.prefix))
  if (!rule) return true
  return rule.roles.includes(role)
}

export function getHomePathForRole(role: Role): string {
  switch (role) {
    case 'mesero':
      return '/pos'
    case 'cocinero':
      return '/kitchen'
    case 'gerente':
    case 'dueño':
    default:
      return '/admin'
  }
}
