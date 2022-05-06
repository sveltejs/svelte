import { TemplateNode } from '../../interfaces';
import Component from '../Component';
import { nodes_to_template_literal } from '../utils/nodes_to_template_literal';
import Expression from './shared/Expression';
import Node from './shared/Node';
import TemplateScope from './shared/TemplateScope';

export default class StyleDirective extends Node {
	type: 'StyleDirective';
	name: string;
	expression: Expression;
	should_cache: boolean;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.name = info.name;

		// Convert the value array to an expression so it's easier to handle
		// the StyleDirective going forward.
		if (info.value === true || (info.value.length === 1 && info.value[0].type === 'MustacheTag')) {
			const identifier = info.value === true
				? {
					type: 'Identifier',
					start: info.end - info.name.length,
					end: info.end,
					name: info.name
				} as any
				: info.value[0].expression;
			this.expression = new Expression(component, this, scope, identifier);
			this.should_cache = false;
		} else {
			const raw_expression = nodes_to_template_literal(info.value);
			this.expression = new Expression(component, this, scope, raw_expression);
			this.should_cache = raw_expression.expressions.length > 0;
		}

	}
}
