import { is_reserved_keyword } from '../../utils/reserved_keywords.js';

/**
 * @param {import('../../Component.js').default} component
 * @param {import('./TemplateScope.js').default} scope
 * @param {string} name
 */
export default function is_contextual(component, scope, name) {
	if (is_reserved_keyword(name)) return true;
	// if it's a name below root scope, it's contextual
	if (!scope.is_top_level(name)) return true;
	const variable = component.var_lookup.get(name);
	// hoistables, module declarations, and imports are non-contextual
	if (!variable || variable.hoistable) return false;
	// assume contextual
	return true;
}
