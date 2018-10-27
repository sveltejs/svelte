import Node from './shared/Node';
import getObject from '../../utils/getObject';
import Expression from './shared/Expression';

export default class Binding extends Node {
	name: string;
	value: Expression;
	isContextual: boolean;
	usesContext: boolean;
	obj: string;
	prop: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;
		this.value = new Expression(component, this, scope, info.value);

		let obj;
		let prop;

		const { name } = getObject(this.value.node);
		this.isContextual = scope.names.has(name);

		if (this.value.node.type === 'MemberExpression') {
			prop = `[✂${this.value.node.property.start}-${this.value.node.property.end}✂]`;
			if (!this.value.node.computed) prop = `'${prop}'`;
			obj = `[✂${this.value.node.object.start}-${this.value.node.object.end}✂]`;

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
