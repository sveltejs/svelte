/** @import { Component } from 'svelte' */
/** @import { UnevalReplacer } from 'devalue' */
/** @import { RenderContext, SSRContext, WarpStore } from './types.js' */
/** @import { WarpKey } from '#shared' */
/** @import { AsyncRenderOutput, Csp, RenderOutput, Sha256Source } from '../../server/public.js' */
/** @import { MaybePromise } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { STALE_REACTION } from '../client/constants.js';
import { pop, push, set_ssr_context, ssr_context } from './context.js';
import * as e from './errors.js';
import * as w from './warnings.js';
import { BLOCK_CLOSE, BLOCK_OPEN } from './hydration.js';
import { HYDRATION_START_FAILED } from '../../constants.js';
import { attributes } from './index.js';
import { with_render_context } from './render-context.js';
import { sha256 } from './crypto.js';
import * as devalue from 'devalue';
import { deferred, has_own_property, is_array, noop } from '../shared/utils.js';
import { escape_html } from '../../escaping.js';

/** @typedef {'head' | 'body'} RendererType */
/** @typedef {{ [key in RendererType]: string }} AccumulatedContent */

/**
 * @typedef {string | Renderer} RendererItem
 */

class RenderResult {
	/** @type {() => AccumulatedContent} */
	#render;

	/** @type {() => Promise<AccumulatedContent & { hashes: { script: Sha256Source[] }, tail: AsyncIterable<string> }>} */
	#render_async;

	/** @type {AccumulatedContent | undefined} */
	#sync;

	/** @type {{ script: '' }} */
	#hashes = { script: '' };

	/** @type {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] }, tail: AsyncIterable<string> }> | undefined} */
	#promise;

