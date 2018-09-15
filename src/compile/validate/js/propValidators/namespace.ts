import * as namespaces from '../../../../utils/namespaces';
import nodeToString from '../../../../utils/nodeToString'
import fuzzymatch from '../../utils/fuzzymatch';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

const valid = new Set(namespaces.validNamespaces);

export default function namespace(component: Component, prop: Node) {
	const ns = nodeToString(prop.value);

	if (typeof ns !== 'string') {
		component.error(prop, {
			code: `invalid-namespace-property`,
			message: `The 'namespace' property must be a string literal representing a valid namespace`
		});
	}

	if (!valid.has(ns)) {
		const match = fuzzymatch(ns, namespaces.validNamespaces);
		if (match) {
			component.error(prop, {
				code: `invalid-namespace-property`,
				message: `Invalid namespace '${ns}' (did you mean '${match}'?)`
			});
		} else {
			component.error(prop, {
				code: `invalid-namespace-property`,
				message: `Invalid namespace '${ns}'`
			});
		}
	}
}
