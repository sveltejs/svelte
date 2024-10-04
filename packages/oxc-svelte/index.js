import * as bindings from './bindings.cjs';

function wrap(fn) {
	return (...args) => {
		const result = fn(...args);
		return {
			ast: JSON.parse(result.ast),
			errors: result.errors,
			comments: JSON.parse(result.comments),
		};
	};
}
export const parse = wrap(bindings.parse);
export const parse_expression_at = wrap(bindings.parse_expression_at);
export const parse_pattern_at = wrap(bindings.parse_pattern_at);
