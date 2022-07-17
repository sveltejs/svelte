import {
	ARIARoleDefintionKey,
	roles as roles_map,
	elementRoles,
	ARIARoleRelationConcept
} from 'aria-query';
import { AXObjects, elementAXObjects } from 'axobject-query';
import Attribute from '../nodes/Attribute';

const roles = [...roles_map.keys()];

const non_interactive_roles = new Set(
	roles
		.filter((name) => {
			const role = roles_map.get(name);
			return (
				!roles_map.get(name).abstract &&
				// 'toolbar' does not descend from widget, but it does support
				// aria-activedescendant, thus in practice we treat it as a widget.
				name !== 'toolbar' &&
				!role.superClass.some((classes) => classes.includes('widget'))
			);
		})
		.concat(
			// The `progressbar` is descended from `widget`, but in practice, its
			// value is always `readonly`, so we treat it as a non-interactive role.
			'progressbar'
		)
);

const interactive_roles = new Set(
	roles
		.filter((name) => {
			const role = roles_map.get(name);
			return (
				!role.abstract &&
				// The `progressbar` is descended from `widget`, but in practice, its
				// value is always `readonly`, so we treat it as a non-interactive role.
				name !== 'progressbar' &&
				role.superClass.some((classes) => classes.includes('widget'))
			);
		})
		.concat(
			// 'toolbar' does not descend from widget, but it does support
			// aria-activedescendant, thus in practice we treat it as a widget.
			'toolbar'
		)
);

export function is_non_interactive_roles(role: ARIARoleDefintionKey) {
	return non_interactive_roles.has(role);
}

const presentation_roles = new Set(['presentation', 'none']);

export function is_presentation_role(role: ARIARoleDefintionKey) {
	return presentation_roles.has(role);
}

const non_interactive_element_role_schemas: ARIARoleRelationConcept[] = [];

elementRoles.entries().forEach(([schema, roles]) => {
	if ([...roles].every((role) => non_interactive_roles.has(role))) {
		non_interactive_element_role_schemas.push(schema);
	}
});

const interactive_element_role_schemas: ARIARoleRelationConcept[] = [];

elementRoles.entries().forEach(([schema, roles]) => {
	if ([...roles].every((role) => interactive_roles.has(role))) {
		interactive_element_role_schemas.push(schema);
	}
});

const interactive_ax_objects = new Set(
	[...AXObjects.keys()].filter((name) => AXObjects.get(name).type === 'widget')
);

const interactive_element_ax_object_schemas: ARIARoleRelationConcept[] = [];

elementAXObjects.entries().forEach(([schema, ax_object]) => {
	if ([...ax_object].every((role) => interactive_ax_objects.has(role))) {
		interactive_element_ax_object_schemas.push(schema);
	}
});

function match_schema(
	schema: ARIARoleRelationConcept,
	tag_name: string,
	attribute_map: Map<string, Attribute>
) {
	if (schema.name !== tag_name) return false;
	if (!schema.attributes) return true;
	return schema.attributes.every((schema_attribute) => {
		const attribute = attribute_map.get(schema_attribute.name);
		if (!attribute) return false;
		if (
			schema_attribute.value &&
			schema_attribute.value !== attribute.get_static_value()
		) {
return false;
}
		return true;
	});
}

export function is_interactive_element(
	tag_name: string,
	attribute_map: Map<string, Attribute>
): boolean {
	if (
		interactive_element_role_schemas.some((schema) =>
			match_schema(schema, tag_name, attribute_map)
		)
	) {
		return true;
	}

	if (
		non_interactive_element_role_schemas.some((schema) =>
			match_schema(schema, tag_name, attribute_map)
		)
	) {
		return false;
	}

	if (
		interactive_element_ax_object_schemas.some((schema) =>
			match_schema(schema, tag_name, attribute_map)
		)
	) {
		return true;
	}

	return false;
}
