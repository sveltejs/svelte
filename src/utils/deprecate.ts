const seen = new Set();

export default function deprecate(message: string, code = message) {
	if (seen.has(code)) return;
	seen.add(code);

	console.warn(`[svelte] DEPRECATION: ${message}`);
}