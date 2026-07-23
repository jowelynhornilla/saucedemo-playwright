import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';
  protected readonly title = 'Checkout: Complete!';

  readonly nav: HeaderComponent;
  readonly confirmationHeading: Locator;
  readonly confirmationText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new HeaderComponent(page);
    this.confirmationHeading = page.locator('[data-test="complete-header"]');
    this.confirmationText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async expectOrderConfirmed(): Promise<void> {
    await this.expectLoaded();
    await expect(this.confirmationHeading).toHaveText('Thank you for your order!');
    await expect(this.backHomeButton).toBeVisible();
  }
}
