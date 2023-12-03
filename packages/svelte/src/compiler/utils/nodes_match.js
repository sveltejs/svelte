export function nodes_match(a, b, ignore_keys = []) {
	if (!!a !== !!b) return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;

	if (a && typeof a === 'object') {
		if (Array.isArray(a)) {
			if (a.length !== b.length) return false;
			return a.every((child, i) => nodes_match(child, b[i]));
		}

		const a_keys = Object.keys(a)
			.sort()
			.filter((key) => !ignore_keys.includes(key));
		const b_keys = Object.keys(b)
			.sort()
			.filter((key) => !ignore_keys.includes(key));

		if (a_keys.length !== b_keys.length) return false;

		let i = a_keys.length;
		while (i--) {
			const key = a_keys[i];
			if (b_keys[i] !== key) return false;

			if (key === 'start' || key === 'end') continue;

			if (!nodes_match(a[key], b[key])) {
				return false;
			}
		}

		return true;
	}

	return a === b;
}
