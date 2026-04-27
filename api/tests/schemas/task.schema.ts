import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  isCompleted: z.boolean(),
  isAiGenerated: z.boolean(),
});

export const TaskListSchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;