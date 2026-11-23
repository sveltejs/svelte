/** @import { Renderer } from '../../custom-renderer/types.js' */
/** @import { Snippet } from 'svelte' */
/** @import { TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
import { EFFECT_TRANSPARENT, ELEMENT_NODE } from '#client/constants';
import { block, teardown } from '../../reactivity/effects.js';
import {
	component_context,
	dev_current_component_function,
	dev_stack,
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
import { current_renderer } from '../../custom-renderer/state.js';
import { cross, is_crossing } from '../../custom-renderer/cross.js';
import { has_own_property } from '../../../shared/utils.js';

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
 * Wraps a snippet function so that it remembers which renderer it was compiled for
 * (`null` for DOM). If it is rendered by a different renderer, the snippet content
 * is rendered across a renderer boundary (see `cross`).
 * @template {(...args: any[]) => any} T
 * @param {Renderer | null} renderer
 * @param {T} fn
 * @returns {T}
 */
export function renderer_snippet(renderer, fn) {
	var wrapped = /** @type {T} */ (
		(/** @type {TemplateNode} */ anchor, /** @type {any[]} */ ...args) => {
			if (is_crossing(renderer)) {
				return cross(renderer, anchor, (anchor) => fn(anchor, ...args));
			}

			return fn(anchor, ...args);
		}
	);

	/** @type {any} */ (wrapped).__renderer = renderer;

	return wrapped;
}

/**
 * Validates that a snippet can be rendered by a custom renderer. Snippets compiled with
 * custom renderer support know which renderer they belong to and can cross renderer
 * boundaries; anything else (e.g. snippets from components compiled without the
 * `experimental.customRenderer` option) can only be rendered by the DOM.
 * @template {((...args: any[]) => void) | null | undefined} T
 * @param {T} fn
 * @returns {T}
 */
export function validate_snippet_renderer(fn) {
	if (fn != null && !has_own_property.call(fn, '__renderer')) {
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
		if (current_renderer != null) {
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

		if (DEV && dev_stack !== null) {
			// Raw snippets have no template locations, so use the render callsite.
			// This also keeps the surrounding template from claiming their root.
			// @ts-expect-error
			element.__svelte_meta = {
				parent: dev_stack,
				loc: { file: dev_stack.file, line: dev_stack.line, column: dev_stack.column },
				component: component_context
			};
		}

		const result = snippet.setup?.(element);
		assign_nodes(element, element);

		if (typeof result === 'function') {
			teardown(result);
		}
	};
}
