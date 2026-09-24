/** @type {string[]} */
export const shadowed = [];

export function record() {
	shadowed.push(/** @type {any} */ (document).createElement.constructor.name);
}

/** @param {'both' | 'object'} step */
export function rename(step) {
	const form = /** @type {HTMLFormElement | null} */ (document.querySelector('main form'));
	const object = document.querySelector('main object');

	// the server renders this component too, before there is any markup
	if (!form || !object) return;

	if (step === 'both') object.id = 'createElement';
	if (step === 'object') form.name = 'renamed';
	record();
}
