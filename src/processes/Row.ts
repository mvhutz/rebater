import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({ });
type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(_: Attributes, data: ETL.Cell[][]): Promise<ETL.Row[]> {

  const lengths = data.map(g => g.length);
  if (lengths.some(l => l !== lengths[0])) {
    throw Error("Not all lengths are equal!");
  }

  const results = new Map<string, ETL.Row>();

  for (let g = 0; g < data.length; g++) {
    const group = data[g];
    
    for (const cell of group) {
      const rowID = `${cell.table},${cell.row}`;
      if (!results.has(rowID)) results.set(rowID, {
        type: "row",
        data: [],
        table: cell.table,
        row: cell.row,
        labels: new Set()
      });

      const row = results.get(rowID)!;
      row.data.push(cell.data);
      for (const label of cell.labels) {
        row.labels.add(label);
      }
    }
  }
  
  return [...results.values()];
}

const Row = makeBasicRegistration<Attributes, ETL.Cell, ETL.Row>({
  name: "row",
  schema: AttributesSchema,
  types: ["cell"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Row;
