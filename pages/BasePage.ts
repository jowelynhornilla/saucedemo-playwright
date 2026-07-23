import { Page, Locator, expect } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 *
 * Deliberately thin: it holds the `Page` handle, the page's URL path and its
 * expected header, plus the couple of checks every page needs. Anything
 * page-specific belongs in the subclass, not here — a fat base class is the
 * usual way a POM turns into a dumping ground.
 */
export abstract class BasePage {
  /** Path appended to `baseURL`, e.g. `/cart.html`. */
  protected abstract readonly path: string;

  /** Text of the header the app renders for this page. */
  protected abstract readonly title: string;

  /** The page heading ("Products", "Your Cart", "Checkout: Overview", ...). */
  readonly header: Locator;

  constructor(protected readonly page: Page) {
    this.header = page.locator('.title');
  }

  /** Navigates directly to this page. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /**
   * Asserts the browser is on this page.
   *
   * Checks both the URL and the rendered header: the URL alone can be right
   * while the page failed to render, and the header alone does not prove the
   * app routed correctly.
   */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.escapedPath}$`));
    await expect(this.header).toHaveText(this.title);
  }

  /** `path` escaped for safe use inside a URL regular expression. */
  protected get escapedPath(): string {
    return this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
