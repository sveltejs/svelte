import { effect, render_effect, teardown } from '../../reactivity/effects.js';
import { untrack } from '../../runtime.js';
import { set_attribute } from '../elements/attributes.js';
import { set_class } from '../elements/class.js';
import { hydrating } from '../hydration.js';

/**
 * @param {() => Record<string, any>} get_attributes
 * @returns {void}
 */
export function svelte_html(get_attributes) {
	const node = document.documentElement;
	const self = {};

	/** @type {Record<string, Array<{ owner: any, value: any }>>} to check who set the last value of each attribute */
	// @ts-expect-error
	const current_setters = (node.__attributes_setters ??= {});

	/** @type {Record<string, any>} Does _not_ contain event listeners, those are handled separately */
	let attributes;

	const set_html_attributes = () => {
		attributes = get_attributes();

		for (const name in attributes) {
			const current = (current_setters[name] ??= []);
			const index = current.findIndex((c) => c.owner === self);
			const old = index === -1 ? null : current.splice(index, 1)[0].value;

			let value = attributes[name];
			current.push({ owner: self, value });

			// Defer hydration on initial render during hydration: If there are attribute duplicates, the last value
			// wins, so we wait until all values have been set to see if we're actually the last one that sets the value.
			if (hydrating) {
				effect(() => {
					if (current[current.length - 1].owner === self) {
						untrack(set_html_attributes);
					}
				});
				return;
			}

			if (name === 'class') {
				// Avoid unrelated attribute changes from triggering class changes
				if (old !== value) {
					set_class(node, current_setters[name].map((e) => e.value).join(' '));
				}
			} else {
				set_attribute(node, name, value);
			}
		}
	};

	render_effect(set_html_attributes);

	teardown(() => {
		for (const name in attributes) {
			const old = current_setters[name];
			current_setters[name] = old.filter((o) => o.owner !== self);
			const current = current_setters[name];

			if (name === 'class') {
				set_class(node, current.map((c) => c.value).join(' '));

				// If this was the last one setting this attribute, revert to the previous value
			} else if (old[old.length - 1].owner === self) {
				set_attribute(node, name, current[current.length - 1]?.value);
			}
		}
	});
}
