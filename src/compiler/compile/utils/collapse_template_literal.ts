import { TemplateLiteral } from 'estree';
import { escape_template } from './stringify';

/**
 * Collapse string literals together
 */ 
export function collapse_template_literal(literal: TemplateLiteral) {
	if (!literal.quasis.length) return;

	const collapsed_quasis = [];
	const collapsed_expressions = [];

	let cur_quasi = literal.quasis[0];

	// An expression always follows a quasi and vice versa, ending with a quasi
	for (let i = 0; i < literal.quasis.length; i++) {
		const expr = literal.expressions[i];
		const next_quasi = literal.quasis[i + 1];
		// If an expression is a simple string literal, combine it with its preceding
		// and following quasi
		if (next_quasi && expr && expr.type === 'Literal' && typeof expr.value === 'string') {
			cur_quasi.value.raw += escape_template(expr.value) + next_quasi.value.raw;
		} else {
			if (expr) {
				collapsed_expressions.push(expr);
			}
			collapsed_quasis.push(cur_quasi);
			cur_quasi = next_quasi;
		}
	}

	literal.quasis = collapsed_quasis;
	literal.expressions = collapsed_expressions;
}
