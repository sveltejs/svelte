import { DEV } from 'esm-env';
import { render_effect, teardown } from '../../../reactivity/effects.js';
import { listen_to_event_and_reset_event } from './shared.js';
import * as e from '../../../errors.js';
import { is } from '../../../proxy.js';
import { queue_micro_task } from '../../task.js';
import { hydrating } from '../../hydration.js';
import { is_runes, untrack } from '../../../runtime.js';

/**
 * @param {HTMLInputElement} input
 * @param {() => unknown} get
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_value(input, get, set = get) {
	var runes = is_runes();

	listen_to_event_and_reset_event(input, 'input', (is_reset) => {
		if (DEV && input.type === 'checkbox') {
			// TODO should this happen in prod too?
			e.bind_invalid_checkbox_value();
		}

		/** @type {any} */
		var value = is_reset ? input.defaultValue : input.value;
		value = is_numberlike_input(input) ? to_number(value) : value;
		set(value);

		// In runes mode, respect any validation in accessors (doesn't apply in legacy mode,
		// because we use mutable state which ensures the render effect always runs)
		if (runes && value !== (value = get())) {
			var start = input.selectionStart;
			var end = input.selectionEnd;

			// the value is coerced on assignment
			input.value = value ?? '';

			// Restore selection
			if (end !== null) {
				input.selectionStart = start;
				input.selectionEnd = Math.min(end, input.value.length);
			}
		}
	});

	if (
		// If we are hydrating and the value has since changed,
		// then use the updated value from the input instead.
		(hydrating && input.defaultValue !== input.value) ||
		// If defaultValue is set, then value == defaultValue
		// TODO Svelte 6: remove input.value check and set to empty string?
		(untrack(get) == null && input.value)
	) {
		set(is_numberlike_input(input) ? to_number(input.value) : input.value);
	}

	render_effect(() => {
		if (DEV && input.type === 'checkbox') {
			// TODO should this happen in prod too?
			e.bind_invalid_checkbox_value();
		}

		var value = get();

		if (is_numberlike_input(input) && value === to_number(input.value)) {
			// handles 0 vs 00 case (see https://github.com/sveltejs/svelte/issues/9959)
			return;
		}

		if (input.type === 'date' && !value && !input.value) {
			// Handles the case where a temporarily invalid date is set (while typing, for example with a leading 0 for the day)
			// and prevents this state from clearing the other parts of the date input (see https://github.com/sveltejs/svelte/issues/7897)
			return;
		}

		// don't set the value of the input if it's the same to allow
		// minlength to work properly
		if (value !== input.value) {
			// @ts-expect-error the value is coerced on assignment
			input.value = value ?? '';
		}
	});
}

/** @type {Set<HTMLInputElement[]>} */
const pending = new Set();

/**
 * @param {HTMLInputElement[]} inputs
 * @param {null | [number]} group_index
 * @param {HTMLInputElement} input
 * @param {() => unknown} get
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_group(inputs, group_index, input, get, set = get) {
	var is_checkbox = input.getAttribute('type') === 'checkbox';
	var binding_group = inputs;

	// needs to be let or related code isn't treeshaken out if it's always false
	let hydration_mismatch = false;

	if (group_index !== null) {
		for (var index of group_index) {
			// @ts-expect-error
			binding_group = binding_group[index] ??= [];
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

			set(value);
		},
		// TODO better default value handling
		() => set(is_checkbox ? [] : null)
	);

	render_effect(() => {
		var value = get();

		// If we are hydrating and the value has since changed, then use the update value
		// from the input instead.
		if (hydrating && input.defaultChecked !== input.checked) {
			hydration_mismatch = true;
			return;
		}

		if (is_checkbox) {
			value = value || [];
			// @ts-ignore
			input.checked = value.includes(input.__value);
		} else {
			// @ts-ignore
			input.checked = is(input.__value, value);
		}
	});

	teardown(() => {
		var index = binding_group.indexOf(input);

		if (index !== -1) {
			binding_group.splice(index, 1);
		}
	});

	if (!pending.has(binding_group)) {
		pending.add(binding_group);

		queue_micro_task(() => {
			// necessary to maintain binding group order in all insertion scenarios
			binding_group.sort((a, b) => (a.compareDocumentPosition(b) === 4 ? -1 : 1));
			pending.delete(binding_group);
		});
	}

	queue_micro_task(() => {
		if (hydration_mismatch) {
			var value;

			if (is_checkbox) {
				value = get_binding_group_value(binding_group, value, input.checked);
			} else {
				var hydration_input = binding_group.find((input) => input.checked);
				// @ts-ignore
				value = hydration_input?.__value;
			}

			set(value);
		}
	});
}

/**
 * @param {HTMLInputElement} input
 * @param {() => unknown} get
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_checked(input, get, set = get) {
	listen_to_event_and_reset_event(input, 'change', (is_reset) => {
		var value = is_reset ? input.defaultChecked : input.checked;
		set(value);
	});

	if (
		// If we are hydrating and the value has since changed,
		// then use the update value from the input instead.
		(hydrating && input.defaultChecked !== input.checked) ||
		// If defaultChecked is set, then checked == defaultChecked
		untrack(get) == null
	) {
		set(input.checked);
	}

	render_effect(() => {
		var value = get();
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
 * @param {() => FileList | null} get
 * @param {(value: FileList | null) => void} set
 */
export function bind_files(input, get, set = get) {
	listen_to_event_and_reset_event(input, 'change', () => {
		set(input.files);
	});

	render_effect(() => {
		input.files = get();
	});
}
