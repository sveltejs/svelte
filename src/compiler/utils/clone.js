// adapted from klona v2.0.4 - https://github.com/lukeed/klona
// (c) Luke Edwards, under MIT License

// The sole modification is to skip function values in objects when cloning, so we don't break tests.

export function clone(val) {
	let k, out, tmp;

	if (Array.isArray(val)) {
		out = Array((k = val.length));
		while (k--) out[k] = (tmp = val[k]) && typeof tmp === 'object' ? clone(tmp) : tmp;
		return out;
	}

	if (Object.prototype.toString.call(val) === '[object Object]') {
		out = {}; // null
		for (k in val) {
			if (k === '__proto__') {
				Object.defineProperty(out, k, {
					value: clone(val[k]),
					configurable: true,
					enumerable: true,
					writable: true
				});
			} else if (typeof val[k] !== 'function') {
				// MODIFICATION: skip functions
				out[k] = (tmp = val[k]) && typeof tmp === 'object' ? clone(tmp) : tmp;
			}
		}
		return out;
	}

	return val;
}
