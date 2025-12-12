// @ts-ignore -- we don't include node types in the production build
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { RenderContext } from '#server' */

import { deferred, noop } from '../shared/utils.js';
import * as e from './errors.js';

/** @type {Promise<void> | null} */
let current_render = null;

/** @type {RenderContext | null} */
let context = null;

/** @returns {RenderContext} */
export function get_render_context() {
	const store = context ?? als?.getStore();

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
	context = {
		hydratable: {
			lookup: new Map(),
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

	try {
		if (als === null) {
			e.async_local_storage_unavailable();
		}
		return als.run(context, fn);
	} finally {
		context = null;
	}
}

/** @type {AsyncLocalStorage<RenderContext | null> | null} */
let als = null;
/** @type {Promise<void> | null} */
let als_import = null;

/**
 *
 * @returns {Promise<void>}
 */
export function init_render_context() {
	// It's important the right side of this assignment can run a maximum of one time
	// otherwise it's possible for a very, very well-timed race condition to assign to `als`
	// at the beginning of a render, and then another render to assign to it again, which causes
	// the first render's second half to use a new instance of `als` which doesn't have its
	// context anymore.
	// @ts-ignore -- we don't include node types in the production build
	als_import ??= import('node:async_hooks')
		.then((hooks) => {
			als = new hooks.AsyncLocalStorage();
		})
		.then(noop, noop);
	return als_import;
}

// this has to be a function because rollup won't treeshake it if it's a constant
function in_webcontainer() {
	// @ts-ignore -- this will fail when we run typecheck because we exclude node types
	// eslint-disable-next-line n/prefer-global/process
	return !!globalThis.process?.versions?.webcontainer;
}
