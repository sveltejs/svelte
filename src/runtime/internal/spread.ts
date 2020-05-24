import { assign } from "./utils";

export function get_spread_update(levels, updates) {
	const update = {};

	const to_null_out = {};
	const accounted_for = { $$scope: 1 };

	let i = levels.length;
	while (i--) {
		const o = levels[i];
		const n = updates[i];

		if (n) {
			for (const key in o) {
				if (!(key in n) && !accounted_for[key]) to_null_out[key] = 1;
			}

			for (const key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}

			levels[i] = n;
		} else {
			for (const key in o) {
				// if spreads decides to null out the key
				// should reset it back for static attribute
				if (to_null_out[key]) {
					update[key] = o[key];
				}
				accounted_for[key] = 1;
			}
		}
	}

	for (const key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}

	return update;
}

export function get_attributes_for_spread(levels) {
	let attrs = {};
	for (let i = 0; i < levels.length; i += 1) {
		attrs = assign(attrs, levels[i]);
	}
	return attrs;
}

export function get_spread_object(spread_props) {
	return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}