import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Transition extends Node {
	type: 'Transition';
	name: string;
	directive: string;
	expression: Expression;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		if (!component.transitions.has(info.name)) {
			component.error(info, {
				code: `missing-transition`,
				message: `Missing transition '${info.name}'`
			});
		}

		this.name = info.name;
		this.directive = info.intro && info.outro ? 'transition' : info.intro ? 'in' : 'out';

		if ((info.intro && parent.intro) || (info.outro && parent.outro)) {
			const parentTransition = (parent.intro || parent.outro);

			const message = this.directive === parentTransition.directive
				? `An element can only have one '${this.directive}' directive`
				: `An element cannot have both ${describe(parentTransition)} directive and ${describe(this)} directive`;

			component.error(info, {
				code: `duplicate-transition`,
				message
			});
		}

		this.component.used.transitions.add(this.name);

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