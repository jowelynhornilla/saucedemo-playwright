import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;

  protected abstract readonly title: string;

  readonly header: Locator;

  constructor(protected readonly page: Page) {
    this.header = page.locator('.title');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.escapedPath}$`));
    await expect(this.header).toHaveText(this.title);
  }

  protected get escapedPath(): string {
    return this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
