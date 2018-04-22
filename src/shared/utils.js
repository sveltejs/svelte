export function noop() {}

export function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

export function makePropertyMap(obj) {
	const map = {};
	for (const key in obj) {
		map[key] = 1;
	}
	return map;
}