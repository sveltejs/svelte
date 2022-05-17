import { TemplateLiteral } from 'estree';
import { escape_template } from './stringify';

// Collapse string literals together
export function collapse_template_literal(literal: TemplateLiteral) {
	if (literal.quasis.length) {
		// flatMap() to produce an array containing [quasi, expr, quasi, expr, ..., quasi]
		const zip = literal.quasis.reduce((acc, cur, index) => {
			const expr = literal.expressions[index];
			acc.push(cur);
			if (expr) {
				acc.push(expr);
			}
			return acc;
		}, []);

		// If an expression is a simple string literal, combine it with its preceding
		// and following quasi
		let cur_quasi = zip[0];
		const new_zip = [cur_quasi];
		for (let i = 1; i < zip.length; i += 2) {
			const expr = zip[i];
			const next_quasi = zip[i + 1];
			if (expr.type === 'Literal' && typeof expr.value === 'string') {
				cur_quasi.value.raw += escape_template(expr.value) + next_quasi.value.raw;
			} else {
				new_zip.push(expr);
				new_zip.push(next_quasi);
				cur_quasi = next_quasi;
			}
		}

		// Reconstitute the quasi and expressions arrays
		literal.quasis = new_zip.filter((_, index) => index % 2 === 0);
		literal.expressions = new_zip.filter((_, index) => index % 2 === 1);
	}
}
