import { is_reserved_keyword } from '../../../utils/reserved_keywords.js';

/** @param {import('../../../../interfaces.js').Var} variable */
export default function is_dynamic(variable) {
	if (variable) {
		// Only variables declared in the instance script tags should be considered dynamic
		const is_declared_in_reactive_context = !variable.module && !variable.global;

		if (is_declared_in_reactive_context && (variable.mutated || variable.reassigned)) return true; // dynamic internal state
		if (is_declared_in_reactive_context && variable.writable && variable.export_name) return true; // writable props
		if (is_reserved_keyword(variable.name)) return true;
	}
	return false;
}
