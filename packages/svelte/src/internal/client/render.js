/** @import { ComponentContext, Effect, EffectNodes, TemplateNode } from '#client' */
/** @import { Component, ComponentType, SvelteComponent, MountOptions } from '../../index.js' */
/** @import { Renderer } from './custom-renderer/types.js' */
import { DEV } from 'esm-env';
import {
	clear_text_content,
	create_text,
	get_first_child,
	get_next_sibling,
	append_child,
	get_parent_node,
	remove_child,
	set_node_value,
	get_node_value,
	node_type
} from './dom/operations.js';
import { HYDRATION_END, HYDRATION_ERROR, HYDRATION_START } from '../../constants.js';
import { active_effect } from './runtime.js';
import { push, pop, component_context, mark_as_component } from './context.js';
import { component_root } from './reactivity/effects.js';
import { hydrate_node, hydrating, set_hydrate_node, set_hydrating } from './dom/hydration.js';
import { listen_to_delegated_events } from './dom/elements/events.js';
import * as w from './warnings.js';
import * as e from './errors.js';
import { assign_nodes } from './dom/template.js';
import { COMMENT_NODE, TEXT_CACHE } from './constants.js';
import { boundary } from './dom/blocks/boundary.js';
import { push_renderer, pop_renderer } from './custom-renderer/state.js';
import { async_mode_flag, custom_renderers_flag } from '../flags/index.js';
import { current_batch } from './reactivity/batch.js';

/**
 * This is normally true — block effects should run their intro transitions —
 * but is false during hydration (unless `options.intro` is `true`) and
 * when creating the children of a `<svelte:element>` that just changed tag
 */
export let should_intro = true;

/** @param {boolean} value */
export function set_should_intro(value) {
	should_intro = value;
}

/**
 * @param {Element} text
 * @param {string} value
 * @returns {void}
 */
export function set_text(text, value) {
	// For objects, we apply string coercion (which might make things like $state array references in the template reactive) before diffing
	var str = value == null ? '' : typeof value === 'object' ? `${value}` : value;
	// prettier-ignore
	if (str !== (/** @type {any} */ (text)[TEXT_CACHE] ??= get_node_value(text))) {
		/** @type {any} */ (text)[TEXT_CACHE] = str;
		set_node_value(text, `${str}`);
	}
}

/**
 * Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
 * Transitions will play during the initial render unless the `intro` option is set to `false`.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template [Renderer=undefined]
 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
 * @param {MountOptions<Props, Renderer>} options
 * @returns {Exports}
 */
export function mount(component, options) {
	return _mount(component, options);
}

/**
 * Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template [Renderer=undefined]
 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
 * @param {{} extends Props ? {
 * 		target: Document | Element | ShadowRoot;
 * 		props?: Props;
 * 		events?: Record<string, (e: any) => any>;
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 		recover?: boolean;
 *		transformError?: (error: unknown) => unknown;
 * 	} : {
 * 		target: Document | Element | ShadowRoot;
 * 		props: Props;
 * 		events?: Record<string, (e: any) => any>;
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 		recover?: boolean;
 *		transformError?: (error: unknown) => unknown;
 * 	}} options
 * @returns {Exports}
 */
// `Renderer` is unused, but the type parameters need to match `mount`'s,
// otherwise a `hydrate | mount` union isn't callable
export function hydrate(component, options) {
	options.intro = options.intro ?? false;
	const target = options.target;
	const was_hydrating = hydrating;
	const previous_hydrate_node = hydrate_node;

	try {
		var anchor = get_first_child(target);

		while (
			anchor &&
			(node_type(anchor) !== COMMENT_NODE || get_node_value(anchor) !== HYDRATION_START)
		) {
			anchor = get_next_sibling(anchor);
		}

		if (!anchor) {
			throw HYDRATION_ERROR;
		}

		set_hydrating(true);
		set_hydrate_node(/** @type {Comment} */ (anchor));

		const instance = _mount(component, { ...options, anchor });

		// The server rendered the hydrated DOM with the state that hydration ran with (set before `hydrate()`,
		// or while hydrating, e.g. by lazily initialized state), so that state is the real world from now on.
		// This is what happens when mounting, too, where the batch commits right away because the root boundary
		// is pending. Otherwise, while the hydration batch waits for async work, other batches' views would undo
		// those writes — e.g. that of a pending boundary's content, which renders in a batch of its own
		if (async_mode_flag && current_batch !== null) {
			current_batch.commit_writes();
		}

		set_hydrating(false);

		return /**  @type {Exports} */ (instance);
	} catch (error) {
		// re-throw Svelte errors - they are certainly not related to hydration
		if (
			error instanceof Error &&
			error.message.split('\n').some((line) => line.startsWith('https://svelte.dev/e/'))
		) {
			throw error;
		}
		if (error !== HYDRATION_ERROR) {
			// eslint-disable-next-line no-console
			console.warn('Failed to hydrate: ', error);
		}

		if (options.recover === false) {
			e.hydration_failed();
		}

		clear_text_content(target);

		set_hydrating(false);
		return mount(component, options);
	} finally {
		set_hydrating(was_hydrating);
		set_hydrate_node(previous_hydrate_node);
	}
}

