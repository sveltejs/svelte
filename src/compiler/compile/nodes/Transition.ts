import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Element from './Element';
import compiler_errors from '../compiler_errors';

export default class Transition extends Node {
	type: 'Transition';
	name: string;
	directive: string;
	expression: Expression;
	is_local: boolean;

	constructor(component: Component, parent: Element, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		component.warn_if_undefined(info.name, info, scope);

		this.name = info.name;
		component.add_reference(info.name.split('.')[0]);

		this.directive = info.intro && info.outro ? 'transition' : info.intro ? 'in' : 'out';
		this.is_local = info.modifiers.includes('local');

		if ((info.intro && parent.intro) || (info.outro && parent.outro)) {
			const parent_transition = (parent.intro || parent.outro);
			component.error(info, compiler_errors.duplicate_transition(this.directive, parent_transition.directive));
		}

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}
