/** @type {string[]} */
export const calls = [];

/**
 * Wraps the native `disabled` and `hidden` setters, recording calls inside `#accessors`
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
				if (this.closest('#accessors')) calls.push(`${label} ${this.textContent} ${name} ${value}`);
				descriptor.set?.call(this, value);
			}
		});
	}
}

/** Replaces the setters while hydrating, and gives the button labelled `own-while-hydrating` an own `disabled` setter */
export function replace() {
	const own = [...document.querySelectorAll('#accessors button')].find(
		(button) => button.textContent === 'own-while-hydrating'
	);

	// the server renders this component too, before there is any markup
	if (!own) return;

	wrap('replaced');

	Object.defineProperty(own, 'disabled', {
		/** @param {boolean} value */
		set(value) {
			calls.push(`own-while-hydrating ${value}`);
		}
	});
}
