/** @import { Component } from 'svelte' */
/** @import { Csp, HydratableContext, RenderOutput, SSRContext, SyncRenderOutput, Sha256Source } from './types.js' */
/** @import { MaybePromise } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { abort } from './abort-signal.js';
import { pop, push, set_ssr_context, ssr_context, save } from './context.js';
import * as e from './errors.js';
import * as w from './warnings.js';
import { BLOCK_CLOSE, BLOCK_OPEN } from './hydration.js';
import { attributes } from './index.js';
import { get_render_context, with_render_context, init_render_context } from './render-context.js';
import { sha256 } from './crypto.js';
import * as devalue from 'devalue';
import { noop } from '../shared/utils.js';

/** @typedef {'head' | 'body'} RendererType */
/** @typedef {{ [key in RendererType]: string }} AccumulatedContent */

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
	 * @type {{ select_value: string | undefined }}
	 */
	local;

	/**
	 * @param {SSRState} global
	 * @param {Renderer | undefined} [parent]
	 */
	constructor(global, parent) {
		this.#parent = parent;

		this.global = global;
		this.local = parent ? { ...parent.local } : { select_value: undefined };
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
		this.promise = promise;

		return promises;
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
			child.promise = result;
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
		const { value, ...select_attrs } = attrs;

		this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags)}>`);
		this.child((renderer) => {
			renderer.local.select_value = value;
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
			if ('value' in attrs) {
				value = attrs.value;
			}

			if (value === this.local.select_value) {
				renderer.#out.push(' selected');
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
			close(this, body, { body });
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
		this.#out = other.#out.map((item) => {
			if (item instanceof Renderer) {
				item.subsume(item);
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
	 * Only available on the server and when compiling with the `server` option.
	 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
	 * @template {Record<string, any>} Props
	 * @param {Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} [options]
	 * @returns {RenderOutput}
	 */
	static render(component, options = {}) {
		/** @type {AccumulatedContent | undefined} */
		let sync;
		/** @type {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }> | undefined} */
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
			hashes: {
				value: {
					script: ''
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
							const result = (sync ??= Renderer.#render(component, options));
							const user_result = onfulfilled({
								head: result.head,
								body: result.body,
								html: result.body,
								hashes: { script: [] }
							});
							return Promise.resolve(user_result);
						}
						async ??= init_render_context().then(() =>
							with_render_context(() => Renderer.#render_async(component, options))
						);
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

			const content = renderer.#collect_content();
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
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
	 * @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>}
	 */
	static async #render_async(component, options) {
		const previous_context = ssr_context;

		try {
			const renderer = Renderer.#open_render('async', component, options);
			const content = await renderer.#collect_content_async();
			const hydratables = await renderer.#collect_hydratables();
			if (hydratables !== null) {
				content.head = hydratables + content.head;
			}
			return Renderer.#close_render(content, renderer);
		} finally {
			set_ssr_context(previous_context);
			abort();
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
				await item.#collect_content_async(content);
			}
		}

		return content;
	}

	async #collect_hydratables() {
		const ctx = get_render_context().hydratable;

		for (const [_, key] of ctx.unresolved_promises) {
			// this is a problem -- it means we've finished the render but we're still waiting on a promise to resolve so we can
			// serialize it, so we're blocking the response on useless content.
			w.unresolved_hydratable(key, ctx.lookup.get(key)?.stack ?? '<missing stack trace>');
		}

		for (const comparison of ctx.comparisons) {
			// these reject if there's a mismatch
			await comparison;
		}

		return await this.#hydratable_block(ctx);
	}

	/**
	 * @template {Record<string, any>} Props
	 * @param {'sync' | 'async'} mode
	 * @param {import('svelte').Component<Props>} component
	 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
	 * @returns {Renderer}
	 */
	static #open_render(mode, component, options) {
		const renderer = new Renderer(
			new SSRState(mode, options.idPrefix ? options.idPrefix + '-' : '', options.csp)
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
	 * @returns {AccumulatedContent & { hashes: { script: Sha256Source[] } }}
	 */
	static #close_render(content, renderer) {
		for (const cleanup of renderer.#collect_on_destroy()) {
			cleanup();
		}

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

	/**
	 * @param {HydratableContext} ctx
	 */
	async #hydratable_block(ctx) {
		if (ctx.lookup.size === 0) {
			return null;
		}

		let entries = [];
		let has_promises = false;

		for (const [k, v] of ctx.lookup) {
			if (v.promises) {
				has_promises = true;
				for (const p of v.promises) await p;
			}

			entries.push(`[${devalue.uneval(k)},${v.serialized}]`);
		}

		let prelude = `const h = (window.__svelte ??= {}).h ??= new Map();`;

		if (has_promises) {
			prelude = `const r = (v) => Promise.resolve(v);
				${prelude}`;
		}

		const body = `
			{
				${prelude}

				for (const [k, v] of [
					${entries.join(',\n\t\t\t\t\t')}
				]) {
					h.set(k, v);
				}
			}
		`;

		let csp_attr = '';
		if (this.global.csp.nonce) {
			csp_attr = ` nonce="${this.global.csp.nonce}"`;
		} else if (this.global.csp.hash) {
			// note to future selves: this doesn't need to be optimized with a Map<body, hash>
			// because the it's impossible for identical data to occur multiple times in a single render
			// (this would require the same hydratable key:value pair to be serialized multiple times)
			const hash = await sha256(body);
			this.global.csp.script_hashes.push(`sha256-${hash}`);
		}

		return `\n\t\t<script${csp_attr}>${body}</script>`;
	}
}

export class SSRState {
	/** @readonly @type {Csp & { script_hashes: Sha256Source[] }} */
	csp;

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
	 * @param {string} id_prefix
	 * @param {Csp} csp
	 */
	constructor(mode, id_prefix = '', csp = { hash: false }) {
		this.mode = mode;
		this.csp = { ...csp, script_hashes: [] };

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
