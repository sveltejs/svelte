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

export function createSlot(slots) {
	const root_slots = {};
	for (const slot_name in slots) {
		let elements = slots[slot_name];
		if (!Array.isArray(elements)) {
			elements = [elements];
		}
		root_slots[slot_name] = [create_root_slot_fn(elements)];
	}
	return root_slots;
}
