/** The scope of constructs within the Svelte template */
export default class TemplateScope {
	/**
	 * @typedef {import('../EachBlock').default
	 * 	| import('../ThenBlock').default
	 * 	| import('../CatchBlock').default
	 * 	| import('../InlineComponent').default
	 * 	| import('../Element').default
	 * 	| import('../SlotTemplate').default
	 * 	| import('../ConstTag').default} NodeWithScope
	 */

	/** @type {Set<string>} */
	names;

	/** @type {Map<string, Set<string>>} */
	dependencies_for_name;

	/** @type {Map<string, NodeWithScope>} */
	owners = new Map();

	/** @type {TemplateScope} */
	parent;

	/** @param {TemplateScope} [parent]  undefined */
	constructor(parent) {
		this.parent = parent;
		this.names = new Set(parent ? parent.names : []);
		this.dependencies_for_name = new Map(parent ? parent.dependencies_for_name : []);
	}

	/**
	 * @param {any} name
	 * @param {Set<string>} dependencies
	 * @param {any} owner
	 */
	add(name, dependencies, owner) {
		this.names.add(name);
		this.dependencies_for_name.set(name, dependencies);
		this.owners.set(name, owner);
		return this;
	}
	child() {
		const child = new TemplateScope(this);
		return child;
	}

	/** @param {string} name */
	is_top_level(name) {
		return !this.parent || (!this.names.has(name) && this.parent.is_top_level(name));
	}

	/**
	 * @param {string} name
	 * @returns {NodeWithScope}
	 */
	get_owner(name) {
		return this.owners.get(name) || (this.parent && this.parent.get_owner(name));
	}

	/** @param {string} name */
	is_let(name) {
		const owner = this.get_owner(name);
		return (
			owner &&
			(owner.type === 'Element' ||
				owner.type === 'InlineComponent' ||
				owner.type === 'SlotTemplate')
		);
	}

	/** @param {string} name */
	is_await(name) {
		const owner = this.get_owner(name);
		return owner && (owner.type === 'ThenBlock' || owner.type === 'CatchBlock');
	}

	/** @param {string} name */
	is_const(name) {
		const owner = this.get_owner(name);
		return owner && owner.type === 'ConstTag';
	}
}
