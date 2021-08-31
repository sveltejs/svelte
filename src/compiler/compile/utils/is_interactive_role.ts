import { ARIARoleDefintionKey, roles as rolesMap } from 'aria-query';

const roles = [...rolesMap.keys()];
const _interactiveRoles = roles.filter(
	(name) =>
		!rolesMap.get(name).abstract &&
		rolesMap.get(name).superClass.some((c) => c.includes('widget'))
);

// 'toolbar' does not descend from widget, but it does support
// aria-activedescendant, thus in practice we treat it as a widget.
_interactiveRoles.push('toolbar');

const interactiveRoles = new Set(_interactiveRoles);

export const is_interactive_roles: (role: string) => boolean = (role) => {
	return interactiveRoles.has(role as ARIARoleDefintionKey);
};
