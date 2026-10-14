export class RenderNode {
	/** @type {any} */
	component;

	/** @type {any} */
	error;

	data = $state.raw({});

	/** @type {RenderNode | undefined} */
	child = $state.raw();

	/**
	 * @param {any} component
	 * @param {any} [error]
	 */
	constructor(component, error) {
		this.component = component;
		this.error = error;
	}
}
