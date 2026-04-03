/** @import { Snippet } from 'svelte' */
/** @import { TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
import { EFFECT_TRANSPARENT, ELEMENT_NODE } from '#client/constants';
import { block, teardown } from '../../reactivity/effects.js';
import {
	dev_current_component_function,
	set_dev_current_component_function
} from '../../context.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { create_fragment_from_html } from '../reconciler.js';
import { assign_nodes } from '../template.js';
import * as w from '../../warnings.js';
import * as e from '../../errors.js';
import { DEV } from 'esm-env';
import { get_first_child, get_next_sibling, insert_before, node_type } from '../operations.js';
import { prevent_snippet_stringification } from '../../../shared/validate.js';
import { BranchManager } from './branches.js';
import { renderer } from '../../custom-renderer/state.js';

/**
 * @template {(node: TemplateNode, ...args: any[]) => void} SnippetFn
 * @param {TemplateNode} node
 * @param {() => SnippetFn | null | undefined} get_snippet
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(node, get_snippet, ...args) {
	var branches = new BranchManager(node);

	block(() => {
		const snippet = get_snippet() ?? null;

		if (DEV && snippet == null) {
			e.invalid_snippet();
		}

		branches.ensure(snippet, snippet && ((anchor) => snippet(anchor, ...args)));
	}, EFFECT_TRANSPARENT);
}

/**
 * In development, wrap the snippet function so that it passes validation, and so that the
 * correct component context is set for ownership checks
 * @param {any} component
 * @param {(node: TemplateNode, ...args: any[]) => void} fn
 */
export function wrap_snippet(component, fn) {
	const snippet = (/** @type {TemplateNode} */ node, /** @type {any[]} */ ...args) => {
		var previous_component_function = dev_current_component_function;
		set_dev_current_component_function(component);

		try {
			return fn(node, ...args);
		} finally {
			set_dev_current_component_function(previous_component_function);
		}
	};

	prevent_snippet_stringification(snippet);

	return snippet;
}

/**
 * Wraps a snippet function created in a component with a custom renderer,
 * ensuring it can only be rendered by the same renderer.
 * @template {(...args: any[]) => void} T
 * @param {any} expected_renderer
 * @param {T} fn
 * @returns {T}
 */
export function renderer_snippet(expected_renderer, fn) {
	var wrapped = /** @type {T} */ (
		(.../** @type {any[]} */ args) => {
			if (renderer !== expected_renderer) {
				e.snippet_renderer_mismatch();
			}
			return fn(...args);
		}
	);
	// we could technically avoid checking for expected_renderer in the function
	// and store it in the returned function to check with `validate_snippet_renderer`
	// but this keeps all the changes on the custom renderer side and leave the paths
	// of "normal svelte" untouched...since that's the default people are gonna use
	// svelte with we should optimize for that case
	/** @type {any} */ (wrapped).__renderer = expected_renderer;

	return wrapped;
}

/**
 * Validates that a snippet function is compatible with the given renderer.
 * Used at render sites in custom renderer components.
 * @template {((...args: any[]) => void) | null | undefined} T
 * @param {any} expected_renderer
 * @param {T} fn
 * @returns {T}
 */
export function validate_snippet_renderer(expected_renderer, fn) {
	if (fn != null && /** @type {any} */ (fn).__renderer !== expected_renderer) {
		e.snippet_renderer_mismatch();
	}
	return fn;
}

/**
 * Create a snippet programmatically
 * @template {unknown[]} Params
 * @param {(...params: Getters<Params>) => {
 *   render: () => string
 *   setup?: (element: Element) => void | (() => void)
 * }} fn
 * @returns {Snippet<Params>}
 */
export function createRawSnippet(fn) {
	// @ts-expect-error the types are a lie
	return (/** @type {TemplateNode} */ anchor, /** @type {Getters<Params>} */ ...params) => {
		if (renderer != null) {
			e.invalid_snippet_in_custom_renderer();
		}
		var snippet = fn(...params);

		/** @type {Element} */
		var element;

		if (hydrating) {
			element = /** @type {Element} */ (hydrate_node);
			hydrate_next();
		} else {
			var html = snippet.render().trim();
			var fragment = create_fragment_from_html(html);
			element = /** @type {Element} */ (get_first_child(fragment));

			if (DEV && (get_next_sibling(element) !== null || node_type(element) !== ELEMENT_NODE)) {
				w.invalid_raw_snippet_render();
			}

			insert_before(anchor, element);
		}

		const result = snippet.setup?.(element);
		assign_nodes(element, element);

		if (typeof result === 'function') {
			teardown(result);
		}
	};
}
