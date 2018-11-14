import Node from './shared/Node';
import Expression from './shared/Expression';
import addToSet from '../../utils/addToSet';
import flattenReference from '../../utils/flattenReference';
import validCalleeObjects from '../../utils/validCalleeObjects';
import list from '../../utils/list';

const validBuiltins = new Set(['set', 'fire', 'destroy']);

export default class EventHandler extends Node {
	name: string;
	modifiers: Set<string>;
	dependencies: Set<string>;
	expression: Node;
	callee: any; // TODO

	usesComponent: boolean;
	usesContext: boolean;
	usesEventObject: boolean;
	isCustomEvent: boolean;
	shouldHoist: boolean;

	insertionPoint: number;
	args: Expression[];
	snippet: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;
		this.modifiers = new Set(info.modifiers);

		component.used.events.add(this.name);

		this.dependencies = new Set();

		if (info.expression) {
			this.expression = new Expression(component, parent, scope, info.expression);
			this.snippet = this.expression.snippet;
		} else {
			this.snippet = null; // TODO handle shorthand events here?
		}

		this.isCustomEvent = component.events.has(this.name);
		this.shouldHoist = !this.isCustomEvent && parent.hasAncestor('EachBlock');
	}
}