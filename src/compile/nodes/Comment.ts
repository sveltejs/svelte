import Node from './shared/Node';

export default class Comment extends Node {
	type: 'Comment';
	data: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.data = info.data;
	}

	ssr() {
		// Allow option to preserve comments, otherwise ignore
		if (this.component.options.preserveComments) {
			this.component.target.append(`<!--${this.data}-->`);
		}
	}
}