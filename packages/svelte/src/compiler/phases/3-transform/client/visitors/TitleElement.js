/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import {build_template_chunk, get_expression_id} from './shared/utils.js';
import { is_event_attribute, is_text_attribute } from '../../../../utils/ast.js';
import {build_attribute_value} from "./shared/element.js";
import { visit_event_attribute } from './shared/events.js';
import {normalize_attribute} from "../../../../../utils.js";
import {is_ignored} from "../../../../state.js";

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	const { has_state, value } = build_template_chunk(
		/** @type {any} */ (node.fragment.nodes),
		context.visit,
		context.state
	);

	const statement = b.stmt(b.assignment('=', b.id('$.document.title'), value));
	if (has_state) {
		context.state.update.push(statement);
	} else {
		context.state.init.push(statement);
	}

	// TODO: is this the right approach?

	/** @type {Array<AST.Attribute | AST.SpreadAttribute>} */
	const attributes = [];
	for (const attribute of node.attributes) {
		switch (attribute.type) {
			case 'Attribute':
				attributes.push(attribute);
				break;
		}
	}

	const node_id = {"type": "Identifier", "name": "title"}

	for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
		if (is_event_attribute(attribute)) {
			visit_event_attribute(attribute, context);
			continue;
		}

		const name = normalize_attribute(attribute.name);
		const { value, has_state } = build_attribute_value(
			attribute.value,
			context,
			(value, metadata) => (metadata.has_call ? get_expression_id(context.state, value) : value)
		);

		const update = b.call(
			'$.set_attribute',
			false,
			b.literal(name),
			value,
			is_ignored(node, 'hydration_attribute_changed') && b.true
		);
		(has_state ? context.state.update : context.state.init).push(b.stmt(update));
	}
}
