/** @import { Component } from 'svelte' */
/** @import { UnevalReplacer } from 'devalue' */
/** @import { RenderContext, SSRContext } from './types.js' */
/** @import { AsyncRenderOutput, Csp, RenderOutput, Sha256Source } from '../../server/public.js' */
/** @import { MaybePromise } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { STALE_REACTION } from '../client/constants.js';
import { pop, push, set_ssr_context, ssr_context } from './context.js';
import * as e from './errors.js';
import { BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE } from './hydration.js';
import { HYDRATION_START_ELSE, HYDRATION_START_FAILED } from '../../constants.js';
import { attributes } from './index.js';
import {
	get_render_context,
	hold_render_context,
	in_webcontainer,
	in_boundary,
	with_render_context
} from './render-context.js';
import { serialize_warp } from './warp-stream.js';
import { deferred, has_own_property, is_array, noop } from '../shared/utils.js';
import { escape_html } from '../../escaping.js';

/** @typedef {'head' | 'body'} RendererType */
/** @typedef {{ [key in RendererType]: string }} AccumulatedContent */

/**
 * @typedef {string | Renderer | PendingBoundary} RendererItem
 */

/**
 * A first-layer pending boundary whose contents are rendered in the background. It sits in the
 * `#out` array of the renderer that opened it, in place of the comment that opens it
 */
export class PendingBoundary {
	/**
	 * Assigned when the HTML is put together, in document order, so that it's stable between renders
	 * @type {string | null}
	 */
	id = null;
}

class RenderResult {
	/** @type {() => AccumulatedContent} */
	#render;

	/** @type {() => Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } } & { tail: AsyncIterable<string> }>} */
	#render_async;

	/** @type {AccumulatedContent | undefined} */
	#sync;

	/** @type {{ script: '' }} */
	#hashes = { script: '' };

	/** @type {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } } & { tail: AsyncIterable<string> }> | undefined} */
	#promise;

	/**
	 * @param {() => AccumulatedContent} render
	 * @param {() => Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } } & { tail: AsyncIterable<string> }>} render_async
	 */
	constructor(render, render_async) {
		this.#render = render;
		this.#render_async = render_async;
	}

	#get() {
		return (this.#sync ??= this.#render());
	}

	get html() {
		return this.#get().body;
	}

	get head() {
		return this.#get().head;
	}

	get body() {
		return this.#get().body;
	}

	get hashes() {
		return this.#hashes;
	}

	/**
	 * This is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
	 *
	 * @template TResult1
	 * @template [TResult2=never]
	 * @param {(value: AsyncRenderOutput) => TResult1} onfulfilled
	 * @param {(reason: unknown) => TResult2} onrejected
	 */
	then(onfulfilled, onrejected) {
		if (!async_mode_flag) {
			const result = this.#get();
			const user_result = onfulfilled({
				head: result.head,
				body: result.body,
				html: result.body,
				hashes: { script: [] },
				tail: empty()
			});
			return Promise.resolve(user_result);
		}

		this.#promise ??= this.#render_async().then((result) => {
			Object.defineProperty(result, 'html', {
				// eslint-disable-next-line getter-return
				get: () => {
					e.html_deprecated();
				}
			});
			return result;
		});
		return this.#promise.then(
			(result) => onfulfilled(/** @type {AsyncRenderOutput} */ (result)),
			onrejected
		);
	}
}

/**
 * Renderers are basically a tree of `string | Renderer`s, where each `Renderer` in the tree represents
 * work that may or may not have completed. A renderer can be {@link collect}ed to aggregate the
 * content from itself and all of its children, but this will throw if any of the children are
 * performing asynchronous work. To asynchronously collect a renderer, just `await` it.
 *
 * The `string` values within a renderer are always associated with the {@link type} of that renderer. To switch types,
 * call {@link child} with a different `type` argument.
 */
export class Renderer {
	/**
	 * The contents of the renderer.
	 * @type {RendererItem[]}
	 */
	#out = [];

	/**
	 * Any `onDestroy` callbacks registered during execution of this renderer.
	 * @type {(() => void)[] | undefined}
	 */
	#on_destroy = undefined;

	/**
	 * Whether this renderer is a component body.
	 * @type {boolean}
	 */
	#is_component_body = false;

