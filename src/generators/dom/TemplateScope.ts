export default class TemplateScope {
	names: Set<string>;
	indexes: Set<string>;
	dependenciesForName: Map<string, string>;

	constructor(parent?: TemplateScope) {
		this.names = new Set(parent ? parent.names : []);
		this.indexes = new Set(parent ? parent.names : []);

		this.dependenciesForName = new Map(parent ? parent.dependenciesForName : []);
	}

	add(name, dependencies) {
		this.names.add(name);
		this.dependenciesForName.set(name, dependencies);
		return this;
	}

	child() {
		return new TemplateScope(this);
	}
}