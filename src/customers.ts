import { promises as fs } from 'fs';
import { z } from 'zod';

export const CustomerSchema = z.object({
  supplierName: z.string().nonempty(),
  category: z.string().nonempty(),
  customerName: z.string().nonempty(),
  internalId: z.string().optional(),
  fuseId: z.number().optional(),
});

const CustomerTableSchema = z.array(CustomerSchema);

export type Customer = z.infer<typeof CustomerSchema>;

export async function getCustomersFile(path: string): Promise<Customer[]> {
  const file = await fs.readFile(path, 'utf-8');
  const json = JSON.parse(file);
  return await CustomerTableSchema.parseAsync(json);
}
