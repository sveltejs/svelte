import Node from './shared/Node';
import Component from '../Component';
import { walk } from 'estree-walker';
import { BasePattern, Identifier } from 'estree';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';

const applicable = new Set(['Identifier', 'ObjectExpression', 'ArrayExpression', 'Property']);

export default class Let extends Node {
	type: 'Let';
	name: Identifier;
	value: Identifier;
	names: string[] = [];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.name = { type: 'Identifier', name: info.name };

		const { names } = this;

		if (info.expression) {
			this.value = info.expression;

			walk(info.expression, {
				enter(node: Identifier|BasePattern) {
					if (!applicable.has(node.type)) {
						component.error(node as any, compiler_errors.invalid_let);
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
