import path from "path";
import { RebaterResult, Thrown } from "./error";
import Lockfile from 'proper-lockfile';
import { Err } from "ts-results";

/** ------------------------------------------------------------------------- */

export class Locker {
  private static readonly LOCKFILE_OPTIONS = { retries: { forever: true, randomize: true } };
  private readonly parent: string;
  public readonly file: string;

  constructor(file: string) {
    this.file = file;
    this.parent = path.dirname(file);
  }

  public async run<T>(fn: () => Promise<RebaterResult<T>>): Promise<RebaterResult<T>> {
    let release: () => Promise<void>;
    try {
      release = await Lockfile.lock(path.dirname(this.file), Locker.LOCKFILE_OPTIONS);
    } catch (err) {
      return Err(Thrown("LOCKER", "OBTAIN_LOCK", { file: this.file, cause: err }));
    }

    const out = await fn();

    try {
      await release();
      return out;
    } catch (err) {
      await release();
      return Err(Thrown("LOCKER", "RELEASE_LOCK", { file: this.file, cause: err }));
    }
  }
}