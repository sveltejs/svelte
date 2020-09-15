import Expression from "./shared/Expression";
import map_children from "./shared/map_children";
import AbstractBlock from "./shared/AbstractBlock";
import Element from "./Element";

export default class KeyBlock extends AbstractBlock {
	type: "KeyBlock";

	expression: Expression;
	has_animation: boolean;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		this.has_animation = false;

		this.children = map_children(component, this, scope, info.children);

		if (this.has_animation) {
			if (this.children.length !== 1) {
				const child = this.children.find(
					(child) => !!(child as Element).animation
				);
				component.error((child as Element).animation, {
					code: `invalid-animation`,
					message: `An element that use the animate directive must be the sole child of a key block`
				});
			}
		}

		this.warn_if_empty_block();
	}
}
