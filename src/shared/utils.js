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
	if (i === 0) fn();
	return () => {
		if (!--i) fn();
	};
}

export function addLoc(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char }
	};
}

export function exclude(src, prop) {
	const tar = {};
	for (const k in src) k === prop || (tar[k] = src[k]);
	return tar;
}