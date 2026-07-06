// @vitest-environment node

// This suite runs in a dedicated Vitest project (see the root `vitest.config.js`
// `projects` array) that resolves `svelte` using only the server/`default`
// export condition — i.e. it simulates running a custom renderer in Node
// *without* the required `custom-renderer` (or `browser`) resolve condition.
// In that situation Svelte should fail fast with a descriptive error rather
// than letting the user hit a cryptic `mount` failure later on.

import { expect, test } from 'vitest';

test('`createRenderer` from `svelte/renderer` throws a descriptive error', async () => {
	const { createRenderer } = await import('svelte/renderer');

	// @ts-expect-error - we are testing that this throws, so we don't care about the type signature
	expect(() => createRenderer({})).toThrow(/custom_renderer_unavailable_on_server/);
});

test('importing the custom renderer flag module throws a descriptive error', async () => {
	// the compiler injects `import 'svelte/internal/flags/custom-renderer'` into
	// every component when the feature is enabled, so this must fail loudly too
	await expect(import('svelte/internal/flags/custom-renderer')).rejects.toThrow(
		/custom_renderer_unavailable_on_server/
	);
});
