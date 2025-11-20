// @ts-ignore -- we don't include node types in the production build
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { RenderContext } from '#server' */

import { deferred } from '../shared/utils.js';
import * as e from './errors.js';

/** @type {Promise<void> | null} */
let current_render = null;

/** @type {RenderContext | null} */
let sync_context = null;

/**
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function save_render_context(promise) {
	var previous_context = sync_context;
	var value = await promise;

	return () => {
		sync_context = previous_context;
		return value;
	};
}

/** @returns {RenderContext | null} */
export function try_get_render_context() {
	if (sync_context !== null) {
		return sync_context;
	}
	return als?.getStore() ?? null;
}

/** @returns {RenderContext} */
export function get_render_context() {
	const store = try_get_render_context();

	if (!store) {
		e.render_context_unavailable(
			`\`AsyncLocalStorage\` is ${als ? 'available' : 'not available'}.`
		);
	}

	return store;
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function with_render_context(fn) {
	try {
		sync_context = {
			hydratable: {
				lookup: new Map(),
				values: [],
				comparisons: [],
				unresolved_promises: new Map()
			}
		};
		if (in_webcontainer()) {
			const { promise, resolve } = deferred();
			const previous_render = current_render;
			current_render = promise;
			await previous_render;
			return fn().finally(resolve);
		}
		return als ? als.run(sync_context, fn) : fn();
	} finally {
		if (!in_webcontainer()) {
			sync_context = null;
		}
	}
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
