import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Element from './Element';
import compiler_errors from '../compiler_errors';

export default class SvelteDirective extends Node {
	type: 'SvelteDirective';
	expression: Expression;

	constructor(component: Component, parent: Element, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		if (info.modifiers && info.modifiers.length) {
			component.error(info, compiler_errors.invalid_modifier);
		}
	}
}
