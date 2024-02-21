import {
	ROOT_BLOCK,
	HEAD_BLOCK,
	DYNAMIC_ELEMENT_BLOCK,
	DYNAMIC_COMPONENT_BLOCK,
	SNIPPET_BLOCK
} from './constants.js';
import { current_block } from './runtime.js';

/**
 * @param {boolean} intro
 * @returns {import('./types.js').RootBlock}
 */
export function create_root_block(intro) {
	return {
		// dom
		d: null,
		// effect
		e: null,
		// intro
		i: intro,
		// parent
		p: null,
		// transition
		r: null,
		// type
		t: ROOT_BLOCK
	};
}

/** @returns {import('./types.js').HeadBlock} */
export function create_head_block() {
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
		t: HEAD_BLOCK
	};
}

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

/** @returns {import('./types.js').DynamicComponentBlock} */
export function create_dynamic_component_block() {
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
		t: DYNAMIC_COMPONENT_BLOCK
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
