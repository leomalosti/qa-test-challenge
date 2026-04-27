import { type Page, type Locator } from '@playwright/test';
import { HeaderPage } from './HeaderPage';
import { TaskFormPage } from './TaskFormPage';
import { TaskListPage } from './TaskListPage';
import { AiGeneratorPage } from './AiGeneratorPage';

export class HomePage {
  readonly page: Page;
  readonly header: HeaderPage;
  readonly taskForm: TaskFormPage;
  readonly taskList: TaskListPage;
  readonly aiGenerator: AiGeneratorPage;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderPage(page);
    this.taskForm = new TaskFormPage(page);
    this.taskList = new TaskListPage(page);
    this.aiGenerator = new AiGeneratorPage(page);
  }

  async goto(): Promise<void> {
    const url = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.page.goto(url);
  }

  async cleanupTasks(): Promise<void> {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const tasksResponse = await fetch(`${apiBaseUrl}/tasks`);
    const tasks = await tasksResponse.json();
    
    for (const task of tasks) {
      await fetch(`${apiBaseUrl}/tasks/${task.id}`, { method: 'DELETE' });
    }
    
    await this.page.goto(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
}