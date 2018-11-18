import Node from './shared/Node';
import getObject from '../../utils/getObject';
import Expression from './shared/Expression';

export default class Binding extends Node {
	name: string;
	expression: Expression;
	isContextual: boolean;
	usesContext: boolean;
	obj: string;
	prop: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;
		this.expression = new Expression(component, this, scope, info.expression);

		let obj;
		let prop;

		const { name } = getObject(this.expression.node);
		this.isContextual = scope.names.has(name);

		if (this.expression.node.type === 'MemberExpression') {
			prop = `[✂${this.expression.node.property.start}-${this.expression.node.property.end}✂]`;
			if (!this.expression.node.computed) prop = `'${prop}'`;
			obj = `[✂${this.expression.node.object.start}-${this.expression.node.object.end}✂]`;

			this.usesContext = true;
		} else {
			obj = 'ctx';
			prop = `'${name}'`;

			this.usesContext = scope.names.has(name);
		}

		this.obj = obj;
		this.prop = prop;
	}
}
