import pb from '@/lib/pocketbase/client'

export interface Client {
  id: string
  name: string
  cnpj: string
  contact_email: string
  contact_phone: string
  created: string
  updated: string
}

export const getClients = () => pb.collection('clients').getFullList({ sort: '-updated' })

export const getClient = (id: string) => pb.collection('clients').getOne(id)

export const createClient = (data: {
  name: string
  cnpj?: string
  contact_email?: string
  contact_phone?: string
}) => pb.collection('clients').create(data)

export const updateClient = (
  id: string,
  data: Partial<{ name: string; cnpj: string; contact_email: string; contact_phone: string }>,
) => pb.collection('clients').update(id, data)

export const deleteClient = (id: string) => pb.collection('clients').delete(id)
