import z from "zod/v4";
import * as FS from 'fs/promises';
import { DIRECTORY } from "./magic";
import path from "path";
import XMLConvert from 'xml-js';

/** ------------------------------------------------------------------------- */

export const VarTagSchema = z.object({
  name: z.literal("var"),
  attributes: z.union([
    z.object({ to: z.string() }),
    z.object({ from: z.string() })
  ]).optional(),
});

const LabelTagSchema = z.object({
  name: z.literal("label"),
  attributes: z.union([
    z.object({ add: z.string() }),
    z.object({ filter: z.string() })
  ]),
});

const ReadTagSchema = z.object({
  name: z.literal("read"),
  attributes: z.object({
    type: z.string(),
    category: z.string(),
  }),
});

const RowTagSchema = z.object({
  name: z.literal("row"),
});

const TableTagSchema = z.object({
  name: z.literal("table"),
});

const StackTagSchema = z.object({
  name: z.literal("stack"),
});

const ExcelTagSchema = z.object({
  name: z.literal("excel"),
});

const SheetTagSchema = z.object({
  name: z.literal("sheet"),
  attributes: z.object({
    name: z.string(),
  }),
});

const TrimTagSchema = z.object({
  name: z.literal("trim"),
  attributes: z.object({
    top: z.coerce.number().optional(),
    bottom: z.coerce.number().optional(),
    left: z.coerce.number().optional(),
    right: z.coerce.number().optional(),
  }).optional(),
});

const SliceTagSchema = z.object({
  name: z.literal("slice"),
  attributes: z.object({
    into: z.union([z.literal("rows"), z.literal("columns")]),
  }),
});

const CounterTagSchema = z.object({
  name: z.literal("counter"),
});

const ColumnTagSchema = z.object({
  name: z.literal("column"),
  attributes: z.object({
    index: z.coerce.number(),
  }),
});

const LiteralTagSchema = z.object({
  name: z.literal("literal"),
  attributes: z.object({
    value: z.string(),
  }),
});

const DollarsTagSchema = z.object({
  name: z.literal("dollars"),
});

const NumberTagSchema = z.object({
  name: z.literal("number"),
});

const DateTagSchema = z.object({
  name: z.literal("date"),
});

const ReferenceTagSchema = z.object({
  name: z.literal("reference"),
  attributes: z.object({
    table: z.string(),
    enter: z.string(),
    exit: z.string(),
  }),
});

const WriteTagSchema = z.object({
  name: z.literal("write"),
  attributes: z.object({
    type: z.string(),
    category: z.string(),
    as: z.string().optional(),
    headers: z.string().optional(),
  }),
});

/** ------------------------------------------------------------------------- */

interface BaseTag {
  attributes?: {
    from?: string;
    to?: string;
    label?: string;
    only?: string;
  }
  elements: Tag[];
}

const BaseTagSchema: z.ZodType<BaseTag> = z.object({
  attributes: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    label: z.string().optional(),
    only: z.string().optional(),
  }).optional(),
  get elements() { return z.array(TagSchema); }
});

type Tag = BaseTag & (
  | z.infer<typeof VarTagSchema> 
  | z.infer<typeof ReadTagSchema> 
  | z.infer<typeof SliceTagSchema> 
  | z.infer<typeof LabelTagSchema> 
  | z.infer<typeof RowTagSchema> 
  | z.infer<typeof TableTagSchema> 
  | z.infer<typeof ExcelTagSchema> 
  | z.infer<typeof SheetTagSchema> 
  | z.infer<typeof TrimTagSchema> 
  | z.infer<typeof CounterTagSchema> 
  | z.infer<typeof ColumnTagSchema> 
  | z.infer<typeof LiteralTagSchema> 
  | z.infer<typeof DollarsTagSchema> 
  | z.infer<typeof NumberTagSchema> 
  | z.infer<typeof DateTagSchema> 
  | z.infer<typeof ReferenceTagSchema>
  | z.infer<typeof WriteTagSchema>
  | z.infer<typeof StackTagSchema>
);

const TagSchema = z.intersection(BaseTagSchema, z.union([
  VarTagSchema,
  ReadTagSchema,
  SliceTagSchema,
  LabelTagSchema,
  RowTagSchema,
  TableTagSchema,
  ExcelTagSchema,
  SheetTagSchema,
  TrimTagSchema,
  CounterTagSchema,
  ColumnTagSchema,
  LiteralTagSchema,
  DollarsTagSchema,
  NumberTagSchema,
  DateTagSchema,
  ReferenceTagSchema,
  WriteTagSchema,
  StackTagSchema
]));

const ConfigSchema = z.object({
  elements: z.array(
    z.object({
      name: z.literal("transformer"),
      elements: z.array(TagSchema)
    })
  ).length(1),
});

export type Config = z.infer<typeof ConfigSchema>;

export async function parseTransformer(name: string): Promise<Config> {
  const totalPath = path.join(DIRECTORY, 'transformers', `${name}.xml`);
  const xml = await FS.readFile(totalPath, 'utf-8');

  const data = XMLConvert.xml2js(xml, {
    compact: false,
    ignoreComment: true,
    alwaysChildren: true,
  });
  
  return ConfigSchema.parseAsync(data);
}