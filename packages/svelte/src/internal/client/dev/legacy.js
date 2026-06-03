import * as e from '../errors.js';
import { component_context } from '../context.js';
import { FILENAME } from '../../../constants.js';

/** @param {Function & { [FILENAME]: string }} target */
export function check_target(target) {
	if (target) {
		e.component_api_invalid_new(target[FILENAME] ?? 'a component', target.name);
	}
}

export function legacy_api() {
	const component = component_context?.function;

	/** @param {string} method */
	function error(method) {
		e.component_api_changed(method, component[FILENAME]);
	}

	return {
		$destroy: () => error('$destroy()'),
		$on: () => error('$on(...)'),
		$set: () => error('$set(...)')
	};
}
