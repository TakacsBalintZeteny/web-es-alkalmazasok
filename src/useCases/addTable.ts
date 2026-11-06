import type { Table } from '../domain/entities/Table'

type AddTableInput = {
  name: string
  capacity: number
}

export function addTable(
  tables: Table[],
  input: AddTableInput,
): Table[] {
  if (!input.name.trim()) {
    throw new Error('Az asztal neve kötelező.')
  }

  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    throw new Error('Az asztal férőhelye legalább 1 fő kell legyen.')
  }

  const nextId =
    tables.length > 0
      ? Math.max(...tables.map((table) => table.id)) + 1
      : 1

  const newTable: Table = {
    id: nextId,
    name: input.name.trim(),
    capacity: input.capacity,
  }

  return [...tables, newTable]
}