export class PortalKey {
	/** @param {string} [name] */
	constructor(name) {
		this.v = Symbol(name);
	}
}

/**
 * Creates a key for use with a `<svelte:portal>`. It connects the portal source and target.
 * Example: TODO write out once exact API clear.
 * @param {string} [name]
 */
export function createPortalKey(name) {
	return new PortalKey(name);
}
