import { AXObjectRoles, elementAXObjects } from 'axobject-query';
import Attribute from '../../nodes/Attribute';

export default (
	name: string,
	attribute_map: Map<string, Attribute>
): boolean => {
	if (!attribute_map.has('role')) {
		return false;
	}
	const value = attribute_map.get('role').get_static_value();

	for (const [concept, ax_objects] of elementAXObjects) {
		if (
			// @ts-ignore
			concept.name === name &&
			// @ts-ignore
			(concept.attributes
				? // @ts-ignore
				  concept.attributes.every(
						attribute =>
							attribute_map.has(attribute.name) &&
							(attribute.value !== undefined
								? (console.log(
										attribute_map.get(attribute.name).get_static_value(),
										attribute.value
								  ),
								  attribute_map.get(attribute.name).get_static_value()) ===
								  attribute.value
								: true)
				  )
				: true)
		) {
			for (const ax_object of ax_objects) {
				if (AXObjectRoles.has(ax_object)) {
					for (const role of AXObjectRoles.get(ax_object)) {
						if (role.name === value) {
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};
