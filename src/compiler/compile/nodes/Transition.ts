import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';

export default class Transition extends Node {
	type: 'Transition';
	name: string;
	directive: string;
	expression: Expression;
	is_local: boolean;

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		component.warn_if_undefined(info.name, info, scope);

		this.name = info.name;
		component.qualify(info.name);

		this.directive = info.intro && info.outro ? 'transition' : info.intro ? 'in' : 'out';
		this.is_local = info.modifiers.includes('local');

		if ((info.intro && parent.intro) || (info.outro && parent.outro)) {
			const parent_transition = (parent.intro || parent.outro);

			const message = this.directive === parent_transition.directive
				? `An element can only have one '${this.directive}' directive`
				: `An element cannot have both ${describe(parent_transition)} directive and ${describe(this)} directive`;

			component.error(info, {
				code: `duplicate-transition`,
				message
			});
		}

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}

function describe(transition: Transition) {
	return transition.directive === 'transition'
		? `a 'transition'`
		: `an '${transition.directive}'`;
}