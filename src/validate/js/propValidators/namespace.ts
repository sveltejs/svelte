import * as namespaces from '../../../utils/namespaces';
import nodeToString from '../../../utils/nodeToString'
import fuzzymatch from '../../utils/fuzzymatch';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

const valid = new Set(namespaces.validNamespaces);

export default function namespace(validator: Validator, prop: Node) {
	const ns = nodeToString(prop.value);

	if (typeof ns !== 'string') {
		validator.error(prop, {
			code: `invalid-namespace-property`,
			message: `The 'namespace' property must be a string literal representing a valid namespace`
		});
	}

	if (!valid.has(ns)) {
		const match = fuzzymatch(ns, namespaces.validNamespaces);
		if (match) {
			validator.error(prop, {
				code: `invalid-namespace-property`,
				message: `Invalid namespace '${ns}' (did you mean '${match}'?)`
			});
		} else {
			validator.error(prop, {
				code: `invalid-namespace-property`,
				message: `Invalid namespace '${ns}'`
			});
		}
	}
}
