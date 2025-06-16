import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

async function runProcess(_, data: ETL.Table[][]): Promise<ETL.Table[]> {
  return data.flat(1).map(table => {
    const transposed = (table.data[0] ?? []).map((_, c) => {
      return table.data.map((_, r) => {
        return table.data[r][c];
      });
    });

    return { ...table, data: transposed };
  });
}

const Trim = makeBasicRegistration<object, ETL.Table, ETL.Table>({
  name: "transpose",
  types: ["table"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Trim;
