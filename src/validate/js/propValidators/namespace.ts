import * as namespaces from '../../../utils/namespaces';
import nodeToString from '../../../utils/nodeToString'
import fuzzymatch from '../../utils/fuzzymatch';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

const valid = new Set(namespaces.validNamespaces);

export default function namespace(validator: Validator, prop: Node) {
	const ns = nodeToString(prop.value);

	if (typeof ns !== 'string') {
		validator.error(
			`The 'namespace' property must be a string literal representing a valid namespace`,
			prop
		);
	}

	if (!valid.has(ns)) {
		const match = fuzzymatch(ns, namespaces.validNamespaces);
		if (match) {
			validator.error(
				`Invalid namespace '${ns}' (did you mean '${match}'?)`,
				prop
			);
		} else {
			validator.error(`Invalid namespace '${ns}'`, prop);
		}
	}
}
