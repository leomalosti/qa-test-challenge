import { TaskSchema, TaskListSchema } from '../schemas/task.schema';

export function assertTask(body: unknown) {
  return TaskSchema.parse(body);
}

export function assertTaskList(body: unknown) {
  return TaskListSchema.parse(body);
}