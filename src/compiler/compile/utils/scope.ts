import { Node } from 'estree';
import { analyze, Scope, extract_names, extract_identifiers } from 'periscopic';

// TODO replace this with periscopic?
export function create_scopes(expression: Node) {
	return analyze(expression);
}

export { Scope, extract_names, extract_identifiers }
