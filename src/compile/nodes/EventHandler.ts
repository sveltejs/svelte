import Node from './shared/Node';
import Expression from './shared/Expression';
import flattenReference from '../../utils/flattenReference';
import { createScopes } from '../../utils/annotateWithScopes';
import { walk } from 'estree-walker';

export default class EventHandler extends Node {
	name: string;
	modifiers: Set<string>;
	expression: Expression;
	callee: any; // TODO

	usesComponent: boolean;
	usesContext: boolean;
	usesEventObject: boolean;
	isCustomEvent: boolean;

	insertionPoint: number;
	args: Expression[];
	snippet: string;

	constructor(component, parent, template_scope, info) {
		super(component, parent, template_scope, info);

		this.name = info.name;
		this.modifiers = new Set(info.modifiers);

		if (info.expression) {
			this.expression = new Expression(component, parent, template_scope, info.expression, true);
			this.snippet = this.expression.snippet;

			let { scope, map } = createScopes(info.expression);

			walk(info.expression, {
				enter: (node, parent) => {
					if (map.has(node)) {
						scope = map.get(node);
					}

					if (node.type === 'AssignmentExpression') {
						const { name } = flattenReference(node.left);

						if (!scope.has(name)) {
							component.instrument(node, parent, name, true);
						}
					}
				},

				leave(node) {
					if (map.has(node)) {
						scope = scope.parent;
					}
				}
			});
		} else {
			this.snippet = null; // TODO handle shorthand events here?
		}

		// TODO figure out what to do about custom events
		// this.isCustomEvent = component.events.has(this.name);
	}
}