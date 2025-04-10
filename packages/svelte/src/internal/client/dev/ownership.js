/** @typedef {{ file: string, line: number, column: number }} Location */

import { get_descriptor } from '../../shared/utils.js';
import { LEGACY_PROPS, STATE_SYMBOL } from '../constants.js';
import { FILENAME } from '../../../constants.js';
import { component_context } from '../context.js';
import * as w from '../warnings.js';
import { sanitize_location } from '../../../utils.js';

/**
 * Sets up a validator that
 * - traverses the path of a prop to find out if it is allowed to be mutated
 * - checks that the binding chain is not interrupted
 * @param {Record<string, any>} props
 */
export function create_ownership_validator(props) {
	const component = component_context?.function;
	const parent = component_context?.p?.function;

	return {
		/**
		 * @param {string} prop
		 * @param {any[]} path
		 * @param {any} result
		 * @param {number} line
		 * @param {number} column
		 */
		mutation: (prop, path, result, line, column) => {
			const name = path[0];
			if (is_bound(props, name) || !parent) {
				return result;
			}

			let value = props[name];

			for (let i = 1; i < path.length - 1; i++) {
				if (!value?.[STATE_SYMBOL]) {
					return result;
				}
				value = value[path[i]];
			}

			const location = sanitize_location(`${component[FILENAME]}:${line}:${column}`);

			w.ownership_invalid_mutation(name, location, prop, parent[FILENAME]);

			return result;
		},
		/**
		 * @param {any} key
		 * @param {any} child_component
		 * @param {() => any} value
		 */
		binding: (key, child_component, value) => {
			if (!is_bound(props, key) && parent && value()?.[STATE_SYMBOL]) {
				w.ownership_invalid_binding(
					component[FILENAME],
					key,
					child_component[FILENAME],
					parent[FILENAME]
				);
			}
		}
	};
}

/**
 * @param {Record<string, any>} props
 * @param {string} prop_name
 */
function is_bound(props, prop_name) {
	// Can be the case when someone does `mount(Component, props)` with `let props = $state({...})`
	// or `createClassComponent(Component, props)`
	const is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
	return !!get_descriptor(props, prop_name)?.set || (is_entry_props && prop_name in props);
}
