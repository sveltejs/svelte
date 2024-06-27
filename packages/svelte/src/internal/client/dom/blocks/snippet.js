import { add_snippet_symbol } from '../../../shared/validate.js';
import { EFFECT_TRANSPARENT } from '../../constants.js';
import { branch, block, destroy_effect } from '../../reactivity/effects.js';
import {
	dev_current_component_function,
	set_dev_current_component_function
} from '../../runtime.js';

/**
 * @template {(node: import('#client').TemplateNode, ...args: any[]) => import('#client').Dom} SnippetFn
 * @param {import('#client').TemplateNode} anchor
 * @param {() => SnippetFn | null | undefined} get_snippet
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(anchor, get_snippet, ...args) {
	/** @type {SnippetFn | null | undefined} */
	var snippet;

	/** @type {import('#client').Effect | null} */
	var snippet_effect;

	block(anchor, EFFECT_TRANSPARENT, () => {
		if (snippet === (snippet = get_snippet())) return;

		if (snippet_effect) {
			destroy_effect(snippet_effect);
			snippet_effect = null;
		}

		if (snippet) {
			snippet_effect = branch(() => /** @type {SnippetFn} */ (snippet)(anchor, ...args));
		}
	});
}

/**
 * In development, wrap the snippet function so that it passes validation, and so that the
 * correct component context is set for ownership checks
 * @param {(node: import('#client').TemplateNode, ...args: any[]) => import('#client').Dom} fn
 * @param {any} component
 */
export function wrap_snippet(fn, component) {
	return add_snippet_symbol(
		(/** @type {import('#client').TemplateNode} */ node, /** @type {any[]} */ ...args) => {
			var previous_component_function = dev_current_component_function;
			set_dev_current_component_function(component);

			try {
				return fn(node, ...args);
			} finally {
				set_dev_current_component_function(previous_component_function);
			}
		}
	);
}
