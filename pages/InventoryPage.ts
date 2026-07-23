import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';
import { toProductId } from '../utils/helpers';
import type { Product } from '../data/products';

/**
 * The Products (inventory) page shown after a successful login.
 */
export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  protected readonly title = 'Products';

  readonly nav: HeaderComponent;
  readonly items: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new HeaderComponent(page);
    this.items = page.locator('.inventory_item');
  }

  /** Scopes a locator to a single product card by its visible name. */
  private itemCard(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  /**
   * Adds a product to the cart.
   *
   * The button id is derived from the product name (see `toProductId`) so no
   * per-product selector has to be maintained.
   */
  async addToCart(product: Product): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${toProductId(product.name)}"]`).click();
  }

  /** Adds several products in the order given. */
  async addProductsToCart(productsToAdd: readonly Product[]): Promise<void> {
    for (const product of productsToAdd) {
      await this.addToCart(product);
    }
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.page.locator(`[data-test="remove-${toProductId(product.name)}"]`).click();
  }

  /** Opens the detail page for a product by clicking its title. */
  async openProductDetails(product: Product): Promise<void> {
    await this.itemCard(product.name).getByText(product.name, { exact: true }).click();
  }

  async expectProductVisible(product: Product): Promise<void> {
    const card = this.itemCard(product.name);
    await expect(card).toBeVisible();
    await expect(card.locator('.inventory_item_price')).toHaveText(product.price);
  }

  /** Asserts the catalogue rendered at all — a smoke check on the product grid. */
  async expectProductsListed(): Promise<void> {
    await expect(this.items.first()).toBeVisible();
    expect(await this.items.count()).toBeGreaterThan(0);
  }
}