/**
 * @template {Record<string, any>} Exports
 * @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
 * @param {MountOptions<any, any> & { renderer?: Renderer }} options
 * @returns {Exports}
 */
function _mount(Component, options) {
	if (custom_renderers_flag && options.renderer) {
		var previous_renderer = push_renderer(options.renderer);

		try {
			return _mount_inner(Component, options);
		} finally {
			pop_renderer(previous_renderer);
		}
	}

	return _mount_inner(Component, options);
}

/**
 * @template {Record<string, any>} Exports
 * @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
 * @param {MountOptions<any, any> & { renderer?: Renderer }} options
 * @returns {Exports}
 */
function _mount_inner(
	Component,
	{ target, anchor, props = {}, events, context, intro = true, transformError, renderer }
) {
	/** @type {Exports} */
	// @ts-expect-error will be defined because the render effect runs synchronously
	var component = undefined;

	var unmount = component_root(() => {
		var anchor_node =
			anchor ?? /** @type {Text} */ (append_child(/** @type {Node} */ (target), create_text()));

		boundary(
			/** @type {TemplateNode} */ (anchor_node),
			{
				pending: () => {}
			},
			(anchor_node) => {
				push({});
				var ctx = /** @type {ComponentContext} */ (component_context);
				if (context) ctx.c = context;

				if (events) {
					// We can't spread the object or else we'd lose the state proxy stuff, if it is one
					/** @type {any} */ (props).$$events = events;
				}

				if (hydrating) {
					assign_nodes(/** @type {TemplateNode} */ (anchor_node), null);
				}

				should_intro = intro;
				// @ts-expect-error the public typings are not what the actual function looks like
				component = Component(anchor_node, props) || mark_as_component();
				should_intro = true;

				if (hydrating) {
					/** @type {Effect & { nodes: EffectNodes }} */ (active_effect).nodes.end = hydrate_node;

					if (
						hydrate_node === null ||
						node_type(hydrate_node) !== COMMENT_NODE ||
						get_node_value(hydrate_node) !== HYDRATION_END
					) {
						w.hydration_mismatch();
						throw HYDRATION_ERROR;
					}
				}

				pop();
			},
			transformError
		);

		// Setup event delegation _after_ component is mounted - if an error would happen during mount, it would otherwise not be cleaned up.
		// When mounting with a custom renderer the target isn't a DOM node; any DOM content inside it is rendered
		// into DOM containers that become delegation roots themselves (see `cross`)
		var stop_listening = renderer
			? null
			: listen_to_delegated_events(/** @type {EventTarget} */ (target));

		return () => {
			stop_listening?.();

			if (anchor_node !== anchor) {
				var parent = get_parent_node(/** @type {Node} */ (anchor_node));
				if (parent) remove_child(parent, /** @type {ChildNode} */ (anchor_node));
			}
		};
	});

	mounted_components.set(component, unmount);
	return component;
}

/**
 * References of the components that were mounted or hydrated.
 * Uses a `WeakMap` to avoid memory leaks.
 */
let mounted_components = new WeakMap();

/**
 * Unmounts a component that was previously mounted using `mount` or `hydrate`.
 *
 * Since 5.13.0, if `options.outro` is `true`, [transitions](https://svelte.dev/docs/svelte/transition) will play before the component is removed from the DOM.
 *
 * Returns a `Promise` that resolves after transitions have completed if `options.outro` is true, or immediately otherwise (prior to 5.13.0, returns `void`).
 *
 * ```js
 * import { mount, unmount } from 'svelte';
 * import App from './App.svelte';
 *
 * const app = mount(App, { target: document.body });
 *
 * // later...
 * unmount(app, { outro: true });
 * ```
 * @param {Record<string, any>} component
 * @param {{ outro?: boolean }} [options]
 * @returns {Promise<void>}
 */
export function unmount(component, options) {
	const fn = mounted_components.get(component);

	if (fn) {
		mounted_components.delete(component);
		return fn(options);
	}

	if (DEV) {
		w.lifecycle_double_unmount();
	}

	return Promise.resolve();
}
