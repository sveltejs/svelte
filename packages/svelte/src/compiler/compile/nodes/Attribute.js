import { string_literal } from '../utils/stringify.js';
import add_to_set from '../utils/add_to_set.js';
import Node from './shared/Node.js';
import Expression from './shared/Expression.js';
import { x } from 'code-red';
import compiler_warnings from '../compiler_warnings.js';

/** @extends Node<'Attribute' | 'Spread', import('./Element.js').default> */
export default class Attribute extends Node {
	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/** @type {string} */
	name;

	/** @type {boolean} */
	is_spread;

	/** @type {boolean} */
	is_true;

	/** @type {boolean} */
	is_static;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {Array<import('./Text.js').default | import('./shared/Expression.js').default>} */
	chunks;

	/** @type {Set<string>} */
	dependencies;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.scope = scope;

		if (info.type === 'Spread') {
			this.name = null;
			this.is_spread = true;
			this.is_true = false;
			this.expression = new Expression(component, this, scope, info.expression);
			this.dependencies = this.expression.dependencies;
			this.chunks = null;
			this.is_static = false;
		} else {
			this.name = info.name;
			this.is_true = info.value === true;
			this.is_static = true;
			this.dependencies = new Set();
			this.chunks = this.is_true
				? []
				: info.value.map(
						/** @param {any} node */ (node) => {
							if (node.type === 'Text') return node;
							this.is_static = false;
							const expression = new Expression(component, this, scope, node.expression);
							add_to_set(this.dependencies, expression.dependencies);
							return expression;
						}
				  );
		}

		if (this.dependencies.size > 0) {
			parent.cannot_use_innerhtml();
			parent.not_static_content();
		}

		// TODO Svelte 5: Think about moving this into the parser and make it an error
		if (
			this.name &&
			this.name.includes(':') &&
			!this.name.startsWith('xmlns:') &&
			!this.name.startsWith('xlink:') &&
			!this.name.startsWith('xml:')
		) {
			component.warn(this, compiler_warnings.illegal_attribute_character);
		}
	}
	get_dependencies() {
		if (this.is_spread) return this.expression.dynamic_dependencies();

		/** @type {Set<string>} */
		const dependencies = new Set();
		this.chunks.forEach(
			/** @param {any} chunk */ (chunk) => {
				if (chunk.type === 'Expression') {
					add_to_set(dependencies, chunk.dynamic_dependencies());
				}
			}
		);
		return Array.from(dependencies);
	}

	/** @param {any} block */
	get_value(block) {
		if (this.is_true) return x`true`;
		if (this.chunks.length === 0) return x`""`;
		if (this.chunks.length === 1) {
			return this.chunks[0].type === 'Text'
				? string_literal(/** @type {import('./Text.js').default} */ (this.chunks[0]).data)
				: /** @type {import('./shared/Expression.js').default} */ (this.chunks[0]).manipulate(
						block
				  );
		}
		let expression = this.chunks
			.map(
				/** @param {any} chunk */ (chunk) =>
					chunk.type === 'Text' ? string_literal(chunk.data) : chunk.manipulate(block)
			)
			.reduce(
				/**
				 * @param {any} lhs
				 * @param {any} rhs
				 */ (lhs, rhs) => x`${lhs} + ${rhs}`
			);
		if (this.chunks[0].type !== 'Text') {
			expression = x`"" + ${expression}`;
		}
		return expression;
	}
	get_static_value() {
		if (!this.is_static) return null;
		return this.is_true
			? true
			: this.chunks[0]
			? // method should be called only when `is_static = true`
			  /** @type {import('./Text.js').default} */ (this.chunks[0]).data
			: '';
	}
	should_cache() {
		return this.is_static
			? false
			: this.chunks.length === 1
			? // @ts-ignore todo: probably error
			  this.chunks[0].node.type !== 'Identifier' || this.scope.names.has(this.chunks[0].node.name)
			: true;
	}
}