	/**
	 * @param {() => AccumulatedContent} render
	 * @param {() => Promise<AccumulatedContent & { hashes: { script: Sha256Source[] }, tail: AsyncIterable<string> }>} render_async
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
	 * Runs the children of a pending boundary in the background, discarding their output, so that the
	 * data they need starts loading on the server. Only used with `experimental.streaming`.
	 * @param {(renderer: Renderer) => MaybePromise<void>} fn
	 */
	background(fn) {
		if (this.global.mode === 'sync') return;

		const state = this.global.get_background();
		const renderer = new Renderer(state, this);
		state.background_renderers.push(renderer);

		const parent = ssr_context;

		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: renderer,
			i: ssr_context?.i ?? false
		});

		try {
			const result = fn(renderer);

			if (result instanceof Promise) {
				result.catch(noop);
				result.finally(() => set_ssr_context(null)).catch(noop);
				renderer.promise = state.track(result);
			}
		} catch {
			// the client will render the children itself, and handle the error then
		} finally {
			set_ssr_context(parent);
		}
	}

	/**
	 * Called once the background work has settled, or is no longer needed
	 * @param {SSRState} state
	 */
	static finish_background(state) {
		state.abort();

		for (const renderer of state.background_renderers) {
			renderer.#run_on_destroy(true);
		}

		state.background_renderers.length = 0;
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
						with_render_context((context) => Renderer.#render_async(component, options, context))
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
			if (typeof child !== 'string') {
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
	 * @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] }, tail: AsyncIterable<string> }>}
	 */
	static async #render_async(component, options, context) {
		const previous_context = ssr_context;
		const renderer = Renderer.#create('async', options);
		/** @type {(AccumulatedContent & { hashes: { script: Sha256Source[] }, tail: AsyncIterable<string> }) | undefined} */
		let result;
		let render_error;
		let failed = false;

		try {
			try {
				Renderer.#open_render(renderer, component, options);
				const content = await renderer.#collect_content_async();
				const background = renderer.global.background;

				if (background !== null) {
					context.background = background.settle();
				}

				const warp = await renderer.#collect_warp(
					context.warp,
					compose_replacers(options.replacer, context.replacer),
					background
				);
				if (warp.head !== null) {
					content.head = warp.head + content.head;
				}
				result = { ...Renderer.#close_render(content, renderer), tail: warp.tail };
			} catch (error) {
				render_error = error;
				failed = true;
				renderer.global.abort();
				await renderer.global.settle();

				if (renderer.global.background !== null) {
					context.warp.late = null;
					Renderer.finish_background(renderer.global.background);
				}
			}

			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;

			return /** @type {AccumulatedContent & { hashes: { script: Sha256Source[] }, tail: AsyncIterable<string> }} */ (
				result
			);
		} finally {
			set_ssr_context(previous_context);
			renderer.global.abort();
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
			}
		}

		return content;
	}

	/**
	 * Serializes the values added to `Warp` instances into a `<script>` that recreates them on the client.
	 *
	 * If there's no background work, this waits for every promise to settle first. Otherwise, the work inside
	 * pending boundaries may still be going on, and the client is waiting for it — so only the promises that
	 * have already settled are resolved in the `<script>`, and the rest (along with any values added later)
	 * are streamed to the client via the `tail`.
	 * @param {WarpStore} store
	 * @param {UnevalReplacer | undefined} replacer
	 * @param {SSRState | null} background
	 * @returns {Promise<{ head: string | null, tail: AsyncIterable<string> }>}
	 */
	async #collect_warp(store, replacer, background) {
		// these reject if there's a mismatch. a loop, as more can be added while we're awaiting
		for (let i = 0; i < store.comparisons.length; i += 1) {
			await store.comparisons[i];
		}

		if (background !== null && this.global.csp.hash) {
			e.invalid_csp_streaming();
		}

		store.emitted = true;

		/** @type {Map<string, Map<WarpKey, unknown>>} */
		const values = new Map();

		for (const [id, v] of store.values) {
			if (v.size > 0) values.set(id, v);
		}

		if (values.size === 0 && background === null) {
			return { head: null, tail: empty() };
		}

		const late = background === null ? null : stream_late_values(store, background);

		/** @type {unknown} */
		let serialization_error = null;

		/** @type {ReturnType<typeof devalue.unevalStream>} */
		let stream;

		try {
			stream = devalue.unevalStream(
				late === null ? values : [values, late.values],
				(thing, js) => {
					if (thing instanceof LateValues) {
						// add the values to the client's `Warp`s as soon as this is evaluated, rather than
						// when the promise resolves, so that they're there before anything awaiting the
						// promises resolved in the same block runs
						return js`((e, n) => {
							const w = window.__svelte.w;
							for (const [id, k, v] of e) {
								let m = w.get(id);
								if (!m) w.set(id, (m = new Map()));
								m.set(k, v);
							}
							return n;
						})(${thing.entries}, ${thing.next})`;
					}

					return replacer?.(thing, js);
				},
				{
					id: `${this.global.id_prefix}w`,
					scope: 'window.__svelte.d',
					transformError: (error) => {
						// a promise resolved to something that can't be serialized. if we're streaming, it's too
						// late to fail the render, so the promise rejects on the client with a generic error instead
						if (error instanceof devalue.DevalueError) {
							serialization_error ??= error;
							return;
						}

						// rejected promises reject on the client too, with whatever `transformError` returns
						return this.global.transformError(error);
					}
				}
			);
		} catch (error) {
			late?.close();
			serialization_failed(error);
		}

		const { head, tail } = stream;

		// promises that have already settled are resolved in the head script
		const ready = await take_ready(tail);
		let blocks = ready.blocks;

		if (late === null && ready.next) {
			// this is a problem -- it means we've finished the render but we're still waiting on a promise
			// to resolve so we can serialize it, so we're blocking the response on useless content.
			w.unresolved_warp();

			let result = await ready.next;

			while (!result.done) {
				blocks += `\n\t\t\t\t${result.value}`;
				result = await tail.next();
			}
		}

		if (late === null && serialization_error !== null) {
			serialization_failed(serialization_error);
		}

		const streaming = late !== null && ready.next !== null;

		const body = `
			{
				const w = (window.__svelte ??= {}).w ??= new Map();${
					// while this is above zero, changes made to the client's `Warp`s are kept separate,
					// so they can't interfere with the values that are still being streamed in
					streaming ? '\n\t\t\t\twindow.__svelte.s = (window.__svelte.s ?? 0) + 1;' : ''
				}

				for (const [id, values] of ${late === null ? head : `(${head})[0]`}) {
					const existing = w.get(id);

					if (existing) {
						for (const [k, v] of values) existing.set(k, v);
					} else {
						w.set(id, values);
					}
				}${blocks}
			}
		`;

		let csp_attr = '';
		if (this.global.csp.nonce) {
			csp_attr = ` nonce="${this.global.csp.nonce}"`;
		} else if (this.global.csp.hash) {
			// note to future selves: this doesn't need to be optimized with a Map<body, hash>
			// because the it's impossible for identical data to occur multiple times in a single render
			const hash = await sha256(body);
			this.global.csp.script_hashes.push(`sha256-${hash}`);
		}

		return {
			head: `\n\t\t<script${csp_attr}>${body}</script>`,
			tail: streaming
				? stream_scripts(
						tail,
						/** @type {Promise<IteratorResult<string>>} */ (ready.next),
						csp_attr,
						late.close
					)
				: empty()
		};
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

const MACROTASK = Symbol('macrotask');

/** Values that were added to `Warp` instances after the `head` was generated */
class LateValues {
	/**
	 * @param {Array<[string, WarpKey, unknown]>} entries
	 * @param {Promise<LateValues | null> | null} next
	 */
	constructor(entries, next) {
		this.entries = entries;
		this.next = next;
	}
}

/** @returns {AsyncIterable<string>} */
async function* empty() {}

/**
 * Streams the values that are added to `Warp` instances after the `head` was generated,
 * as a chain of promises that each resolve to a batch of values and the next promise.
 * The chain ends once the background work is done.
 * @param {WarpStore} store
 * @param {SSRState} background
 */
