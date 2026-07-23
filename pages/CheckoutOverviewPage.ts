import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parsePrice, sumPrices } from '../utils/helpers';
import type { Product } from '../data/products';

/**
 * Step two of checkout at `/checkout-step-two.html` — the order summary.
 */
export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';
  protected readonly title = 'Checkout: Overview';

  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectProductsListed(expectedProducts: readonly Product[]): Promise<void> {
    await expect(this.items).toHaveCount(expectedProducts.length);
    await expect(this.itemNames).toHaveText(expectedProducts.map((product) => product.name));
  }

  /**
   * Checks the money maths: the item subtotal is the sum of the line prices and
   * the total is subtotal + tax.
   *
   * Worth asserting because a price bug is exactly the kind of defect a UI
   * smoke test would otherwise walk straight past.
   */
  async expectTotalsAreConsistent(expectedProducts: readonly Product[]): Promise<void> {
    const expectedSubtotal = sumPrices(expectedProducts.map((product) => product.price));

    await expect(this.subtotalLabel).toHaveText(`Item total: $${expectedSubtotal.toFixed(2)}`);

    const tax = parsePrice(await this.taxLabel.innerText());
    const total = parsePrice(await this.totalLabel.innerText());

    expect(total).toBeCloseTo(expectedSubtotal + tax, 2);
  }
}
