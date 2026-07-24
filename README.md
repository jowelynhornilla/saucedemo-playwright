# SauceDemo - Playwright E2E Test Suite

End-to-end tests for [saucedemo.com](https://www.saucedemo.com/), written with **Playwright** and **TypeScript** using the Page Object Model.

114 tests (19 scenarios × 6 device profiles), all passing.

Six real defects found on the platform are documented in **[BUG-REPORT.md](BUG-REPORT.md)**, each backed by an automated test.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Install the Playwright browsers (one-off)
npm run install:browsers

# 3. Run the whole suite (all six device profiles)
npm test

# 4. Open the HTML report
npm run report
```

### Other useful commands

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm test`               | Runs every test on all 6 device profiles                 |
| `npm run test:chromium`  | Chromium only - the fastest feedback loop                |
| `npm run test:mobile`    | Mobile and tablet profiles only                          |
| `npm run test:demo`      | Visible browser in slow motion - watch a run end to end  |
| `npm run test:ui`        | Playwright UI mode - time-travel debugging, watch mode   |
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
| **1** - Log in, verify the Products page loads            | `tests/login.spec.ts`- *standard user can log in and the Products page loads* |
| **2** - Add Backpack + Bike Light, badge shows 2          | `tests/cart.spec.ts`- *adding two products updates the cart badge to 2*  |
| **3** - Cart shows both products, names, prices           | `tests/cart.spec.ts`- *cart page lists both products with correct names and prices* |
| **4** - Remove an item, one remains, badge updates        | `tests/cart.spec.ts`- *removing a product leaves one item and updates the badge* |
| **5** - Checkout, verify the Overview page loads          | `tests/checkout.spec.ts`- *customer details lead to the Checkout Overview page* |

Beyond the brief, the suite also covers the locked-out and invalid-credential
login paths, emptying the cart completely, checkout form validation, the order
confirmation screen, and the one product whose name contains punctuation
(`Test.allTheThings() T-Shirt (Red)`) — the case most likely to break selector
generation.

### Bonus features included

- **Page Object Model** with a shared `BasePage` and a reusable `HeaderComponent`
- **Custom fixtures** for dependency-injected page objects and a one-line login precondition
- **Reusable helpers** (`utils/helpers.ts`) for product-id slugs and price maths
- **Screenshots on failure**, **video on failure**, **traces on failure**
- **HTML report** (plus `list` and JUnit XML for CI)
- **Cross-browser**: Chromium, Firefox, WebKit
- **Responsive coverage**: iPad, Pixel 5 and iPhone 13 profiles alongside desktop
- **A defect report** ([BUG-REPORT.md](BUG-REPORT.md)) with six verified bugs, screenshots and a control group
- **GitHub Actions workflow** (`.github/workflows/playwright.yml`)
- **`test.step()`** grouping so the report reads like the test plan
- Strict TypeScript throughout

---

## Defects found

Testing the `problem_user` account surfaced **six genuine defects**, three of them Critical.
They are written up in **[BUG-REPORT.md](BUG-REPORT.md)** with steps to reproduce, expected
versus actual behaviour, severity, business impact and screenshot evidence.

| ID | Defect | Severity |
| --- | --- | --- |
| BUG-001 | All six products render the same image | Medium |
| BUG-002 | Add to cart is dead on three products | **Critical** |
| BUG-003 | Items cannot be removed from the cart | **Critical** |
| BUG-004 | Sort dropdown rejects any new selection | High |
| BUG-005 | Last Name field writes into First Name | **Critical** |
| BUG-006 | Cart badge over-counts after a dead Remove | Medium |

```bash
npm run test:defects
```

Two things make this more than a list of complaints:

**Every defect has a test that asserts the correct behaviour**, marked `test.fail()`. The
suite stays green while the bug exists, and the moment someone fixes it Playwright reports
an unexpected pass - the signal to drop the annotation and let the test guard the fix as a
normal regression test. The bug list maintains itself.

**Every defect is checked against a control account in the same run.** The
*Control - standard_user is unaffected* test runs all six checks against a healthy account
and passes. That is what separates a real defect from a broken test, and it is automated
rather than asserted.

---

## A note on API testing

There are no API tests here, and that is deliberate rather than an omission. SauceDemo is a
static front-end with no public API to exercise, so any API test in this repository would be
testing something invented for the sake of it.

On a platform that does have one, this is the approach I would take:

- Playwright's `request` fixture for direct endpoint tests — status codes, schema, auth
  rules, permissions and error paths — running as their own fast project, separate from the
  UI suite.
- **Seed state via API, assert via UI.** Creating a customer or quote through the API and
  then verifying only the rendered result is dramatically faster and less brittle than
  clicking through setup screens on every test.
- `page.route()` to intercept and stub responses, so error states, empty states, slow
  responses and timeouts can be tested deterministically instead of hoping to catch them.
- A shared `APIRequestContext` with an auth token acquired once per worker.

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
│   ├── checkout.spec.ts
│   └── known-defects.spec.ts    #   real bugs, each asserted + `test.fail()`
├── utils/
│   └── helpers.ts               # Pure helpers (slugify, price parsing)
├── docs/
│   └── bug-evidence/            # Screenshots referenced by the bug report
├── BUG-REPORT.md                # Six verified defects, with severity + impact
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Reports and failure artefacts

After a run:

- **HTML report** - `playwright-report/index.html` (`npm run report`)
- **Screenshots, videos and traces for failures** - `test-results/`
- **JUnit XML for CI** - `test-results/junit.xml`

A trace can be replayed step by step with:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
