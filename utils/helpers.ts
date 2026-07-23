export function toProductId(productName: string): string {
  return productName.toLowerCase().replace(/\s+/g, '-');
}

export function parsePrice(displayedPrice: string): number {
  const parsed = Number(displayedPrice.replace(/[^0-9.]/g, ''));

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse a price from "${displayedPrice}"`);
  }

  return parsed;
}

export function sumPrices(displayedPrices: string[]): number {
  const total = displayedPrices.reduce((sum, price) => sum + parsePrice(price), 0);

  return Number(total.toFixed(2));
}
