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
 * @param {Node} container
 * @param {boolean} intro
 * @returns {import('./types.js').RootBlock}
 */
export function create_root_block(container, intro) {
	return {
		dom: null,
		effect: null,
		container,
		intro,
		parent: null,
		transition: null,
		type: ROOT_BLOCK
	};
}

/** @returns {import('./types.js').IfBlock} */
export function create_if_block() {
	return {
		current: false,
		dom: null,
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		transition: null,
		type: IF_BLOCK
	};
}

/** @returns {import('./types.js').KeyBlock} */
export function create_key_block() {
	return {
		dom: null,
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		transition: null,
		type: KEY_BLOCK
	};
}

/** @returns {import('./types.js').HeadBlock} */
export function create_head_block() {
	return {
		dom: null,
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		transition: null,
		type: HEAD_BLOCK
	};
}

/** @returns {import('./types.js').DynamicElementBlock} */
export function create_dynamic_element_block() {
	return {
		dom: null,
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		transition: null,
		type: DYNAMIC_ELEMENT_BLOCK
	};
}

/** @returns {import('./types.js').DynamicComponentBlock} */
export function create_dynamic_component_block() {
	return {
		dom: null,
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		transition: null,
		type: DYNAMIC_COMPONENT_BLOCK
	};
}

/** @returns {import('./types.js').AwaitBlock} */
export function create_await_block() {
	return {
		dom: null,
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		pending: true,
		transition: null,
		type: AWAIT_BLOCK
	};
}

/**
 * @param {number} flags
 * @param {Element | Comment} anchor
 * @returns {import('./types.js').EachBlock}
 */
export function create_each_block(flags, anchor) {
	return {
		anchor,
		dom: null,
		flags,
		items: [],
		effect: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		transition: null,
		transitions: [],
		type: EACH_BLOCK
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
		dom: null,
		effect: null,
		index,
		key,
		item,
		parent: /** @type {import('./types.js').EachBlock} */ (current_block),
		transition: null,
		transitions: null,
		type: EACH_ITEM_BLOCK
	};
}

/** @returns {import('./types.js').SnippetBlock} */
export function create_snippet_block() {
	return {
		dom: null,
		parent: /** @type {import('./types.js').Block} */ (current_block),
		effect: null,
		transition: null,
		type: SNIPPET_BLOCK
	};
}
