import { test, expect } from '../fixtures/pages.fixture';
import { users } from '../data/users';
import { products } from '../data/products';
import { customers } from '../data/checkout';

test.describe('Known defects — problem_user', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.gotoAndLogin(users.problem);
    await inventoryPage.expectLoaded();
  });

  test(
    'BUG-001 every product should have its own image',
    { annotation: [{ type: 'defect', description: 'BUG-001 — all 6 products render the same image. Severity: Medium.' }] },
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.expectEveryProductHasADistinctImage();
    },
  );

  test(
    'BUG-002 every Add to cart button should add its product',
    { annotation: [{ type: 'defect', description: 'BUG-002 — Add to cart is dead for Bolt T-Shirt, Fleece Jacket and Red T-Shirt. Severity: Critical.' }] },
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.expectAddToCartButtonResponds(products.boltTShirt);
    },
  );

  test(
    'BUG-003 a product added to the cart should be removable',
    { annotation: [{ type: 'defect', description: 'BUG-003 — Remove is dead for Backpack, Bike Light and Onesie; the item cannot be taken out of the cart. Severity: Critical.' }] },
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.nav.expectCartItemCount(1);

      await inventoryPage.removeFromCart(products.backpack);
      await inventoryPage.nav.expectCartItemCount(0);
    },
  );

  test(
    'BUG-004 the sort dropdown should accept a new selection',
    { annotation: [{ type: 'defect', description: 'BUG-004 — selecting any sort option leaves the dropdown on "az"; the selection is rejected and the grid never reorders. Severity: High.' }] },
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.sortBy('za');
      await expect(inventoryPage.sortDropdown).toHaveValue('za');
    },
  );

  test(
    'BUG-004b sorting Z to A should reverse the product order',
    { annotation: [{ type: 'defect', description: 'BUG-004b — downstream effect of BUG-004: the product grid keeps its A-Z order. Severity: High.' }] },
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.sortBy('za');
      await inventoryPage.expectSortedByNameDescending();
    },
  );

  test(
    'BUG-006 the cart badge should clear once every item is removed',
    { annotation: [{ type: 'defect', description: 'BUG-006 — knock-on effect of BUG-003: the badge keeps counting items the customer has tried to remove. Severity: Medium.' }] },
    async ({ inventoryPage, cartPage }) => {
      test.fail();
      const stuck = [products.backpack, products.bikeLight, products.onesie];

      for (const product of stuck) {
        await inventoryPage.addToCart(product);
      }
      await inventoryPage.nav.expectCartItemCount(stuck.length);

      for (const product of stuck) {
        await inventoryPage.removeFromCart(product);
      }

      await inventoryPage.nav.expectCartItemCount(0);
      await inventoryPage.nav.openCart();
      await cartPage.expectItemCount(0);
    },
  );

  test(
    'BUG-005 the checkout Last Name field should hold its own value',
    { annotation: [{ type: 'defect', description: 'BUG-005 — the Last Name input is bound to the First Name field: typing a last name overwrites the first name and Last Name stays empty, so checkout can never be completed. Severity: Critical.' }] },
    async ({ inventoryPage, cartPage, checkoutInformationPage }) => {
      test.fail();
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.nav.openCart();
      await cartPage.proceedToCheckout();
      await checkoutInformationPage.expectLoaded();

      await checkoutInformationPage.fillCustomerInfo(customers.valid);

      await expect(checkoutInformationPage.lastNameInput).toHaveValue(customers.valid.lastName);
      await expect(checkoutInformationPage.firstNameInput).toHaveValue(customers.valid.firstName);
    },
  );
});

test.describe('Control — standard_user is unaffected', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.gotoAndLogin(users.standard);
    await inventoryPage.expectLoaded();
  });

  test('none of the defects above reproduce on a healthy account', async ({
    inventoryPage,
    cartPage,
    checkoutInformationPage,
  }) => {
    await inventoryPage.expectEveryProductHasADistinctImage();
    await inventoryPage.expectAddToCartButtonResponds(products.boltTShirt);

    await inventoryPage.sortBy('za');
    await expect(inventoryPage.sortDropdown).toHaveValue('za');
    await inventoryPage.expectSortedByNameDescending();

    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.removeFromCart(products.backpack);

    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.nav.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInformationPage.fillCustomerInfo(customers.valid);
    await expect(checkoutInformationPage.lastNameInput).toHaveValue(customers.valid.lastName);
    await expect(checkoutInformationPage.firstNameInput).toHaveValue(customers.valid.firstName);
  });
});
