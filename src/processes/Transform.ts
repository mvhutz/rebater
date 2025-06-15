import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const Transform = makeBasicRegistration<object, ETL.Data, ETL.Data>({
  name: "transform",
  act: async () => []
});

/** ------------------------------------------------------------------------- */

export default Transform;
