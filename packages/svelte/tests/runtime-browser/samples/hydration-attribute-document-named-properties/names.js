/** @type {string[]} */
export const shadowed = [];

/**
 * Changes which elements the document exposes as `document.createElement`, then records it
 * @param {'both' | 'object'} step
 */
export function rename(step) {
	const form = /** @type {HTMLFormElement | null} */ (document.querySelector('main form'));
	const object = document.querySelector('main object');

	// the server renders this component too, when there is no markup yet
	if (!form || !object) return;

	if (step === 'both') object.id = 'createElement';
	if (step === 'object') form.name = 'renamed';

	shadowed.push(/** @type {any} */ (document).createElement.constructor.name);
}
