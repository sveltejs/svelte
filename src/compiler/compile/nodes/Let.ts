import Node from './shared/Node';
import Component from '../Component';
import { walk } from 'estree-walker';
import { BasePattern, Identifier } from 'estree';

const applicable = new Set(['Identifier', 'ObjectExpression', 'ArrayExpression', 'Property']);

export default class Let extends Node {
	type: 'Let';
	name: Identifier;
	value: Identifier;
	names: string[] = [];

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = { type: 'Identifier', name: info.name };

		const { names } = this;

		if (info.expression) {
			this.value = info.expression;

			walk(info.expression, {
				enter(node: Identifier|BasePattern) {
					if (!applicable.has(node.type)) {
						component.error(node as any, {
							code: 'invalid-let',
							message: `let directive value must be an identifier or an object/array pattern`
						});
					}

					if (node.type === 'Identifier') {
						names.push((node as Identifier).name);
					}

					// slightly unfortunate hack
					if (node.type === 'ArrayExpression') {
						node.type = 'ArrayPattern';
					}

					if (node.type === 'ObjectExpression') {
						node.type = 'ObjectPattern';
					}
				}
			});
		} else {
			names.push(this.name.name);
		}
	}
}
