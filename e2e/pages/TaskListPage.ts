import { type Page, type Locator, expect } from '@playwright/test';

export class TaskListPage {
  readonly page: Page;
  readonly taskList: Locator;
  readonly loading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskList = page.getByTestId('task-list');
    this.loading = page.getByTestId('tasks-loading');
  }

  getTaskItems(): Locator {
    return this.page.getByTestId('task-item');
  }

  getTaskItem(index: number): Locator {
    return this.page.getByTestId('task-item').nth(index);
  }

  getTaskTitle(title: string): Locator {
    return this.page.getByTestId('task-title').filter({ hasText: title });
}

  getTaskCheckbox(index: number = 0): Locator {
    return this.page.getByTestId('task-checkbox').nth(index);
  }

  getTaskByTitle(title: string): Locator {
    return this.page.getByTestId('task-item').filter({ hasText: title });
  }

  getCheckboxByTitle(title: string): Locator {
    return this.getTaskByTitle(title)
      .getByTestId('task-checkbox');
  }

  getTaskDeleteButton(index: number = 0): Locator {
    return this.page.getByTestId('task-delete-button').nth(index);
  }

  async getTaskCount(): Promise<number> {
    return await this.getTaskItems().count();
  }

  async deleteTask(index: number = 0): Promise<void> {
    await this.getTaskDeleteButton(index).click();
  }

  async waitForEmpty(): Promise<void> {
    await expect(this.getTaskItems()).toHaveCount(0);
  }
};