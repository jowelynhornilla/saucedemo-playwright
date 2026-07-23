import { test } from '../fixtures/pages.fixture';
import { products } from '../data/products';

const productsUnderTest = [products.backpack, products.bikeLight] as const;

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

      await cartPage.expectProductInCart(products.backpack);
      await cartPage.expectProductInCart(products.bikeLight);

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

  test('a product with punctuation in its name can be added and removed', async ({
    loginAsStandardUser,
    cartPage,
  }) => {
    const inventoryPage = loginAsStandardUser;

    await inventoryPage.addToCart(products.redTShirt);
    await inventoryPage.nav.expectCartItemCount(1);

    await inventoryPage.nav.openCart();
    await cartPage.expectProductInCart(products.redTShirt);

    await cartPage.removeProduct(products.redTShirt);
    await cartPage.expectItemCount(0);
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

    await cartPage.nav.expectCartItemCount(0);
  });
});
