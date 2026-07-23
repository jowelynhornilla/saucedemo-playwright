import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';
import { toProductId } from '../utils/helpers';
import type { Product } from '../data/products';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  protected readonly title = 'Your Cart';

  readonly nav: HeaderComponent;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new HeaderComponent(page);
    this.items = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  private itemRow(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async removeProduct(product: Product): Promise<void> {
    await this.page.locator(`[data-test="remove-${toProductId(product.name)}"]`).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async getItemPrices(): Promise<string[]> {
    return this.itemPrices.allInnerTexts();
  }

  async expectItemCount(expected: number): Promise<void> {
    await expect(this.items).toHaveCount(expected);
  }

  async expectProductInCart(product: Product, quantity = 1): Promise<void> {
    const row = this.itemRow(product.name);

    await expect(row).toBeVisible();
    await expect(row.locator('.inventory_item_name')).toHaveText(product.name);
    await expect(row.locator('.inventory_item_price')).toHaveText(product.price);
    await expect(row.locator('.cart_quantity')).toHaveText(String(quantity));
  }

  async expectProductNotInCart(product: Product): Promise<void> {
    await expect(this.itemRow(product.name)).toHaveCount(0);
  }

  async expectCartContains(expectedProducts: readonly Product[]): Promise<void> {
    await expect(this.itemNames).toHaveText(expectedProducts.map((product) => product.name));
    await expect(this.itemPrices).toHaveText(expectedProducts.map((product) => product.price));
  }
}
