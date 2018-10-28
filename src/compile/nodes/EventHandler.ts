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
			this.validateExpression(info.expression);

			this.callee = flattenReference(info.expression.callee);

			this.insertionPoint = info.expression.start;

			this.usesComponent = !validCalleeObjects.has(this.callee.name);
			this.usesContext = false;
			this.usesEventObject = this.callee.name === 'event';

			this.args = info.expression.arguments.map(param => {
				const expression = new Expression(component, this, scope, param);
				addToSet(this.dependencies, expression.dependencies);
				if (expression.usesContext) this.usesContext = true;
				if (expression.usesEvent) this.usesEventObject = true;
				return expression;
			});

			this.snippet = `[✂${info.expression.start}-${info.expression.end}✂];`;
		} else {
			this.callee = null;
			this.insertionPoint = null;

			this.args = null;
			this.usesComponent = true;
			this.usesContext = false;
			this.usesEventObject = true;

			this.snippet = null; // TODO handle shorthand events here?
		}

		this.isCustomEvent = component.events.has(this.name);
		this.shouldHoist = !this.isCustomEvent && parent.hasAncestor('EachBlock');
	}

	render(component, block, context, hoisted) { // TODO hoist more event handlers
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
				arg.overwriteThis(context);
			});

			if (this.callee && this.callee.name === 'this') {
				const node = this.callee.nodes[0];
				component.code.overwrite(node.start, node.end, context, {
					storeName: true,
					contentOnly: true
				});
			}
		}
	}

	validateExpression(expression) {
		const { callee, type } = expression;

		if (type !== 'CallExpression') {
			this.component.error(expression, {
				code: `invalid-event-handler`,
				message: `Expected a call expression`
			});
		}

		const { component } = this;
		const { name } = flattenReference(callee);

		if (validCalleeObjects.has(name) || name === 'options') return;

		if (name === 'refs') {
			this.component.refCallees.push(callee);
			return;
		}

		if (
			(callee.type === 'Identifier' && validBuiltins.has(name)) ||
			this.component.methods.has(name)
		) {
			return;
		}

		if (name[0] === '$') {
			// assume it's a store method
			return;
		}

		const validCallees = ['this.*', 'refs.*', 'event.*', 'options.*', 'console.*'].concat(
			Array.from(validBuiltins),
			Array.from(this.component.methods.keys())
		);

		let message = `'${component.source.slice(callee.start, callee.end)}' is an invalid callee ` ;

		if (name === 'store') {
			message += `(did you mean '$${component.source.slice(callee.start + 6, callee.end)}(...)'?)`;
		} else {
			message += `(should be one of ${list(validCallees)})`;

			if (callee.type === 'Identifier' && component.helpers.has(callee.name)) {
				message += `. '${callee.name}' exists on 'helpers', did you put it in the wrong place?`;
			}
		}

		component.warn(expression, {
			code: `invalid-callee`,
			message
		});
	}
}