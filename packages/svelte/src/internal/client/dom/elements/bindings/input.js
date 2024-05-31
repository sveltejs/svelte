import { DEV } from 'esm-env';
import { render_effect, effect } from '../../../reactivity/effects.js';
import { stringify } from '../../../render.js';
import { listen_to_event_and_reset_event } from './shared.js';
import * as e from '../../../errors.js';
import { get_proxied_value, is } from '../../../proxy.js';

/**
 * @param {HTMLInputElement} input
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_value(input, get_value, update) {
	listen_to_event_and_reset_event(input, 'input', () => {
		if (DEV && input.type === 'checkbox') {
			// TODO should this happen in prod too?
			e.bind_invalid_checkbox_value();
		}

		update(is_numberlike_input(input) ? to_number(input.value) : input.value);
	});

	render_effect(() => {
		if (DEV && input.type === 'checkbox') {
			// TODO should this happen in prod too?
			e.bind_invalid_checkbox_value();
		}

		var value = get_value();

		// @ts-ignore
		input.__value = value;

		if (is_numberlike_input(input) && value === to_number(input.value)) {
			// handles 0 vs 00 case (see https://github.com/sveltejs/svelte/issues/9959)
			return;
		}

		if (input.type === 'date' && !value && !input.value) {
			// Handles the case where a temporarily invalid date is set (while typing, for example with a leading 0 for the day)
			// and prevents this state from clearing the other parts of the date input (see https://github.com/sveltejs/svelte/issues/7897)
			return;
		}

		input.value = stringify(value);
	});
}

/**
 * @param {Array<HTMLInputElement>} inputs
 * @param {null | [number]} group_index
 * @param {HTMLInputElement} input
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_group(inputs, group_index, input, get_value, update) {
	var is_checkbox = input.getAttribute('type') === 'checkbox';
	var binding_group = inputs;

	if (group_index !== null) {
		for (var index of group_index) {
			var group = binding_group;
			// @ts-ignore
			binding_group = group[index];
			if (binding_group === undefined) {
				// @ts-ignore
				binding_group = group[index] = [];
			}
		}
	}

	binding_group.push(input);

	listen_to_event_and_reset_event(
		input,
		'change',
		() => {
			// @ts-ignore
			var value = input.__value;

			if (is_checkbox) {
				value = get_binding_group_value(binding_group, value, input.checked);
			}

			update(value);
		},
		// TODO better default value handling
		() => update(is_checkbox ? [] : null)
	);

	render_effect(() => {
		var value = get_value();

		if (is_checkbox) {
			value = value || [];
			// @ts-ignore
			input.checked = get_proxied_value(value).includes(get_proxied_value(input.__value));
		} else {
			// @ts-ignore
			input.checked = is(input.__value, value);
		}
	});

	render_effect(() => {
		return () => {
			var index = binding_group.indexOf(input);

			if (index !== -1) {
				binding_group.splice(index, 1);
			}
		};
	});

	effect(() => {
		// necessary to maintain binding group order in all insertion scenarios. TODO optimise
		binding_group.sort((a, b) => (a.compareDocumentPosition(b) === 4 ? -1 : 1));
	});
}

/**
 * @param {HTMLInputElement} input
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_checked(input, get_value, update) {
	listen_to_event_and_reset_event(input, 'change', () => {
		var value = input.checked;
		update(value);
	});

	if (get_value() == undefined) {
		update(false);
	}

	render_effect(() => {
		var value = get_value();
		input.checked = Boolean(value);
	});
}

/**
 * @template V
 * @param {Array<HTMLInputElement>} group
 * @param {V} __value
 * @param {boolean} checked
 * @returns {V[]}
 */
function get_binding_group_value(group, __value, checked) {
	var value = new Set();

	for (var i = 0; i < group.length; i += 1) {
		if (group[i].checked) {
			// @ts-ignore
			value.add(group[i].__value);
		}
	}

	if (!checked) {
		value.delete(__value);
	}

	return Array.from(value);
}

/**
 * @param {HTMLInputElement} input
 */
function is_numberlike_input(input) {
	var type = input.type;
	return type === 'number' || type === 'range';
}

/**
 * @param {string} value
 */
function to_number(value) {
	return value === '' ? null : +value;
}

/**
 * @param {HTMLInputElement} input
 * @param {() => FileList | null} get_value
 * @param {(value: FileList | null) => void} update
 */
export function bind_files(input, get_value, update) {
	listen_to_event_and_reset_event(input, 'change', () => {
		update(input.files);
	});
	render_effect(() => {
		input.files = get_value();
	});
}
