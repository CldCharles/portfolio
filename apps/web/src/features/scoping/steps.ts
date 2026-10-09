// Step order; the keys name each step's texts under scoping.* in the locales.
export const stepKeys = ['problem', 'users', 'goals', 'scope', 'features', 'risks'] as const;
export type StepKey = typeof stepKeys[number];
