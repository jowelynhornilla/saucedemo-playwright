import { test } from '../fixtures/pages.fixture';
import { products } from '../data/products';
import { customers } from '../data/checkout';

const productsUnderTest = [products.backpack, products.bikeLight] as const;

test.describe('Checkout', () => {
  test.beforeEach(async ({ loginAsStandardUser, cartPage }) => {
    await loginAsStandardUser.addProductsToCart(productsUnderTest);
    await loginAsStandardUser.nav.openCart();
    await cartPage.expectItemCount(productsUnderTest.length);
  });

  test('customer details lead to the Checkout Overview page', async ({
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    await test.step('start checkout', async () => {
      await cartPage.proceedToCheckout();
      await checkoutInformationPage.expectLoaded();
    });

    await test.step('enter first name, last name and postal code', async () => {
      await checkoutInformationPage.submitCustomerInfo(customers.valid);
    });

    await test.step('the Checkout Overview page loads', async () => {
      await checkoutOverviewPage.expectLoaded();
      await checkoutOverviewPage.expectProductsListed(productsUnderTest);
      await checkoutOverviewPage.expectTotalsAreConsistent(productsUnderTest);
    });
  });

  test('order can be completed through to the confirmation page', async ({
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutInformationPage.submitCustomerInfo(customers.valid);
    await checkoutOverviewPage.expectLoaded();

    await checkoutOverviewPage.finish();

    await checkoutCompletePage.expectOrderConfirmed();

    await checkoutCompletePage.nav.expectCartItemCount(0);
  });

  test('checkout is blocked when the first name is missing', async ({
    cartPage,
    checkoutInformationPage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutInformationPage.expectLoaded();

    await checkoutInformationPage.fillCustomerInfo({
      ...customers.valid,
      firstName: '',
    });
    await checkoutInformationPage.continue();

    await checkoutInformationPage.expectErrorMessage('Error: First Name is required');
    await checkoutInformationPage.expectLoaded();
  });
});
