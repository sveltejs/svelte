/** @import { Context, Visitor, Visitors } from 'zimmerframe' */
import { js } from '@teasel/parser';
import { grammar } from '../phases/1-parse/grammar.js';

/**
 * The fields holding nodes: the grammar's, the `tag` phase 1 promotes from `this`, and an await
 * block's in source order, which names made along a walk follow
 * @type {Record<string, readonly string[]>}
 */
export const CHILDREN = {
	...grammar.children,
	SvelteElement: [...grammar.children.SvelteElement, 'tag'],
	AwaitBlock: ['expression', 'pending', 'value', 'then', 'error', 'catch']
};

const EXTRAS = js.extras;

/**
 * @param {any} node
 * @returns {readonly string[]} the table's fields, or every field of a node the table cannot speak
 * for: one of a type it lacks, or one carrying TypeScript's extra fields
 */
function fields(node) {
	const listed = CHILDREN[node.type];
	if (listed !== undefined) {
		let plain = true;
		for (const key of EXTRAS) {
			if (node[key] != null) {
				plain = false;
				break;
			}
		}
		if (plain) return listed;
	}
	/** @type {string[]} */
	const keys = [];
	for (const key in node) {
		if (key !== 'type' && key !== '__proto__') keys.push(key);
	}
	return keys;
}

/**
 * zimmerframe's `walk`, reading a node's children off the fields its type holds them in.
 * @template {{ type: string }} T
 * @template {Record<string, any> | null} U
 * @param {T} node
 * @param {U} state
 * @param {Visitors<T, U>} visitors
 * @returns {T}
 */
export function walk(node, state, visitors) {
	const universal = visitors._;

	let stopped = false;

	const stop = () => {
		stopped = true;
	};

	/**
	 * @param {T} node
	 * @param {T[]} path
	 * @param {U} state
	 * @returns {T | undefined}
	 */
	function visit_children(node, path, state) {
		/** @type {T | undefined} */
		let clone;

		path.push(node);
		for (const key of fields(node)) {
			const child_node = /** @type {any} */ (node)[key];
			if (child_node && typeof child_node === 'object') {
				if (Array.isArray(child_node)) {
					/** @type {T[] | null} */
					let mutated_array = null;
					const len = child_node.length;

					for (let i = 0; i < len; i++) {
						const node = child_node[i];
						if (node && typeof node === 'object') {
							const result = visit(node, path, state);
							if (result) {
								(mutated_array ??= child_node.slice())[i] = result;
							}
						}
					}

					if (mutated_array) {
						/** @type {any} */ (clone ??= { ...node })[key] = mutated_array;
					}
				} else {
					const result = visit(child_node, path, state);
					if (result) {
						/** @type {any} */ (clone ??= { ...node })[key] = result;
					}
				}
			}
		}
		path.pop();

		return clone;
	}

	/**
	 * @param {T} node
	 * @param {T[]} path
	 * @param {U} state
	 * @returns {T | undefined}
	 */
	function visit(node, path, state) {
		// a node returned unchanged would read as a transformation
		if (stopped) return;
		if (!node.type) return;

		const visitor = /** @type {Visitor<T, U, T> | undefined} */ (
			visitors[/** @type {T['type']} */ (node.type)]
		);

		if (!universal && !visitor) {
			return visit_children(node, path, state);
		}

		/** @type {T | void} */
		let result;

		/** @type {T | undefined} */
		let next_result;

		/** @type {Context<T, U>['next']} */
		const next = (next_state = state) => (next_result = visit_children(node, path, next_state));

		/** @type {Context<T, U>['visit']} */
		const visit_node = (next_node, next_state = state) => {
			path.push(node);
			const result = visit(next_node, path, next_state) ?? next_node;
			path.pop();
			return result;
		};

		if (universal) {
			/** @type {T | void} */
			let inner_result;

			result = universal(node, {
				path,
				state,
				/** @param {U} next_state */
				next: (next_state = state) => {
					// the specialised visitor sees the state the universal one passed on
					state = next_state;

					inner_result = visitor
						? visitor(node, {
								path,
								state: next_state,
								next,
								stop,
								visit: visit_node
							})
						: next(next_state);

					return inner_result;
				},
				stop,
				visit: visit_node
			});

			// @ts-expect-error `context.next(...)` runs before the universal visitor returns
			if (!result && inner_result) {
				result = inner_result;
			}
		} else {
			result = /** @type {Visitor<T, U, T>} */ (visitor)(node, {
				path,
				state,
				next,
				stop,
				visit: visit_node
			});
		}

		if (!result && next_result) {
			result = next_result;
		}

		if (result) {
			return result;
		}
	}

	return visit(node, [], state) ?? node;
}
