import Node from './shared/Node';

export default class Comment extends Node {
	type: 'Comment';
	data: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.data = info.data;

		const value = this.data.trim();
		if (value === 'svelte-disable') {
			component.disableWarn = true;
		} else if (value === 'svelte-enable') {
			component.disableWarn = false;
		}
	}
}