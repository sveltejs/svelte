import Node from './shared/Node';
import get_object from '../utils/get_object';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';

export default class Binding extends Node {
	type: 'Binding';
	name: string;
	expression: Expression;
	is_contextual: boolean;
	obj: string;
	prop: string;

	constructor(component: Component, parent, scope: TemplateScope, info) {
		super(component, parent, scope, info);

		if (info.expression.type !== 'Identifier' && info.expression.type !== 'MemberExpression') {
			component.error(info, {
				code: 'invalid-directive-value',
				message: 'Can only bind to an identifier (e.g. `foo`) or a member expression (e.g. `foo.bar` or `foo[baz]`)'
			});
		}

		this.name = info.name;
		this.expression = new Expression(component, this, scope, info.expression);

		let obj;
		let prop;

		const { name } = get_object(this.expression.node);
		this.is_contextual = scope.names.has(name);

		// make sure we track this as a mutable ref
		if (scope.is_let(name)) {
			component.error(this, {
				code: 'invalid-binding',
				message: 'Cannot bind to a variable declared with the let: directive'
			});
		} else if (this.is_contextual) {
			scope.dependencies_for_name.get(name).forEach(name => {
				const variable = component.var_lookup.get(name);
				variable[this.expression.node.type === 'MemberExpression' ? 'mutated' : 'reassigned'] = true;
			});
		} else {
			const variable = component.var_lookup.get(name);

			if (!variable || variable.global) component.error(this.expression.node, {
				code: 'binding-undeclared',
				message: `${name} is not declared`
			});

			variable[this.expression.node.type === 'MemberExpression' ? 'mutated' : 'reassigned'] = true;
		}

		if (this.expression.node.type === 'MemberExpression') {
			prop = `[✂${this.expression.node.property.start}-${this.expression.node.property.end}✂]`;
			if (!this.expression.node.computed) prop = `'${prop}'`;
			obj = `[✂${this.expression.node.object.start}-${this.expression.node.object.end}✂]`;
		} else {
			obj = 'ctx';
			prop = `'${name}'`;
		}

		this.obj = obj;
		this.prop = prop;
	}
}
