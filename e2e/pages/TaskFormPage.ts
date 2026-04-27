import { type Page, type Locator } from '@playwright/test';

export class TaskFormPage {
  readonly page: Page;
  readonly form: Locator;
  readonly titleInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId('task-form');
    this.titleInput = page.getByTestId('task-title-input');
    this.submitButton = page.getByTestId('task-submit-button');
  }

  async createTask(title: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.submitButton.click();
  }

  async getTitleInputValue(): Promise<string> {
    return this.titleInput.inputValue();
  }
}