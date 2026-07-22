import pb from '@/lib/pocketbase/client'

export type Department = 'Fiscal' | 'Contábil' | 'Folha' | 'Outros'

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: Department
  notes: string
  created: string
  updated: string
}

export const DEPARTMENTS: Department[] = ['Fiscal', 'Contábil', 'Folha', 'Outros']

export const getEmployees = () => pb.collection('employees').getFullList({ sort: 'name' })

export const getEmployee = (id: string) => pb.collection('employees').getOne(id)

export const createEmployee = (data: {
  name: string
  email: string
  phone?: string
  role?: string
  department?: Department
  notes?: string
}) => pb.collection('employees').create(data)

export const updateEmployee = (
  id: string,
  data: Partial<{
    name: string
    email: string
    phone: string
    role: string
    department: Department
    notes: string
  }>,
) => pb.collection('employees').update(id, data)

export const deleteEmployee = (id: string) => pb.collection('employees').delete(id)
