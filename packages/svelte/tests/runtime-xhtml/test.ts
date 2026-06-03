// @vitest-environment vitest-xhtml-environment.ts

import { runtime_suite, ok } from '../runtime-legacy/shared';

const { test, run } = runtime_suite(true);

export { test, ok };

await run(__dirname);
