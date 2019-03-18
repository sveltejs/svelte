import Node from './shared/Node';

export default class Text extends Node {
	type: 'Text';
	data: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.data = info.data;
	}
}