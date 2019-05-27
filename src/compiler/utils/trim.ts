import { whitespace } from './patterns';

export function trim_start(str: string) {
	let i = 0;
	while (whitespace.test(str[i])) i += 1;

	return str.slice(i);
}

export function trim_end(str: string) {
	let i = str.length;
	while (whitespace.test(str[i - 1])) i -= 1;

	return str.slice(0, i);
}
