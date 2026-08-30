export interface CoreTestCase {
  name: string;
  run: () => void | Promise<void>;
}

export function coreTest(
  name: string,
  run: CoreTestCase["run"],
): CoreTestCase {
  return { name, run };
}
