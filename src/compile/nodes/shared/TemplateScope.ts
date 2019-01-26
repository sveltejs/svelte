import Node from './Node';
import EachBlock from '../EachBlock';
import ThenBlock from '../ThenBlock';
import CatchBlock from '../CatchBlock';
import InlineComponent from '../InlineComponent';

type NodeWithScope = EachBlock | ThenBlock | CatchBlock | InlineComponent | Element;

export default class TemplateScope {
	names: Set<string>;
	dependenciesForName: Map<string, Set<string>>;
	mutables: Set<string> = new Set();
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

	setMutable(name: string) {
		if (this.names.has(name)) {
			this.mutables.add(name);
			if (this.parent && this.dependenciesForName.has(name)) this.dependenciesForName.get(name).forEach(dep => this.parent.setMutable(dep));
		} else if (this.parent) this.parent.setMutable(name);
		else this.mutables.add(name);
	}

	containsMutable(names: Iterable<string>) {
		for (const name of names) {
			const owner = this.getOwner(name);
			const is_let = owner && (owner.type === 'InlineComponent' || owner.type === 'Element');
			if (is_let) return true;

			if (name[0] === '$') return true;
			if (this.mutables.has(name)) return true;
			else if (this.dependenciesForName.has(name) && this.containsMutable(this.dependenciesForName.get(name))) return true;
		}

		if (this.parent) return this.parent.containsMutable(names);
		else return false;
	}

	isTopLevel(name: string) {
		return !this.parent || !this.names.has(name) && this.parent.isTopLevel(name);
	}

	getOwner(name: string): NodeWithScope {
		return this.owners.get(name) || (this.parent && this.parent.getOwner(name));
	}
}