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
		for (let i = 0; i < EXTRAS.length; i++) {
			if (node[EXTRAS[i]] != null) {
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
 * @template {string} T
 * @template X
 * @typedef {X extends { type: T } ? X : never} NodeOf
 */

/**
 * @template T
 * @template U
 * @template {{ type: string }} V
 * @typedef {(node: T, context: Context<V, U>) => V | void} Visitor
 */

/**
 * A visitor per node type under its name, and `_` for every node, which runs first and hands on
 * with its `next`.
 * @template {{ type: string }} T
 * @template U
 * @typedef {T['type'] extends '_' ? never : { [K in T['type']]?: Visitor<NodeOf<K, T>, U, T> } & { _?: Visitor<T, U, T> }} Visitors
 */

/**
 * What a visitor is handed: the node's place and state, and the walk to continue. One object per
 * visit, its methods shared: a literal and three closures per visit were a sixth of all allocation.
 * @template {{ type: string }} T
 * @template U
 */
export class Context {
	/** @type {T[]} */
	path;
	/** @type {U} */
	state;
	/** @type {T | void} */
	result = undefined;
	/**
	 * @param {Walker<T, U>} walker
	 * @param {T} node
	 * @param {T[]} path
	 * @param {U} state
	 */
	constructor(walker, node, path, state) {
		this.walker = walker;
		this.node = node;
		this.path = path;
		this.state = state;
	}
	/**
	 * @param {U} [state]
	 * @returns {T | void}
	 */
	next(state = this.state) {
		return (this.result = this.walker.visit_children(this.node, this.path, state));
	}
	/**
	 * @param {T} node
	 * @param {U} [state]
	 */
	visit(node, state = this.state) {
		const path = this.path;
		path.push(this.node);
		const result = this.walker.visit(node, path, state) ?? node;
		path.pop();
		return result;
	}
	stop() {
		this.walker.stopped = true;
	}
	/**
	 * This context with another state, for the visits made from here.
	 * @param {U} state
	 */
	with(state) {
		return new Context(this.walker, this.node, this.path, state);
	}
}

/**
 * The universal visitor's context: its `next` runs the node's own visitor with the state it passes on.
 * @template {{ type: string }} T
 * @template U
 * @extends {Context<T, U>}
 */
class Universal extends Context {
	/** @type {Context<T, U> | undefined} */
	inner = undefined;
	/**
	 * @param {U} [state]
	 * @returns {T | void}
	 */
	next(state = this.state) {
		const inner = (this.inner = new Context(this.walker, this.node, this.path, state));
		const visitor = /** @type {Visitor<T, U, T> | undefined} */ (
			this.walker.visitors[/** @type {T['type']} */ (this.node.type)]
		);
		return (this.result = visitor ? visitor(this.node, inner) : inner.next(state));
	}
}

/**
 * @template {{ type: string }} T
 * @template U
 */
class Walker {
	stopped = false;
	/**
	 * @param {Visitors<T, U>} visitors
	 */
	constructor(visitors) {
		this.visitors = visitors;
		this.universal = visitors._;
	}

	/**
	 * @param {T} node
	 * @param {T[]} path
	 * @param {U} state
	 * @returns {T | undefined}
	 */
	visit_children(node, path, state) {
		/** @type {T | undefined} */
		let clone;

		path.push(node);
		// indexed: for...of allocated an iterator result per field
		const keys = fields(node);
		for (let k = 0; k < keys.length; k++) {
			const key = keys[k];
			const child_node = /** @type {any} */ (node)[key];
			if (child_node && typeof child_node === 'object') {
				if (Array.isArray(child_node)) {
					/** @type {T[] | null} */
					let mutated_array = null;
					const len = child_node.length;

					for (let i = 0; i < len; i++) {
						const node = child_node[i];
						if (node && typeof node === 'object') {
							const result = this.visit(node, path, state);
							if (result) {
								(mutated_array ??= child_node.slice())[i] = result;
							}
						}
					}

					if (mutated_array) {
						/** @type {any} */ (clone ??= { ...node })[key] = mutated_array;
					}
				} else {
					const result = this.visit(child_node, path, state);
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
	visit(node, path, state) {
		// a node returned unchanged would read as a transformation
		if (this.stopped) return;
		if (!(/** @type {any} */ (node).type)) return;

		const universal = this.universal;
		const visitor = /** @type {Visitor<T, U, T> | undefined} */ (
			this.visitors[/** @type {T['type']} */ (node.type)]
		);

		if (!universal && !visitor) {
			return this.visit_children(node, path, state);
		}

		/** @type {Context<T, U>} */
		let context;
		/** @type {T | void} */
		let result;
		if (universal) {
			const outer = new Universal(this, node, path, state);
			result = universal(node, outer);
			// the node's own visitor ran inside the universal's `next`: what it returned stands
			// before the clone its children made
			if (!result && outer.result) result = outer.result;
			context = outer.inner ?? outer;
		} else {
			context = new Context(this, node, path, state);
			result = /** @type {Visitor<T, U, T>} */ (visitor)(node, context);
		}

		if (!result && context.result) {
			result = context.result;
		}

		if (result) {
			return result;
		}
	}
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
	return new Walker(visitors).visit(node, [], state) ?? node;
}
