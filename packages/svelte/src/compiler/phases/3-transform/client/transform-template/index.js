/** @import { Expression, Identifier } from 'estree' */
/** @import { Namespace } from '#compiler' */
/** @import { ComponentClientTransformState } from '../types.js' */
/** @import { Node } from './types.js' */
import { TEMPLATE_USE_MATHML, TEMPLATE_USE_SVG } from '../../../../../constants.js';
import { dev, locator } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {Node[]} nodes
 */
function build_locations(nodes) {
	const array = b.array([]);

	for (const node of nodes) {
		if (node.type !== 'element') continue;

		const { line, column } = locator(node.start);

		const expression = b.array([b.literal(line), b.literal(column)]);
		const children = build_locations(node.children);

		if (children.elements.length > 0) {
			expression.elements.push(children);
		}

		array.elements.push(expression);
	}

	return array;
}

/**
 * @param {ComponentClientTransformState} state
 * @param {Namespace} namespace
 * @param {number} [flags]
 */
export function transform_template(state, namespace, flags = 0) {
	const tree = state.options.fragments === 'tree';

	const expression = tree ? state.template.as_tree() : state.template.as_html();

	if (tree) {
		if (namespace === 'svg') flags |= TEMPLATE_USE_SVG;
		if (namespace === 'mathml') flags |= TEMPLATE_USE_MATHML;
	}

	let call = b.call(
		tree ? `$.from_tree` : `$.from_${namespace}`,
		expression,
		flags ? b.literal(flags) : undefined
	);

	if (state.template.contains_script_tag) {
		call = b.call(`$.with_script`, call);
	}

	if (dev) {
		call = b.call(
			'$.add_locations',
			call,
			b.member(b.id(state.analysis.name), '$.FILENAME', true),
			build_locations(state.template.nodes)
		);
	}

	return call;
}

/**
 * Hoists a template factory (`$.from_html(...)` etc.) to module scope, reusing an
 * existing identical template within the same component rather than emitting a duplicate.
 * @param {ComponentClientTransformState} state
 * @param {string} name - the base name for a newly hoisted template
 * @param {Expression} template
 * @returns {Identifier}
 */
export function hoist_template(state, name, template) {
	const key = get_template_key(template);

	if (key !== null) {
		const existing = state.templates.get(key);
		if (existing !== undefined) return existing;
	}

	const id = state.scope.root.unique(name);
	state.hoisted.push(b.var(id, template));

	if (key !== null) {
		state.templates.set(key, id);
	}

	return id;
}

/**
 * Returns a stable key for templates that are safe to deduplicate - plain
 * `$.from_html`/`from_svg`/`from_mathml` factories with literal arguments - or `null`
 * for anything else. Dev-mode templates are wrapped in `$.add_locations(...)`, which
 * embeds per-call-site locations, so they never produce a key and are never shared.
 * @param {Expression} template
 * @returns {string | null}
 */
function get_template_key(template) {
	if (template.type !== 'CallExpression' || template.callee.type !== 'Identifier') {
		return null;
	}

	const name = template.callee.name;

	if (name !== '$.from_html' && name !== '$.from_svg' && name !== '$.from_mathml') {
		return null;
	}

	const [content, flags] = template.arguments;

	if (
		content?.type !== 'TemplateLiteral' ||
		content.expressions.length !== 0 ||
		content.quasis.length !== 1
	) {
		return null;
	}

	if (flags !== undefined && (flags.type !== 'Literal' || typeof flags.value !== 'number')) {
		return null;
	}

	return `${name} ${flags ? flags.value : 0} ${content.quasis[0].value.raw}`;
}
