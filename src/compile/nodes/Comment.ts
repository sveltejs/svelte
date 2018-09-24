import Node from './shared/Node';

export default class Comment extends Node {
	type: 'Comment';
	data: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.data = info.data;
	}
}