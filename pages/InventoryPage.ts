import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';
import { toProductId } from '../utils/helpers';
import type { Product } from '../data/products';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  protected readonly title = 'Products';

  readonly nav: HeaderComponent;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemImages: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new HeaderComponent(page);
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemImages = page.locator('.inventory_item img');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  private itemCard(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async addToCart(product: Product): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${toProductId(product.name)}"]`).click();
  }

  async addProductsToCart(productsToAdd: readonly Product[]): Promise<void> {
    for (const product of productsToAdd) {
      await this.addToCart(product);
    }
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.page.locator(`[data-test="remove-${toProductId(product.name)}"]`).click();
  }

  async openProductDetails(product: Product): Promise<void> {
    await this.itemCard(product.name).getByText(product.name, { exact: true }).click();
  }

  async expectProductVisible(product: Product): Promise<void> {
    const card = this.itemCard(product.name);
    await expect(card).toBeVisible();
    await expect(card.locator('.inventory_item_price')).toHaveText(product.price);
  }

  async expectProductsListed(): Promise<void> {
    await expect(this.items.first()).toBeVisible();
    expect(await this.items.count()).toBeGreaterThan(0);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async getImageSources(): Promise<string[]> {
    return this.itemImages.evaluateAll((images) =>
      images.map((image) => image.getAttribute('src') ?? ''),
    );
  }

  async expectEveryProductHasADistinctImage(): Promise<void> {
    const sources = await this.getImageSources();
    expect(new Set(sources).size).toBe(sources.length);
  }

  async expectSortedByNameDescending(): Promise<void> {
    const names = await this.getProductNames();
    expect(names).toEqual([...names].sort().reverse());
  }

  async expectAddToCartButtonResponds(product: Product): Promise<void> {
    const button = this.itemCard(product.name).locator('button');
    await expect(button).toHaveText(/add to cart/i);
    await button.click();
    await expect(button).toHaveText(/remove/i);
  }
}

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';
