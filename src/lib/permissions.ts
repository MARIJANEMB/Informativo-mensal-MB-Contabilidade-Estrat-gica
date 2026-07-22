export type ModuleName = 'painel' | 'admin' | 'contabil' | 'fiscal'

export const ALL_MODULES: ModuleName[] = ['painel', 'admin', 'contabil', 'fiscal']

const DEPARTMENT_MODULES: Record<string, ModuleName[]> = {
  Fiscal: ['painel', 'fiscal'],
  Contábil: ['painel', 'contabil'],
  Folha: ['painel'],
  Outros: ['painel'],
  Administrativo: ['painel', 'admin'],
}

export function getAccessibleModules(
  role: string | undefined,
  department: string | undefined,
): ModuleName[] {
  if (role === 'Admin') return ALL_MODULES
  if (!department) return ['painel']
  return DEPARTMENT_MODULES[department] || ['painel']
}

export function hasModuleAccess(
  role: string | undefined,
  department: string | undefined,
  module: ModuleName,
): boolean {
  return getAccessibleModules(role, department).includes(module)
}
