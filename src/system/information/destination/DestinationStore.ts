import path from "path";
import { Time } from "../../../shared/time";
import { mkdir, readdir } from "fs/promises";
import { Destination } from "./Destination";

/** ------------------------------------------------------------------------- */

export class DestinationStore {
  public destinations = new Map<string, Destination>();
  private directory: string;

  public constructor(directory: string) {
    this.directory = directory;
  }

  public wipe(): void {
    this.destinations.clear();
  }

  public get(): Destination[] {
    return this.destinations.values().toArray();
  }

  public async save(): Promise<void> {
    await Promise.all(this.destinations.values().map(async d => {
      await mkdir(path.dirname(d.path), { recursive: true });
      await d.save();
    }))
  }

  public async add(destination: Destination) {
    const current = this.destinations.get(destination.path);

    if (current != null) {
      current.add(destination);
    } else {
      this.destinations.set(destination.path, destination);
    }
  }
  
  public async loadQuarter(time: Time): Promise<void> {
    await Promise.all(this.destinations.values().map(s => {
      if (s.quarter.is(time)) {
        return s.load();
      } else {
        return null;
      }
    }))
  }

  public async load(): Promise<void> {
    await Promise.all(this.destinations.values().map(s => {
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
      const source = new Destination(name, time, full_path);
      this.destinations.set(full_path, source);
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