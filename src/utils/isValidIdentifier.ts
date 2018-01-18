import { isIdentifierStart, isIdentifierChar } from 'acorn';
import fullCharCodeAt from './fullCharCodeAt';

export default function isValidIdentifier(str: string): boolean {
	let i = 0;

	while (i < str.length) {
		const code = fullCharCodeAt(str, i);
		if (!(i === 0 ? isIdentifierStart : isIdentifierChar)(code, true)) return false;

		i += code <= 0xffff ? 1 : 2;
	}

	return true;
}