export interface User {
  username: string;
  password: string;
}

export const users = {
  standard: {
    username: process.env.SAUCE_USERNAME ?? 'standard_user',
    password: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  },

  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },

  invalid: {
    username: 'not_a_real_user',
    password: 'wrong_password',
  },

  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },

  performanceGlitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
} as const satisfies Record<string, User>;