	/**
	 * If set, this renderer is an error boundary. When async collection
	 * of the children fails, the failed snippet is rendered instead.
	 * @type {{
	 * 	failed: (renderer: Renderer, error: unknown, reset: () => void) => void;
	 * 	transformError: (error: unknown) => unknown;
	 * 	context: SSRContext | null;
	 * } | null}
	 */
	#boundary = null;

	/**
	 * The type of string content that this renderer is accumulating.
	 * @type {RendererType}
	 */
	type;

	/** @type {Renderer | undefined} */
	#parent;

	/**
	 * Asynchronous work associated with this renderer
	 * @type {Promise<void> | undefined}
	 */
	promise = undefined;

	/**
	 * State which is associated with the content tree as a whole.
	 * It will be re-exposed, uncopied, on all children.
	 * @type {SSRState}
	 * @readonly
	 */
	global;

	/**
	 * State that is local to the branch it is declared in.
	 * It will be shallow-copied to all children.
	 *
	 * @type {{ select_value: any, multiple: boolean }}
	 */
	local;

	/**
	 * @param {SSRState} global
	 * @param {Renderer | undefined} [parent]
	 */
	constructor(global, parent) {
		this.#parent = parent;

		this.global = global;
		this.local = parent ? { ...parent.local } : { select_value: undefined, multiple: false };
		this.type = parent ? parent.type : 'body';
	}

	/**
	 * @param {(renderer: Renderer) => void} fn
	 */
	head(fn) {
		const head = new Renderer(this.global, this);
		head.type = 'head';

		this.#out.push(head);
		head.child(fn);
	}

	/**
	 * @param {Array<Promise<void>>} blockers
	 * @param {(renderer: Renderer) => void} fn
	 */
	async_block(blockers, fn) {
		this.#out.push(BLOCK_OPEN);
		this.async(blockers, fn);
		this.#out.push(BLOCK_CLOSE);
	}

	/**
	 * @param {Array<Promise<void>>} blockers
	 * @param {(renderer: Renderer) => void} fn
	 */
	async(blockers, fn) {
		let callback = fn;

		if (blockers.length > 0) {
			const context = ssr_context;

			callback = (renderer) => {
				return Promise.all(blockers).then(() => {
					const previous_context = ssr_context;

					try {
						set_ssr_context(context);
						return fn(renderer);
					} finally {
						set_ssr_context(previous_context);
					}
				});
			};
		}

		this.child(callback);
	}

	/**
	 * @param {Array<() => void>} thunks
	 */
	run(thunks) {
		const context = ssr_context;

		let promise = Promise.resolve(thunks[0]());
		const promises = [promise];

		if (context !== null && thunks.length > 1) {
			// the remaining thunks run after an `await`, by which point it is too late to set context
			context.i = true;
		}

		for (const fn of thunks.slice(1)) {
			promise = promise.then(() => {
				const previous_context = ssr_context;
				set_ssr_context(context);

				try {
					return fn();
				} finally {
					set_ssr_context(previous_context);
				}
			});

			promises.push(promise);
		}

		// prevent unhandled rejections, and attach the promise to the renderer instance
		// so that rejections correctly cause rendering to fail
		promise.catch(noop);
		this.promise = this.global.track(promise);

		return promises;
	}

	/**
	 * @param {(renderer: Renderer) => MaybePromise<void>} fn
	 */
	child_block(fn) {
		this.#out.push(BLOCK_OPEN);
		this.child(fn);
		this.#out.push(BLOCK_CLOSE);
	}

	/**
	 * Create a child renderer. The child renderer inherits the state from the parent,
	 * but has its own content.
	 * @param {(renderer: Renderer) => MaybePromise<void>} fn
	 */
	child(fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);

