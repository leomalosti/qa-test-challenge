import { type Page, type Locator } from '@playwright/test';

export class HeaderPage {
  readonly page: Page;
  readonly header: Locator;
  readonly taskCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByTestId('app-header');
    this.taskCount = page.getByTestId('task-count');
  }

  async getTaskCount(): Promise<string | null> {
    return this.taskCount.textContent();
  }

  async getTaskCountNumber(): Promise<number> {
    const count = await this.taskCount.textContent();
    return parseInt(count || '0', 10);
  }
}