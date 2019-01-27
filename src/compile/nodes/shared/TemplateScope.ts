import Node from './Node';
import EachBlock from '../EachBlock';
import ThenBlock from '../ThenBlock';
import CatchBlock from '../CatchBlock';
import InlineComponent from '../InlineComponent';

type NodeWithScope = EachBlock | ThenBlock | CatchBlock | InlineComponent | Element;

export default class TemplateScope {
	names: Set<string>;
	dependenciesForName: Map<string, Set<string>>;
	owners: Map<string, NodeWithScope> = new Map();
	parent?: TemplateScope;

	constructor(parent?: TemplateScope) {
		this.parent = parent;
		this.names = new Set(parent ? parent.names : []);
		this.dependenciesForName = new Map(parent ? parent.dependenciesForName : []);
	}

	add(name, dependencies: Set<string>, owner) {
		this.names.add(name);
		this.dependenciesForName.set(name, dependencies);
		this.owners.set(name, owner);
		return this;
	}

	child() {
		const child = new TemplateScope(this);
		return child;
	}

	isTopLevel(name: string) {
		return !this.parent || !this.names.has(name) && this.parent.isTopLevel(name);
	}

	getOwner(name: string): NodeWithScope {
		return this.owners.get(name) || (this.parent && this.parent.getOwner(name));
	}

	is_let(name: string) {
		const owner = this.getOwner(name);
		return owner && (owner.type === 'Element' || owner.type === 'InlineComponent');
	}
}