// @ts-ignore -- we don't include node types in the production build
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { RenderContext } from '#server' */

import { deferred } from '../shared/utils.js';
import * as e from './errors.js';

/** @type {Promise<void> | null} */
let current_render = null;

// Fallback only when AsyncLocalStorage is unavailable (e.g. webcontainer)
/** @type {RenderContext | null} */
let fallback_context = null;

/** @returns {RenderContext} */
export function get_render_context() {
	const store = als?.getStore?.() ?? fallback_context;

	if (!store) {
		e.server_context_required();
	}

	return store;
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function with_render_context(fn) {
	const store = {
		hydratable: {
			lookup: new Map(),
			comparisons: [],
			unresolved_promises: new Map()
		}
	};

	// Fallback path when AsyncLocalStorage is not available
	if (in_webcontainer() || als === null) {
		const { promise, resolve } = deferred();
		const previous_render = current_render;
		current_render = promise;
		await previous_render;
		fallback_context = store;
		return fn().finally(() => {
			fallback_context = null;
			resolve();
		});
	}

	return als.run(store, fn);
}

/** @type {AsyncLocalStorage<RenderContext | null> | null} */
let als = null;

export async function init_render_context() {
	if (als !== null) return;
	try {
		// @ts-ignore -- we don't include node types in the production build
		const { AsyncLocalStorage } = await import('node:async_hooks');
		als = new AsyncLocalStorage();
	} catch {}
}

// this has to be a function because rollup won't treeshake it if it's a constant
function in_webcontainer() {
	// @ts-ignore -- this will fail when we run typecheck because we exclude node types
	// eslint-disable-next-line n/prefer-global/process
	return !!globalThis.process?.versions?.webcontainer;
}
