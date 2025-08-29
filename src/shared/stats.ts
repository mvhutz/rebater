import { z } from "zod/v4";

/** ------------------------------------------------------------------------- */

export const PerformanceResultSchema = z.object({
  start: z.number(),
  end: z.number(),
  name: z.string()
});

export type PerformanceResult = z.infer<typeof PerformanceResultSchema>;


export const DiscrepencyResultSchema = z.object({
  name: z.string(),
  match: z.number(),
  take: z.array(z.string()),
  drop: z.array(z.string())
});

export type DiscrepencyResult = z.infer<typeof DiscrepencyResultSchema>;

export const NoSourceIssueSchema = z.strictObject({
  transformer: z.string(),
});

export type NoSourceIssue = z.infer<typeof NoSourceIssueSchema>;

export const EmptySourceIssueSchema = z.strictObject({
  transformer: z.string(),
  source: z.string(),
});

export type EmptySourceIssue = z.infer<typeof EmptySourceIssueSchema>;

export const EmptySheetIssueSchema = z.strictObject({
  transformer: z.string(),
  source: z.string(),
  sheet: z.string(),
});

export type EmptySheetIssue = z.infer<typeof EmptySheetIssueSchema>;

export const IgnoredRowIssueSchema = z.strictObject({
  transformer: z.string(),
  row: z.array(z.string()),
  source: z.string(),
  reason: z.string(),
});

export type IgnoredRowIssue = z.infer<typeof IgnoredRowIssueSchema>;

export const FailedTransformerIssueSchema = z.strictObject({
  transformer: z.string(),
  reason: z.string(),
})

export type FailedTransformerIssue = z.infer<typeof FailedTransformerIssueSchema>;

/** ------------------------------------------------------------------------- */

export const StatsSchema = z.strictObject({
  issues: z.strictObject({
    no_source: z.array(NoSourceIssueSchema),
    empty_source: z.array(EmptySourceIssueSchema),
    empty_sheet: z.array(EmptySheetIssueSchema),
    ignored_row: z.array(IgnoredRowIssueSchema),
    failed_transformer: z.array(FailedTransformerIssueSchema)
  }),
  performance: z.array(PerformanceResultSchema),
  discrepancy: z.array(DiscrepencyResultSchema)
});

export type StatsData = z.infer<typeof StatsSchema>;

export function getEmptyStats(): StatsData {
  return {
    issues: {
      no_source: [],
      empty_source: [],
      empty_sheet: [],
      ignored_row: [],
      failed_transformer: []
    },
    discrepancy: [],
    performance: [],
  };
}
