/** @import { Effect, TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
import { add_snippet_symbol } from '../../../shared/validate.js';
import { EFFECT_TRANSPARENT } from '../../constants.js';
import { branch, block, destroy_effect } from '../../reactivity/effects.js';
import {
	dev_current_component_function,
	set_dev_current_component_function
} from '../../runtime.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { assign_nodes } from '../template.js';

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
	return add_snippet_symbol((/** @type {TemplateNode} */ node, /** @type {any[]} */ ...args) => {
		var previous_component_function = dev_current_component_function;
		set_dev_current_component_function(component);

		try {
			return fn(node, ...args);
		} finally {
			set_dev_current_component_function(previous_component_function);
		}
	});
}

/**
 * Create a snippet imperatively using mount, hyrdate and render functions.
 * @template {unknown[]} Params
 * @param {{
 * 	 mount: (...params: Getters<Params>) => Element,
 *   hydrate?: (element: Element, ...params: Getters<Params>) => void,
 *   render: (...params: Params) => string
 * }} options
 * @returns {import('svelte').Snippet<Params>}
 */
export function createRawSnippet({ mount, hydrate }) {
	return add_snippet_symbol(
		(/** @type {TemplateNode} */ anchor, /** @type {Getters<Params>} */ ...params) => {
			/** @type {Element} */
			var element;

			if (hydrating) {
				element = /** @type {Element} */ (hydrate_node);
				hydrate_next();

				if (hydrate === undefined) {
					element.replaceWith((element = mount(...params)));
				} else {
					hydrate(element, ...params);
				}
			} else {
				element = mount(...params);
				anchor.before(element);
			}

			assign_nodes(element, element);
		}
	);
}
