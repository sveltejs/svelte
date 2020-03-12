import Node from './shared/Node';
import PendingBlock from './PendingBlock';
import ThenBlock from './ThenBlock';
import CatchBlock from './CatchBlock';
import Expression from './shared/Expression';
import { Pattern } from 'estree';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import get_object from '../utils/get_object';

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
		this.expressions = get_context_from_expression(this.pattern, []);
		this.identifier_name = this.pattern.type === 'Identifier' ? this.pattern.name : undefined;
	}
}
function get_context_from_expression(node: Pattern, result: string[]): string[] {
	switch (node.type) {
		case 'Identifier':
			result.push(node.name);
			return result;
		case 'ArrayPattern':
			for (const element of node.elements) {
				get_context_from_expression(element, result);
			}
			return result;
		case 'ObjectPattern':
			for (const property of node.properties) {
				get_context_from_expression(property.value, result);
			}
			return result;
		case 'MemberExpression':
			get_context_from_expression(get_object(node), result);
			return result;
		case 'RestElement':
			get_context_from_expression(node.argument, result);
			return result;
		case 'AssignmentPattern':
			get_context_from_expression(node.left, result);
			return result;
	}
}

