import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerInfo } from '../data/checkout';

/**
 * Step one of checkout at `/checkout-step-one.html` — the customer details form.
 */
export class CheckoutInformationPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';
  protected readonly title = 'Checkout: Your Information';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /** Fills the form without submitting — useful for validation tests. */
  async fillCustomerInfo(customer: CustomerInfo): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /** Fills the form and submits it in one step — the common path. */
  async submitCustomerInfo(customer: CustomerInfo): Promise<void> {
    await this.fillCustomerInfo(customer);
    await this.continue();
  }

  async expectErrorMessage(expected: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }
}
