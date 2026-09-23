/** @type {string[]} */
export const calls = [];

/**
 * Wraps the `disabled` and `hidden` setters of the native prototypes, which then record their calls
 * and set `data-{label}`
 * @param {string} label
 */
export function wrap(label) {
	/** @type {Array<[object, string]>} */
	const accessors = [
		[HTMLButtonElement.prototype, 'disabled'],
		[HTMLElement.prototype, 'hidden']
	];

	for (const [prototype, name] of accessors) {
		const descriptor = /** @type {PropertyDescriptor} */ (
			Object.getOwnPropertyDescriptor(prototype, name)
		);

		Object.defineProperty(prototype, name, {
			...descriptor,
			/**
			 * @this {HTMLElement}
			 * @param {boolean} value
			 */
			set(value) {
				calls.push(`${label} ${this.textContent} ${name}`);
				descriptor.set?.call(this, value);
				this.setAttribute(`data-${label}`, String(value));
			}
		});
	}
}

/** Replaces the setters while hydrating, and gives the button labelled `own` an own `disabled` setter */
export function replace_during_hydration() {
	const buttons = [...document.querySelectorAll('main button')];
	const own = buttons.find((button) => button.textContent === 'own');

	// the server renders this component too, when there is no markup yet
	if (!own) return;

	wrap('replaced');

	Object.defineProperty(own, 'disabled', {
		/** @param {boolean} value */
		set(value) {
			calls.push(`own ${value}`);
		}
	});
}
