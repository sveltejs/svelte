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
			background: new Map(),
			emitted: false,
			late: null
		},
		rendered,
		replacer,
		background: false,
		queue: [],
		held: null
	};
}

/**
 * Runs `fn` with a copy of the render context that marks everything it does
 * (including after `await`s) as background work. The `Warp` values are shared.
 *
 * WebContainers don't have `AsyncLocalStorage`, so the only way to tell background work apart from the
 * rest of the render is to not run them at the same time. There, `fn` is queued until the `head` has been
 * serialized (see `start_background`), and the result is a promise
 * @template T
 * @param {() => T} fn
 * @returns {T | Promise<Awaited<T> | undefined>}
 */
export function run_in_background(fn) {
	const current = get_render_context();

	if (in_webcontainer() && current.queue !== null) {
		const { promise, resolve, reject } =
			/** @type {ReturnType<typeof deferred<Awaited<T> | undefined>>} */ (deferred());

		current.queue.push({
			start: () => {
				try {
					resolve(/** @type {Awaited<T>} */ (fn()));
				} catch (error) {
					reject(error);
				}
			},
			drop: () => resolve(undefined)
		});

		return promise;
	}

	if (in_webcontainer()) {
		// the background work has started, so `context` is already the background context (see `start_background`)
		return fn();
	}

	const ctx = { ...current, background: true };
	const previous = context;

	try {
		context = ctx;
		return /** @type {AsyncLocalStorage<RenderContext | null>} */ (als).run(ctx, fn);
	} finally {
		context = previous;
	}
}

/**
 * In WebContainers, starts the background work that was queued by `run_in_background`, now that the
 * `head` has been serialized. From now on, the render context belongs to the background work, until
 * the next render starts — the rest of the render can no longer add values to the `head` anyway.
 * Elsewhere, the background work has already started, so this does nothing
 * @param {boolean} start Whether to start the queued work, or drop it (e.g. because the render failed)
 */
export function start_background(start) {
	const current = get_render_context_safe();
	const queue = current?.queue;
	if (!current || !queue) return;

	current.queue = null;

	if (start && in_webcontainer()) {
		context = { ...current, background: true };
		for (const work of queue) work.start();
	} else {
		for (const work of queue) work.drop();
	}
}

/**
 * In WebContainers, keeps the next render queued until `promise` has settled,
 * so that it can't take over the render context while background work is running
 * @param {Promise<void>} promise
 */
export function hold_render_context(promise) {
	const current = get_render_context_safe();
	if (current) current.held = promise;
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

	// WebContainers don't have AsyncLocalStorage, so `context` stays set while a render is
	// running and we can't tell a nested call from a concurrent one. If it has already
	// rendered, assume it belongs to a concurrent render, and queue behind it in `run`
	if (existing !== null && !(existing.rendered && in_webcontainer())) {
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
	// in WebContainers, `context` may belong to a concurrent render (see above), so we queue instead
	if (!in_webcontainer() && get_render_context_safe()) {
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
			// not returned, so that the render's result isn't delayed by the background work
			Promise.resolve(ctx.held).finally(() => {
				context = null;
				resolve();
			});
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
