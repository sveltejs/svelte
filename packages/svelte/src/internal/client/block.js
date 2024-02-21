import {
	ROOT_BLOCK,
	HEAD_BLOCK,
	DYNAMIC_ELEMENT_BLOCK,
	DYNAMIC_COMPONENT_BLOCK,
	SNIPPET_BLOCK
} from './constants.js';
import { current_block } from './runtime.js';

/** @returns {import('./types.js').DynamicElementBlock} */
export function create_dynamic_element_block() {
	return {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('./types.js').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: DYNAMIC_ELEMENT_BLOCK
	};
}

/** @returns {import('./types.js').SnippetBlock} */
export function create_snippet_block() {
	return {
		// dom
		d: null,
		// parent
		p: /** @type {import('./types.js').Block} */ (current_block),
		// effect
		e: null,
		// transition
		r: null,
		// type
		t: SNIPPET_BLOCK
	};
}
