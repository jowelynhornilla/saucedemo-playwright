import { test } from '../fixtures/pages.fixture';
import { products } from '../data/products';

/** The two products the assessment asks for, in the order they are added. */
const productsUnderTest = [products.backpack, products.bikeLight] as const;

/**
 * Tasks 2–4 — adding products, inspecting the cart and removing an item.
 *
 * `loginAsStandardUser` is requested as a fixture so each test starts on the
 * Products page with a signed-in session, and the body of the test contains
 * only the behaviour under test.
 */
test.describe('Shopping cart', () => {
  test('adding two products updates the cart badge to 2', async ({ loginAsStandardUser }) => {
    const inventoryPage = loginAsStandardUser;

    await test.step('add the Backpack and the Bike Light', async () => {
      await inventoryPage.addProductsToCart(productsUnderTest);
    });

    await test.step('the cart badge shows 2 items', async () => {
      await inventoryPage.nav.expectCartItemCount(2);
    });
  });

  test('cart page lists both products with correct names and prices', async ({
    loginAsStandardUser,
    cartPage,
  }) => {
    const inventoryPage = loginAsStandardUser;

    await inventoryPage.addProductsToCart(productsUnderTest);
    await inventoryPage.nav.openCart();

    await test.step('the cart page loads', async () => {
      await cartPage.expectLoaded();
    });

    await test.step('both products are present, with the right name and price', async () => {
      await cartPage.expectItemCount(2);

      // Per-product assertions: each one is scoped to its own cart row, so a
      // failure names the product that is wrong.
      await cartPage.expectProductInCart(products.backpack);
      await cartPage.expectProductInCart(products.bikeLight);

      // And a whole-cart assertion: exactly these products, in this order.
      await cartPage.expectCartContains(productsUnderTest);
    });
  });

  test('removing a product leaves one item and updates the badge', async ({
    loginAsStandardUser,
    cartPage,
  }) => {
    const inventoryPage = loginAsStandardUser;

    await inventoryPage.addProductsToCart(productsUnderTest);
    await inventoryPage.nav.openCart();
    await cartPage.expectItemCount(2);

    await test.step('remove the Backpack', async () => {
      await cartPage.removeProduct(products.backpack);
    });

    await test.step('only the Bike Light remains', async () => {
      await cartPage.expectItemCount(1);
      await cartPage.expectProductNotInCart(products.backpack);
      await cartPage.expectProductInCart(products.bikeLight);
    });

    await test.step('the cart badge updates to 1', async () => {
      await cartPage.nav.expectCartItemCount(1);
    });
  });

  test('removing every product empties the cart and hides the badge', async ({
    loginAsStandardUser,
    cartPage,
  }) => {
    const inventoryPage = loginAsStandardUser;

    await inventoryPage.addProductsToCart(productsUnderTest);
    await inventoryPage.nav.openCart();

    for (const product of productsUnderTest) {
      await cartPage.removeProduct(product);
    }

    await cartPage.expectItemCount(0);

    // SauceDemo removes the badge element entirely when the cart is empty.
    await cartPage.nav.expectCartItemCount(0);
  });
});
