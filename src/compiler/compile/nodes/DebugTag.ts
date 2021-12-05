import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import { INode } from './interfaces';
import { Node as EsTreeNode } from 'estree';

export default class DebugTag extends Node {
	type: 'DebugTag';
	expressions: Expression[];

	constructor(component: Component, parent: INode, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expressions = info.identifiers.map((node: EsTreeNode) => {
			return new Expression(component, parent, scope, node);
		});
	}
}
