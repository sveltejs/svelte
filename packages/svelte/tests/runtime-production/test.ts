// @vitest-environment jsdom

import { vi } from 'vitest';
import { runtime_suite, ok } from '../runtime-legacy/shared';

vi.mock('esm-env', async (importEnv) => {
	return {
		...(await importEnv()),
		DEV: false
	};
});

const { test, run } = runtime_suite(true);

export { test, ok };

await run(__dirname);
