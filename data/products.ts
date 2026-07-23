/**
 * Catalogue data for the products the suite interacts with.
 *
 * Only the fields the tests actually assert on are modelled. Prices are stored
 * as strings exactly as the UI renders them, so assertions compare like for
 * like without formatting logic in the spec.
 */
export interface Product {
  name: string;
  price: string;
}

export const products = {
  backpack: {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
  },
  boltTShirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
  },
} as const satisfies Record<string, Product>;
