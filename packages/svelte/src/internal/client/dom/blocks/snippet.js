/** @import { Snippet } from 'svelte' */
/** @import { Effect, TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
import { EFFECT_TRANSPARENT } from '../../constants.js';
import { branch, block, destroy_effect, teardown } from '../../reactivity/effects.js';
import {
	dev_current_component_function,
	set_dev_current_component_function
} from '../../runtime.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { create_fragment_from_html } from '../reconciler.js';
import { assign_nodes } from '../template.js';
import * as w from '../../warnings.js';
import { DEV } from 'esm-env';
import { get_first_child, get_next_sibling } from '../operations.js';

/**
 * @template {(node: TemplateNode, ...args: any[]) => void} SnippetFn
 * @param {TemplateNode} node
 * @param {() => SnippetFn | null | undefined} get_snippet
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(node, get_snippet, ...args) {
	var anchor = node;

	/** @type {SnippetFn | null | undefined} */
	var snippet;

	/** @type {Effect | null} */
	var snippet_effect;

	block(() => {
		if (snippet === (snippet = get_snippet())) return;

		if (snippet_effect) {
			destroy_effect(snippet_effect);
			snippet_effect = null;
		}

		if (snippet) {
			snippet_effect = branch(() => /** @type {SnippetFn} */ (snippet)(anchor, ...args));
		}
	}, EFFECT_TRANSPARENT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 * In development, wrap the snippet function so that it passes validation, and so that the
 * correct component context is set for ownership checks
 * @param {any} component
 * @param {(node: TemplateNode, ...args: any[]) => void} fn
 */
export function wrap_snippet(component, fn) {
	return (/** @type {TemplateNode} */ node, /** @type {any[]} */ ...args) => {
		var previous_component_function = dev_current_component_function;
		set_dev_current_component_function(component);

		try {
			return fn(node, ...args);
		} finally {
			set_dev_current_component_function(previous_component_function);
		}
	};
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

			if (DEV && (get_next_sibling(element) !== null || element.nodeType !== 1)) {
				w.invalid_raw_snippet_render();
			}

			anchor.before(element);
		}

		const result = snippet.setup?.(element);
		assign_nodes(element, element);

		if (typeof result === 'function') {
			teardown(result);
		}
	};
}
