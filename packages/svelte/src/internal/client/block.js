import { current_block } from './runtime.js';

export const ROOT_BLOCK = 0;
export const IF_BLOCK = 1;
export const EACH_BLOCK = 2;
export const EACH_ITEM_BLOCK = 3;
export const AWAIT_BLOCK = 4;
export const KEY_BLOCK = 5;
export const HEAD_BLOCK = 6;
export const DYNAMIC_COMPONENT_BLOCK = 7;
export const DYNAMIC_ELEMENT_BLOCK = 8;
export const SNIPPET_BLOCK = 9;

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
