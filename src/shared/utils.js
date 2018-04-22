export function noop() {}

export function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

export function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
	return tar;
}