import { effect } from '../../../reactivity/effects.js';

/**
 * Selects the correct option(s) (depending on whether this is a multiple select)
 * @template V
 * @param {HTMLSelectElement} select
 * @param {V} value
 * @param {boolean} [mounting]
 */
export function select_option(select, value, mounting) {
	if (select.multiple) {
		return select_options(select, value);
	}

	for (var option of select.options) {
		var option_value = get_option_value(option);
		if (option_value === value) {
			option.selected = true;
			return;
		}
	}

	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

/**
 * Finds the containing `<select>` element and potentially updates its `selected` state.
 * @param {HTMLOptionElement} option
 * @returns {void}
 */
export function selected(option) {
	// Inside an effect because the element might not be connected
	// to the parent <select> yet when this is called
	effect(() => {
		var select = option.parentNode;

		while (select != null) {
			if (select.nodeName === 'SELECT') break;
			select = select.parentNode;
		}

		// @ts-ignore
		if (select != null && option.__value === select.__value) {
			// never set to false, since this causes browser to select default option
			option.selected = true;
		}
	});
}

/**
 * @param {HTMLSelectElement} select
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_select_value(select, get_value, update) {
	var mounting = true;

	select.addEventListener('change', () => {
		/** @type {unknown} */
		var value;

		if (select.multiple) {
			value = [].map.call(select.querySelectorAll(':checked'), get_option_value);
		} else {
			/** @type {HTMLOptionElement | null} */
			var selected_option = select.querySelector(':checked');
			value = selected_option && get_option_value(selected_option);
		}

		update(value);
	});

	// Needs to be an effect, not a render_effect, so that in case of each loops the logic runs after the each block has updated
	effect(() => {
		var value = get_value();
		select_option(select, value, mounting);

		if (mounting && value === undefined) {
			/** @type {HTMLOptionElement | null} */
			var selected_option = select.querySelector(':checked');
			if (selected_option !== null) {
				value = get_option_value(selected_option);
				update(value);
			}
		}

		// @ts-ignore
		select.__value = value;
		mounting = false;
	});
}

/**
 * @template V
 * @param {HTMLSelectElement} select
 * @param {V} value
 */
function select_options(select, value) {
	for (var option of select.options) {
		// @ts-ignore
		option.selected = ~value.indexOf(get_option_value(option));
	}
}

/** @param {HTMLOptionElement} option */
function get_option_value(option) {
	// __value only exists if the <option> has a value attribute
	if ('__value' in option) {
		return option.__value;
	} else {
		return option.value;
	}
}
