export function equal(a, b, message) {
	if (a != b) throw new Error(message || `Expected ${a} to equal ${b}`);
}