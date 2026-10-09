// @ts-ignore -- we don't include node types in the production build
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { UnevalReplacer } from 'devalue' */
/** @import { RenderContext } from '#server' */

import { deferred, noop } from '../shared/utils.js';
import * as e from './errors.js';

/** @type {Promise<void> | null} */
let current_render = null;

/** @type {RenderContext | null} */
let context = null;

/** @returns {RenderContext} */
export function get_render_context() {
	const store = get_render_context_safe();

	if (!store) {
		e.server_context_required();
	}

	return store;
}

/** @returns {RenderContext | null} */
function get_render_context_safe() {
	return context ?? als?.getStore() ?? null;
}

/**
 * @param {boolean} rendered
 * @param {UnevalReplacer | undefined} replacer
 * @returns {RenderContext}
 */
function create_render_context(rendered, replacer) {
	return {
		warp: {
			values: new Map(),
			stacks: new Map(),
			comparisons: [],
			emitted: false
		},
		rendered,
		replacer
	};
}

/**
 * Runs `fn` with a render context. If `fn` is running inside `withWarp`,
 * that context is used — but only for one render.
 * @template T
 * @param {(context: RenderContext) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function with_render_context(fn) {
	const existing = get_render_context_safe();

	if (existing !== null) {
		if (existing.rendered) {
			e.warp_context_already_rendered();
		}

		existing.rendered = true;
		return fn(existing);
	}

	await init_render_context();
	return run(create_render_context(true, undefined), fn);
}

/**
 * Only available on the server. Runs `fn` with a context in which `Warp` instances
 * can be used. A `render` call inside `fn` will use the same context, and serialize
 * all the values added to `Warp` instances inside `fn` — whether they were added
 * before or during the render. Only one `render` can happen inside a given `withWarp`.
 * @template T
 * @param {() => T | Promise<T>} fn
 * @param {{ replacer?: UnevalReplacer }} [options]
 * @returns {Promise<T>}
 */
export async function withWarp(fn, options = {}) {
	if (get_render_context_safe()) {
		e.warp_context_nested();
	}

	await init_render_context();
	return run(create_render_context(false, options.replacer), async () => fn());
}

/**
 * @template T
 * @param {RenderContext} ctx
 * @param {(context: RenderContext) => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function run(ctx, fn) {
	if (in_webcontainer()) {
		const { promise, resolve } = deferred();
		const previous_render = current_render;
		current_render = promise;
		await previous_render;
		context = ctx;
		return fn(ctx).finally(() => {
			context = null;
			resolve();
		});
	}

	try {
		if (als === null) {
			e.async_local_storage_unavailable();
		}

		context = ctx;
		return als.run(ctx, () => fn(ctx));
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
