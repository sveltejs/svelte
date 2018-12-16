import { stringify } from '../../utils/stringify';
import addToSet from '../../utils/addToSet';
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
	isSpread: boolean;
	isTrue: boolean;
	isDynamic: boolean;
	isStatic: boolean;
	isSynthetic: boolean;
	shouldCache: boolean;
	expression?: Expression;
	chunks: (Text | Expression)[];
	dependencies: Set<string>;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		if (info.type === 'Spread') {
			this.name = null;
			this.isSpread = true;
			this.isTrue = false;
			this.isSynthetic = false;

			this.expression = new Expression(component, this, scope, info.expression);
			this.dependencies = this.expression.dynamic_dependencies;
			this.chunks = null;

			this.isDynamic = true; // TODO not necessarily
			this.isStatic = false;
			this.shouldCache = false; // TODO does this mean anything here?
		}

		else {
			this.name = info.name;
			this.isTrue = info.value === true;
			this.isStatic = true;
			this.isSynthetic = info.synthetic;

			this.dependencies = new Set();

			this.chunks = this.isTrue
				? []
				: info.value.map(node => {
					if (node.type === 'Text') return node;

					this.isStatic = false;

					const expression = new Expression(component, this, scope, node.expression);

					addToSet(this.dependencies, expression.dynamic_dependencies);
					return expression;
				});

			this.isDynamic = this.dependencies.size > 0;

			this.shouldCache = this.isDynamic
				? this.chunks.length === 1
					? this.chunks[0].node.type !== 'Identifier' || scope.names.has(this.chunks[0].node.name)
					: true
				: false;
		}
	}

	getValue() {
		if (this.isTrue) return true;
		if (this.chunks.length === 0) return `""`;

		if (this.chunks.length === 1) {
			return this.chunks[0].type === 'Text'
				? stringify(this.chunks[0].data)
				: this.chunks[0].render();
		}

		return (this.chunks[0].type === 'Text' ? '' : `"" + `) +
			this.chunks
				.map(chunk => {
					if (chunk.type === 'Text') {
						return stringify(chunk.data);
					} else {
						return chunk.getPrecedence() <= 13 ? `(${chunk.render()})` : chunk.render();
					}
				})
				.join(' + ');
	}

	getStaticValue() {
		if (this.isSpread || this.isDynamic) return null;

		return this.isTrue
			? true
			: this.chunks[0]
				? this.chunks[0].data
				: '';
	}
}