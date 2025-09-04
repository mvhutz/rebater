interface OkRawResult<Ok> { ok: true, data: Ok };
interface ErrRawResult<Err> { ok: false, error: Err };

export type RawResult<Ok, Err> = 
  | OkRawResult<Ok>
  | ErrRawResult<Err>;

/** ------------------------------------------------------------------------- */

export class Result<Ok, Err> {
  public readonly raw: RawResult<Ok, Err>;

  private constructor(result: RawResult<Ok, Err>) {
    this.raw = result;
  }

  public match<O, E>(options: { ok: (data: Ok) => O, err: (error: Err) => E, }): O | E {
    if (this.raw.ok) {
      return options.ok(this.raw.data);
    } else {
      return options.err(this.raw.error);
    }
  }

  public map<O>(fn: (data: Ok) => O): Result<O, Err> {
    if (this.raw.ok) {
      return Result.ok(fn(this.raw.data));
    } else {
      return Result.of(this.raw);
    }
  }

  public then<O, E>(fn: (data: Ok) => Result<O, E>): Result<O, E | Err> {
    if (this.raw.ok) {
      return fn(this.raw.data);
    } else {
      return Result.of(this.raw);
    }
  }

  public catch<O, E>(fn: (error: Err) => Result<O, E>): Result<O | Ok, E> {
    if (!this.raw.ok) {
      return fn(this.raw.error);
    } else {
      return Result.of(this.raw);
    }
  }

  public static of<Ok, Err>(this: void, data: RawResult<Ok, Err>) {
    return new Result(data);
  }
  
  public static ok<Ok, Err = unknown>(this: void, data: Ok) {
    return new Result<Ok, Err>({ ok: true, data });
  }

  public static err<Err, Ok = unknown>(this: void, error: Err) {
    return new Result<Ok, Err>({ ok: false, error });
  }
}
