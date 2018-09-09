import Node from './shared/Node';
import Expression from './shared/Expression';
import addToSet from '../../utils/addToSet';
import flattenReference from '../../utils/flattenReference';
import validCalleeObjects from '../../utils/validCalleeObjects';

export default class EventHandler extends Node {
	name: string;
	dependencies: Set<string>;
	expression: Node;
	callee: any; // TODO

	usesComponent: boolean;
	usesContext: boolean;
	isCustomEvent: boolean;
	shouldHoist: boolean;

	insertionPoint: number;
	args: Expression[];
	snippet: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;
		this.dependencies = new Set();

		if (info.expression) {
			this.callee = flattenReference(info.expression.callee);
			this.insertionPoint = info.expression.start;

			this.usesComponent = !validCalleeObjects.has(this.callee.name);
			this.usesContext = false;

			this.args = info.expression.arguments.map(param => {
				const expression = new Expression(component, this, scope, param);
				addToSet(this.dependencies, expression.dependencies);
				if (expression.usesContext) this.usesContext = true;
				return expression;
			});

			this.snippet = `[✂${info.expression.start}-${info.expression.end}✂];`;
		} else {
			this.callee = null;
			this.insertionPoint = null;

			this.args = null;
			this.usesComponent = true;
			this.usesContext = false;

			this.snippet = null; // TODO handle shorthand events here?
		}

		this.isCustomEvent = component.events.has(this.name);
		this.shouldHoist = !this.isCustomEvent && parent.hasAncestor('EachBlock');
	}

	render(component, block, hoisted) { // TODO hoist more event handlers
		if (this.insertionPoint === null) return; // TODO handle shorthand events here?

		if (!validCalleeObjects.has(this.callee.name)) {
			const component_name = hoisted ? `component` : block.alias(`component`);

			// allow event.stopPropagation(), this.select() etc
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			if (this.callee.name[0] === '$' && !component.methods.has(this.callee.name)) {
				component.code.overwrite(
					this.insertionPoint,
					this.insertionPoint + 1,
					`${component_name}.store.`
				);
			} else {
				component.code.prependRight(
					this.insertionPoint,
					`${component_name}.`
				);
			}
		}

		if (this.isCustomEvent) {
			this.args.forEach(arg => {
				arg.overwriteThis(this.parent.var);
			});

			if (this.callee && this.callee.name === 'this') {
				const node = this.callee.nodes[0];
				component.code.overwrite(node.start, node.end, this.parent.var, {
					storeName: true,
					contentOnly: true
				});
			}
		}
	}
}