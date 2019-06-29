import { Var } from '../../../../interfaces';

export default function is_dynamic(variable: Var) {
	if (variable) {
		if (variable.mutated || variable.reassigned) return true; // dynamic internal state
		if (!variable.module && variable.writable && variable.export_name) return true; // writable props
	}

	return false;
}