		const parent = ssr_context;

		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: child,
			i: ssr_context?.i ?? false
		});

		const result = fn(child);

		set_ssr_context(parent);

		if (result instanceof Promise) {
			// catch to avoid unhandled promise rejections - we'll end up throwing in `collect_async` if something fails
			result.catch(noop);
			result.finally(() => set_ssr_context(null)).catch(noop);

			if (child.global.mode === 'sync') {
				e.await_invalid();
			}

			child.promise = child.global.track(result);
		}

		return child;
	}

	/**
	 * Render children inside an error boundary. If the children throw and the API-level
	 * `transformError` transform handles the error (doesn't re-throw), the `failed` snippet is
	 * rendered instead. Otherwise the error propagates.
	 *
	 * @param {{ failed?: (renderer: Renderer, error: unknown, reset: () => void) => void }} props
	 * @param {(renderer: Renderer) => MaybePromise<void>} children_fn
	 */
	boundary(props, children_fn) {
		// Create a child renderer for the boundary content.
		// Mark it as a boundary so that #collect_content_async can catch
		// errors from nested async children and render the failed snippet.
		const child = new Renderer(this.global, this);
		this.#out.push(child);

		const parent_context = ssr_context;

		if (props.failed) {
			child.#boundary = {
				failed: props.failed,
				transformError: this.global.transformError,
				context: parent_context
			};
		}

		set_ssr_context({
			...ssr_context,
			p: parent_context,
			c: null,
			r: child,
			i: ssr_context?.i ?? false
		});

		try {
			const result = children_fn(child);

			set_ssr_context(parent_context);

			if (result instanceof Promise) {
				if (child.global.mode === 'sync') {
					e.await_invalid();
				}
				result.catch(noop);
				child.promise = child.global.track(result);
			}
		} catch (error) {
			// synchronous errors are handled here, async errors will be handled in #collect_content_async
			set_ssr_context(parent_context);

			const failed_snippet = props.failed;

			if (!failed_snippet) throw error;

			const result = this.global.transformError(error);

			child.#out.length = 0;
			child.#boundary = null;

			if (result instanceof Promise) {
				if (this.global.mode === 'sync') {
					e.await_invalid();
				}

				child.promise = child.global.track(
					/** @type {Promise<unknown>} */ (result).then((transformed) => {
						set_ssr_context(parent_context);
						child.#out.push(Renderer.#serialize_failed_boundary(transformed));
						failed_snippet(child, transformed, noop);
						child.#out.push(BLOCK_CLOSE);
					})
				);
				child.promise.catch(noop);
			} else {
				child.#out.push(Renderer.#serialize_failed_boundary(result));
				failed_snippet(child, result, noop);
				child.#out.push(BLOCK_CLOSE);
			}
		}
	}

	/**
	 * Opens a pending boundary, and runs its children in the background, discarding their output, so that
	 * the data they need starts loading on the server. Values they add to `Warp` instances are streamed
	 * via the `tail` (see `serialize_warp`), followed by a message that tells the client it can render
	 * the boundary's children, once the synchronous part of the work is done. Only used with
	 * `experimental.streaming`.
	 *
	 * In WebContainers, the work of the outermost boundaries doesn't start until the `head` has been
	 * serialized (see `BackgroundWork`)
	 * @param {(renderer: Renderer) => MaybePromise<void>} fn
	 */
	background(fn) {
		if (this.global.mode === 'sync') {
			this.#out.push(BLOCK_OPEN_ELSE);
			return;
		}

		// boundaries inside background work aren't in the HTML, so they don't need an id. their
		// values are attributed to the outermost boundary, which they're already running inside
		const boundary = this.global.is_background ? null : new PendingBoundary();
		this.#out.push(boundary ?? BLOCK_OPEN_ELSE);

		const work = this.global.get_background();
		const renderer = new Renderer(work.state, this);

		/** @type {SSRContext} */
		const context = {
			...ssr_context,
			p: ssr_context,
			c: null,
			r: renderer,
			i: ssr_context?.i ?? false
		};

		const defer = boundary !== null && work.deferred;

		/**
		 * Runs the work, and returns its promise if it's asynchronous
		 * @returns {Promise<void> | undefined}
		 */
		const start = () => {
			const previous = ssr_context;
			set_ssr_context(context);

			try {
				// deferred work only starts once every value goes in the `tail`, so there's no need to attribute them
				const result = boundary === null || defer ? fn(renderer) : in_boundary(() => fn(renderer));

				if (result instanceof Promise) {
					result.finally(() => set_ssr_context(null)).catch(noop);
					return result;
				}
			} catch {
				// the client will render the children itself, and handle the error then
			} finally {
				set_ssr_context(previous);

				if (boundary !== null) {
					// the values that the children read synchronously have been added by now
					get_render_context().warp.release(boundary);
				}
			}
		};

		renderer.promise = work.run(start, defer, () => renderer.#run_on_destroy(true));
	}

	/**
	 * Create a component renderer. The component renderer inherits the state from the parent,
	 * but has its own content. It is treated as an ordering boundary for ondestroy callbacks.
	 * @param {(renderer: Renderer) => MaybePromise<void>} fn
	 * @param {Function} [component_fn]
	 * @returns {void}
	 */
	component(fn, component_fn) {
		push(component_fn);
		// mark before running so `onDestroy` callbacks are still collected if `fn` throws
		this.child((renderer) => {
			renderer.#is_component_body = true;
			return fn(renderer);
		});
		pop();
	}

	/**
	 * @param {Record<string, any>} attrs
	 * @param {(renderer: Renderer) => void} fn
	 * @param {string | undefined} [css_hash]
	 * @param {Record<string, boolean> | undefined} [classes]
	 * @param {Record<string, string> | undefined} [styles]
	 * @param {number | undefined} [flags]
	 * @param {boolean | undefined} [is_rich]
	 * @returns {void}
	 */
	select(attrs, fn, css_hash, classes, styles, flags, is_rich) {
		const { value, defaultValue, ...select_attrs } = attrs;
		if (select_attrs.multiple === '') select_attrs.multiple = true;

		this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags)}>`);
		this.child((renderer) => {
			renderer.local.select_value = value === undefined ? defaultValue : value;
			renderer.local.multiple = !!select_attrs.multiple;
			fn(renderer);
		});
		this.push(`${is_rich ? '<!>' : ''}</select>`);
	}

	/**
	 * @param {Record<string, any>} attrs
	 * @param {string | number | boolean | ((renderer: Renderer) => void)} body
	 * @param {string | undefined} [css_hash]
	 * @param {Record<string, boolean> | undefined} [classes]
	 * @param {Record<string, string> | undefined} [styles]
	 * @param {number | undefined} [flags]
	 * @param {boolean | undefined} [is_rich]
	 */
	option(attrs, body, css_hash, classes, styles, flags, is_rich) {
		this.#out.push(`<option${attributes(attrs, css_hash, classes, styles, flags)}`);

		/**
		 * @param {Renderer} renderer
		 * @param {any} value
		 * @param {{ head?: string, body: any }} content
		 */
		const close = (renderer, value, { head, body }) => {
			if (has_own_property.call(attrs, 'value')) {
				value = attrs.value;
			}

			var select_value = this.local.select_value;

			if (
				// Super edge-case, but theoretically someone could use arrays with non-multiple selects,
				// so we gotta check for the multiple attribute presence, too.
				this.local.multiple && is_array(select_value)
					? select_value.includes(value)
					: value === select_value
			) {
				renderer.#out.push(' selected=""');
			}

			renderer.#out.push(`>${body}${is_rich ? '<!>' : ''}</option>`);

			// super edge case, but may as well handle it
			if (head) {
				renderer.head((child) => child.push(head));
			}
		};

		if (typeof body === 'function') {
			this.child((renderer) => {
				const r = new Renderer(this.global, this);
				body(r);

				if (this.global.mode === 'async') {
					return r.#collect_content_async().then((content) => {
						close(renderer, content.body.replaceAll('<!---->', ''), content);
					});
				} else {
					const content = r.#collect_content();
					close(renderer, content.body.replaceAll('<!---->', ''), content);
				}
			});
		} else {
			close(this, body, { body: escape_html(body) });
		}
	}

	/**
	 * @param {(renderer: Renderer) => void} fn
	 */
	title(fn) {
		const path = this.get_path();

		/** @param {string} head */
		const close = (head) => {
			this.global.set_title(head, path);
		};

		this.child((renderer) => {
			const r = new Renderer(renderer.global, renderer);
			fn(r);

			if (renderer.global.mode === 'async') {
				return r.#collect_content_async().then((content) => {
					close(content.head);
				});
			} else {
				const content = r.#collect_content();
				close(content.head);
			}
		});
	}

	/**
	 * @param {string | (() => Promise<string>)} content
	 */
	push(content) {
		if (typeof content === 'function') {
			this.child(async (renderer) => renderer.push(await content()));
		} else {
			this.#out.push(content);
		}
	}

	/**
	 * @param {() => void} fn
	 */
	on_destroy(fn) {
		(this.#on_destroy ??= []).push(fn);
	}

	/**
	 * @returns {number[]}
	 */
	get_path() {
		return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
	}

	/**
	 * @deprecated this is needed for legacy component bindings
	 */
	copy() {
		const copy = new Renderer(this.global, this.#parent);
		copy.type = this.type;
		copy.#out = this.#out.map((item) => (item instanceof Renderer ? item.copy() : item));
		copy.promise = this.promise;
		return copy;
	}

	/**
	 * @param {Renderer} other
	 * @deprecated this is needed for legacy component bindings
	 */
	subsume(other) {
		if (this.global.mode !== other.global.mode) {
			throw new Error(
				"invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!"
			);
		}

		this.local = other.local;
		this.#out = other.#out.map((item, i) => {
			const current = this.#out[i];

			if (current instanceof Renderer && item instanceof Renderer) {
				current.subsume(item);
				return current;
			}

			return item;
		});
		this.promise = other.promise;
		this.type = other.type;
	}

	get length() {
		return this.#out.length;
	}

	/**
	 * Creates the hydration comment that marks the start of a failed boundary.
	 * The error is JSON-serialized and embedded inside an HTML comment for the client
	 * to parse during hydration. The JSON is escaped to prevent `-->` or `<!--` sequences
	 * from breaking out of the comment (XSS). Uses unicode escapes which `JSON.parse()`
	 * handles transparently.
	 * @param {unknown} error
	 * @returns {string}
	 */
	static #serialize_failed_boundary(error) {
		var json = JSON.stringify(error);
		var escaped = json.replace(/>/g, '\\u003e').replace(/</g, '\\u003c');
		return `<!--${HYDRATION_START_FAILED}${escaped}-->`;
	}

	/**
	 * Only available on the server and when compiling with the `server` option.
	 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown; replacer?: UnevalReplacer }} [options]
	 * @returns {RenderOutput}
	 */
	static render(component, options = {}) {
		return /** @type {RenderOutput} */ (
			/** @type {unknown} */ (
				new RenderResult(
					() => Renderer.#render(component, options),
					() =>
						with_render_context(options.replacer, (context) =>
							Renderer.#render_async(component, options, context)
						)
				)
			)
		);
	}

	/**
	 * Collect all of the `onDestroy` callbacks registered during rendering. In an async context, this is only safe to call
	 * after awaiting `collect_async`.
	 *
	 * Child renderers are "porous" and don't affect execution order, but component body renderers
	 * create ordering boundaries. Within a renderer, callbacks run in order until hitting a component boundary.
	 * @returns {Iterable<() => void>}
	 */
	*#collect_on_destroy() {
		for (const component of this.#traverse_components()) {
			yield* component.#collect_ondestroy();
		}
	}

	/**
	 * Performs a depth-first search of renderers, yielding the deepest components first, then additional components as we backtrack up the tree.
	 * @returns {Iterable<Renderer>}
	 */
	*#traverse_components() {
		for (const child of this.#out) {
			if (child instanceof Renderer) {
				yield* child.#traverse_components();
			}
		}
		if (this.#is_component_body) {
			yield this;
		}
	}

	/**
	 * @returns {Iterable<() => void>}
	 */
	*#collect_ondestroy() {
		if (this.#on_destroy) {
			for (const fn of this.#on_destroy) {
				yield fn;
			}
		}
		for (const child of this.#out) {
			if (child instanceof Renderer && !child.#is_component_body) {
				yield* child.#collect_ondestroy();
			}
		}
	}

	/**
	 * Runs every `onDestroy` callback in this renderer tree. On a failed render,
	 * cleanup errors are suppressed so they do not mask the render error.
	 * @param {boolean} suppress_errors
	 */
	#run_on_destroy(suppress_errors) {
		let first_error;
		let has_error = false;

		for (const cleanup of this.#collect_on_destroy()) {
			try {
				cleanup();
			} catch (error) {
				if (!suppress_errors && !has_error) {
					first_error = error;
					has_error = true;
				}
			}
		}

		if (has_error) throw first_error;
	}

	/**
	 * @param {'sync' | 'async'} mode
	 * @param {{ idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
	 * @returns {Renderer}
	 */
	static #create(mode, options) {
		if (options.idPrefix?.includes('--')) {
			e.invalid_id_prefix();
		}

		return new Renderer(
			new SSRState(
				mode,
				options.idPrefix ? options.idPrefix + '-' : '',
				options.csp,
				options.transformError
			)
		);
	}

	/**
	 * Render a component. Throws if any of the children are performing asynchronous work.
	 *
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	 * @returns {AccumulatedContent}
	 */
	static #render(component, options) {
		var previous_context = ssr_context;
		const renderer = Renderer.#create('sync', options);
		/** @type {AccumulatedContent | undefined} */
		let result;
		let render_error;
		let failed = false;

		try {
			try {
				Renderer.#open_render(renderer, component, options);
				result = Renderer.#close_render(renderer.#collect_content(), renderer);
			} catch (error) {
				render_error = error;
				failed = true;
			}

			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;

			return /** @type {AccumulatedContent} */ (result);
		} finally {
			renderer.global.abort();
			set_ssr_context(previous_context);
		}
	}

	/**
	 * Render a component.
	 *
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; replacer?: UnevalReplacer }} options
	 * @param {RenderContext} context
	 * @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } } & { tail: AsyncIterable<string> }>}
	 */
	static async #render_async(component, options, context) {
		const previous_context = ssr_context;
		const renderer = Renderer.#create('async', options);
		/** @type {(AccumulatedContent & { hashes: { script: Sha256Source[] } } & { tail: AsyncIterable<string> }) | undefined} */
		let result;
		let render_error;
		let failed = false;
		// when streaming, the work behind the streamed values may still depend on the abort signals,
		// so they're aborted once the `tail` is done instead
		let streaming = false;

		try {
			try {
				Renderer.#open_render(renderer, component, options);
				const content = await renderer.#collect_content_async();
				const warp = await serialize_warp(context.warp, {
					id_prefix: renderer.global.id_prefix,
					replacer: context.replacer,
					csp: renderer.global.csp,
					transformError: renderer.global.transformError,
					background: renderer.global.background,
					abort: () => renderer.global.abort()
				});

				if (warp.head !== null) {
					content.head = warp.head + content.head;
				}

				streaming = warp.tail !== null;
				result = { ...Renderer.#close_render(content, renderer), tail: warp.tail ?? empty() };
			} catch (error) {
				render_error = error;
				failed = true;
				renderer.global.abort();
				await renderer.global.settle();
			}

			// read after the render has settled, since work that was still running could have started background work
			const background = renderer.global.background;

			if (background !== null) {
				hold_render_context(background.finish(failed));
			}

			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;

			return /** @type {AccumulatedContent & { hashes: { script: Sha256Source[] } } & { tail: AsyncIterable<string> }} */ (
				result
			);
		} finally {
			set_ssr_context(previous_context);
			if (!streaming) renderer.global.abort();
		}
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
	 * @param {AccumulatedContent} content
	 * @returns {AccumulatedContent}
	 */
	#collect_content(content = { head: '', body: '' }) {
		for (const item of this.#out) {
			if (typeof item === 'string') {
				content[this.type] += item;
			} else if (item instanceof Renderer) {
				item.#collect_content(content);
			} else {
				content[this.type] += this.#open_pending_boundary(item);
			}
		}

		return content;
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @param {AccumulatedContent} content
	 * @returns {Promise<AccumulatedContent>}
	 */
	async #collect_content_async(content = { head: '', body: '' }) {
		await this.promise;

		// no danger to sequentially awaiting stuff in here; all of the work is already kicked off
		for (const item of this.#out) {
			if (typeof item === 'string') {
				content[this.type] += item;
			} else if (item instanceof Renderer) {
				if (item.#boundary) {
					// This renderer is an error boundary - collect into a separate
					// accumulator so we can discard partial content on error
					/** @type {AccumulatedContent} */
					const boundary_content = { head: '', body: '' };

					try {
						await item.#collect_content_async(boundary_content);
						// Success - merge into the main content
						content.head += boundary_content.head;
						content.body += boundary_content.body;
					} catch (error) {
						const { context, failed, transformError } = item.#boundary;

						set_ssr_context(context);

						let promise = transformError(error);
						set_ssr_context(null);

						let transformed = await promise;
						set_ssr_context(context);

						// Render the failed snippet instead of the partial children content
						const failed_renderer = new Renderer(item.global, item);
						failed_renderer.type = item.type;
						failed_renderer.#out.push(Renderer.#serialize_failed_boundary(transformed));
						failed(failed_renderer, transformed, noop);
						failed_renderer.#out.push(BLOCK_CLOSE);
						await failed_renderer.#collect_content_async(content);
					}
				} else {
					await item.#collect_content_async(content);
				}
			} else {
				content[this.type] += this.#open_pending_boundary(item);
			}
		}

		return content;
	}

	/**
	 * Assigns the boundary's id, in the order the HTML is put together (which, unlike the order in which
	 * boundaries are reached, doesn't depend on timing), and returns the comment that opens it
	 * @param {PendingBoundary} boundary
	 */
	#open_pending_boundary(boundary) {
		boundary.id ??= `${this.global.id_prefix}b${this.global.boundaries++}`;
		return `<!--${HYDRATION_START_ELSE}${boundary.id}-->`;
	}

	/**
	 * @template {Record<string, any>} Props
	 * @param {Renderer} renderer
	 * @param {import('svelte').Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
	 * @returns {void}
	 */
	static #open_render(renderer, component, options) {
		var previous_context = ssr_context;

		try {
			/** @type {SSRContext} */
			const context = { p: null, c: options.context ?? null, r: renderer, i: false };
			set_ssr_context(context);

			renderer.push(BLOCK_OPEN);
			// @ts-expect-error
			component(renderer, options.props ?? {});
			renderer.push(BLOCK_CLOSE);
		} finally {
			set_ssr_context(previous_context);
		}
	}

	/**
	 * @param {AccumulatedContent} content
	 * @param {Renderer} renderer
	 * @returns {AccumulatedContent & { hashes: { script: Sha256Source[] } }}
	 */
	static #close_render(content, renderer) {
		let head = content.head + renderer.global.get_title();
		let body = content.body;

		for (const { hash, code } of renderer.global.css) {
			head += `<style id="${hash}">${code}</style>`;
		}

		return {
			head,
			body,
			hashes: {
				script: renderer.global.csp.script_hashes
			}
		};
	}
}

/** @returns {AsyncIterable<string>} */
async function* empty() {}

/**
 * The work that pending boundaries start in the background (see `Renderer.background`). It renders
 * with its own state, so that it can't affect the rendered output, and its own id prefix, so that its
 * ids can't clash with the rendered output's. Boundaries inside background work run in the same state
 */
export class BackgroundWork {
	/** @readonly @type {SSRState} */
	state;

	/**
	 * Runs the `onDestroy` callbacks of each renderer that the work uses, once it has settled
	 * @type {Array<() => void>}
	 */
	#destroy = [];

	/**
	 * In WebContainers, which don't have `AsyncLocalStorage`, the work can't be told apart from the rest of
	 * the render after an `await`, so the work of the outermost boundaries waits for this, which resolves once
	 * the `head` has been serialized. After that, every value goes in the `tail` anyway, so the client receives
	 * the same values as it would elsewhere. It resolves with `false` if the render failed, in which case the
	 * work doesn't start
	 * @type {ReturnType<typeof deferred<boolean>> | null}
	 */
	#gate = in_webcontainer() ? deferred() : null;

	/** @param {SSRState} parent The state of the render */
	constructor(parent) {
		this.state = new SSRState(
			parent.mode,
			parent.id_prefix + 'b',
			parent.csp,
			parent.transformError
		);

		this.state.background = this;
	}

	/** Whether the work of the outermost boundaries waits until the `head` has been serialized */
	get deferred() {
		return this.#gate !== null;
	}

	/**
	 * Runs `start`, or schedules it to run once the `head` has been serialized if `defer` is `true` and
	 * the work is `deferred`, and tracks the result, so that it's waited for
	 * @param {() => Promise<void> | undefined} start Starts the work, returning its promise if it's asynchronous
	 * @param {boolean} defer
	 * @param {() => void} destroy Runs the `onDestroy` callbacks of the renderer that the work uses
	 * @returns {Promise<void> | undefined}
	 */
	run(start, defer, destroy) {
		this.#destroy.push(destroy);

		const result =
			defer && this.#gate !== null
				? this.#gate.promise.then((open) => (open ? start() : undefined))
				: start();

		return result === undefined ? undefined : this.state.track(result);
	}

	/** Called once the `head` has been serialized, so that work that was waiting for it can start */
	open() {
		this.#gate?.resolve(true);
	}

	abort() {
		this.state.abort();
	}

	settle() {
		return this.state.settle();
	}

	/**
	 * Runs the `onDestroy` callbacks once the work has settled. If the render failed, the work is
	 * aborted first, and work that was waiting for the `head` doesn't start
	 * @param {boolean} failed
	 */
	async finish(failed) {
		if (failed) {
			this.state.abort();
			this.#gate?.resolve(false);
		}

		await this.state.settle();

		for (const destroy of this.#destroy) destroy();
		this.#destroy.length = 0;
	}
}

export class SSRState {
	/** @readonly @type {Csp & { script_hashes: Sha256Source[] }} */
	csp;

	/** @readonly @type {'sync' | 'async'} */
	mode;

	/** @readonly @type {() => string} */
	uid;

	/** @readonly @type {string} */
	id_prefix;

	/**
	 * For the state of a render, the work started in the background by its pending boundaries, if there
	 * is any. For the state of that work, the work itself
	 * @type {BackgroundWork | null}
	 */
	background = null;

	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = new Set();

	/** The number of pending boundaries that have been given an id */
	boundaries = 0;

	/** @type {Set<Promise<unknown>>} */
	#pending = new Set();

	/** @type {AbortController | null} */
	#controller = null;

	#aborted = false;

	/**
	 * `transformError` passed to `render`. Called when an error boundary catches an error.
	 * Throws by default if unset in `render`.
	 * @type {(error: unknown) => unknown}
	 */
	transformError;

	/** @type {{ path: number[], value: string }} */
	#title = { path: [], value: '' };

	/**
	 * @param {'sync' | 'async'} mode
	 * @param {string} id_prefix
	 * @param {Csp} csp
	 * @param {((error: unknown) => unknown) | undefined} [transformError]
	 */
	constructor(mode, id_prefix = '', csp = { hash: false }, transformError) {
		this.mode = mode;
		this.csp = { ...csp, script_hashes: [] };

		if (transformError) {
			// the same error can reach both a boundary and a `Warp` (when an awaited `Warp` promise
			// rejects), so only transform it once, to avoid e.g. logging it twice
			/** @type {WeakMap<object, unknown>} */
			const transformed = new WeakMap();

			this.transformError = (error) => {
				if (error === null || (typeof error !== 'object' && typeof error !== 'function')) {
					return transformError(error);
				}

				if (!transformed.has(error)) {
					transformed.set(error, transformError(error));
				}

				return transformed.get(error);
			};
		} else {
			this.transformError = (error) => {
				throw error;
			};
		}

		this.id_prefix = id_prefix;

		let uid = 1;
		this.uid = () => `${id_prefix}s${uid++}`;
	}

	/**
	 * @template T
	 * @param {Promise<T>} promise
	 * @returns {Promise<T>}
	 */
	track(promise) {
		this.#pending.add(promise);
		promise.then(
			() => this.#pending.delete(promise),
			() => this.#pending.delete(promise)
		);
		return promise;
	}

	async settle() {
		while (this.#pending.size > 0) {
			await Promise.allSettled([...this.#pending]);
		}
	}

	abort() {
		if (this.#aborted) return;
		this.#aborted = true;
		this.#controller?.abort(STALE_REACTION);
	}

	get_abort_signal() {
		const controller = (this.#controller ??= new AbortController());
		if (this.#aborted) controller.abort(STALE_REACTION);
		return controller.signal;
	}

	/** Whether this is the state of work started in the background by pending boundaries */
	get is_background() {
		return this.background?.state === this;
	}

	/**
	 * The work started in the background by pending boundaries, which starts it if there isn't any yet.
	 * Boundaries inside background work get the work they're already part of
	 * @returns {BackgroundWork}
	 */
	get_background() {
		return (this.background ??= new BackgroundWork(this));
	}

	get_title() {
		return this.#title.value;
	}

	/**
	 * Performs a depth-first (lexicographic) comparison using the path. Rejects sets
	 * from earlier than or equal to the current value.
	 * @param {string} value
	 * @param {number[]} path
	 */
	set_title(value, path) {
		const current = this.#title.path;

		let i = 0;
		let l = Math.min(path.length, current.length);

		// skip identical prefixes - [1, 2, 3, ...] === [1, 2, 3, ...]
		while (i < l && path[i] === current[i]) i += 1;

		if (path[i] === undefined) return;

		// replace title if
		// - incoming path is longer - [7, 8, 9] > [7, 8]
		// - incoming path is later  - [7, 8, 9] > [7, 8, 8]
		if (current[i] === undefined || path[i] > current[i]) {
			this.#title.path = path;
			this.#title.value = value;
		}
	}
}
