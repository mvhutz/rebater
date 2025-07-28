import { glob, mkdir, readFile, writeFile } from "fs/promises";
import { Reference } from "./Reference";
import path from "path";

/** ------------------------------------------------------------------------- */

export class ReferenceStore {
  private store = new Map<string, Reference>();
  private directory: string;

  public constructor(directory: string) {
    this.directory = directory;
  }

  private add(name: string, reference: Reference): void {
    const current_reference = this.store.get(name);
    if (current_reference != null) {
      current_reference.add(reference);
    } else {
      this.store.set(name, reference);
    }
  }

  public async load(): Promise<void> {
    const full_directory = path.join(this.directory, "**/*.csv");

    for await (const dirent of glob(full_directory, { withFileTypes: true })) {
      const filepath = path.join(dirent.parentPath, dirent.name);
      if (!dirent.isFile()) {
        continue;
      }

      const raw = await readFile(filepath, 'utf-8');
      const reference = Reference.fromRaw(raw);
      this.add(path.parse(filepath).name, reference);
    }
  }

  public async save(): Promise<void> {
    for (const [name, reference] of this.store) {
      const full_directory = path.join(this.directory, `${name}.csv`);
      const raw = reference.toRaw();

      await mkdir(path.dirname(full_directory), { recursive: true });
      await writeFile(full_directory, raw);
    }
  }

  public get(name: string): Reference {
    const reference = this.store.get(name);
    if (reference != null) {
      return reference;
    }

    const new_reference = new Reference();
    this.store.set(name, new_reference);
    return new_reference;
  }
}