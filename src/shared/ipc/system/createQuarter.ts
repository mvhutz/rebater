import { mkdir, readdir } from "fs/promises";
import { bad, good, Reply } from "../../reply";
import { getAllQuarters } from "./getAllQuarters";
import { getSettingsInterface } from "./getSettings";
import path from "path";

/** ------------------------------------------------------------------------- */

interface CreateQuarterOptions {
  quarter: Time;
  createStructureFrom?: Time;
}

export async function createQuarter(_: unknown, options: CreateQuarterOptions): Promise<Reply> {
  const { createStructureFrom, quarter } = options;

  const quarters_reply = await getAllQuarters();
  if (!quarters_reply.ok) return quarters_reply;
  const { data: quarters } = quarters_reply;

  if (quarters.includes(quarter)) {
    return bad(`Quarter ${quarter.year}-${quarter.quarter} already exists!`);
  }

  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const source_group = isettings.getSourcePath(quarter);
  await mkdir(source_group, { recursive: true });

  if (createStructureFrom != null) {
    if (!quarters.includes(createStructureFrom)) {
      return bad(`QUarter to create structure from, ${quarter.year}-${quarter.quarter}, does not exist!`);
    }

    const structure_group = isettings.getSourcePath(createStructureFrom);
    for (const f of await readdir(structure_group, {
      recursive: true,
      withFileTypes: true
    })) {
      if (!f.isFile()) continue;

      const relative = path.relative(f.parentPath, structure_group);
      const new_folder = path.join(source_group, relative);

      await mkdir(new_folder, { recursive: true });
    }
  }
  
  return good(undefined);
}