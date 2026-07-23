import { test, expect } from '../fixtures/pages.fixture';
import { users } from '../data/users';

test.describe('Login', () => {
  test('standard user can log in and the Products page loads', async ({
    loginPage,
    inventoryPage,
  }) => {
    await test.step('open the login page', async () => {
      await loginPage.goto();
      await loginPage.expectLoaded();
    });

    await test.step('sign in as standard_user', async () => {
      await loginPage.login(users.standard);
    });

    await test.step('the Products page is displayed', async () => {
      await inventoryPage.expectLoaded();
      await inventoryPage.expectProductsListed();

      await inventoryPage.nav.expectCartItemCount(0);
    });
  });

  test('locked out user is rejected with an explanatory error', async ({ loginPage, page }) => {
    await loginPage.gotoAndLogin(users.lockedOut);

    await loginPage.expectErrorMessage('Sorry, this user has been locked out.');

    await expect(page).toHaveURL(/saucedemo\.com\/$/);
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    await loginPage.gotoAndLogin(users.invalid);

    await loginPage.expectErrorMessage(
      'Username and password do not match any user in this service',
    );
  });
});
