import { render_effect, teardown } from '../../reactivity/effects.js';
import { set_attribute } from '../elements/attributes.js';
import { set_class } from '../elements/class.js';
import { hydrating } from '../hydration.js';

/**
 * @param {() => Record<string, any>} get_attributes
 * @returns {void}
 */
export function svelte_html(get_attributes) {
	const node = document.documentElement;
	const own = {};

	/** @type {Record<string, Array<[any, any]>>} to check who set the last value of each attribute */
	// @ts-expect-error
	const current_setters = (node.__attributes_setters ??= {});

	/** @type {Record<string, any>} */
	let attributes;

	render_effect(() => {
		attributes = get_attributes();

		for (const name in attributes) {
			const current = (current_setters[name] ??= []);
			const idx = current.findIndex(([owner]) => owner === own);
			const old = idx === -1 ? null : current.splice(idx, 1)[0][1];

			let value = attributes[name];
			current.push([own, value]);

			// Do nothing on initial render during hydration: If there are attribute duplicates, the last value
			// wins, which could result in needless hydration repairs from earlier values.
			if (hydrating) continue;

			if (name === 'class') {
				// Avoid unrelated attribute changes from triggering class changes
				if (old !== value) {
					set_class(node, current_setters[name].map(([_, text]) => text).join(' '));
				}
			} else {
				set_attribute(node, name, value);
			}
		}
	});

	teardown(() => {
		for (const name in attributes) {
			const old = current_setters[name];
			current_setters[name] = old.filter(([owner]) => owner !== own);
			const current = current_setters[name];

			if (name === 'class') {
				set_class(node, current.map(([_, text]) => text).join(' '));

				// If this was the last one setting this attribute, revert to the previous value
			} else if (old[old.length - 1][0] === own) {
				set_attribute(node, name, current[current.length - 1]?.[1]);
			}
		}
	});
}
