# SauceDemo — Playwright E2E Test Suite

End-to-end tests for [saucedemo.com](https://www.saucedemo.com/), written with **Playwright** and **TypeScript** using the Page Object Model.

30 tests (10 scenarios × Chromium / Firefox / WebKit), all passing.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Install the Playwright browsers (one-off)
npm run install:browsers

# 3. Run the whole suite (all three browsers)
npm test

# 4. Open the HTML report
npm run report
```

### Other useful commands

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm test`               | Runs every test in Chromium, Firefox and WebKit          |
| `npm run test:chromium`  | Chromium only — the fastest feedback loop                |
| `npm run test:headed`    | Runs with a visible browser window                       |
| `npm run test:ui`        | Playwright UI mode — time-travel debugging, watch mode   |
| `npm run test:debug`     | Steps through tests with the Playwright Inspector        |
| `npm run report`         | Opens the generated HTML report                          |
| `npm run typecheck`      | Type-checks the project without running any tests        |

Run a single file or a single test:

```bash
npx playwright test tests/cart.spec.ts
npx playwright test -g "cart badge"
```

Credentials default to `standard_user` / `secret_sauce` and can be overridden
without touching code:

```bash
SAUCE_USERNAME=problem_user SAUCE_PASSWORD=secret_sauce npm run test:chromium
BASE_URL=https://www.saucedemo.com npm test
```

---

## Assessment coverage

| Task                                                     | Test                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| **1** – Log in, verify the Products page loads            | `tests/login.spec.ts` → *standard user can log in and the Products page loads* |
| **2** – Add Backpack + Bike Light, badge shows 2          | `tests/cart.spec.ts` → *adding two products updates the cart badge to 2*  |
| **3** – Cart shows both products, names, prices           | `tests/cart.spec.ts` → *cart page lists both products with correct names and prices* |
| **4** – Remove an item, one remains, badge updates        | `tests/cart.spec.ts` → *removing a product leaves one item and updates the badge* |
| **5** – Checkout, verify the Overview page loads          | `tests/checkout.spec.ts` → *customer details lead to the Checkout Overview page* |

Beyond the brief, the suite also covers the locked-out and invalid-credential
login paths, emptying the cart completely, checkout form validation, and the
order confirmation screen.

### Bonus features included

- **Page Object Model** with a shared `BasePage` and a reusable `HeaderComponent`
- **Custom fixtures** for dependency-injected page objects and a one-line login precondition
- **Reusable helpers** (`utils/helpers.ts`) for product-id slugs and price maths
- **Screenshots on failure**, **video on failure**, **traces on failure**
- **HTML report** (plus `list` and JUnit XML for CI)
- **Cross-browser**: Chromium, Firefox, WebKit
- **GitHub Actions workflow** (`.github/workflows/playwright.yml`)
- **`test.step()`** grouping so the report reads like the test plan
- Strict TypeScript throughout

---

## Project structure

```
saucedemo-playwright/
├── data/                        # Test data — no values hard-coded in specs
│   ├── users.ts                 #   accounts (env-var overridable)
│   ├── products.ts              #   product names + prices
│   └── checkout.ts              #   customer details for the checkout form
├── fixtures/
│   └── pages.fixture.ts         # Custom `test` — injects page objects + login
├── pages/                       # Page Object Model
│   ├── BasePage.ts              #   shared navigation + `expectLoaded()`
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutInformationPage.ts
│   ├── CheckoutOverviewPage.ts
│   ├── CheckoutCompletePage.ts
│   └── components/
│       └── HeaderComponent.ts   #   cart badge + burger menu, shared by all pages
├── tests/                       # Specs — one file per user journey
│   ├── login.spec.ts
│   ├── cart.spec.ts
│   └── checkout.spec.ts
├── utils/
│   └── helpers.ts               # Pure helpers (slugify, price parsing)
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Explanation of the approach

### Why it is organised this way

**Four layers, each with one job.** Test data (`data/`), interaction with the UI
(`pages/`), setup and wiring (`fixtures/`), and the assertions that express
business intent (`tests/`). Each layer only knows about the one below it, so a
change lands in exactly one place: a redesigned checkout form touches one page
object, a price change touches one data file, and no spec changes at all.

**Page objects hide *how*, specs state *what*.** There is not a single CSS
selector in the `tests/` folder. A spec reads
`await inventoryPage.addProductsToCart([backpack, bikeLight])` — which is the
language of the requirement, not the language of the DOM. That also means the
specs stay readable to a non-developer reviewing coverage.

**A `BasePage` that stays small.** It holds only what genuinely is universal:
the `Page` handle, the page's path, and `expectLoaded()`. That last method
asserts *both* the URL and the rendered header, because a correct URL on a page
that failed to render is a false pass. I deliberately kept the base class thin —
an over-stuffed base class is the most common way a POM decays.

**A component object for the header.** The cart badge and burger menu appear on
every page behind the login, so they are modelled once as `HeaderComponent` and
composed into each page (`cartPage.nav.expectCartItemCount(1)`) rather than
inherited or copy-pasted five times.

**Fixtures instead of `beforeEach` boilerplate.** Page objects are injected, so
a test declares its dependencies in its signature and constructs nothing. The
`loginAsStandardUser` fixture makes the "user is signed in" precondition a
single word in the test signature — while leaving `login.spec.ts` free to drive
login by hand, since that is the thing it is testing.

**Deriving selectors from data.** SauceDemo's add/remove buttons are
`data-test="add-to-cart-sauce-labs-backpack"`. `toProductId()` derives that slug
from the product name, so covering a new product means adding three lines to
`data/products.ts` — no new selectors, no new page-object methods.

**Selector strategy.** `data-test` attributes first (they exist precisely to be
tested against and survive restyling), stable structural classes such as
`.cart_item` second, and role/text-based locators where they are the clearest
option. I avoided XPath and any positional or CSS-nesting-dependent selector.

**Waiting.** No `waitForTimeout` anywhere. Every assertion is a web-first
`expect` that retries on its own. The one place that needed care is the cart
badge, which SauceDemo *removes from the DOM* when the cart is empty — asserting
"the badge shows 0" is impossible directly, so `expectCartItemCount` wraps the
read in `expect.poll()`, which retries and handles the missing-element case
cleanly.

**Test independence.** Every test logs in fresh, builds its own cart, and
asserts its own outcome. Nothing is shared, nothing is ordered, so the suite runs
fully parallel and a single failure never cascades.

**Meaningful assertions.** Where it was cheap to check something real, I did:
the checkout overview verifies that the item total equals the sum of the line
prices and that the grand total equals subtotal + tax. A test that only checks
"the page loaded" would sail straight past a pricing bug.

### What I would add with more time

1. **Authenticate via `storageState`.** Logging in through the UI in every test
   costs a few seconds per test and re-tests login constantly. A setup project
   that logs in once and saves the session state would cut suite time
   significantly. I left it out here because SauceDemo keeps its cart in
   session storage, so sharing state naively would leak cart contents between
   tests — it needs doing properly, not quickly.
2. **Visual regression testing** with `toHaveScreenshot()`, especially against
   `visual_user`, which SauceDemo ships specifically to exhibit layout defects.
3. **API-level setup.** On a real application I would seed the cart via API and
   reserve the UI for asserting what the user actually sees — faster and far
   less brittle.
4. **Accessibility checks** via `@axe-core/playwright` on each key page.
5. **Data-driven runs across the other personas** (`problem_user`,
   `performance_glitch_user`) — a good way to prove the suite catches real
   defects rather than just passing.
6. **ESLint + Prettier + a pre-commit hook**, and sharded CI runs with merged
   blob reports once the suite outgrows a single machine.
7. **Fuller negative and boundary coverage** on the checkout form: missing last
   name and postal code, over-long input, special characters.

---

## Reports and failure artefacts

After a run:

- **HTML report** → `playwright-report/index.html` (`npm run report`)
- **Screenshots, videos and traces for failures** → `test-results/`
- **JUnit XML for CI** → `test-results/junit.xml`

A trace can be replayed step by step with:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
