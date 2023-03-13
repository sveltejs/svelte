import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { Context, unpack_destructuring } from './shared/Context';
import { ConstTag as ConstTagType } from '../../interfaces';
import { INodeAllowConstTag } from './interfaces';
import { walk } from 'estree-walker';
import { extract_identifiers } from 'periscopic';
import is_reference, { NodeWithPropertyDefinition } from 'is-reference';
import get_object from '../utils/get_object';
import compiler_errors from '../compiler_errors';
import { Node as ESTreeNode } from 'estree';

const allowed_parents = new Set(['EachBlock', 'CatchBlock', 'ThenBlock', 'InlineComponent', 'SlotTemplate', 'IfBlock', 'ElseBlock']);

export default class ConstTag extends Node {
	type: 'ConstTag';
	expression: Expression;
	contexts: Context[] = [];
	node: ConstTagType;
	scope: TemplateScope;
	context_rest_properties: Map<string, ESTreeNode> = new Map();

	assignees: Set<string> = new Set();
  dependencies: Set<string> = new Set();

	constructor(component: Component, parent: INodeAllowConstTag, scope: TemplateScope, info: ConstTagType) {
		super(component, parent, scope, info);

		if (!allowed_parents.has(parent.type)) {
			component.error(info, compiler_errors.invalid_const_placement);
		}
		this.node = info;
		this.scope = scope;

		const { assignees, dependencies } = this;

		extract_identifiers(info.expression.left).forEach(({ name }) => {
      assignees.add(name);
			const owner = this.scope.get_owner(name);
			if (owner === parent) {
				component.error(info, compiler_errors.invalid_const_declaration(name));
			}
    });

    walk(info.expression.right, {
      enter(node, parent) {
        if (is_reference(node as NodeWithPropertyDefinition, parent as NodeWithPropertyDefinition)) {
          const identifier = get_object(node as any);
          const { name } = identifier;
          dependencies.add(name);
        }
      }
    });
	}

	parse_expression() {
		unpack_destructuring({
			contexts: this.contexts,
			node: this.node.expression.left,
			scope: this.scope,
			component: this.component,
			context_rest_properties: this.context_rest_properties
		});
		this.expression = new Expression(this.component, this, this.scope, this.node.expression.right);
		this.contexts.forEach(context => {
			const owner = this.scope.get_owner(context.key.name);
			if (owner && owner.type === 'ConstTag' && owner.parent === this.parent) {
				this.component.error(this.node, compiler_errors.invalid_const_declaration(context.key.name));
			}
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});
	}
}
