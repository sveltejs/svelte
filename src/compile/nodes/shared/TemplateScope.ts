export default class TemplateScope {
	names: Set<string>;
	dependenciesForName: Map<string, Set<string>>;
	mutables: Set<string>;
	parent?: TemplateScope;

	constructor(parent?: TemplateScope) {
		this.parent = parent;
		this.names = new Set(parent ? parent.names : []);
		this.dependenciesForName = new Map(parent ? parent.dependenciesForName : []);
		this.mutables = new Set();
	}

	add(name, dependencies: Set<string>) {
		this.names.add(name);
		this.dependenciesForName.set(name, dependencies);
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
}