import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Animation extends Node {
	type: 'Animation';
	name: string;
	expression: Expression;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;

		component.used.animations.add(this.name);

		if (parent.animation) {
			component.error(this, {
				code: `duplicate-animation`,
				message: `An element can only have one 'animate' directive`
			});
		}

		if (!component.animations.has(this.name)) {
			component.error(this, {
				code: `missing-animation`,
				message: `Missing animation '${this.name}'`
			});
		}

		const block = parent.parent;
		if (!block || block.type !== 'EachBlock' || !block.key) {
			// TODO can we relax the 'immediate child' rule?
			component.error(this, {
				code: `invalid-animation`,
				message: `An element that use the animate directive must be the immediate child of a keyed each block`
			});
		}

		block.hasAnimation = true;

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}