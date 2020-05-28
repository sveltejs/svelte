export function get_spread_update(levels, updates) {
	const update = {};

	const to_null_out = {};
	const accounted_for = { $$scope: 1 };

	let i = levels.length,
		key,
		n;
	while (i--) {
		if (n = updates[i]) {
			for (key in levels[i]) {
				if (!(key in n)) to_null_out[key] = 1;
			}

			for (key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}

			levels[i] = n;
		} else {
			for (key in levels[i]) {
				accounted_for[key] = 1;
			}
		}
	}

	for ( key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}

	return update;
}