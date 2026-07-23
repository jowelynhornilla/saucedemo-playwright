import { Page, Locator, expect } from '@playwright/test';

/**
 * The persistent site header (burger menu + cart button).
 *
 * Modelled as a component rather than duplicated across page objects, because
 * it appears identically on every page behind the login.
 */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /**
   * Returns the number shown on the cart badge, or `0` when no badge is
   * rendered — SauceDemo removes the element entirely for an empty cart.
   */
  async getCartItemCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }

    return Number(await this.cartBadge.innerText());
  }

  /**
   * Asserts the badge count, retrying until it settles.
   *
   * `expect.poll` is used instead of reading the value once so the assertion
   * auto-waits like a native web-first assertion, including the empty-cart case
   * where the element disappears.
   */
  async expectCartItemCount(expected: number): Promise<void> {
    await expect
      .poll(() => this.getCartItemCount(), {
        message: `Expected the cart badge to show ${expected} item(s)`,
      })
      .toBe(expected);
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
