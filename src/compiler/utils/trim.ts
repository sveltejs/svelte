import { regex_start_whitespace, regex_end_whitespace } from './patterns';

export function trim_start(str: string) {
	return str.replace(regex_start_whitespace, '');
}

export function trim_end(str: string) {
	return str.replace(regex_end_whitespace, '');
}
