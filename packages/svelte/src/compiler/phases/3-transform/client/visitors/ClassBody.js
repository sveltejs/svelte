/** @import { ClassBody, Identifier, Literal, MethodDefinition, PrivateIdentifier, PropertyDefinition } from 'estree' */
/** @import { Context, StateField } from '../types' */
import { regex_invalid_identifier_chars } from '../../../patterns.js';
import { ClassAnalysis } from './shared/class-analysis.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
		context.next();
		return;
	}

	const class_analysis = new ClassAnalysis();

	for (const definition of node.body) {
		class_analysis.register_body_definition(definition, context.state.scope);
	}

	class_analysis.finalize_property_definitions();

	/** @type {Array<MethodDefinition | PropertyDefinition>} */
	const body = [];

	const child_state = {
		...context.state,
		class_analysis
	};

	// we need to visit the constructor first so that it can add to the field maps.
	const constructor_node = node.body.find(
		(child) => child.type === 'MethodDefinition' && child.kind === 'constructor'
	);
	const constructor = constructor_node && context.visit(constructor_node, child_state);

	// Replace parts of the class body
	for (const definition of node.body) {
		if (definition === constructor_node) {
			body.push(/** @type {MethodDefinition} */ (constructor));
			continue;
		}

		const state_field = class_analysis.build_state_field_from_body_definition(definition, context);

		if (state_field) {
			body.push(...state_field);
			continue;
		}

		body.push(/** @type {MethodDefinition} **/ (context.visit(definition, child_state)));
	}

	body.push(...class_analysis.constructor_state_fields);

	return { ...node, body };
}
