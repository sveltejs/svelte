import { start_whitespace, end_whitespace } from './patterns';

export function trim_start(str: string) {
	return str.replace(start_whitespace, '');
}

export function trim_end(str: string) {
	return str.replace(end_whitespace, '');
}