function stream_late_values(store, background) {
	/** @type {Array<[string, WarpKey, unknown]>} */
	let entries = [];
	let link = /** @type {ReturnType<typeof deferred<LateValues | null>>} */ (deferred());
	let scheduled = false;
	let closed = false;

	const values = link.promise;

	function flush() {
		if (!scheduled || closed) return;
		scheduled = false;

		const current = link;
		link = deferred();
		current.resolve(new LateValues(entries, link.promise));
		entries = [];
	}

	function close() {
		if (closed) return;
		closed = true;

		store.late = null;
		link.resolve(entries.length > 0 ? new LateValues(entries, null) : null);
		entries = [];

		Renderer.finish_background(background);
	}

	store.late = (id, key, value) => {
		entries.push([id, key, value]);

		if (!scheduled) {
			scheduled = true;
			queueMicrotask(flush);
		}
	};

	background.settle().then(close, close);

	return { values, close };
}

/**
 * @param {AsyncIterator<string>} tail
 * @param {Promise<IteratorResult<string>>} next The pending result of `tail.next()`
 * @param {string} csp_attr
 * @param {() => void} close
 * @returns {AsyncIterable<string>}
 */
function stream_scripts(tail, next, csp_attr, close) {
	const generator = generate_scripts(tail, next, csp_attr);

	/** @type {AsyncIterableIterator<string>} */
	const iterator = {
		next: () => generator.next(),
		// if the consumer stops early, stop the background work. this is
		// done here because `return` doesn't run a generator that hasn't started
		return: async () => {
			close();
			await tail.return?.();
			return generator.return(undefined);
		},
		[Symbol.asyncIterator]: () => iterator
	};

	return iterator;
}

/**
 * Turns the blocks from `unevalStream` into `<script>` tags. Blocks that arrive at around the same time are
 * combined, so that server-side work which was waiting on a promise that just resolved has a chance to add
 * the values that depend on it — otherwise, the client might not receive them before it needs them.
 * @param {AsyncIterator<string>} tail
 * @param {Promise<IteratorResult<string>>} next
 * @param {string} csp_attr
 * @returns {AsyncGenerator<string>}
 */
async function* generate_scripts(tail, next, csp_attr) {
	let done = false;

	while (!done) {
		let code = '';
		let result = await next;

		while (true) {
			if (result.done) {
				// tell the client that this stream has finished
				code += 'window.__svelte.s -= 1;';
				done = true;
				break;
			}

			code += result.value;
			next = tail.next();

			const more = await Promise.race([
				next,
				new Promise((fulfil) => setTimeout(() => fulfil(MACROTASK), 0))
			]);

			if (more === MACROTASK) break;
			result = /** @type {IteratorResult<string>} */ (more);
		}

		yield `<script${csp_attr}>${code}</script>`;
	}
}

/**
 * Takes the blocks from `tail` that are ready now — i.e. the ones for promises that have already
 * settled, which `unevalStream` emits within a few microtasks — without waiting for the rest
 * @param {AsyncIterator<string>} tail
 * @returns {Promise<{ blocks: string, next: Promise<IteratorResult<string>> | null }>}
 */
async function take_ready(tail) {
	let blocks = '';

	while (true) {
		const next = tail.next();
		const result = await Promise.race([
			next,
			new Promise((fulfil) => setTimeout(() => fulfil(MACROTASK), 0))
		]);

		if (result === MACROTASK) {
			// the block this resolves to is the next one, so it must not be dropped
			return { blocks, next };
		}

		const { done, value } = /** @type {IteratorResult<string>} */ (result);
		if (done) return { blocks, next: null };

		blocks += `\n\t\t\t\t${value}`;
	}
}

/**
 * @param {unknown} error
 * @returns {never}
 */
function serialization_failed(error) {
	const { stack, path } = /** @type {any} */ (error) ?? {};
	e.warp_serialization_failed((stack ?? String(error)) + (path ? `\n(at \`${path}\`)` : ''));
}

/**
 * @param {UnevalReplacer | undefined} a
 * @param {UnevalReplacer | undefined} b
 * @returns {UnevalReplacer | undefined}
 */
function compose_replacers(a, b) {
	if (!a || !b) return a ?? b;
	return (value, js) => a(value, js) || b(value, js);
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
	 * The state for work started in the background by pending boundaries, if there is any
	 * @type {SSRState | null}
	 */
	background = null;

	/**
	 * The renderers for work started in the background, if this is the state for that work
	 * @type {Renderer[]}
	 */
	background_renderers = [];

	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = new Set();

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

		this.transformError =
			transformError ??
			((error) => {
				throw error;
			});

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

	/** @returns {SSRState} */
	get_background() {
		if (this.background === null) {
			// background work gets its own state, so that it can't affect the rendered output
			this.background = new SSRState(this.mode, this.id_prefix, this.csp, this.transformError);
			this.background.background = this.background;
		}

		return this.background;
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
