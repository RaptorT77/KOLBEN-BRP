import { z } from 'zod';

export const ActivityStatusSchema = z.enum(['disabled', 'pending', 'in_progress', 'completed']);

export const ActivityCellSchema = z.object({
  id: z.string(),
  rowId: z.string(),
  rowName: z.string(),
  colId: z.string(),
  colCode: z.number(),
  colName: z.string(),
  initialStatus: ActivityStatusSchema,
  status: ActivityStatusSchema,
  isEditable: z.boolean(),
});

export const DiagramColumnSchema = z.object({
  id: z.string(),
  code: z.number(),
  name: z.string(),
  category: z.string(),
});

export const DiagramRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.string(),
  order: z.number(),
  page: z.number(),
});

export const DiagramSummarySchema = z.object({
  totalActivities: z.number(),
  disabledActivities: z.number(),
  pendingActivities: z.number(),
  inProgressActivities: z.number(),
  completedActivities: z.number(),
});

export const DiagramDataSchema = z.object({
  title: z.string(),
  sourceDocument: z.string(),
  metadata: z.object({
    totalRows: z.number(),
    totalColumns: z.number(),
    summary: DiagramSummarySchema,
  }),
  columns: z.array(DiagramColumnSchema),
  rows: z.array(DiagramRowSchema),
  cells: z.array(ActivityCellSchema),
});

export type DiagramDataValidated = z.infer<typeof DiagramDataSchema>;
