/**
 * The sample suite: each folder in `samples/` has a `main.svelte` (plus any other components
 * it uses) and a `_config.js`. The components are compiled with the tree renderer in
 * `renderer.ts` (unless they opt out with `<svelte:options customRenderer={null} />`), then
 * `main.svelte` is mounted into a tree root, or into a DOM element with `target: 'dom'`.
 *
 * `_config.js` files import `test` from here, not from `samples.test.ts`, which runs the suite
 * when it's imported.
 */

import * as path from 'node:path';
import { flushSync, mount, unmount } from 'svelte';
import { assert } from 'vitest';
import { compile_directory } from '../../svelte/tests/helpers.js';
import { suite, type BaseTest } from '../../svelte/tests/suite.js';
import type { TreeFragment } from '../src/public.js';
import {
	assert_mirror,
	create_root,
	dom_html,
	serialize,
	type Platform,
	type PRoot
} from './platform.js';
import renderer, { calls, connections } from './renderer.js';

// `_config.js` callbacks rely on inferred parameter types, which TypeScript rejects for
// chai's assertion-function signatures (TS2775), so use non-asserting equivalents
type NonAssertingMethods = {
	ok(value: unknown, message?: string): void;
	isOk(value: unknown, message?: string): void;
	isTrue(value: unknown, message?: string): void;
	isFalse(value: unknown, message?: string): void;
	exists(value: unknown, message?: string): void;
	notExists(value: unknown, message?: string): void;
};

type Assert = Omit<typeof assert, keyof NonAssertingMethods> & NonAssertingMethods;

export interface TreeRendererTest extends BaseTest {
	/** Mount `main.svelte` into a DOM element (`target`), without a renderer */
	target?: 'dom';
	props?: Record<string, any>;
	/** The platform's tree after mounting (or the DOM's HTML without comments, with `target: 'dom'`) */
	html?: string;
	test?: (args: {
		assert: Assert;
		/** The component's exports */
		instance: Record<string, any>;
		/** The tree root `main.svelte` is mounted into */
		root: TreeFragment<Platform>;
		/** The platform's root, which `root` points to */
		platform_root: PRoot;
		/** The DOM element `main.svelte` is mounted into with `target: 'dom'` */
		target: HTMLElement;
		/** The calls the platform received, see `platform.ts` */
		calls: string[];
	}) => void | Promise<void>;
}

const renderer_path = path.resolve(import.meta.dirname, 'renderer.ts');

export const { test, run } = suite<TreeRendererTest>(async (config, cwd) => {
	await compile_directory(cwd, 'client', {
		runes: true,
		experimental: { customRenderer: renderer_path }
	});

	const { default: Main } = await import(`${cwd}/_output/client/main.svelte.js`);

	calls.length = 0;
	connections.open = 0;

	const platform_root = create_root();
	const root = renderer.createRoot(platform_root);
	const target = document.createElement('main');
	const in_dom = config.target === 'dom';
	const props = config.props ?? {};

	const instance = in_dom
		? mount(Main, { target, props })
		: mount(Main, { renderer, target: root, props });

	const output = () => (in_dom ? dom_html(target) : serialize(platform_root));

	try {
		flushSync();
		assert_mirror(root);

		if (config.html !== undefined) {
			assert.equal(output(), config.html);
		}

		await config.test?.({
			assert: assert as Assert,
			instance,
			root,
			platform_root,
			target,
			calls
		});

		assert_mirror(root);
	} finally {
		await unmount(instance);
	}

	assert.equal(output(), '', 'expected unmounting to leave nothing behind');
	assert.equal(connections.open, 0, 'expected unmounting to close every connection');
});
