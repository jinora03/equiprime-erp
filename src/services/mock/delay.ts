/** Simulate realistic network latency for the mock layer. */
export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let _id = 1000;
/** Monotonic id generator for newly created mock records. */
export const nextId = () => ++_id;
