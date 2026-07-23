import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '../data/users';

/**
 * The login screen at `/`.
 */
export class LoginPage extends BasePage {
  protected readonly path = '/';
  protected readonly title = 'Swag Labs';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * The login page uses a `.login_logo` heading rather than the `.title`
   * element every other page uses, so the base implementation is overridden.
   */
  override async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.path}$`));
    await expect(this.page.locator('.login_logo')).toHaveText(this.title);
    await expect(this.loginButton).toBeVisible();
  }

  /** Fills the form and submits it. Does not assert the outcome. */
  async login(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }

  /** Convenience entry point: open the site and sign in. */
  async gotoAndLogin(user: User): Promise<void> {
    await this.goto();
    await this.login(user);
  }

  async expectErrorMessage(expected: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }
}
