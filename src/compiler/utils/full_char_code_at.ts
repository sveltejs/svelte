// Adapted from https://github.com/acornjs/acorn/blob/6584815dca7440e00de841d1dad152302fdd7ca5/src/tokenize.js
// Reproduced under MIT License https://github.com/acornjs/acorn/blob/master/LICENSE

export default function full_char_code_at(str: string, i: number): number {
	const code = str.charCodeAt(i);
	if (code <= 0xd7ff || code >= 0xe000) return code;

	const next = str.charCodeAt(i + 1);
	return (code << 10) + next - 0x35fdc00;
}
