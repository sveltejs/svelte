import * as e from '../errors.js';
import { current_component_context } from '../runtime.js';
import { get_component } from './ownership.js';

export function legacy_api() {
	const component = current_component_context?.function;

	/** @param {string} method */
	function error(method) {
		// @ts-expect-error
		const parent = get_component()?.filename ?? 'Something';
		e.component_api_changed(parent, method, component.filename);
	}

	return {
		$destroy: () => error('$destroy()'),
		$on: () => error('$on(...)'),
		$set: () => error('$set(...)')
	};
}
