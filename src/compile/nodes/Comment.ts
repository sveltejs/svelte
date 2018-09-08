import Node from './shared/Node';

export default class Comment extends Node {
	type: 'Comment';
	data: string;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.data = info.data;
	}
}