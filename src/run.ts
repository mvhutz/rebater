import assert from "node:assert";
import { glob, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unparse } from "papaparse";
import XLSX from "xlsx";
import z from "zod/v4";
import { CellTransformationSchema, runMany } from "./cell";
import { availableAnswers, compareRebates } from "./test";

/** ------------------------------------------------------------------------- */

// const MultiplyCellTransformationSchema = z.object({
//   type: z.literal("multiply"),
//   with: z.array(z.unknown()), // Actually a cell transformation.
// });

// type MultiplyCellTransformation = z.infer<typeof MultiplyCellTransformationSchema>;

// const MetaCellTransformationSchema = z.object({
//   type: z.literal("meta"),
//   name: z.string(),
// });

// type MetaCellTransformation = z.infer<typeof MetaCellTransformationSchema>;

// const EqualsCellTransformationSchema = z.object({
//   type: z.literal("equals"),
//   with: z.array(z.unknown()), // Actually a cell transformation.
// });

// type EqualsCellTransformation = z.infer<typeof EqualsCellTransformationSchema>;

/** ------------------------------------------------------------------------- */

const TrimRowTransformationSchema = z.object({
  type: z.literal("trim"),
  top: z.number().optional(),
  bottom: z.number().optional(),
});

type TrimRowTransformation = z.infer<typeof TrimRowTransformationSchema>;

async function runTrimRowTransformation(transformation: TrimRowTransformation, table: Table) {
  const { top, bottom } = transformation;

  return { 
    ...table,
    data: table.data.slice(top, bottom == null ? undefined : -bottom)
  };
}

const SelectRowTransformationSchema = z.object({
  type: z.literal("select"),
  column: z.number(),
  is: z.string().optional(),
  isnt: z.string().optional(),
  action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
});

type SelectRowTransformation = z.infer<typeof SelectRowTransformationSchema>;

async function runSelectRowTransformation(transformation: SelectRowTransformation, table: Table) {
  const { column, is, isnt, action } = transformation;

  const rows = table.data.filter(row => {
    const datum = row[column];
    const selected = (is != null && is == datum) || (isnt != null && isnt != datum);
    // Basically, if "keep", it is `selected`, and if "drop", it is `!selected`.
    return selected === (action === "keep");
  });

  return { ...table, data: rows };
}

const DropRowTransformationSchema = z.object({
  type: z.literal("drop"),
  criteria: z.array(z.unknown()) // Actually a cell transformation.
});

type DropRowTransformation = z.infer<typeof DropRowTransformationSchema>;

async function runDropRowTransformation(transformation: DropRowTransformation, table: Table): Promise<Table> {
  void [transformation, table];
  throw Error("WIP!");
}

const ChopRowTransformationSchema = z.object({
  type: z.literal("chop"),
  column: z.number(),
  is: z.string(),
  keep: z.union([z.literal("top"), z.literal("bottom")])
});

type ChopRowTransformation = z.infer<typeof ChopRowTransformationSchema>;

async function runChopRowTransformation(transformation: ChopRowTransformation, table: Table) {
  const { column, is, keep } = transformation;

  const index = table.data.findIndex(row => row[column] == is);
  return {
    ...table,
    data: keep === "top"
      ? table.data.slice(0, index)
      : table.data.slice(index)
  };
}

/** ------------------------------------------------------------------------- */

const ExcelSourceSchema = z.object({
  type: z.literal("excel"),
  group: z.string(),
  subgroup: z.string(),
  sheets: z.array(z.string()).optional(),
});

type ExcelSource = z.infer<typeof ExcelSourceSchema>;

async function runExcelSource(source: ExcelSource, context: Context) {
  const { group, subgroup, sheets } = source;
  
  const folder = path.join(
    context.directory,
    group,
    subgroup,
    `${context.year}`,
    `Q${context.quarter}`,
    '**/*'
  );

  const results = new Array<Table>();

  for await (const file of glob(folder)) {
    const workbook = XLSX.readFile(file);

    const sheetsToTake = sheets ?? workbook.SheetNames;
    for (const sheetName of sheetsToTake) {
      const sheet = workbook.Sheets[sheetName];
      assert.ok(sheet != null, `Sheet '${sheetName}' does not exist on workbook!`);

      const unclean = XLSX.utils.sheet_to_json(sheet, {
        raw: true,
        blankrows: false,
        defval: '',
        header: 1,
      });

      const parsed = z.array(z.array(z.coerce.string())).parse(unclean);
      results.push({
        path: file,
        data: parsed.map(data => ({ group, data }))
      });
    }
  }

  return results;
}

/** ------------------------------------------------------------------------- */

const CSVDestinationSchema = z.object({
  type: z.literal("csv"),
  group: z.string(),
  subgroup: z.string(),
});

