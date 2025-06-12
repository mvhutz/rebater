import { promises as fs } from 'fs';
import { Customer, CustomerTableSchema } from './schema';

export async function getCustomersFile(path: string): Promise<Customer[]> {
  const file = await fs.readFile(path, 'utf-8');
  const json = JSON.parse(file);
  return await CustomerTableSchema.parseAsync(json);
}
