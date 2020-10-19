export function deepEqual(a, b, message) {
	if (!is_equal(a, b)) {
		throw new Error(message || `Expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`);
	}
}

function is_equal(a, b) {
	if (a && typeof a === 'object') {
		const is_array = Array.isArray(a);
		if (Array.isArray(b) !== is_array) return false;

		if (is_array) {
			if (a.length !== b.length) return false;
			return a.every((value, i) => is_equal(value, b[i]));
		}

		const a_keys = Object.keys(a).sort();
		const b_keys = Object.keys(b).sort();
		if (a_keys.join(',') !== b_keys.join(',')) return false;

		return a_keys.every(key => is_equal(a[key], b[key]));
	}

	return a === b;
}

export function equal(a, b, message) {
	if (a != b) throw new Error(message || `Expected ${a} to equal ${b}`);
}

export function ok(condition, message) {
	if (!condition) throw new Error(message || `Expected ${condition} to be truthy`);
}
