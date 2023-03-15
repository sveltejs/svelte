import ElseBlock from './ElseBlock';
import Expression from './shared/Expression';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import Element from './Element';
import ConstTag from './ConstTag';
import { Context, unpack_destructuring } from './shared/Context';
import { Node } from 'estree';
import Component from '../Component';
import { TemplateNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';
import { INode } from './interfaces';
import get_const_tags from './shared/get_const_tags';

export default class EachBlock extends AbstractBlock {
	type: 'EachBlock';

	expression: Expression;
	context_node: Node;

	iterations: string;
	index: string;
	context: string;
	key: Expression;
	scope: TemplateScope;
	contexts: Context[];
	const_tags: ConstTag[];
	has_animation: boolean;
	has_binding = false;
	has_index_binding = false;
	context_rest_properties: Map<string, Node>;
	else?: ElseBlock;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'each'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.index = info.index;

		this.scope = scope.child();
		this.context_rest_properties = new Map();
		this.contexts = [];
		unpack_destructuring({ contexts: this.contexts, node: info.context, scope, component, context_rest_properties: this.context_rest_properties });

		this.contexts.forEach(context => {
			if (context.type !== 'DestructuredVariable') return;
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});

		if (this.index) {
			// index can only change if this is a keyed each block
			const dependencies = info.key ? this.expression.dependencies : new Set([]);
			this.scope.add(this.index, dependencies, this);
		}

		this.key = info.key
			? new Expression(component, this, this.scope, info.key)
			: null;

		this.has_animation = false;

		([this.const_tags, this.children] = get_const_tags(info.children, component, this, this));

		if (this.has_animation) {
			this.children = this.children.filter(child => !isEmptyNode(child) && !isCommentNode(child));

			if (this.children.length !== 1) {
				const child = this.children.find(child => !!(child as Element).animation);
				component.error((child as Element).animation, compiler_errors.invalid_animation_sole);
				return;
			}
		}

		this.warn_if_empty_block();

		this.else = info.else
			? new ElseBlock(component, this, this.scope, info.else)
			: null;
	}
}

function isEmptyNode(node: INode) {
	return node.type === 'Text' && node.data.trim() === '';
}
function isCommentNode(node: INode) {
	return node.type === 'Comment';
}
