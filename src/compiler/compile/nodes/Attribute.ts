import { string_literal } from '../utils/stringify';
import add_to_set from '../utils/add_to_set';
import Component from '../Component';
import Node from './shared/Node';
import Element from './Element';
import Text from './Text';
import Expression from './shared/Expression';
import TemplateScope from './shared/TemplateScope';
import { x } from 'code-red';

export default class Attribute extends Node {
	type: 'Attribute' | 'Spread';
	start: number;
	end: number;
	scope: TemplateScope;

	component: Component;
	parent: Element;
	name: string;
	is_spread: boolean;
	is_true: boolean;
	is_static: boolean;
	expression?: Expression;
	chunks: Array<Text | Expression>;
	dependencies: Set<string>;

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
		}

		else {
			this.name = info.name;
			this.is_true = info.value === true;
			this.is_static = true;

			this.dependencies = new Set();

			this.chunks = this.is_true
				? []
				: info.value.map(node => {
					if (node.type === 'Text') return node;

					this.is_static = false;

					const expression = new Expression(component, this, scope, node.expression);

					add_to_set(this.dependencies, expression.dependencies);
					return expression;
				});
		}
	}

	get_dependencies() {
		if (this.is_spread) return this.expression.dynamic_dependencies();

		const dependencies: Set<string> = new Set();
		this.chunks.forEach(chunk => {
			if (chunk.type === 'Expression') {
				add_to_set(dependencies, chunk.dynamic_dependencies());
			}
		});

		return Array.from(dependencies);
	}

	get_value(block) {
		if (this.is_true) return x`true`;
		if (this.chunks.length === 0) return x`""`;

		if (this.chunks.length === 1) {
			return this.chunks[0].type === 'Text'
				? string_literal((this.chunks[0] as Text).data)
				: (this.chunks[0] as Expression).manipulate(block);
		}

		let expression = this.chunks
			.map(chunk => chunk.type === 'Text' ? string_literal(chunk.data) : chunk.manipulate(block))
			.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);

		if (this.chunks[0].type !== 'Text') {
			expression = x`"" + ${expression}`;
		}

		return expression;
	}

	get_static_value() {
		if (this.is_spread || this.dependencies.size > 0) return null;

		return this.is_true
			? true
			: this.chunks[0]
				// method should be called only when `is_static = true`
				? (this.chunks[0] as Text).data
				: '';
	}

	should_cache() {
		return this.is_static
			? false
			: this.chunks.length === 1
				// @ts-ignore todo: probably error
				? this.chunks[0].node.type !== 'Identifier' || this.scope.names.has(this.chunks[0].node.name)
				: true;
	}
}
