import { promises as fs } from 'fs';
import { z } from 'zod';

const CustomerSchema = z.object({
  supplierName: z.string().nonempty(),
  category: z.string().nonempty(),
  customerName: z.string().nonempty(),
  internalId: z.string().optional(),
  fuseId: z.number().optional(),
})

const CustomerTableSchema = z.array(CustomerSchema);

export async function getCustomersFile(path: string) {
  const file = await fs.readFile(path, 'utf-8');
  const json = JSON.parse(file);
  return await CustomerTableSchema.parseAsync(json);
}
