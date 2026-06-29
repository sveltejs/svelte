export class PortalKey {
	/** @param {string} name */
	constructor(name) {
		this.v = name;
	}
}

/**
 * Creates a key for use with `{#portal ...}` and `{@portal ...}`. It connects the portal source and outlet.
 * Example: TODO write out once exact API clear.
 * @param {string} name
 */
export function createPortalKey(name) {
	return new PortalKey(name);
}
