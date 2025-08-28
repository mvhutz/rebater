import { mkdir, readdir } from "fs/promises";
import { bad, good, Reply } from "../../reply";
import { getAllQuarters } from "./getAllQuarters";
import { getSettingsInterface } from "./getSettings";
import path from "path";
import { Time, TimeData } from "../../../shared/time";
import { Settings } from "../../settings";

/** ------------------------------------------------------------------------- */

interface CreateQuarterOptions {
  /** Which quarter will be created. */
  quarter: TimeData;
  /** If the user chooses to copy a quarter structure, it will be from those one. */
  createStructureFrom?: TimeData;
}

async function copyFileStructure(to: Time, isettings: Settings, from: Time) {
  const from_directory = isettings.getSourcePath(from);
  const to_directory = isettings.getSourcePath(to);

  for (const entry of await readdir(from_directory, {
    recursive: true,
    withFileTypes: true
  })) {
    if (!entry.isFile()) continue;

    const relative = path.relative(from_directory, entry.parentPath);
    const new_folder = path.join(to_directory, relative);
    await mkdir(new_folder, { recursive: true });
  }
}

/**
 * Automatically generate a valid file structure for a specific quarter.
 */
export async function createQuarter(_: unknown, options: CreateQuarterOptions): Promise<Reply> {
  const { createStructureFrom, quarter: new_quarter_data } = options;
  const new_quarter = new Time(new_quarter_data);

  // Get all quarters.
  const quarters_reply = await getAllQuarters();
  if (!quarters_reply.ok) return quarters_reply;
  const { data: quarters_data } = quarters_reply;
  const quarters = quarters_data.map(d => new Time(d));

  // Get settings.
  const settings_reply = await getSettingsInterface();
  if (!settings_reply.ok) return settings_reply;
  const { data: settings } = settings_reply;

  // The new quarter cannot exist already.
  const current_quarter = quarters.find(q => new_quarter.is(q));
  if (current_quarter != null) {
    return bad(`Quarter ${new_quarter} already exists!`);
  }

  // Create folder.
  const source_group = settings.getSourcePath(new_quarter);
  await mkdir(source_group, { recursive: true });

  // Optionally, copy file structure.
  if (createStructureFrom != null) {
    const copy_quarter = new Time(createStructureFrom);

    if (!quarters.find(q => copy_quarter.is(q))) {
      return bad(`Quarter to create structure from, ${copy_quarter}, does not exist!`);
    }

    await copyFileStructure(new_quarter, settings, copy_quarter);
  }
  
  return good(undefined);
}