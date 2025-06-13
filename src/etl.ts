import FS from "fs/promises";
import { nanoid } from "nanoid";
import Path from "path";
import * as XLSX from 'xlsx';
import { z } from "zod/v4";
import Papa from 'papaparse';
import { COUNTER, DIRECTORY, QUARTER, YEAR } from "./magic";

type Atom<T> = T & {
  labels: Set<string>;
}

type ETLFile = {
  path: string;
}
type ETLWorkbook = {
  workbook: XLSX.WorkBook;
}
type ETLTable = {
  data: string[][];
  table: string;
}
type ETLRow = {
  data: string[];
  table: string;
  row: number;
}
type ETLReferenceTable = {
  data: Record<string, string>[];
  name: string;
}
type ETLCell = {
  data: string;
  table: string;
  row: number;
  column: number;
}
type Group<T> = Atom<T>[];

export function join<T>(...groups: Group<T>[]): Group<T> {
  const result = new Array<Atom<T>>();

  for (const group of groups) {
    result.push(...group);
  }

  return result;
}

export function label<T>(options: { take?: string[], give?: string[] }, group: Group<T>): Group<T> {
  const result = new Array<Atom<T>>();
  const { take = [], give = [] } = options;

  for (const atom of group) {
    let keep = true;

    for (const label of take) {
      if (!atom.labels.has(label)) {
        keep = false;
        break;
      }
    }

    if (!keep) continue;
    result.push({ ...atom, labels: new Set([...atom.labels, ...give]) });
  }

  return result;
}

export async function read(options: { type: string, category: string }): Promise<Group<ETLFile>> {
  const { type, category } = options;
  const path = Path.join(DIRECTORY, type, category, YEAR, `Q${QUARTER}`, '**/*');
  const results = new Array<Atom<ETLFile>>();

  for await (const file of FS.glob(path)) {
    results.push({ labels: new Set(), path: file });
  }

  return results;
}

export function excel(group: Group<ETLFile>): Group<ETLWorkbook> {
  const result = new Array<Atom<ETLWorkbook>>();
  
  for (const file of group) {
    const workbook = XLSX.readFile(file.path);
    result.push({ workbook: workbook, labels: file.labels });
  }
  
  return result;
}

export function sheet(options: { name: string }, group: Group<ETLWorkbook>): Group<ETLTable> {
  const { name } = options;
  const result = new Array<Atom<ETLTable>>();
  
  for (const atom of group) {
    const sheet = atom.workbook.Sheets[name];
    const unclean = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      blankrows: false,
      defval: '',
      header: 1,
    });

    const id = nanoid();
    const parsed = z.array(z.array(z.string())).parse(unclean);
    result.push({ data: parsed, table: id, labels: atom.labels });
  }
  
  return result;
}

export function trim(options: { top?: number, bottom?: number, left?: number, right?: number }, group: Group<ETLTable>): Group<ETLTable> {
  const { top, bottom, left, right } = options;
  
  return group.map(t => ({ 
    ...t,
    data: t.data.slice(top, bottom).map(r => r.slice(left, right))
  }));
}

export function transpose(group: Group<ETLTable>): Group<ETLTable> {
  const results = new Array<Atom<ETLTable>>();

  for (const table of group) {
    const transposed = (table.data[0] ?? []).map((_, c) => {
        return table.data.map((_, r) => { 
            return table.data[r][c]; 
        }); 
    });

    results.push({ data: transposed, table: table.table, labels: table.labels });
  }

  return results;
}

export function slice(options: { into?: "columns" | "rows" }, group: Group<ETLTable>): Group<ETLRow> {
  const { into = "rows" } = options;
  if (into === "columns") group = transpose(group);

  const results = new Array<Atom<ETLRow>>();

  for (const table of group) {
    for (let i = 0; i < table.data.length; i++) {
      const row = table.data[i];

      results.push({
        table: table.table,
        row: i,
        data: row,
        labels: table.labels
      })
    }
  }
  
  return results;
}

function updateCell<T extends ETLCell | ETLRow>(options: { value: (cell: Atom<T>) => string }, group: Group<T>): Group<ETLCell> {
  const { value } = options;
  const results = new Array<Atom<ETLCell>>();

  for (const cell of group) {
    results.push({
      table: cell.table,
      row: cell.row,
      column: 'column' in cell ? cell.column : 0,
      data: value(cell),
      labels: cell.labels
    })
  }
  
  return results;
}

export function column(options: { index: number }, group: Group<ETLRow>): Group<ETLCell> {
  const { index } = options;

  return updateCell({
    value: c => Array.isArray(c.data) ? c.data[index] : c.data,
  }, group);
}

