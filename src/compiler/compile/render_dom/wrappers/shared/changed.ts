import { x } from 'code-red';

export function changed(dependencies: string[]) {
	return dependencies
		.map(d => x`#changed.${d}`)
		.reduce((lhs, rhs) => x`${lhs} || ${rhs}`);
}