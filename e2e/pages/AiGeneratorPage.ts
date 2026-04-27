import { type Page, type Locator } from '@playwright/test';

export class AiGeneratorPage {
  readonly page: Page;
  readonly container: Locator;
  readonly apiKeyInput: Locator;
  readonly objectiveInput: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('ai-generator');
    this.apiKeyInput = page.getByTestId('ai-api-key-input');
    this.objectiveInput = page.getByTestId('ai-objective-input');
    this.generateButton = page.getByTestId('ai-generate-button');
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.apiKeyInput.fill(apiKey);
  }

  async setObjective(objective: string): Promise<void> {
    await this.objectiveInput.fill(objective);
  }

  async clickGenerate(): Promise<void> {
    await this.generateButton.click();
  }
}