export function literal(options: { value: string }, group: Group<ETLCell | ETLRow>): Group<ETLCell> {
  const { value } = options;
  return updateCell({ value: () => value }, group);
}

export function date(group: Group<ETLCell>): Group<ETLCell> {
  return updateCell({ value: c => {
    const date = new Date(c.data);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  } }, group);
}

export function number(group: Group<ETLCell>): Group<ETLCell> {
  return updateCell({ value: c => parseInt(c.data).toString() }, group);
}

export function dollars(group: Group<ETLCell>): Group<ETLCell> {
  return updateCell({ value: c => `$${Number(c.data).toFixed(2)}` }, group);
}

export function counter(group: Group<ETLCell | ETLRow>): Group<ETLCell> {
  return updateCell({ value: () => (COUNTER.default++).toString() }, group);
}

export function row(groups: Group<ETLCell>[]): Group<ETLRow> {
  const lengths = groups.map(g => g.length);
  if (lengths.some(l => l !== lengths[0])) {
    throw Error("Not all lengths are equal!");
  }

  const results = new Map<string, Atom<ETLRow>>();

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    
    for (const cell of group) {
      const rowID = `${cell.table},${cell.row}`;
      if (!results.has(rowID)) results.set(rowID, {
        data: [],
        table: cell.table,
        row: cell.row,
        labels: new Set()
      });

      const row = results.get(rowID)!;
      row.data.push(cell.data);
      for (const label of cell.labels) {
        row.labels.add(label);
      }
    }
  }
  
  return [...results.values()];
}

export function table(group: Group<ETLRow>): Group<ETLTable> {
  const lengths = group.map(g => g.data.length);
  if (lengths.some(l => l !== lengths[0])) {
    throw Error("Not all lengths are equal!");
  }
 
  const results = new Map<string, Atom<ETLTable>>();

  for (const row of group) {
    if (!results.has(row.table)) {
      results.set(row.table, {
        data: [],
        table: "",
        labels: new Set(),
      });
    }

    const table = results.get(row.table)!;
    table.data.push(row.data);
    for (const label of row.labels) {
      table.labels.add(label);
    }
  }
  
  return [...results.values()];
}

export function stack(group: Group<ETLTable>): Group<ETLTable> {
  const lengths = group.map(g => g.data[0].length);
  if (lengths.some(l => l !== lengths[0])) {
    throw Error("Not all lengths are equal!");
  }
 
  const result: Atom<ETLTable> = {
    data: [],
    table: "",
    labels: new Set(),
  };

  for (const table of group) {
    result.data.push(...table.data);

    for (const label of table.labels) {
      result.labels.add(label);
    }
  }
  
  return [result];
}

export async function write(options: { type: string, category: string, as?: "csv", headers: string[] }, group: Group<ETLTable>): Promise<Group<ETLFile>> {
  const { type, category, headers } = options;

  const results = new Array<Atom<ETLFile>>();

  for (let t = 0; t < group.length; t++) {
    const table = group[t];
    const directory = Path.join(DIRECTORY, type, category);
    const file = Path.join(directory, `${t}.csv`);

    await FS.mkdir(directory, { recursive: true });
    await FS.writeFile(file, Papa.unparse([headers, ...table.data]));

    results.push({ labels: table.labels, path: file });
  }

  return results;
}

const TABLE_CACHE: Record<string, ETLReferenceTable> = {};

async function getReferenceTable(name: string): Promise<ETLReferenceTable> {
  if ('name' in TABLE_CACHE) return TABLE_CACHE[name];

  const path = Path.join(DIRECTORY, 'tables', `${name}.csv`);

  const file = await FS.readFile(path, 'utf-8');
  const { data: unclean } = Papa.parse(file, { header: true });
  const parsed = z.array(z.record(z.string(), z.string())).parse(unclean);

  const result = { name, data: parsed };
  TABLE_CACHE[name] = result;
  return result;
}

export async function reference(options: { table: string, enter: string, exit: string }, group: Group<ETLCell>): Promise<Group<ETLCell>> {
  const { table, enter, exit } = options;
  const reference_table = await getReferenceTable(table);

  function onValue(cell: Atom<ETLCell | ETLRow>) {
    for (const row of reference_table.data) {
      if (row[enter] === cell.data) {
        return row[exit];
      }
    }

    throw Error(`Table '${reference_table.name}' has no item '${cell.data}' for '${enter}'.`);
  }

  return updateCell({ value: onValue }, group);
}
