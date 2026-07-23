import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInformationPage } from '../pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { users } from '../data/users';

/**
 * Custom fixtures.
 *
 * Two things happen here:
 *
 * 1. Every page object is exposed as a fixture, so a spec destructures only the
 *    pages it needs instead of `new`-ing them in a `beforeEach`.
 * 2. `loginAsStandardUser` performs the sign-in that most specs need as a
 *    precondition. Making it an explicit fixture (rather than a global setup)
 *    keeps the login test itself free to drive login by hand, and keeps every
 *    other test's precondition visible in its own signature.
 */
type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
};

type Auth = {
  /** Signs in as `standard_user` and leaves the browser on the Products page. */
  loginAsStandardUser: InventoryPage;
};

export const test = base.extend<Pages & Auth>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },

  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  loginAsStandardUser: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.gotoAndLogin(users.standard);
    await inventoryPage.expectLoaded();

    // Hand the Products page to the test so it can start acting immediately.
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
