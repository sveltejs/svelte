import { Node } from 'estree';
import { Node as PeriscopicNode, analyze, Scope, extract_names, extract_identifiers } from 'periscopic';

export function create_scopes(expression: Node) {
	return analyze(expression as PeriscopicNode);
}

export { Scope, extract_names, extract_identifiers };
