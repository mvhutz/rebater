import { mkdir, readdir } from "fs/promises";
import { bad, good, Reply } from "../../reply";
import { getAllQuarters } from "./getAllQuarters";
import { getSettingsInterface } from "./getSettings";
import path from "path";
import { Time, TimeData } from "../../../shared/time";

/** ------------------------------------------------------------------------- */

interface CreateQuarterOptions {
  quarter: TimeData;
  createStructureFrom?: TimeData;
}

export async function createQuarter(_: unknown, options: CreateQuarterOptions): Promise<Reply> {
  const { createStructureFrom, quarter: new_quarter_data } = options;

  const quarters_reply = await getAllQuarters();
  if (!quarters_reply.ok) return quarters_reply;
  const { data: quarters_data } = quarters_reply;

  const current_quarters = quarters_data.map(Time.of);
  const new_quarter = Time.of(new_quarter_data);

  const current_quarter = current_quarters.find(new_quarter.is);
  if (current_quarter != null) {
    return bad(`Quarter ${new_quarter} already exists!`);
  }

  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const source_group = isettings.getSourcePath(new_quarter);
  await mkdir(source_group, { recursive: true });

  if (createStructureFrom != null) {
    const copy_quarter = Time.of(createStructureFrom);

    if (!current_quarters.find(copy_quarter.is)) {
      return bad(`Quarter to create structure from, ${current_quarters}, does not exist!`);
    }

    const structure_group = isettings.getSourcePath(copy_quarter);
    for (const f of await readdir(structure_group, {
      recursive: true,
      withFileTypes: true
    })) {
      if (!f.isFile()) continue;

      const relative = path.relative(structure_group, f.parentPath);
      const new_folder = path.join(source_group, relative);
      await mkdir(new_folder, { recursive: true });
    }
  }
  
  return good(undefined);
}