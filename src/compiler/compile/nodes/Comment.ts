import { TemplateNode } from '../../interfaces';
import Component from '../Component';
import { extract_svelte_ignore } from '../utils/extract_svelte_ignore';
import Node from './shared/Node';
import TemplateScope from './shared/TemplateScope';

export default class Comment extends Node {
	type: 'Comment';
	data: string;
	ignores: string[];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);
		this.data = info.data;
		this.ignores = extract_svelte_ignore(this.data);
	}
}
