/** @import { Component } from 'svelte' */
/** @import { RenderOutput, SSRContext, SyncRenderOutput } from './types.js' */
import { async_mode_flag } from '../flags/index.js';
import { abort } from './abort-signal.js';
import { pop, push, set_ssr_context, ssr_context } from './context.js';
import * as e from './errors.js';
import * as w from './warnings.js';
import { BLOCK_CLOSE, BLOCK_OPEN } from './hydration.js';

/** @typedef {'head' | 'body'} RendererType */
/** @typedef {{ [key in RendererType]: string }} AccumulatedContent */
/**
 * @template T
 * @typedef {T | Promise<T>} MaybePromise<T>
 */
/**
 * @typedef {string | Renderer} RendererItem
 */

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
	 * The type of string content that this renderer is accumulating.
	 * @type {RendererType}
	 */
	type;

	/** @type {Renderer | undefined} */
	#parent;

	/**
	 * Asynchronous work associated with this renderer. `initial` is the promise from the function
	 * this renderer was passed to (if that function was async), and `followup` is any any additional
	 * work from `compact` calls that needs to complete prior to collecting this renderer's content.
	 * @type {{ initial: Promise<void> | undefined, followup: Promise<void>[] }}
	 */
	promises = { initial: undefined, followup: [] };

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
	 * @type {{ select_value: string | undefined }}
	 */
	local;

	/**
	 * @param {SSRState} global
	 * @param {Renderer | undefined} [parent]
	 * @param {RendererType} [type]
	 */
	constructor(global, parent, type) {
		this.global = global;
		this.local = parent ? { ...parent.local } : { select_value: undefined };
		this.#parent = parent;
		this.type = type ?? parent?.type ?? 'body';
	}

	/**
	 * Create a child renderer. The child renderer inherits the state from the parent,
	 * but has its own content.
	 * @param {(renderer: Renderer) => MaybePromise<void>} fn
	 * @param {RendererType} [type]
	 */
	child(fn, type) {
		const child = new Renderer(this.global, this, type);
		this.#out.push(child);

		const parent = ssr_context;

		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: child
		});

		const result = fn(child);

		set_ssr_context(parent);

		if (result instanceof Promise) {
			if (child.global.mode === 'sync') {
				e.await_invalid();
			}
			// just to avoid unhandled promise rejections -- we'll end up throwing in `collect_async` if something fails
			result.catch(() => {});
			child.promises.initial = result;
		}

		return child;
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
		const child = this.child(fn);
		child.#is_component_body = true;
		pop();
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
	 * Compact everything between `start` and `end` into a single renderer, then call `fn` with the result of that renderer.
	 * The compacted renderer will be sync if all of the children are sync and {@link fn} is sync, otherwise it will be async.
	 * @param {{ start: number, end?: number, fn: (content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent> }} args
	 */
	compact({ start, end = this.#out.length, fn }) {
		const child = new Renderer(this.global, this);
		const to_compact = this.#out.splice(start, end - start, child);

		if (this.global.mode === 'sync') {
			Renderer.#compact(fn, child, to_compact, this.type);
		} else {
			this.promises.followup.push(Renderer.#compact_async(fn, child, to_compact, this.type));
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
		const copy = new Renderer(this.global, this.#parent, this.type);
		copy.#out = this.#out.map((item) => (item instanceof Renderer ? item.copy() : item));
		copy.promises = this.promises;
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
		this.#out = other.#out.map((item) => {
			if (item instanceof Renderer) {
				item.subsume(item);
			}
			return item;
		});
		this.promises = other.promises;
		this.type = other.type;
	}

	get length() {
		return this.#out.length;
	}

	/**
	 * Only available on the server and when compiling with the `server` option.
	 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} [options]
	 * @returns {RenderOutput}
	 */
	static render(component, options = {}) {
		/** @type {AccumulatedContent | undefined} */
		let sync;
		/** @type {Promise<AccumulatedContent> | undefined} */
		let async;

		const result = /** @type {RenderOutput} */ ({});
		// making these properties non-enumerable so that console.logging
		// doesn't trigger a sync render
		Object.defineProperties(result, {
			html: {
				get: () => {
					return (sync ??= Renderer.#render(component, options)).body;
				}
			},
			head: {
				get: () => {
					return (sync ??= Renderer.#render(component, options)).head;
				}
			},
			body: {
				get: () => {
					return (sync ??= Renderer.#render(component, options)).body;
				}
			},
			then: {
				value:
					/**
					 * this is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
					 *
					 * @template TResult1
					 * @template [TResult2=never]
					 * @param { (value: SyncRenderOutput) => TResult1 } onfulfilled
					 * @param { (reason: unknown) => TResult2 } onrejected
					 */
					(onfulfilled, onrejected) => {
						if (!async_mode_flag) {
							w.experimental_async_ssr();
							const result = (sync ??= Renderer.#render(component, options));
							const user_result = onfulfilled({
								head: result.head,
								body: result.body,
								html: result.body
							});
							return Promise.resolve(user_result);
						}
						async ??= Renderer.#render_async(component, options);
						return async.then((result) => {
							Object.defineProperty(result, 'html', {
								// eslint-disable-next-line getter-return
								get: () => {
									e.html_deprecated();
								}
							});
							return onfulfilled(/** @type {SyncRenderOutput} */ (result));
						}, onrejected);
					}
			}
		});

		return result;
	}

	/**
	 * Collect all of the `onDestroy` callbacks regsitered during rendering. In an async context, this is only safe to call
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
	 * Render a component. Throws if any of the children are performing asynchronous work.
	 *
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	 * @returns {AccumulatedContent}
	 */
	static #render(component, options) {
		var previous_context = ssr_context;
		try {
			const renderer = Renderer.#open_render('sync', component, options);

			const content = Renderer.#collect_content([renderer], renderer.type);
			return Renderer.#close_render(content, renderer);
		} finally {
			abort();
			set_ssr_context(previous_context);
		}
	}

	/**
	 * Render a component.
	 *
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	 * @returns {Promise<AccumulatedContent>}
	 */
	static async #render_async(component, options) {
		var previous_context = ssr_context;
		try {
			const renderer = Renderer.#open_render('async', component, options);

			const content = await Renderer.#collect_content_async([renderer], renderer.type);
			return Renderer.#close_render(content, renderer);
		} finally {
			abort();
			set_ssr_context(previous_context);
		}
	}

	/**
	 * @param {(content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent>} fn
	 * @param {Renderer} child
	 * @param {RendererItem[]} to_compact
	 * @param {RendererType} type
	 */
	static #compact(fn, child, to_compact, type) {
		const content = Renderer.#collect_content(to_compact, type);
		const transformed_content = fn(content);
		if (transformed_content instanceof Promise) {
			throw new Error(
				"invariant: Somehow you've encountered asynchronous work while rendering synchronously. If you're seeing this, there's a compiler bug. File an issue!"
			);
		} else {
			Renderer.#push_accumulated_content(child, transformed_content);
		}
	}

	/**
	 * @param {(content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent>} fn
	 * @param {Renderer} child
	 * @param {RendererItem[]} to_compact
	 * @param {RendererType} type
	 */
	static async #compact_async(fn, child, to_compact, type) {
		const content = await Renderer.#collect_content_async(to_compact, type);
		const transformed_content = await fn(content);
		Renderer.#push_accumulated_content(child, transformed_content);
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
	 * @param {RendererItem[]} items
	 * @param {RendererType} current_type
	 * @param {AccumulatedContent} content
	 * @returns {AccumulatedContent}
	 */
	static #collect_content(items, current_type, content = { head: '', body: '' }) {
		for (const item of items) {
			if (typeof item === 'string') {
				content[current_type] += item;
			} else if (item instanceof Renderer) {
				Renderer.#collect_content(item.#out, item.type, content);
			}
		}
		return content;
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @param {RendererItem[]} items
	 * @param {RendererType} current_type
	 * @param {AccumulatedContent} content
	 * @returns {Promise<AccumulatedContent>}
	 */
	static async #collect_content_async(items, current_type, content = { head: '', body: '' }) {
		// no danger to sequentially awaiting stuff in here; all of the work is already kicked off
		for (const item of items) {
			if (typeof item === 'string') {
				content[current_type] += item;
			} else {
				if (item.promises.initial) {
					// this represents the async function that's modifying this renderer.
					// we can't do anything until it's done and we know our `out` array is complete.
					await item.promises.initial;
				}
				for (const followup of item.promises.followup) {
					// this is sequential because `compact` could synchronously queue up additional followup work
					await followup;
				}
				await Renderer.#collect_content_async(item.#out, item.type, content);
			}
		}
		return content;
	}

	/**
	 * @param {Renderer} tree
	 * @param {AccumulatedContent} accumulated_content
	 */
	static #push_accumulated_content(tree, accumulated_content) {
		for (const [type, content] of Object.entries(accumulated_content)) {
			if (!content) continue;
			const child = new Renderer(tree.global, tree, /** @type {RendererType} */ (type));
			child.push(content);
			tree.#out.push(child);
		}
	}

	/**
	 * @template {Record<string, any>} Props
	 * @param {'sync' | 'async'} mode
	 * @param {import('svelte').Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	 * @returns {Renderer}
	 */
	static #open_render(mode, component, options) {
		const renderer = new Renderer(
			new SSRState(mode, options.idPrefix ? options.idPrefix + '-' : '')
		);

		renderer.push(BLOCK_OPEN);

		if (options.context) {
			push();
			/** @type {SSRContext} */ (ssr_context).c = options.context;
			/** @type {SSRContext} */ (ssr_context).r = renderer;
		}

		// @ts-expect-error
		component(renderer, options.props ?? {});

		if (options.context) {
			pop();
		}

		renderer.push(BLOCK_CLOSE);

		return renderer;
	}

	/**
	 * @param {AccumulatedContent} content
	 * @param {Renderer} renderer
	 */
	static #close_render(content, renderer) {
		for (const cleanup of renderer.#collect_on_destroy()) {
			cleanup();
		}

		let head = content.head + renderer.global.get_title();

		const body = BLOCK_OPEN + content.body + BLOCK_CLOSE; // this inserts a fake boundary so hydration matches

		for (const { hash, code } of renderer.global.css) {
			head += `<style id="${hash}">${code}</style>`;
		}

		return {
			head,
			body
		};
	}
}

export class SSRState {
	/** @readonly @type {'sync' | 'async'} */
	mode;

	/** @readonly @type {() => string} */
	uid;

	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = new Set();

	/** @type {{ path: number[], value: string }} */
	#title = { path: [], value: '' };

	/**
	 * @param {'sync' | 'async'} mode
	 * @param {string} [id_prefix]
	 */
	constructor(mode, id_prefix = '') {
		this.mode = mode;

		let uid = 1;
		this.uid = () => `${id_prefix}s${uid++}`;
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