type CSVDestination = z.infer<typeof CSVDestinationSchema>;

async function runCSVDestination(destination: CSVDestination, table: Table, context: Context) {
  const { group, subgroup } = destination;
  const directory = path.join(context.directory, group, subgroup);
  const file = path.join(directory, 'guess.csv');
  
  const data = table.data.map(row => row.data);

  await mkdir(directory, { recursive: true });
  await writeFile(file, unparse(data));
}

/** ------------------------------------------------------------------------- */

const RowTransformationSchema = z.union([
  ChopRowTransformationSchema,
  DropRowTransformationSchema,
  SelectRowTransformationSchema,
  TrimRowTransformationSchema,
]);

type RowTransformation = z.infer<typeof RowTransformationSchema>;

async function runRowTransformation(transformation: RowTransformation, table: Table, context: Context) {
  void context;

  switch (transformation.type) {
    case "drop":  return await runDropRowTransformation(transformation, table);
    case "select": return await runSelectRowTransformation(transformation, table);
    case "trim": return await runTrimRowTransformation(transformation, table);
    case "chop": return await runChopRowTransformation(transformation, table);
  }
}

async function runAllRowTransformations(transformations: RowTransformation[], tables: Table[], context: Context) {
  const results = Array<Table>();

  for (const table of tables) {
    let final = table;

    for (const transformation of transformations) {
      final = await runRowTransformation(transformation, final, context);
    }

    results.push(final);
  }

  return results;
}

/** ------------------------------------------------------------------------- */

const SourceSchema = z.union([ExcelSourceSchema]);

type Source = z.infer<typeof SourceSchema>;

async function runSource(source: Source, context: Context) {
  switch (source.type) {
    case "excel": return await runExcelSource(source, context);
  }
}

async function runAllSources(sources: Source[], context: Context) {
  const results = await Promise.all(sources.map(s => runSource(s, context)));
  return results.flat(1);
}

/** ------------------------------------------------------------------------- */

const DestinationSchema = z.union([CSVDestinationSchema]);

type Destination = z.infer<typeof DestinationSchema>;

async function runDestination(source: Destination, table: Table, context: Context) {
  switch (source.type) {
    case "csv": return await runCSVDestination(source, table, context);
  }
}

const ConfigSchema = z.object({
  sources: z.array(SourceSchema),
  preprocess: z.array(RowTransformationSchema).optional(),
  properties: z.record(z.string(), z.array(CellTransformationSchema)),
  postprocess: z.array(RowTransformationSchema).optional(),
  destination: DestinationSchema,
});

type Config = z.infer<typeof ConfigSchema>;

/** ------------------------------------------------------------------------- */

export async function getConfig(path: string): Promise<Config> {
  const file = await readFile(path, 'utf-8');
  const json = JSON.parse(file);
  return ConfigSchema.parse(json);
}

export async function runConfig(config: Config, context: Context) {
  const start = performance.now();
  const { preprocess = [], postprocess = [] } = config;
  const sources = await runAllSources(config.sources, context);

  const preprocessed = await runAllRowTransformations(preprocess, sources, context);

  const rows = preprocessed.map(table => table.data).flat(1);
  const recombined: Table = {
    path: "<None>",
    data: [
      {
        data: Object.keys(config.properties)
      }
    ]
  }

  for (const row of rows) {
    const result = new Array<string>();

    for (const transformations of Object.values(config.properties)) {
      const output = await runMany(transformations, row, context);
      result.push(output);
    }

    recombined.data.push({
      data: result
    });
  }

  const [postprocessed] = await runAllRowTransformations(postprocess, [recombined], context);
  await runDestination(config.destination, postprocessed, context);

  const end = performance.now();
  return { start, end };
}

async function findConfigs(context: Context) {  
  const folder = path.join(context.directory, 'transformers', '**/*');

  const results = new Array<string>();

  for await (const file of glob(folder)) {
    results.push(file);
  }

  return results;
}

export async function runAllConfigs(context: Context): Promise<RunResults> {
  const config_files = await findConfigs(context);
  const results: RunResults = {
    config: [],
    discrepency: [],
  }

  for (const config_file of config_files) {
    const name = path.parse(config_file).base;
    const config = await getConfig(config_file);

    console.log(`Running ${name}...`)
    const { start, end} = await runConfig(config, context);

    results.config.push({ start, end, name });
  }

  const answers = await availableAnswers(context);
  for (const path of answers) {
    const { file1, file2 } = await compareRebates(`rebates/${path}`, `truth/${path}`, {
      ignore: ['purchaseId'],
      context
    });

    results.discrepency.push({ name: path, take: file2, drop: file1 })
  }

  return results;
}
