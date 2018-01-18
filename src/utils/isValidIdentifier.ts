import { isIdentifierStart, isIdentifierChar } from 'acorn';

export default function isValidIdentifier(str: string): boolean {
	if (!isIdentifierStart(str.charCodeAt(0), true)) return false;

	for (let i = 0; i < str.length; i += 1) {
		if (!isIdentifierChar(str.charCodeAt(i), true)) return false;
	}

	return true;
}