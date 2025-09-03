import z from "zod/v4";

/**
 * Convert an Excel index into a 0-based index.
 * @param letters The index to parse. Must be valid.
 * @returns The 0-based index.
 */
export function getIndexFromExcel(letters: string): number {
  return letters.split("").reduce((s, c) => c.charCodeAt(0) - 64 + s * 26, 0) - 1;
}

/**
 * Turn a number into an Excel index.
 * @param n The number.
 * @returns An Excel index.
 */
export function getExcelFromIndex(n: number) {
  n++;
  let res = "";

  while (n > 0) {
    const rem = n % 26;

    if (rem === 0) {
      res += 'Z';
      n = Math.floor(n / 26) - 1;
    } else {
      res += String.fromCharCode((rem - 1) + 'A'.charCodeAt(0));
      n = Math.floor(n / 26);
    }
  }

  return res.split("").reverse().join("");
}

/**
 * Attempts to index-like a value into a number.
 * @param index An index-like value. Could be an Excel index, or just a normal number.
 * @returns A number.
 */
export function getTrueIndex(index: string | number): number {
  if (typeof index === "number") return index;
  return getIndexFromExcel(index);
}

/** ------------------------------------------------------------------------- */

export const String2Number = z.codec(z.string().regex(z.regexes.number), z.number(), {
  decode: (v, ctx) => {
    try {
      return Number.parseFloat(v);
    } catch (err) {
      ctx.issues.push({
        code: "invalid_format",
        format: "number",
        input: v,
        message: String(err),
      });
      return z.NEVER;
    }
  },
  encode: v => v.toString()
});

export const Excel2Number = z.codec(z.string().regex(/^[A-Z]+$/), z.number(), {
  decode: getIndexFromExcel,
  encode: getExcelFromIndex
});

export const String2JSON = z.codec(z.string(), z.unknown(), {
  decode: (jsonString, ctx) => {
    try {
      return JSON.parse(jsonString) as unknown;
    } catch (err: unknown) {
      ctx.issues.push({
        code: "invalid_format",
        format: "json",
        input: jsonString,
        message: String(err),
      });
      return z.NEVER;
    }
  },
  encode: (value) => JSON.stringify(value, null, 2),
});

export const EmptyString = z.codec(z.string(), z.string().optional(), {
  decode: v => v === "" ? undefined : v,
  encode: v => v == null ? "" : v
});

export function DefaultString(def: string) {
  return z.codec(z.string(), z.string(), {
    decode: v => v === "" ? def : v,
    encode: v => v == def ? "" : v
  });
}

/** ------------------------------------------------------------------------- */

export function doesArrayStartWith(array: PropertyKey[], starts: PropertyKey[]) {
  for (let i = 0; i < starts.length; i++) {
    if (array[i] !== starts[i]) return false;
  }

  return true;
}