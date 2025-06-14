// const ReadTagSchema = z.object({
//   name: z.literal("read"),
//   attributes: z.object({
//     type: z.string(),
//     category: z.string(),
//   }),
// });

// export type ReadTag = z.infer<typeof ReadTagSchema>;

// const RowTagSchema = z.object({
//   name: z.literal("row"),
// });

// export type RowTag = z.infer<typeof RowTagSchema>;

// const TableTagSchema = z.object({
//   name: z.literal("table"),
// });

// export type TableTag = z.infer<typeof TableTagSchema>;

// const StackTagSchema = z.object({
//   name: z.literal("stack"),
// });

// export type StackTag = z.infer<typeof StackTagSchema>;

// const ExcelTagSchema = z.object({
//   name: z.literal("excel"),
// });

// export type ExcelAction = z.infer<typeof ExcelTagSchema>;

// const SheetTagSchema = z.object({
//   name: z.literal("sheet"),
//   attributes: z.object({
//     name: z.string(),
//   }),
// });

// export type SheetTag = z.infer<typeof SheetTagSchema>;

// const TrimTagSchema = z.object({
//   name: z.literal("trim"),
//   attributes: z.object({
//     top: z.coerce.number().optional(),
//     bottom: z.coerce.number().optional(),
//     left: z.coerce.number().optional(),
//     right: z.coerce.number().optional(),
//   }).optional(),
// });

// export type TrimTag = z.infer<typeof TrimTagSchema>;

// const SliceTagSchema = z.object({
//   name: z.literal("slice"),
//   attributes: z.object({
//     into: z.union([z.literal("rows"), z.literal("columns")]).default('rows'),
//   }),
// });

// export type SliceTag = z.infer<typeof SliceTagSchema>;

// const CounterTagSchema = z.object({
//   name: z.literal("counter"),
// });

// export type CounterTag = z.infer<typeof CounterTagSchema>;

// const ColumnTagSchema = z.object({
//   name: z.literal("column"),
//   attributes: z.object({
//     index: z.coerce.number(),
//   }),
// });

// export type ColumnTag = z.infer<typeof ColumnTagSchema>;

// const LiteralTagSchema = z.object({
//   name: z.literal("literal"),
//   attributes: z.object({
//     value: z.string(),
//   }),
// });

// export type LiteralTag = z.infer<typeof LiteralTagSchema>;

// const CoerceTagSchema = z.object({
//   name: z.literal("dollars"),
//   to: z.union([z.literal("usd"), z.literal("number"), z.literal("date")])
// });

// export type CoerceTag = z.infer<typeof CoerceTagSchema>;

// const ReferenceTagSchema = z.object({
//   name: z.literal("reference"),
//   attributes: z.object({
//     table: z.string(),
//     enter: z.string(),
//     exit: z.string(),
//   }),
// });

// export type ReferenceTag = z.infer<typeof ReferenceTagSchema>;

// const WriteTagSchema = z.object({
//   name: z.literal("write"),
//   attributes: z.object({
//     type: z.string(),
//     category: z.string(),
//     as: z.string().default('csv'),
//     headers: z.string().optional(),
//   }),
// });

// export type WriteTag = z.infer<typeof WriteTagSchema>;
