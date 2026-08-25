export const Session = {
  cookieName: "sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;

/** Units a raw material can be stocked in. */
export const MATERIAL_UNITS = ["kg", "g", "litre", "ml"] as const;
export type MaterialUnit = (typeof MATERIAL_UNITS)[number];
