import Node from './shared/Node';
import PendingBlock from './PendingBlock';
import ThenBlock from './ThenBlock';
import CatchBlock from './CatchBlock';
import Expression from './shared/Expression';
import { Pattern } from 'estree';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import traverse_destructure_pattern from '../utils/traverse_destructure_pattern';

export default class AwaitBlock extends Node {
	type: 'AwaitBlock';
	expression: Expression;
	value: DestructurePattern;
	error: DestructurePattern;

	pending: PendingBlock;
	then: ThenBlock;
	catch: CatchBlock;

	constructor(component: Component, parent, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		this.value = info.value && new DestructurePattern(info.value);
		this.error = info.error && new DestructurePattern(info.error);

		this.pending = new PendingBlock(component, this, scope, info.pending);
		this.then = new ThenBlock(component, this, scope, info.then);
		this.catch = new CatchBlock(component, this, scope, info.catch);
	}
}

export class DestructurePattern {
	pattern: Pattern;
	expressions: string[];
	identifier_name: string | undefined;

	constructor(pattern: Pattern) {
		this.pattern = pattern;
		this.expressions = [];
		traverse_destructure_pattern(pattern, (node) => this.expressions.push(node.name));
		this.identifier_name = this.pattern.type === 'Identifier' ? this.pattern.name : undefined;
	}
}
