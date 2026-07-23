import { Page, Locator, expect } from '@playwright/test';

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

  async getCartItemCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }

    return Number(await this.cartBadge.innerText());
  }

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
