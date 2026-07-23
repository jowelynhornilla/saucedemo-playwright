/**
 * Small, framework-agnostic helpers shared by the page objects.
 *
 * Anything here is pure logic with no Playwright dependency, which keeps it
 * trivially unit-testable and free of hidden waiting behaviour.
 */

/**
 * Converts a product name into the slug SauceDemo uses inside its `data-test`
 * attributes.
 *
 * `"Sauce Labs Bike Light"` -> `"sauce-labs-bike-light"`, which builds
 * `data-test="add-to-cart-sauce-labs-bike-light"`.
 *
 * Deriving the id from the product name means adding a new product to the suite
 * only requires adding it to `data/products.ts` — no new selectors.
 */
export function toProductId(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics (spaces, dots, parens) become dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

/**
 * Parses a displayed price such as `"$29.99"` into the number `29.99`.
 *
 * Used for numeric assertions (e.g. cart totals) where comparing strings would
 * be brittle.
 */
export function parsePrice(displayedPrice: string): number {
  const parsed = Number(displayedPrice.replace(/[^0-9.]/g, ''));

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse a price from "${displayedPrice}"`);
  }

  return parsed;
}

/** Sums a list of displayed prices, e.g. `["$29.99", "$9.99"]` -> `39.98`. */
export function sumPrices(displayedPrices: string[]): number {
  const total = displayedPrices.reduce((sum, price) => sum + parsePrice(price), 0);

  // Guard against floating-point drift (29.99 + 9.99 = 39.980000000000004).
  return Number(total.toFixed(2));
}
