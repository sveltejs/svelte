export function noop() {}

export function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

export function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
	return tar;
}

export function isPromise(value) {
	return value && typeof value.then === 'function';
}

export function callAfter(fn, i) {
	return () => {
		if (!--i) fn();
	};
}