/**
 * Customer details used to complete the checkout form.
 */
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const customers = {
  valid: {
    firstName: 'Jowelyn',
    lastName: 'Hornilla',
    postalCode: '6000',
  },
} as const satisfies Record<string, CustomerInfo>;
