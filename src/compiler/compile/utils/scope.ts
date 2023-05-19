import { analyze, Scope, extract_names, extract_identifiers } from 'periscopic';

/**
 * @param {import('estree').Node} expression
 */
export function create_scopes(expression) {
	return analyze(expression);
}

export { Scope, extract_names, extract_identifiers };
