// @vitest-environment jsdom
import { runtime_suite, ok } from './shared.js';

declare global {
	interface Element {
		inert: boolean;
	}
}

const { test, run } = runtime_suite(false);

export { test, ok };

await run(__dirname);
