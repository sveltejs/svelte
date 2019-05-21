import Node from './shared/Node';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import Element from './Element';

export default class Text extends Node {
	type: 'Text';
	data: string;
	use_space = false;

	constructor(component: Component, parent: INode, scope: TemplateScope, info: any) {
		super(component, parent, scope, info);
		this.data = info.data;

		if (!component.component_options.preserveWhitespace && !/\S/.test(info.data)) {
			let node = parent;
			while (node) {
				if (node.type === 'Element' && (node as Element).name === 'pre') {
					return;
				}
				node = node.parent;
			}

			this.use_space = true;
		}
	}
}
