import { readdir } from "fs/promises";
import { Time } from "../../../shared/time";
import path from "path";
import { Source } from "./Source";

/** ------------------------------------------------------------------------- */

export class SourceStore {
  public sources = new Map<string, Source>();
  private directory: string;

  public constructor(directory: string) {
    this.directory = directory;
  }

  public wipe(): void {
    this.sources.clear();
  }

  public getByGlob(glob: string) {
    const results = [];

    for (const [, source] of this.sources) {
      if (path.matchesGlob(source.path, glob)) {
        results.push(source);
      }
    }

    return results;
  }

  public getByPath(name: string) {
    return this.sources.values().filter(s => s.path === name);
  }
  
  public async loadQuarter(time: Time): Promise<void> {
    await Promise.all(this.sources.values().map(s => {
      if (s.quarter.is(time)) {
        return s.load();
      } else {
        return null;
      }
    }))
  }

  public async load(): Promise<void> {
    await Promise.all(this.sources.values().map(s => {
      return s.load();
    }))
  }

  private async gatherQuarterGroup(time: Time, name: string) {
    const group_dir = path.join(this.directory, time.toString(), name);

    const entries = await readdir(group_dir, {
      recursive: true,
      withFileTypes: true,
    });
    
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const full_path = path.join(entry.parentPath, entry.name);
      const source = new Source(name, time, full_path);
      this.sources.set(full_path, source);
    }
  }

  private async gatherQuarter(time: Time) {
    const quarter_dir = path.join(this.directory, time.toString());

    const entries = await readdir(quarter_dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      await this.gatherQuarterGroup(time, entry.name);
    }
  }

  public async gather() {
    const entries = await readdir(this.directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const time = Time.parse(entry.name);
      if (time == null) {
        continue;
      }

      await this.gatherQuarter(time);
    }
  }
}