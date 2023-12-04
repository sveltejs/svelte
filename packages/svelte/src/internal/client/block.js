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

/** @returns {import('./types.js').IfBlock} */
export function create_if_block() {
	return {
		// alternate transitions
		a: null,
		// alternate effect
		ae: null,
		// consequent transitions
		c: null,
		// consequent effect
		ce: null,
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('./types.js').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: IF_BLOCK,
		// value
		v: false
	};
}

/** @returns {import('./types.js').KeyBlock} */
export function create_key_block() {
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
		t: KEY_BLOCK
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

/** @returns {import('./types.js').AwaitBlock} */
export function create_await_block() {
	return {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('./types.js').Block} */ (current_block),
		// pending
		n: true,
		// transition
		r: null,
		// type
		t: AWAIT_BLOCK
	};
}

/**
 * @param {number} flags
 * @param {Element | Comment} anchor
 * @returns {import('./types.js').EachBlock}
 */
export function create_each_block(flags, anchor) {
	return {
		// anchor
		a: anchor,
		// dom
		d: null,
		// flags
		f: flags,
		// items
		v: [],
		// effect
		e: null,
		p: /** @type {import('./types.js').Block} */ (current_block),
		// transition
		r: null,
		// transitions
		s: [],
		// type
		t: EACH_BLOCK
	};
}

/**
 * @param {any | import('./types.js').Signal<any>} item
 * @param {number | import('./types.js').Signal<number>} index
 * @param {null | unknown} key
 * @returns {import('./types.js').EachItemBlock}
 */
export function create_each_item_block(item, index, key) {
	return {
		// dom
		d: null,
		// effect
		e: null,
		i: index,
		// key
		k: key,
		// item
		v: item,
		// parent
		p: /** @type {import('./types.js').EachBlock} */ (current_block),
		// transition
		r: null,
		// transitions
		s: null,
		// type
		t: EACH_ITEM_BLOCK
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
