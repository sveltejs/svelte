import Node from './shared/Node.ts';
import PendingBlock from './PendingBlock.ts';
import ThenBlock from './ThenBlock.ts';
import CatchBlock from './CatchBlock.ts';
import Expression from './shared/Expression.ts';
import Component from '../Component.ts';
import TemplateScope from './shared/TemplateScope.ts';
import { TemplateNode } from '../../interfaces.ts';
import { Context, unpack_destructuring } from './shared/Context.ts';
import { Node as ESTreeNode } from 'estree';

export default class AwaitBlock extends Node {
	type: 'AwaitBlock';
	expression: Expression;

	then_contexts: Context[];
	catch_contexts: Context[];

	then_node: ESTreeNode | null;
	catch_node: ESTreeNode | null;

	pending: PendingBlock;
	then: ThenBlock;
	catch: CatchBlock;

	constructor(component: Component, parent, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		this.then_node = info.value;
		this.catch_node = info.error;

		if (this.then_node) {
			this.then_contexts = [];
			unpack_destructuring(this.then_contexts, info.value, node => node);
		}

		if (this.catch_node) {
			this.catch_contexts = [];
			unpack_destructuring(this.catch_contexts, info.error, node => node);
		}

		this.pending = new PendingBlock(component, this, scope, info.pending);
		this.then = new ThenBlock(component, this, scope, info.then);
		this.catch = new CatchBlock(component, this, scope, info.catch);
	}
}
