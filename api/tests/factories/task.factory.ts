export function makeTask(overrides: Partial<{ title: string }> = {}) {
  return {
    title: 'Default Task',
    ...overrides,
  };
}