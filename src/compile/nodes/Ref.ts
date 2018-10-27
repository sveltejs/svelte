import Node from './shared/Node';
import isValidIdentifier from '../../utils/isValidIdentifier';

export default class Ref extends Node {
	type: 'Ref';
	name: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		if (parent.ref) {
			component.error({
				code: 'duplicate-refs',
				message: `Duplicate refs`
			});
		}

		if (!isValidIdentifier(info.name)) {
			const suggestion = info.name.replace(/[^_$a-z0-9]/ig, '_').replace(/^\d/, '_$&');

			component.error(info, {
				code: `invalid-reference-name`,
				message: `Reference name '${info.name}' is invalid — must be a valid identifier such as ${suggestion}`
			});
		} else {
			component.refs.add(info.name);
		}

		this.name = info.name;
	}
}