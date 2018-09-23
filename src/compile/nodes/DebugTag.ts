import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../render-dom/Block';
import Expression from './shared/Expression';
import deindent from '../../utils/deindent';
import addToSet from '../../utils/addToSet';
import { stringify } from '../../utils/stringify';

export default class DebugTag extends Node {
	expressions: Expression[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expressions = info.identifiers.map(node => {
			return new Expression(component, parent, scope, node);
		});
	}
}