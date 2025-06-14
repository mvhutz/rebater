import { makeBasicRegistration } from './Base';

/** ------------------------------------------------------------------------- */

async function runProcess(_: ETL.Action, data: ETL.Data[][]): Promise<ETL.Data[]> {
  const result = data.flat(1);
  console.log(result);
  return result;
}

const Debug = makeBasicRegistration<object, ETL.Data, ETL.Data>({
  name: "debug",
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Debug;
