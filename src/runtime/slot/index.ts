import { noop, insert, detach } from 'svelte/internal';

function create_root_slot_fn(elements) {
	return function create_root_slot() {
		return {
			c: noop,

			m: function mount(target, anchor) {
				elements.forEach(element => {
					insert(target, element, anchor);
				});
			},

			d: function destroy(detaching) {
				if (detaching) {
					elements.forEach(element => detach(element));
				}
			},

			l: noop,
		};
	};
}

export function createSlot(input) {
	var key, tmp, slots={};
	for (key in input) {
		tmp = input[key];
		slots[key] = [create_root_slot_fn(Array.isArray(tmp) ? tmp : [tmp])];
	}
	return slots;
}
