/**
 * Test accounts published by saucedemo.com.
 *
 * Credentials live here (not inline in specs) so a change to the demo site is a
 * one-line edit. On a real project these would come from environment variables
 * or a secret store — `process.env` fallbacks are wired up for that reason.
 */
export interface User {
  username: string;
  password: string;
}

export const users = {
  /** Happy-path account used by the majority of the suite. */
  standard: {
    username: process.env.SAUCE_USERNAME ?? 'standard_user',
    password: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  },

  /** Account the site rejects at login — used for the negative test. */
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },

  /** Credentials that do not exist at all. */
  invalid: {
    username: 'not_a_real_user',
    password: 'wrong_password',
  },
} as const satisfies Record<string, User>;
