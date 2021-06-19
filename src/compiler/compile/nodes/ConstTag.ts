import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { Context, unpack_destructuring } from './shared/Context';
import { ConstTag as ConstTagType } from '../../interfaces';
import { INodeAllowConstTag } from './interfaces';
import { walk } from 'estree-walker';
import { extract_identifiers } from 'periscopic';
import is_reference from 'is-reference';
import get_object from '../utils/get_object';

const allowed_parents = new Set(['EachBlock', 'CatchBlock', 'ThenBlock', 'InlineComponent', 'SlotTemplate']);

export default class ConstTag extends Node {
	type: 'ConstTag';
	expression: Expression;
	contexts: Context[] = [];
	node: ConstTagType;
	scope: TemplateScope;

	assignees: Set<string> = new Set();
  dependencies: Set<string> = new Set();

	constructor(component: Component, parent: INodeAllowConstTag, scope: TemplateScope, info: ConstTagType) {
		super(component, parent, scope, info);

		if (!allowed_parents.has(parent.type)) {
			component.error(info, { code: 'invalid-const-placement', message: '{@const} must be the immediate child of {#each}, {:then}, {:catch}, <svelte:fragment> and <Component>' });
		}
		this.node = info;
		this.scope = scope;

		const { assignees, dependencies } = this;

		extract_identifiers(info.expression.left).forEach(({ name }) => {
      assignees.add(name);
			const owner = this.scope.get_owner(name);
			if (owner === parent) {
				component.error(info, { code: 'invalid-const-declaration', message: `'${name}' has already been declared` });
			}
    });

    walk(info.expression.right, {
      enter(node, parent) {
        if (is_reference(node, parent)) {
          const identifier = get_object(node);
          const { name } = identifier;
          dependencies.add(name);
        }
      }
    });
	}
	
	parse_expression() {
		unpack_destructuring(this.contexts, this.node.expression.left);
		this.expression = new Expression(this.component, this, this.scope, this.node.expression.right);
		this.contexts.forEach(context => {
			const owner = this.scope.get_owner(context.key.name);
			if (owner && owner.type === 'ConstTag' && owner.parent === this.parent) {
				this.component.error(this.node, { code: 'invalid-const-declaration', message: `'${context.key.name}' has already been declared` });
			}
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});
	}
}
