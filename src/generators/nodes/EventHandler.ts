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
	insertionPoint: number;
	args: Expression[];
	snippet: string;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.name = info.name;
		this.dependencies = new Set();

		if (info.expression) {
			this.callee = flattenReference(info.expression.callee);
			this.insertionPoint = info.expression.start;
			this.args = info.expression.arguments.map(param => {
				const expression = new Expression(compiler, this, scope, param);
				addToSet(this.dependencies, expression.dependencies);
				return expression;
			});

			this.snippet = `[✂${info.expression.start}-${info.expression.end}✂]`;
		} else {
			this.callee = null;
			this.insertionPoint = null;
			this.args = null;

			this.snippet = null; // TODO handle shorthand events here?
		}
	}

	render(compiler, block) {
		if (this.insertionPoint === null) return; // TODO handle shorthand events here?

		if (!validCalleeObjects.has(this.callee.name)) {
			// allow event.stopPropagation(), this.select() etc
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			if (this.callee.name[0] === '$' && !compiler.methods.has(this.callee.name)) {
				compiler.code.overwrite(
					this.insertionPoint,
					this.insertionPoint + 1,
					`${block.alias('component')}.store.`
				);
			} else {
				compiler.code.prependRight(
					this.insertionPoint,
					`${block.alias('component')}.`
				);
			}
		}
	}
}