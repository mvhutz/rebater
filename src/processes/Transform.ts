import { makeBasicRegistration } from './Base';

/** ------------------------------------------------------------------------- */

const Transform = makeBasicRegistration<object, ETL.Data, ETL.Data>({
  name: "transform",
  act: async () => []
});

/** ------------------------------------------------------------------------- */

export default Transform;
