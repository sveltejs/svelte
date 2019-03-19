import { stringify } from '../utils/stringify';
import add_to_set from '../utils/add_to_set';
import Component from '../Component';
import Node from './shared/Node';
import Element from './Element';
import Text from './Text';
import Expression from './shared/Expression';

export default class Attribute extends Node {
	type: 'Attribute';
	start: number;
	end: number;

	component: Component;
	parent: Element;
	name: string;
	is_spread: boolean;
	is_true: boolean;
	is_dynamic: boolean;
	is_static: boolean;
	is_synthetic: boolean;
	should_cache: boolean;
	expression?: Expression;
	chunks: (Text | Expression)[];
	dependencies: Set<string>;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		if (info.type === 'Spread') {
			this.name = null;
			this.is_spread = true;
			this.is_true = false;
			this.is_synthetic = false;

			this.expression = new Expression(component, this, scope, info.expression);
			this.dependencies = this.expression.dependencies;
			this.chunks = null;

			this.is_dynamic = true; // TODO not necessarily
			this.is_static = false;
			this.should_cache = false; // TODO does this mean anything here?
		}

		else {
			this.name = info.name;
			this.is_true = info.value === true;
			this.is_static = true;
			this.is_synthetic = info.synthetic;

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

			this.is_dynamic = this.dependencies.size > 0;

			this.should_cache = this.is_dynamic
				? this.chunks.length === 1
					? this.chunks[0].node.type !== 'Identifier' || scope.names.has(this.chunks[0].node.name)
					: true
				: false;
		}
	}

	get_dependencies() {
		if (this.is_spread) return this.expression.dynamic_dependencies();

		const dependencies = new Set();
		this.chunks.forEach(chunk => {
			if (chunk.type === 'Expression') {
				add_to_set(dependencies, chunk.dynamic_dependencies());
			}
		});

		return Array.from(dependencies);
	}

	get_value(block) {
		if (this.is_true) return true;
		if (this.chunks.length === 0) return `""`;

		if (this.chunks.length === 1) {
			return this.chunks[0].type === 'Text'
				? stringify(this.chunks[0].data)
				: this.chunks[0].render(block);
		}

		return (this.chunks[0].type === 'Text' ? '' : `"" + `) +
			this.chunks
				.map(chunk => {
					if (chunk.type === 'Text') {
						return stringify(chunk.data);
					} else {
						return chunk.get_precedence() <= 13 ? `(${chunk.render()})` : chunk.render();
					}
				})
				.join(' + ');
	}

	get_static_value() {
		if (this.is_spread || this.is_dynamic) return null;

		return this.is_true
			? true
			: this.chunks[0]
				? this.chunks[0].data
				: '';
	}
}
