// Minimal zod subset for offline environment
export type SafeParseError<T extends Record<string, unknown>> = {
  success: false;
  error: {
    flatten: () => { fieldErrors: Partial<Record<keyof T, string[]>> };
  };
};
export type SafeParseSuccess<T> = { success: true; data: T };
export type SafeParseResult<T extends Record<string, unknown>> =
  | SafeParseSuccess<T>
  | SafeParseError<T>;

interface Schema<T> {
  parse(value: unknown, key: string, errors: Record<string, string[]>): T | undefined;
}

class ZString implements Schema<string | undefined> {
  private _min?: number;
  private _max?: number;
  private _optional = false;
  min(len: number): ZString {
    this._min = len;
    return this;
  }
  max(len: number): ZString {
    this._max = len;
    return this;
  }
  optional(): ZString {
    this._optional = true;
    return this;
  }
  parse(value: unknown, key: string, errors: Record<string, string[]>): string | undefined {
    if (value === undefined || value === null || value === "") {
      if (this._optional) return undefined;
      (errors[key] = errors[key] ?? []).push("Required");
      return undefined;
    }
    const str = String(value);
    if (this._min !== undefined && str.length < this._min) {
      (errors[key] = errors[key] ?? []).push(`Must be at least ${this._min} characters`);
    }
    if (this._max !== undefined && str.length > this._max) {
      (errors[key] = errors[key] ?? []).push(`Must be at most ${this._max} characters`);
    }
    return str;
  }
}

class ZNumber implements Schema<number> {
  private _min?: number;
  private _int = false;
  parse(value: unknown, key: string, errors: Record<string, string[]>): number {
    const num = Number(value);
    if (Number.isNaN(num)) {
      (errors[key] = errors[key] ?? []).push("Invalid number");
      return num;
    }
    if (this._int && !Number.isInteger(num)) {
      (errors[key] = errors[key] ?? []).push("Must be an integer");
    }
    if (this._min !== undefined && num < this._min) {
      (errors[key] = errors[key] ?? []).push(`Must be at least ${this._min}`);
    }
    return num;
  }
  int(): ZNumber {
    this._int = true;
    return this;
  }
  min(n: number): ZNumber {
    this._min = n;
    return this;
  }
}

class ZObject<T extends Record<string, unknown>> {
  private refinements: Array<(data: T, errors: Record<string, string[]>) => void> = [];
  constructor(private shape: { [K in keyof T]: Schema<T[K]> }) {}
  refine(check: (data: T) => boolean, opts: { path: keyof T; message: string }): ZObject<T> {
    this.refinements.push((data, errors) => {
      if (!check(data)) {
        const key = opts.path as string;
        (errors[key] = errors[key] ?? []).push(opts.message);
      }
    });
    return this;
  }
  safeParse(obj: unknown): SafeParseResult<T> {
    const errors: Record<string, string[]> = {};
    const result: Record<string, unknown> = {};
    const input = obj as Record<string, unknown>;
    for (const key in this.shape) {
      const schema = this.shape[key];
      const val = schema.parse(input[key], key, errors);
      if (val !== undefined) result[key] = val;
    }
    this.refinements.forEach((fn) => fn(result as T, errors));
    if (Object.keys(errors).length > 0) {
      return { success: false, error: { flatten: () => ({ fieldErrors: errors as Partial<Record<keyof T, string[]>> }) } };
    }
    return { success: true, data: result as T };
  }
}

export const z = {
  string: () => new ZString(),
  object: <T extends Record<string, unknown>>(shape: { [K in keyof T]: Schema<T[K]> }) =>
    new ZObject<T>(shape),
  coerce: {
    number: () => new ZNumber(),
  },
};
