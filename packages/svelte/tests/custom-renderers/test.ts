// @vitest-environment node
import { custom_renderer_suite, ok } from './shared';

const { test, run } = custom_renderer_suite();

export { test, ok };

await run(__dirname);
