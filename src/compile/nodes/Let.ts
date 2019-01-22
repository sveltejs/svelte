import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';

class Pattern {
	constructor(node) {
		// TODO implement `let:foo={bar}` and `let:contact={{ name, address }}` etc
	}
}

export default class Let extends Node {
	type: 'Let';
	name: string;
	pattern: Pattern;
	names: string[];

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;

		this.pattern = info.expression && new Pattern(info.expression);

		// TODO
		this.names = [this.name];
	}
}