export function equal(a, b, message) {
	if (a != b) throw new Error(message || `Expected ${a} to equal ${b}`);
}

export function ok(condition, message) {
	if (!condition) throw new Error(message || `Expected ${condition} to be truthy`);
}