import { TemplateNode } from '../../interfaces';
import Component from '../Component';
import Node from './shared/Node';
import TemplateScope from './shared/TemplateScope';

const pattern = /^\s*svelte-ignore\s+([\s\S]+)\s*$/m;

export default class Comment extends Node {
	type: 'Comment';
	data: string;
	ignores: string[];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);
		this.data = info.data;

		const match = pattern.exec(this.data);
		this.ignores = match ? match[1].split(/[^\S]/).map(x => x.trim()).filter(Boolean) : [];
	}
}
