import { startWhitespace, endWhitespace } from './patterns';

export function trim_start(str: string) {
	return str.replace(startWhitespace, '');
}

export function trim_end(str: string) {
	return str.replace(endWhitespace, '');
}
