import { is_reserved_keyword } from '../../../utils/reserved_keywords.js';

/** @param {import('../../../../interfaces.js').Var} variable */
export default function is_dynamic(variable) {
	if (variable) {
		if (variable.mutated || variable.reassigned) return true; // dynamic internal state
		if (!variable.module && variable.writable && variable.export_name) return true; // writable props
		if (is_reserved_keyword(variable.name)) return true;
	}
	return false;
}
