import Node from './shared/Node';

export default class Comment extends Node {
	type: 'Comment';
	data: string;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.data = info.data;
	}

	ssr() {
		// Allow option to preserve comments, otherwise ignore
		if (this.compiler.options.preserveComments) {
			this.compiler.target.append(`<!--${this.data}-->`);
		}
	}
}