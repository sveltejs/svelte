import { walk } from 'zimmerframe';
import { set_scope, get_rune } from '../../scope.js';
import {
	extract_identifiers,
	extract_paths,
	is_event_attribute,
	unwrap_ts_expression
} from '../../../utils/ast.js';
import * as b from '../../../utils/builders.js';
import is_reference from 'is-reference';
import {
	ContentEditableBindings,
	VoidElements,
	WhitespaceInsensitiveAttributes
} from '../../constants.js';
import {
	clean_nodes,
	determine_namespace_for_children,
	escape_html,
	infer_namespace,
	transform_inspect_rune
} from '../utils.js';
import { create_attribute, is_custom_element_node, is_element_node } from '../../nodes.js';
import { error } from '../../../errors.js';
import { binding_properties } from '../../bindings.js';
import { regex_starts_with_newline, regex_whitespaces_strict } from '../../patterns.js';
import { remove_types } from '../typescript.js';
import { DOMBooleanAttributes } from '../../../../constants.js';
import { sanitize_template_string } from '../../../utils/sanitize_template_string.js';

/**
 * @param {string} value
 * @returns {import('./types').TemplateString}
 */
function t_string(value) {
	return { type: 'string', value };
}

/**
 * @param {import('estree').Expression} value
 * @returns {import('./types').TemplateExpression}
 */
function t_expression(value) {
	return { type: 'expression', value };
}

/**
 * @param {import('estree').Statement} value
 * @returns {import('./types').TemplateStatement}
 */
function t_statement(value) {
	return { type: 'statement', value };
}

/**
 * @param {import('./types').ServerTransformState} state
 * @returns {[import('estree').VariableDeclaration, import('estree').Identifier]}
 */
function serialize_anchor(state) {
	const id = state.scope.root.unique('anchor');
	return [b.const(id, b.call('$.create_anchor', b.id('$$payload'))), id];
}

/**
 * @param {import('./types').Template[]} template
 * @param {import('estree').Identifier} out
 * @returns {import('estree').Statement[]}
 */
function serialize_template(template, out = b.id('out')) {
	/** @type {import('estree').TemplateElement[]} */
	let quasis = [];

	/** @type {import('estree').Expression[]} */
	let expressions = [];

	/** @type {import('estree').Statement[]} */
	const statements = [];

	const flush_payload = () => {
		statements.push(
			b.stmt(b.assignment('+=', b.member(b.id('$$payload'), out), b.template(quasis, expressions)))
		);
		quasis = [];
		expressions = [];
	};

	for (let i = 0; i < template.length; i++) {
		const template_item = template[i];
		if (template_item.type === 'statement') {
			if (quasis.length !== 0) {
				flush_payload();
			}
			statements.push(template_item.value);
		} else {
			let last = quasis.at(-1);
			if (!last) quasis.push((last = b.quasi('', false)));

			if (template_item.type === 'string') {
				last.value.raw += sanitize_template_string(template_item.value);
			} else if (template_item.type === 'expression') {
				const value = template_item.value;
				if (value.type === 'TemplateLiteral') {
					last.value.raw += sanitize_template_string(value.quasis[0].value.raw);
					quasis.push(...value.quasis.slice(1));
					expressions.push(...value.expressions);
					continue;
				}
				expressions.push(value);
				quasis.push(b.quasi('', i + 1 === template.length || template[i + 1].type === 'statement'));
			}
		}
	}

	if (quasis.length !== 0) {
		flush_payload();
	}

	return statements;
}

/**
 * Processes an array of template nodes, joining sibling text/expression nodes and
 * recursing into child nodes.
 * @param {Array<import('#compiler').SvelteNode | import('./types').Anchor>} nodes
 * @param {import('#compiler').SvelteNode} parent
 * @param {import('./types').ComponentContext} context
 */
function process_children(nodes, parent, { visit, state }) {
	/** @typedef {Array<import('#compiler').Text | import('#compiler').Comment | import('#compiler').ExpressionTag | import('./types').Anchor>} Sequence */

	/** @type {Sequence} */
	let sequence = [];
	let did_flush = false;

	/**
	 * @param {Sequence} sequence
	 * @param {boolean} final
	 */
	function flush_sequence(sequence, final) {
		const is_single_flush = !did_flush && final;
		did_flush = true;

		if (sequence.length === 1) {
			const node = sequence[0];

			if (node.type === 'Text') {
				if (
					is_single_flush &&
					parent.type === 'RegularElement' &&
					(parent.name === 'script' || parent.name === 'style')
				) {
					state.template.push(t_string(node.data));
				} else {
					state.template.push(t_string(escape_html(node.data)));
				}
				return;
			}

			if (node.type === 'Comment') {
				state.template.push(t_string(`<!--${escape_html(node.data)}-->`));
				return;
			}

			if (node.type === 'Anchor') {
				state.template.push(t_expression(node.id));
				return;
			}

			const expression = b.call(
				'$.escape_text',
				/** @type {import('estree').Expression} */ (visit(node.expression))
			);
			state.template.push(t_expression(expression));

			return;
		}

		/** @type {import('estree').TemplateElement[]} */
		const quasis = [];

		/** @type {import('estree').Expression[]} */
		const expressions = [];

		quasis.push(b.quasi('', false));

		for (let i = 0; i < sequence.length; i++) {
			const node = sequence[i];
			if (node.type === 'Text' || node.type === 'Comment') {
				let last = /** @type {import('estree').TemplateElement} */ (quasis.at(-1));
				last.value.raw += node.type === 'Comment' ? `<!--${node.data}-->` : escape_html(node.data);
			} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
				let last = /** @type {import('estree').TemplateElement} */ (quasis.at(-1));
				if (node.expression.value != null) {
					last.value.raw += escape_html(node.expression.value + '');
				}
			} else if (node.type === 'Anchor') {
				expressions.push(node.id);
				quasis.push(b.quasi('', i + 1 === sequence.length));
			} else {
				expressions.push(
					b.call('$.escape', /** @type {import('estree').Expression} */ (visit(node.expression)))
				);
				quasis.push(b.quasi('', i + 1 === sequence.length));
			}
		}

		state.template.push(t_expression(b.template(quasis, expressions)));
	}

	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];

		if (
			node.type === 'Text' ||
			node.type === 'Comment' ||
			node.type === 'ExpressionTag' ||
			node.type === 'Anchor'
		) {
			sequence.push(node);
		} else {
			if (sequence.length > 0) {
				flush_sequence(sequence, false);
				sequence = [];
			}

			visit(node, {
				...state
			});
		}
	}

	if (sequence.length > 0) {
		flush_sequence(sequence, true);
	}
}

/**
 * @param {import('#compiler').SvelteNode} parent
 * @param {import('#compiler').SvelteNode[]} nodes
 * @param {import('./types').ComponentContext} context
 * @param {import('./types').Anchor} [anchor]
 * @returns {import('estree').Statement[]}
 */
function create_block(parent, nodes, context, anchor) {
	const namespace = infer_namespace(context.state.metadata.namespace, parent, nodes, context.path);

	const { hoisted, trimmed } = clean_nodes(
		parent,
		nodes,
		context.path,
		namespace,
		context.state.preserve_whitespace,
		context.state.options.preserveComments
	);

	if (hoisted.length === 0 && trimmed.length === 0 && !anchor) {
		return [];
	}

	/** @type {import('./types').ComponentServerTransformState} */
	const state = {
		...context.state,
		init: [],
		template: [],
		metadata: {
			namespace
		}
	};

	for (const node of hoisted) {
		context.visit(node, state);
	}

	process_children(anchor ? [anchor, ...trimmed, anchor] : trimmed, parent, {
		...context,
		state
	});

	/** @type {import('estree').Statement[]} */
	const body = [];

	if (state.template.length > 0) {
		body.push(...state.init);
		body.push(...serialize_template(state.template));
	} else {
		body.push(...state.init);
	}

	return body;
}

/**
 * @param {import('estree').VariableDeclarator} declarator
 * @param {import('../../scope').Scope} scope
 * @param {import('estree').Expression} value
 * @returns {import('estree').VariableDeclarator[]}
 */
function create_state_declarators(declarator, scope, value) {
	if (declarator.id.type === 'Identifier') {
		return [b.declarator(declarator.id, value)];
	}

	const tmp = scope.generate('tmp');
	const paths = extract_paths(declarator.id);
	return [
		b.declarator(b.id(tmp), value), // TODO inject declarator for opts, so we can use it below
		...paths.map((path) => {
			const value = path.expression?.(b.id(tmp));
			return b.declarator(path.node, value);
		})
	];
}

/**
 * @param {import('estree').Identifier} node
 * @param {import('./types').ServerTransformState} state
 * @returns {import('estree').Expression}
 */
function serialize_get_binding(node, state) {
	const binding = state.scope.get(node.name);

	if (binding === null || node === binding.node) {
		// No associated binding or the declaration itself which shouldn't be transformed
		return node;
	}

	if (binding.kind === 'store_sub') {
		const store_id = b.id(node.name.slice(1));
		return b.call(
			state.options.dev ? '$.store_get_dev' : '$.store_get',
			b.id('$$store_subs'),
			b.literal(node.name),
			serialize_get_binding(store_id, state)
		);
	}

	if (binding.expression) {
		return binding.expression;
	}

	return node;
}

/**
 * @param {import('estree').AssignmentExpression} node
 * @param {Pick<import('zimmerframe').Context<import('#compiler').SvelteNode, import('./types').ServerTransformState>, 'visit' | 'state'>} context
 */
function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {import('estree').Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {import('estree').BinaryOperator} */ (operator.slice(0, -1)),
					serialize_get_binding(node.left, state),
					/** @type {import('estree').Expression} */ (visit(node.right))
				);
	} else {
		return /** @type {import('estree').Expression} */ (visit(node.right));
	}
}

/**
 * @param {string} name
 */
function is_store_name(name) {
	return name[0] === '$' && /[A-Za-z_]/.test(name[1]);
}

/**
 * @param {import('estree').AssignmentExpression} node
 * @param {import('zimmerframe').Context<import('#compiler').SvelteNode, import('./types').ServerTransformState>} context
 * @param {() => any} fallback
 * @returns {import('estree').Expression}
 */
function serialize_set_binding(node, context, fallback) {
	const { state, visit } = context;

	if (
		node.left.type === 'ArrayPattern' ||
		node.left.type === 'ObjectPattern' ||
		node.left.type === 'RestElement'
	) {
		// Turn assignment into an IIFE, so that `$.set` calls etc don't produce invalid code
		const tmp_id = context.state.scope.generate('tmp');

		/** @type {import('estree').AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {import('estree').Expression[]} */
		const assignments = [];

		const paths = extract_paths(node.left);

		for (const path of paths) {
			const value = path.expression?.(b.id(tmp_id));
			const assignment = b.assignment('=', path.node, value);
			original_assignments.push(assignment);
			assignments.push(serialize_set_binding(assignment, context, () => assignment));
		}

		if (assignments.every((assignment, i) => assignment === original_assignments[i])) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return fallback();
		}

		return b.call(
			b.thunk(
				b.block([
					b.const(tmp_id, /** @type {import('estree').Expression} */ (visit(node.right))),
					b.stmt(b.sequence(assignments)),
					b.return(b.id(tmp_id))
				])
			)
		);
	}

	if (node.left.type !== 'Identifier' && node.left.type !== 'MemberExpression') {
		error(node, 'INTERNAL', `Unexpected assignment type ${node.left.type}`);
	}

	let left = node.left;

	while (left.type === 'MemberExpression') {
		// @ts-expect-error
		left = left.object;
	}

	if (left.type !== 'Identifier') {
		return fallback();
	}

	const is_store = is_store_name(left.name);
	const left_name = is_store ? left.name.slice(1) : left.name;
	const binding = state.scope.get(left_name);

	if (!binding) return fallback();

	if (binding.mutation !== null) {
		return binding.mutation(node, context);
	}

	if (
		binding.kind !== 'state' &&
		binding.kind !== 'frozen_state' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'each' &&
		binding.kind !== 'legacy_reactive' &&
		!is_store
	) {
		// TODO error if it's a computed (or rest prop)? or does that already happen elsewhere?
		return fallback();
	}

	const value = get_assignment_value(node, { state, visit });
	if (left === node.left) {
		if (is_store) {
			return b.call(
				'$.store_set',
				b.id(left_name),
				/** @type {import('estree').Expression} */ (visit(node.right))
			);
		}
		return fallback();
	} else if (is_store) {
		return b.call(
			'$.mutate_store',
			b.id('$$store_subs'),
			b.literal(left.name),
			b.id(left_name),
			b.assignment(node.operator, /** @type {import('estree').Pattern} */ (visit(node.left)), value)
		);
	}
	return fallback();
}

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 * @param {import('#compiler').Attribute} attribute
 * @param {{ state: { metadata: { namespace: import('#compiler').Namespace }}}} context
 */
function get_attribute_name(element, attribute, context) {
	let name = attribute.name;
	if (!element.metadata.svg && context.state.metadata.namespace !== 'foreign') {
		name = name.toLowerCase();
		// don't lookup boolean aliases here, the server runtime function does only
		// check for the lowercase variants of boolean attributes
	}
	return name;
}

/** @type {import('./types').Visitors} */
const global_visitors = {
	Identifier(node, { path, state }) {
		if (is_reference(node, /** @type {import('estree').Node} */ (path.at(-1)))) {
			if (node.name === '$$props') {
				return b.id('$$sanitized_props');
			}
			return serialize_get_binding(node, state);
		}
	},
	AssignmentExpression(node, context) {
		return serialize_set_binding(node, context, context.next);
	},
	UpdateExpression(node, context) {
		const { state, next } = context;
		const argument = node.argument;

		if (argument.type === 'Identifier' && state.scope.get(argument.name)?.kind === 'store_sub') {
			let fn = '$.update_store';
			if (node.prefix) fn += '_pre';

			/** @type {import('estree').Expression[]} */
			const args = [b.id('$$store_subs'), b.literal(argument.name), b.id(argument.name.slice(1))];
			if (node.operator === '--') {
				args.push(b.literal(-1));
			}

			return b.call(fn, ...args);
		}
		return next();
	}
};

/** @type {import('./types').Visitors} */
const javascript_visitors = {
	Program(node, { visit }) {
		return /** @type {import('estree').Program} */ ({
			...node,
			body: node.body.map((node) => /** @type {import('estree').Node} */ (visit(node)))
		});
	},
	BlockStatement(node, { visit }) {
		return /** @type {import('estree').BlockStatement} */ ({
			...node,
			body: node.body.map((node) => /** @type {import('estree').Node} */ (visit(node)))
		});
	}
};

/** @type {import('./types').Visitors} */
const javascript_visitors_runes = {
	PropertyDefinition(node, { state, next, visit }) {
		if (node.value != null && node.value.type === 'CallExpression') {
			const rune = get_rune(node.value, state.scope);

			if (rune === '$state' || rune === '$state.frozen' || rune === '$derived') {
				return {
					...node,
					value:
						node.value.arguments.length === 0
							? null
							: /** @type {import('estree').Expression} */ (visit(node.value.arguments[0]))
				};
			}
			if (rune === '$derived.call') {
				return {
					...node,
					value:
						node.value.arguments.length === 0
							? null
							: b.call(/** @type {import('estree').Expression} */ (visit(node.value.arguments[0])))
				};
			}
		}
		next();
	},
	VariableDeclaration(node, { state, visit }) {
		const declarations = [];

		for (const declarator of node.declarations) {
			const init = unwrap_ts_expression(declarator.init);
			const rune = get_rune(init, state.scope);
			if (!rune || rune === '$effect.active' || rune === '$inspect') {
				declarations.push(/** @type {import('estree').VariableDeclarator} */ (visit(declarator)));
				continue;
			}

			if (rune === '$props') {
				declarations.push(b.declarator(declarator.id, b.id('$$props')));
				continue;
			}

			const args = /** @type {import('estree').CallExpression} */ (init).arguments;
			const value =
				args.length === 0
					? b.id('undefined')
					: /** @type {import('estree').Expression} */ (visit(args[0]));

			if (rune === '$derived.call') {
				declarations.push(
					b.declarator(
						/** @type {import('estree').Pattern} */ (visit(declarator.id)),
						b.call(value)
					)
				);
				continue;
			}

			if (declarator.id.type === 'Identifier') {
				declarations.push(b.declarator(declarator.id, value));
				continue;
			}

			if (rune === '$derived') {
				declarations.push(
					b.declarator(/** @type {import('estree').Pattern} */ (visit(declarator.id)), value)
				);
				continue;
			}

			declarations.push(...create_state_declarators(declarator, state.scope, value));
		}

		return {
			...node,
			declarations
		};
	},
	ExpressionStatement(node, context) {
		const expression = node.expression;
		if (expression.type === 'CallExpression') {
			const callee = expression.callee;

			if (callee.type === 'Identifier' && callee.name === '$effect') {
				return b.empty;
			}

			if (
				callee.type === 'MemberExpression' &&
				callee.object.type === 'Identifier' &&
				callee.object.name === '$effect'
			) {
				return b.empty;
			}
		}
		context.next();
	},
	CallExpression(node, context) {
		const rune = get_rune(node, context.state.scope);

		if (rune === '$effect.active') {
			return b.literal(false);
		}

		if (rune === '$inspect' || rune === '$inspect().with') {
			return transform_inspect_rune(node, context);
		}

		context.next();
	}
};

/**
 *
 * @param {true | Array<import('#compiler').Text | import('#compiler').ExpressionTag>} attribute_value
 * @param {import('./types').ComponentContext} context
 * @param {boolean} trim_whitespace
 * @param {boolean} is_component
 * @returns {import('estree').Expression}
 */
function serialize_attribute_value(
	attribute_value,
	context,
	trim_whitespace = false,
	is_component = false
) {
	if (attribute_value === true) {
		return b.true;
	}

	if (attribute_value.length === 0) {
		return b.literal(''); // is this even possible?
	}

	if (attribute_value.length === 1) {
		const value = attribute_value[0];
		if (value.type === 'Text') {
			let data = value.data;
			if (trim_whitespace) {
				data = data.replace(regex_whitespaces_strict, ' ').trim();
			}

			return b.literal(is_component ? data : escape_html(data, true));
		} else {
			return /** @type {import('estree').Expression} */ (context.visit(value.expression));
		}
	}

	/** @type {import('estree').TemplateElement[]} */
	const quasis = [];

	/** @type {import('estree').Expression[]} */
	const expressions = [];

	if (attribute_value[0].type !== 'Text') {
		quasis.push(b.quasi('', false));
	}

	let i = 0;
	for (const node of attribute_value) {
		i++;
		if (node.type === 'Text') {
			let data = node.data;
			if (trim_whitespace) {
				// don't trim, space could be important to separate from expression tag
				data = data.replace(regex_whitespaces_strict, ' ');
			}
			quasis.push(b.quasi(data, i === attribute_value.length));
		} else {
			expressions.push(
				b.call(
					'$.stringify',
					/** @type {import('estree').Expression} */ (context.visit(node.expression))
				)
			);
			if (i === attribute_value.length || attribute_value[i]?.type !== 'Text') {
				quasis.push(b.quasi('', true));
			}
		}
	}

	return b.template(quasis, expressions);
}

/**
 *
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 * @param {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute>} attributes
 * @param {import('#compiler').StyleDirective[]} style_directives
 * @param {import('#compiler').ClassDirective[]} class_directives
 * @param {import('./types').ComponentContext} context
 */
function serialize_element_spread_attributes(
	element,
	attributes,
	style_directives,
	class_directives,
	context
) {
	/** @type {import('estree').Expression[]} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const name = get_attribute_name(element, attribute, context);
			const value = serialize_attribute_value(
				attribute.value,
				context,
				WhitespaceInsensitiveAttributes.includes(name)
			);
			values.push(b.object([b.prop('init', b.literal(name), value)]));
		} else {
			values.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
		}
	}

	const lowercase_attributes =
		element.metadata.svg || (element.type === 'RegularElement' && is_custom_element_node(element))
			? b.false
			: b.true;
	const is_svg = element.metadata.svg ? b.true : b.false;
	/** @type {import('estree').Expression[]} */
	const args = [
		b.array(values),
		lowercase_attributes,
		is_svg,
		b.literal(context.state.analysis.stylesheet.id)
	];

	if (style_directives.length > 0 || class_directives.length > 0) {
		const styles = style_directives.map((directive) =>
			b.init(
				directive.name,
				directive.value === true
					? b.id(directive.name)
					: serialize_attribute_value(directive.value, context, true)
			)
		);
		const expressions = class_directives.map((directive) =>
			b.conditional(directive.expression, b.literal(directive.name), b.literal(''))
		);
		const classes = expressions.length
			? b.call(
					b.member(
						b.call(b.member(b.array(expressions), b.id('filter')), b.id('Boolean')),
						b.id('join')
					),
					b.literal(' ')
				)
			: b.literal('');
		args.push(
			b.object([
				b.init('styles', styles.length === 0 ? b.literal(null) : b.object(styles)),
				b.init('classes', classes)
			])
		);
	}
	context.state.template.push(t_expression(b.call('$.spread_attributes', ...args)));
}

/**
 * @param {import('#compiler').Component | import('#compiler').SvelteComponent | import('#compiler').SvelteSelf} node
 * @param {string | import('estree').Expression} component_name
 * @param {import('./types').ComponentContext} context
 * @returns {import('estree').Statement}
 */
function serialize_inline_component(node, component_name, context) {
	/** @type {Array<import('estree').Property[] | import('estree').Expression>} */
	const props_and_spreads = [];

	/** @type {import('estree').Property[]} */
	const custom_css_props = [];

	/** @type {import('estree').ExpressionStatement[]} */
	const default_lets = [];

	/** @type {Record<string, import('#compiler').TemplateNode[]>} */
	const children = {};

	/**
	 * @param {import('estree').Property} prop
	 */
	function push_prop(prop) {
		const current = props_and_spreads.at(-1);
		const current_is_props = Array.isArray(current);
		const props = current_is_props ? current : [];
		props.push(prop);
		if (!current_is_props) {
			props_and_spreads.push(props);
		}
	}

	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			default_lets.push(
				/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute))
			);
		} else if (attribute.type === 'SpreadAttribute') {
			props_and_spreads.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
		} else if (attribute.type === 'Attribute') {
			if (attribute.name.startsWith('--')) {
				const value = serialize_attribute_value(attribute.value, context, false, true);
				custom_css_props.push(b.init(attribute.name, value));
				continue;
			}

			const value = serialize_attribute_value(attribute.value, context, false, true);
			push_prop(b.prop('init', b.key(attribute.name), value));
		} else if (attribute.type === 'BindDirective') {
			// TODO this needs to turn the whole thing into a while loop because the binding could be mutated eagerly in the child
			push_prop(
				b.get(attribute.name, [
					b.return(/** @type {import('estree').Expression} */ (context.visit(attribute.expression)))
				])
			);
			push_prop(
				b.set(attribute.name, [
					b.stmt(
						/** @type {import('estree').Expression} */ (
							context.visit(b.assignment('=', attribute.expression, b.id('$$value')))
						)
					),
					b.stmt(b.assignment('=', b.id('$$settled'), b.false))
				])
			);
		}
	}

	/** @type {import('estree').Statement[]} */
	const snippet_declarations = [];

	// Group children by slot
	for (const child of node.fragment.nodes) {
		if (child.type === 'SnippetBlock') {
			// the SnippetBlock visitor adds a declaration to `init`, but if it's directly
			// inside a component then we want to hoist them into a block so that they
			// can be used as props without creating conflicts
			context.visit(child, {
				...context.state,
				init: snippet_declarations
			});

			push_prop(b.prop('init', child.expression, child.expression));

			continue;
		}

		let slot_name = 'default';
		if (is_element_node(child)) {
			const attribute = /** @type {import('#compiler').Attribute | undefined} */ (
				child.attributes.find(
					(attribute) => attribute.type === 'Attribute' && attribute.name === 'slot'
				)
			);
			if (attribute !== undefined) {
				slot_name = /** @type {import('#compiler').Text[]} */ (attribute.value)[0].data;
			}
		}

		children[slot_name] = children[slot_name] || [];
		children[slot_name].push(child);
	}

	// Serialize each slot
	/** @type {import('estree').Property[]} */
	const serialized_slots = [];

	for (const slot_name of Object.keys(children)) {
		const body = create_block(node, children[slot_name], context);
		if (body.length === 0) continue;

		const slot_fn = b.arrow(
			[b.id('$$payload'), b.id('$$slotProps')],
			b.block([...(slot_name === 'default' ? default_lets : []), ...body])
		);

		if (slot_name === 'default') {
			push_prop(
				b.prop(
					'init',
					b.id('children'),
					context.state.options.dev ? b.call('$.add_snippet_symbol', slot_fn) : slot_fn
				)
			);
		} else {
			const slot = b.prop('init', b.literal(slot_name), slot_fn);
			serialized_slots.push(slot);
		}
	}

	if (serialized_slots.length > 0) {
		push_prop(b.prop('init', b.id('$$slots'), b.object(serialized_slots)));
	}

	const props_expression =
		props_and_spreads.length === 0 ||
		(props_and_spreads.length === 1 && Array.isArray(props_and_spreads[0]))
			? b.object(/** @type {import('estree').Property[]} */ (props_and_spreads[0] || []))
			: b.call(
					'$.spread_props',
					b.array(props_and_spreads.map((p) => (Array.isArray(p) ? b.object(p) : p)))
				);

	/** @type {import('estree').Statement} */
	let statement = b.stmt(
		(typeof component_name === 'string' ? b.call : b.maybe_call)(
			context.state.options.dev
				? b.call(
						'$.validate_component',
						typeof component_name === 'string' ? b.id(component_name) : component_name
					)
				: component_name,
			b.id('$$payload'),
			props_expression
		)
	);

	if (custom_css_props.length > 0) {
		statement = b.stmt(
			b.call(
				'$.css_props',
				b.id('$$payload'),
				b.literal(context.state.metadata.namespace === 'svg' ? false : true),
				b.object(custom_css_props),
				b.thunk(b.block([statement]))
			)
		);
	}

	if (snippet_declarations.length > 0) {
		statement = b.block([...snippet_declarations, statement]);
	}

	return statement;
}

/**
 * Returns true if the attribute contains a single static text node.
 * @param {import('#compiler').Attribute} attribute
 * @returns {attribute is import('#compiler').Attribute & { value: [import('#compiler').Text] }}
 */
function is_text_attribute(attribute) {
	return (
		attribute.value !== true && attribute.value.length === 1 && attribute.value[0].type === 'Text'
	);
}

/** @type {import('./types').Visitors} */
const javascript_visitors_legacy = {
	VariableDeclaration(node, { state, visit }) {
		/** @type {import('estree').VariableDeclarator[]} */
		const declarations = [];

		for (const declarator of node.declarations) {
			const bindings = /** @type {import('#compiler').Binding[]} */ (
				state.scope.get_bindings(declarator)
			);
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'prop');

			if (!has_state && !has_props) {
				declarations.push(/** @type {import('estree').VariableDeclarator} */ (visit(declarator)));
				continue;
			}

			if (has_props) {
				if (declarator.id.type !== 'Identifier') {
					// Turn export let into props. It's really really weird because export let { x: foo, z: [bar]} = ..
					// means that foo and bar are the props (i.e. the leafs are the prop names), not x and z.
					const tmp = state.scope.generate('tmp');
					const paths = extract_paths(declarator.id);
					declarations.push(
						b.declarator(
							b.id(tmp),
							/** @type {import('estree').Expression} */ (
								visit(/** @type {import('estree').Expression} */ (declarator.init))
							)
						)
					);
					for (const path of paths) {
						const value = path.expression?.(b.id(tmp));
						const name = /** @type {import('estree').Identifier} */ (path.node).name;
						const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(name));
						const prop = b.member(b.id('$$props'), b.literal(binding.prop_alias ?? name), true);
						declarations.push(b.declarator(path.node, b.call('$.value_or_fallback', prop, value)));
					}
					continue;
				}

				const binding = /** @type {import('#compiler').Binding} */ (
					state.scope.get(declarator.id.name)
				);
				const prop = b.member(
					b.id('$$props'),
					b.literal(binding.prop_alias ?? declarator.id.name),
					true
				);
				const init = declarator.init
					? b.call(
							'$.value_or_fallback',
							prop,
							/** @type {import('estree').Expression} */ (visit(declarator.init))
						)
					: prop;

				declarations.push(b.declarator(declarator.id, init));

				continue;
			}

			declarations.push(
				...create_state_declarators(
					declarator,
					state.scope,
					/** @type {import('estree').Expression} */ (declarator.init && visit(declarator.init))
				)
			);
		}

		return {
			...node,
			declarations
		};
	},
	LabeledStatement(node, context) {
		if (context.path.length > 1) return;
		if (node.label.name !== '$') return;

		// TODO bail out if we're in module context

		// these statements will be topologically ordered later
		context.state.legacy_reactive_statements.set(
			node,
			// people could do "break $" inside, so we need to keep the label
			b.labeled('$', /** @type {import('estree').ExpressionStatement} */ (context.visit(node.body)))
		);

		return b.empty;
	}
};

/** @type {import('./types').ComponentVisitors} */
const template_visitors = {
	Fragment(node, context) {
		const body = create_block(node, node.nodes, context);
		return b.block(body);
	},
	HtmlTag(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));
		const raw = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		context.state.template.push(t_expression(raw));
		state.template.push(t_expression(id));
	},
	ConstTag(node, { state, visit }) {
		const declaration = node.declaration.declarations[0];
		const pattern = /** @type {import('estree').Pattern} */ (visit(declaration.id));
		const init = /** @type {import('estree').Expression} */ (visit(declaration.init));
		state.init.push(b.declaration('const', pattern, init));
	},
	DebugTag(node, { state, visit }) {
		state.template.push(
			t_statement(
				b.stmt(
					b.call(
						'console.log',
						b.object(
							node.identifiers.map((identifier) =>
								b.prop(
									'init',
									identifier,
									/** @type {import('estree').Expression} */ (visit(identifier))
								)
							)
						)
					)
				)
			),
			t_statement(b.debugger)
		);
	},
	RenderTag(node, context) {
		const state = context.state;
		const [anchor, anchor_id] = serialize_anchor(state);

		state.init.push(anchor);
		state.template.push(t_expression(anchor_id));

		const expression = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		const snippet_function = state.options.dev
			? b.call('$.validate_snippet', expression)
			: expression;
		if (node.argument) {
			state.template.push(
				t_statement(
					b.stmt(
						b.call(
							snippet_function,
							b.id('$$payload'),
							/** @type {import('estree').Expression} */ (context.visit(node.argument))
						)
					)
				)
			);
		} else {
			state.template.push(t_statement(b.stmt(b.call(snippet_function, b.id('$$payload')))));
		}

		state.template.push(t_expression(anchor_id));
	},
	ClassDirective(node) {
		error(node, 'INTERNAL', 'Node should have been handled elsewhere');
	},
	StyleDirective(node) {
		error(node, 'INTERNAL', 'Node should have been handled elsewhere');
	},
	RegularElement(node, context) {
		const metadata = {
			...context.state.metadata,
			namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
		};

		context.state.template.push(t_string(`<${node.name}`));
		const body_expression = serialize_element_attributes(node, context);
		context.state.template.push(t_string('>'));

		/** @type {import('./types').ComponentServerTransformState} */
		const state = {
			...context.state,
			metadata,
			preserve_whitespace:
				context.state.preserve_whitespace ||
				((node.name === 'pre' || node.name === 'textarea') && metadata.namespace !== 'foreign')
		};

		/** @type {import('./types').ComponentContext} */
		const inner_context =
			body_expression !== null
				? {
						...context,
						state: {
							...state,
							template: [],
							init: []
						}
					}
				: { ...context, state };

		const { hoisted, trimmed } = clean_nodes(
			node,
			node.fragment.nodes,
			inner_context.path,
			metadata.namespace,
			state.preserve_whitespace,
			state.options.preserveComments
		);

		for (const node of hoisted) {
			inner_context.visit(node, state);
		}

		process_children(trimmed, node, inner_context);

		if (body_expression !== null) {
			let body_id;
			const expression = body_expression.escape
				? b.call('$.escape', body_expression.expression)
				: body_expression.expression;
			if (expression.type === 'Identifier') {
				body_id = expression;
			} else {
				body_id = b.id(context.state.scope.generate('$$body'));
				context.state.template.push(t_statement(b.const(body_id, expression)));
			}

			// Use the body expression as the body if it's truthy, otherwise use the inner template
			context.state.template.push(
				t_statement(
					b.if(
						body_id,
						b.block(serialize_template([t_expression(body_id)])),
						b.block([
							...inner_context.state.init,
							...serialize_template(inner_context.state.template)
						])
					)
				)
			);
		}

		if (!VoidElements.includes(node.name) && metadata.namespace !== 'foreign') {
			context.state.template.push(t_string(`</${node.name}>`));
		}
	},
	SvelteElement(node, context) {
		let tag = /** @type {import('estree').Expression} */ (context.visit(node.tag));
		if (tag.type !== 'Identifier') {
			const tag_id = context.state.scope.generate('$$tag');
			context.state.init.push(b.const(tag_id, tag));
			tag = b.id(tag_id);
		}

		if (context.state.options.dev) {
			if (node.fragment.nodes.length > 0) {
				context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', b.thunk(tag))));
			}
			context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', b.thunk(tag))));
		}

		const metadata = {
			...context.state.metadata,
			namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
		};
		/** @type {import('./types').ComponentContext} */
		const inner_context = {
			...context,
			state: {
				...context.state,
				metadata,
				template: [],
				init: []
			}
		};

		const [el_anchor, anchor_id] = serialize_anchor(context.state);
		context.state.init.push(el_anchor);
		context.state.template.push(t_expression(anchor_id));

		const [inner_anchor, inner_id] = serialize_anchor(context.state);
		inner_context.state.init.push(inner_anchor);
		inner_context.state.template.push(t_string('<'), t_expression(tag));
		serialize_element_attributes(node, inner_context);
		inner_context.state.template.push(t_string('>'));

		const before = serialize_template(inner_context.state.template);
		const main = create_block(node, node.fragment.nodes, {
			...context,
			state: { ...context.state, metadata }
		});
		const after = serialize_template([
			t_expression(inner_id),
			t_string('</'),
			t_expression(tag),
			t_string('>')
		]);

		context.state.template.push(
			t_statement(
				b.if(
					tag,
					b.block([
						...inner_context.state.init,
						...before,
						b.if(
							b.unary('!', b.call('$.VoidElements.has', tag)),
							b.block([...serialize_template([t_expression(inner_id)]), ...main, ...after])
						)
					])
				)
			),
			t_expression(anchor_id)
		);
	},
	EachBlock(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));

		const each_node_meta = node.metadata;
		const collection = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		const item = b.id(each_node_meta.item_name);
		const index =
			each_node_meta.contains_group_binding || !node.index
				? each_node_meta.index
				: b.id(node.index);
		const children = node.body.nodes;

		const [each_dec, each_id] = serialize_anchor(state);

		/** @type {import('./types').Anchor} */
		const anchor = {
			type: 'Anchor',
			id: each_id
		};

		const array_id = state.scope.root.unique('each_array');
		state.init.push(b.const(array_id, b.call('$.ensure_array_like', collection)));

		/** @type {import('estree').Statement[]} */
		const each = [b.const(item, b.member(array_id, index, true))];

		if (node.context.type !== 'Identifier') {
			each.push(b.const(/** @type {import('estree').Pattern} */ (node.context), item));
		}
		if (index.name !== node.index && node.index != null) {
			each.push(b.let(node.index, index));
		}

		each.push(
			each_dec,
			.../** @type {import('estree').Statement[]} */ (create_block(node, children, context, anchor))
		);

		const for_loop = b.for(
			b.let(index, b.literal(0)),
			b.binary('<', index, b.member(array_id, b.id('length'))),
			b.update('++', index, false),
			b.block(each)
		);
		if (node.fallback) {
			state.template.push(
				t_statement(
					b.if(
						b.binary('!==', b.member(array_id, b.id('length')), b.literal(0)),
						for_loop,
						b.block(create_block(node, node.fallback.nodes, context))
					)
				)
			);
		} else {
			state.template.push(t_statement(for_loop));
		}
		state.template.push(t_expression(id));
	},
	IfBlock(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));

		// Insert ssr:if:true/false anchors in addition to the other anchors so that
		// the if block can catch hydration mismatches (false on the server, true on the client and vice versa)
		// and continue hydration without having to re-render everything from scratch.

		const consequent = create_block(node, node.consequent.nodes, context);
		consequent.unshift(
			b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal('<!--ssr:if:true-->')))
		);

		const alternate = node.alternate
			? /** @type {import('estree').BlockStatement} */ (context.visit(node.alternate))
			: b.block([]);
		alternate.body.unshift(
			b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal('<!--ssr:if:false-->')))
		);

		state.template.push(
			t_statement(
				b.if(
					/** @type {import('estree').Expression} */ (context.visit(node.test)),
					b.block(/** @type {import('estree').Statement[]} */ (consequent)),
					alternate
				)
			)
		);
		state.template.push(t_expression(id));
	},
	AwaitBlock(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));

		state.template.push(
			t_statement(
				b.stmt(
					b.call(
						'$.await',
						/** @type {import('estree').Expression} */ (context.visit(node.expression)),
						b.thunk(
							node.pending
								? /** @type {import('estree').BlockStatement} */ (context.visit(node.pending))
								: b.block([])
						),
						b.arrow(
							node.value
								? [/** @type {import('estree').Pattern} */ (context.visit(node.value))]
								: [],
							node.then
								? /** @type {import('estree').BlockStatement} */ (context.visit(node.then))
								: b.block([])
						),
						b.arrow(
							node.error
								? [/** @type {import('estree').Pattern} */ (context.visit(node.error))]
								: [],
							node.catch
								? /** @type {import('estree').BlockStatement} */ (context.visit(node.catch))
								: b.block([])
						)
					)
				)
			)
		);

		state.template.push(t_expression(id));
	},
	KeyBlock(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));
		const body = create_block(node, node.fragment.nodes, context);
		state.template.push(t_statement(b.block(body)));
		state.template.push(t_expression(id));
	},
	SnippetBlock(node, context) {
		// TODO hoist where possible
		/** @type {import('estree').Pattern[]} */
		const args = [b.id('$$payload')];
		if (node.context) {
			args.push(node.context);
		}

		context.state.init.push(
			b.function_declaration(
				node.expression,
				args,
				/** @type {import('estree').BlockStatement} */ (context.visit(node.body))
			)
		);
		if (context.state.options.dev) {
			context.state.init.push(b.stmt(b.call('$.add_snippet_symbol', node.expression)));
		}
	},
	Component(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));
		const call = serialize_inline_component(node, node.name, context);
		state.template.push(t_statement(call));
		state.template.push(t_expression(id));
	},
	SvelteSelf(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));
		const call = serialize_inline_component(node, context.state.analysis.name, context);
		state.template.push(t_statement(call));
		state.template.push(t_expression(id));
	},
	SvelteComponent(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));
		const call = serialize_inline_component(
			node,
			/** @type {import('estree').Expression} */ (context.visit(node.expression)),
			context
		);
		state.template.push(t_statement(call));
		state.template.push(t_expression(id));
	},
	LetDirective(node, { state }) {
		if (node.expression && node.expression.type !== 'Identifier') {
			const name = state.scope.generate(node.name);
			const bindings = state.scope.get_bindings(node);

			for (const binding of bindings) {
				binding.expression = b.member(b.id(name), b.id(binding.node.name));
			}

			return b.const(
				name,
				b.call(
					b.thunk(
						b.block([
							b.let(
								node.expression.type === 'ObjectExpression'
									? // @ts-expect-error types don't match, but it can't contain spread elements and the structure is otherwise fine
										b.object_pattern(node.expression.properties)
									: // @ts-expect-error types don't match, but it can't contain spread elements and the structure is otherwise fine
										b.array_pattern(node.expression.elements),
								b.member(b.id('$$slotProps'), b.id(node.name))
							),
							b.return(b.object(bindings.map((binding) => b.init(binding.node.name, binding.node))))
						])
					)
				)
			);
		} else {
			const name = node.expression === null ? node.name : node.expression.name;
			return b.const(name, b.member(b.id('$$slotProps'), b.id(node.name)));
		}
	},
	SpreadAttribute(node, { visit }) {
		return visit(node.expression);
	},
	SvelteFragment(node, context) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				context.state.template.push(
					t_statement(
						/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute))
					)
				);
			}
		}

		const state = {
			...context.state,
			// TODO this logic eventually belongs in create_block, when fragments are used everywhere
			scope: /** @type {import('../../scope').Scope} */ (context.state.scopes.get(node.fragment))
		};
		const body = create_block(node, node.fragment.nodes, {
			...context,
			state
		});

		context.state.template.push(t_statement(b.block(body)));
	},
	TitleElement(node, context) {
		const state = context.state;

		/** @type {import('./types').ComponentServerTransformState} */
		const inner_state = {
			...state,
			init: [],
			template: []
		};

		process_children(node.fragment.nodes, node, {
			...context,
			state: inner_state
		});

		// Use `=` so that later title changes override earlier ones
		state.init.push(b.stmt(b.assignment('=', b.id('$$payload.title'), b.literal('<title>'))));
		inner_state.template.push(t_string('</title>'));
		// title is guaranteed to contain only text/expression tag children
		state.init.push(...serialize_template(inner_state.template, b.id('title')));
	},
	SlotElement(node, context) {
		const state = context.state;
		const [dec, id] = serialize_anchor(state);
		state.init.push(dec);
		state.template.push(t_expression(id));

		/** @type {import('estree').Property[]} */
		const props = [];

		/** @type {import('estree').Expression[]} */
		const spreads = [];

		/** @type {import('estree').Expression} */
		let expression = b.member_id('$$props.children');

		for (const attribute of node.attributes) {
			if (attribute.type === 'SpreadAttribute') {
				spreads.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
			} else if (attribute.type === 'Attribute') {
				const value = serialize_attribute_value(attribute.value, context);
				if (attribute.name === 'name') {
					expression = b.member(b.member_id('$$props.$$slots'), value, true, true);
				} else {
					if (attribute.metadata.dynamic) {
						props.push(b.get(attribute.name, [b.return(value)]));
					} else {
						props.push(b.init(attribute.name, value));
					}
				}
			}
		}

		const props_expression =
			spreads.length === 0
				? b.object(props)
				: b.call('$.spread_props', b.array([b.object(props), ...spreads]));
		const fallback =
			node.fragment.nodes.length === 0
				? b.literal(null)
				: b.thunk(b.block(create_block(node, node.fragment.nodes, context)));
		const slot = b.call('$.slot', b.id('$$payload'), expression, props_expression, fallback);

		state.template.push(t_statement(b.stmt(slot)));
		state.template.push(t_expression(id));
	},
	SvelteHead(node, context) {
		const state = context.state;
		const body = create_block(node, node.fragment.nodes, context);
		state.template.push(
			t_statement(
				b.stmt(b.call('$.head', b.id('$$payload'), b.arrow([b.id('$$payload')], b.block(body))))
			)
		);
	},
	// @ts-ignore: need to extract this out somehow
	CallExpression: javascript_visitors_runes.CallExpression
};

/**
 * Writes the output to the template output. Some elements may have attributes on them that require the
 * their output to be the child content instead. In this case, an object is returned.
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @param {import('zimmerframe').Context<import('#compiler').SvelteNode, import('./types').ComponentServerTransformState>} context
 */
function serialize_element_attributes(node, context) {
	/** @type {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute>} */
	const attributes = [];

	/** @type {import('#compiler').ClassDirective[]} */
	const class_directives = [];

	/** @type {import('#compiler').StyleDirective[]} */
	const style_directives = [];

	/** @type {import('estree').ExpressionStatement[]} */
	const lets = [];

	/** @type {{ escape: boolean; expression: import('estree').Expression } | null} */
	let content = null;

	let has_spread = false;
	// Use the index to keep the attributes order which is important for spreading
	let class_attribute_idx = -1;
	let style_attribute_idx = -1;

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'value' && node.name === 'textarea') {
				if (
					attribute.value !== true &&
					attribute.value[0].type === 'Text' &&
					regex_starts_with_newline.test(attribute.value[0].data)
				) {
					// Two or more leading newlines are required to restore the leading newline immediately after `<textarea>`.
					// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
					// also see related code in analysis phase
					attribute.value[0].data = '\n' + attribute.value[0].data;
				}
				content = { escape: true, expression: serialize_attribute_value(attribute.value, context) };

				// omit event handlers
			} else if (!is_event_attribute(attribute)) {
				if (attribute.name === 'class') {
					class_attribute_idx = attributes.length;
				} else if (attribute.name === 'style') {
					style_attribute_idx = attributes.length;
				}
				attributes.push(attribute);
			}
		} else if (attribute.type === 'BindDirective') {
			if (attribute.name === 'value' && node.name === 'select') continue;
			if (
				attribute.name === 'value' &&
				attributes.some(
					(attr) =>
						attr.type === 'Attribute' &&
						attr.name === 'type' &&
						is_text_attribute(attr) &&
						attr.value[0].data === 'file'
				)
			) {
				continue;
			}
			if (attribute.name === 'this') continue;

			const binding = binding_properties[attribute.name];
			if (binding?.omit_in_ssr) continue;

			if (ContentEditableBindings.includes(attribute.name)) {
				content = {
					escape: false,
					expression: /** @type {import('estree').Expression} */ (
						context.visit(attribute.expression)
					)
				};
			} else if (attribute.name === 'value' && node.name === 'textarea') {
				content = {
					escape: true,
					expression: /** @type {import('estree').Expression} */ (
						context.visit(attribute.expression)
					)
				};
			} else if (attribute.name === 'group') {
				const value_attribute = /** @type {import('#compiler').Attribute | undefined} */ (
					node.attributes.find((attr) => attr.type === 'Attribute' && attr.name === 'value')
				);
				if (!value_attribute) continue;

				const is_checkbox = node.attributes.some(
					(attr) =>
						attr.type === 'Attribute' &&
						attr.name === 'type' &&
						is_text_attribute(attr) &&
						attr.value[0].data === 'checkbox'
				);
				attributes.push(
					create_attribute('checked', -1, -1, [
						{
							type: 'ExpressionTag',
							start: -1,
							end: -1,
							parent: attribute,
							expression: is_checkbox
								? b.call(
										b.member(attribute.expression, b.id('includes')),
										serialize_attribute_value(value_attribute.value, context)
									)
								: b.binary(
										'===',
										attribute.expression,
										serialize_attribute_value(value_attribute.value, context)
									),
							metadata: {
								contains_call_expression: false,
								dynamic: false
							}
						}
					])
				);
			} else {
				attributes.push(
					create_attribute(attribute.name, -1, -1, [
						{
							type: 'ExpressionTag',
							start: -1,
							end: -1,
							parent: attribute,
							expression: attribute.expression,
							metadata: {
								contains_call_expression: false,
								dynamic: false
							}
						}
					])
				);
			}
		} else if (attribute.type === 'SpreadAttribute') {
			attributes.push(attribute);
			has_spread = true;
		} else if (attribute.type === 'ClassDirective') {
			class_directives.push(attribute);
		} else if (attribute.type === 'StyleDirective') {
			style_directives.push(attribute);
		} else if (attribute.type === 'LetDirective') {
			lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
		} else {
			context.visit(attribute);
		}
	}

	if (class_directives.length > 0 && !has_spread) {
		const class_attribute = serialize_class_directives(
			class_directives,
			/** @type {import('#compiler').Attribute | null} */ (attributes[class_attribute_idx] ?? null)
		);
		if (class_attribute_idx === -1) {
			attributes.push(class_attribute);
		}
	}

	if (style_directives.length > 0 && !has_spread) {
		serialize_style_directives(
			style_directives,
			/** @type {import('#compiler').Attribute | null} */ (attributes[style_attribute_idx] ?? null),
			context
		);
		if (style_attribute_idx > -1) {
			attributes.splice(style_attribute_idx, 1);
		}
	}

	// Let bindings first, they can be used on attributes
	context.state.init.push(...lets);

	if (has_spread) {
		serialize_element_spread_attributes(
			node,
			attributes,
			style_directives,
			class_directives,
			context
		);
	} else {
		for (const attribute of /** @type {import('#compiler').Attribute[]} */ (attributes)) {
			if (attribute.value === true || is_text_attribute(attribute)) {
				const name = get_attribute_name(node, attribute, context);
				const literal_value = /** @type {import('estree').Literal} */ (
					serialize_attribute_value(
						attribute.value,
						context,
						WhitespaceInsensitiveAttributes.includes(name)
					)
				).value;
				if (name !== 'class' || literal_value) {
					context.state.template.push(
						t_string(
							` ${attribute.name}${
								DOMBooleanAttributes.includes(name) && literal_value === true
									? ''
									: `="${literal_value === true ? '' : String(literal_value)}"`
							}`
						)
					);
				}
				continue;
			}

			const name = get_attribute_name(node, attribute, context);
			const is_boolean = DOMBooleanAttributes.includes(name);
			const value = serialize_attribute_value(
				attribute.value,
				context,
				WhitespaceInsensitiveAttributes.includes(name)
			);

			context.state.template.push(
				t_expression(b.call('$.attr', b.literal(name), value, b.literal(is_boolean)))
			);
		}
	}

	return content;
}

/**
 *
 * @param {import('#compiler').ClassDirective[]} class_directives
 * @param {import('#compiler').Attribute | null} class_attribute
 * @returns
 */
function serialize_class_directives(class_directives, class_attribute) {
	const expressions = class_directives.map((directive) =>
		b.conditional(directive.expression, b.literal(directive.name), b.literal(''))
	);
	if (class_attribute === null) {
		class_attribute = create_attribute('class', -1, -1, []);
	}
	const last = /** @type {any[]} */ (class_attribute.value).at(-1);
	if (last?.type === 'Text') {
		last.data += ' ';
		last.raw += ' ';
	} else if (last) {
		/** @type {import('#compiler').Text[]} */ (class_attribute.value).push({
			type: 'Text',
			start: -1,
			end: -1,
			parent: class_attribute,
			data: ' ',
			raw: ' '
		});
	}
	/** @type {import('#compiler').ExpressionTag[]} */ (class_attribute.value).push({
		type: 'ExpressionTag',
		start: -1,
		end: -1,
		parent: class_attribute,
		expression: b.call(
			b.member(
				b.call(b.member(b.array(expressions), b.id('filter')), b.id('Boolean')),
				b.id('join')
			),
			b.literal(' ')
		),
		metadata: { contains_call_expression: false, dynamic: false }
	});
	return class_attribute;
}

/**
 * @param {import('#compiler').StyleDirective[]} style_directives
 * @param {import('#compiler').Attribute | null} style_attribute
 * @param {import('./types').ComponentContext} context
 */
function serialize_style_directives(style_directives, style_attribute, context) {
	const styles = style_directives.map((directive) => {
		let value =
			directive.value === true
				? b.id(directive.name)
				: serialize_attribute_value(directive.value, context, true);
		if (directive.modifiers.includes('important')) {
			value = b.binary('+', value, b.literal(' !important'));
		}
		return b.init(directive.name, value);
	});
	if (style_attribute === null) {
		context.state.template.push(t_expression(b.call('$.add_styles', b.object(styles))));
	} else {
		context.state.template.push(
			t_expression(
				b.call(
					'$.add_styles',
					b.call(
						'$.merge_styles',
						serialize_attribute_value(style_attribute.value, context, true),
						b.object(styles)
					)
				)
			)
		);
	}
}

/**
 * @param {import('../../types').ComponentAnalysis} analysis
 * @param {import('#compiler').ValidatedCompileOptions} options
 * @returns {import('estree').Program}
 */
export function server_component(analysis, options) {
	/** @type {import('./types').ComponentServerTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.template.scopes,
		hoisted: [b.import_all('$', 'svelte/internal/server')],
		legacy_reactive_statements: new Map(),
		// these should be set by create_block - if they're called outside, it's a bug
		get init() {
			/** @type {any[]} */
			const a = [];
			a.push = () => error(null, 'INTERNAL', 'init.push should not be called outside create_block');
			return a;
		},
		get template() {
			/** @type {any[]} */
			const a = [];
			a.push = () =>
				error(null, 'INTERNAL', 'template.push should not be called outside create_block');
			return a;
		},
		metadata: {
			namespace: options.namespace
		},
		preserve_whitespace: options.preserveWhitespace
	};

	const module = /** @type {import('estree').Program} */ (
		walk(/** @type {import('#compiler').SvelteNode} */ (analysis.module.ast), state, {
			...set_scope(analysis.module.scopes),
			...global_visitors,
			...remove_types,
			...javascript_visitors,
			...(analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy)
		})
	);

	const instance = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.instance.ast),
			{ ...state, scope: analysis.instance.scope },
			{
				...set_scope(analysis.instance.scopes),
				...global_visitors,
				...{ ...remove_types, ImportDeclaration: undefined, ExportNamedDeclaration: undefined },
				...javascript_visitors,
				...(analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy),
				ImportDeclaration(node, context) {
					// @ts-expect-error
					state.hoisted.push(remove_types.ImportDeclaration(node, context));
					return b.empty;
				},
				ExportNamedDeclaration(node, context) {
					if (node.declaration) {
						// @ts-expect-error
						return remove_types.ExportNamedDeclaration(context.visit(node.declaration), context);
					}

					return b.empty;
				}
			}
		)
	);

	const template = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.template.ast),
			{ ...state, scope: analysis.template.scope },
			{
				...set_scope(analysis.template.scopes),
				...global_visitors,
				...remove_types,
				...template_visitors
			}
		)
	);

	/** @type {import('estree').VariableDeclarator[]} */
	const legacy_reactive_declarations = [];

	for (const [node] of analysis.reactive_statements) {
		const statement = [...state.legacy_reactive_statements].find(([n]) => n === node);
		if (statement === undefined) {
			error(node, 'INTERNAL', 'Could not find reactive statement');
		}

		if (
			node.body.type === 'ExpressionStatement' &&
			node.body.expression.type === 'AssignmentExpression'
		) {
			for (const id of extract_identifiers(node.body.expression.left)) {
				const binding = analysis.instance.scope.get(id.name);
				if (binding?.kind === 'legacy_reactive') {
					legacy_reactive_declarations.push(b.declarator(id));
				}
			}
		}

		instance.body.push(statement[1]);
	}

	if (legacy_reactive_declarations.length > 0) {
		instance.body.unshift({
			type: 'VariableDeclaration',
			kind: 'let',
			declarations: legacy_reactive_declarations
		});
	}

	// If the component binds to a child, we need to put the template in a loop and repeat until bindings are stable
	if (analysis.uses_component_bindings) {
		template.body = [
			b.let('$$settled', b.true),
			b.let('$$inner_payload'),
			b.stmt(
				b.function(
					b.id('$$render_inner'),
					[b.id('$$payload')],
					b.block(/** @type {import('estree').Statement[]} */ (template.body))
				)
			),
			b.do_while(
				b.unary('!', b.id('$$settled')),
				b.block([
					b.stmt(b.assignment('=', b.id('$$settled'), b.true)),
					b.stmt(
						b.assignment('=', b.id('$$inner_payload'), b.call('$.copy_payload', b.id('$$payload')))
					),
					b.stmt(b.call('$$render_inner', b.id('$$inner_payload')))
				])
			),
			b.stmt(b.call('$.assign_payload', b.id('$$payload'), b.id('$$inner_payload')))
		];
	}

	if (
		[...analysis.instance.scope.declarations.values()].some(
			(binding) => binding.kind === 'store_sub'
		)
	) {
		instance.body.unshift(b.const('$$store_subs', b.object([])));
		template.body.push(b.stmt(b.call('$.unsubscribe_stores', b.id('$$store_subs'))));
	}

	// Propagate values of bound props upwards if they're undefined in the parent and have a value.
	// Don't do this as part of the props retrieval because people could eagerly mutate the prop in the instance script.
	/** @type {import('estree').Property[]} */
	const props = [];
	for (const [name, binding] of analysis.instance.scope.declarations) {
		if (binding.kind === 'prop' && !name.startsWith('$$')) {
			props.push(b.init(binding.prop_alias ?? name, b.id(name)));
		}
	}
	for (const { name, alias } of analysis.exports) {
		props.push(b.init(alias ?? name, b.id(name)));
	}
	if (props.length > 0) {
		template.body.push(b.stmt(b.call('$.bind_props', b.id('$$props'), b.object(props))));
	}

	const component_block = b.block([
		b.stmt(b.call('$.push', b.literal(analysis.runes))),
		.../** @type {import('estree').Statement[]} */ (instance.body),
		.../** @type {import('estree').Statement[]} */ (template.body),
		b.stmt(b.call('$.pop'))
	]);

	if (analysis.uses_rest_props) {
		/** @type {string[]} */
		const named_props = analysis.exports.map(({ name, alias }) => alias ?? name);
		for (const [name, binding] of analysis.instance.scope.declarations) {
			if (binding.kind === 'prop') named_props.push(binding.prop_alias ?? name);
		}

		component_block.body.unshift(
			b.const(
				'$$restProps',
				b.call(
					'$.rest_props',
					b.id('$$sanitized_props'),
					b.array(named_props.map((name) => b.literal(name)))
				)
			)
		);
	}

	if (analysis.uses_props || analysis.uses_rest_props) {
		component_block.body.unshift(
			b.const('$$sanitized_props', b.call('$.sanitize_props', b.id('$$props')))
		);
	}

	if (analysis.uses_slots) {
		component_block.body.unshift(b.const('$$slots', b.call('$.sanitize_slots', b.id('$$props'))));
	}

	const body = [...state.hoisted, ...module.body];

	const component_function = b.function_declaration(
		b.id(analysis.name),
		[b.id('$$payload'), b.id('$$props')],
		component_block
	);
	if (options.legacy.componentApi) {
		body.unshift(b.imports([['render', '$$_render']], 'svelte/server'));
		body.push(
			component_function,
			b.stmt(
				b.assignment(
					'=',
					b.member_id(`${analysis.name}.render`),
					b.function(
						null,
						[b.id('$$props'), b.id('$$opts')],
						b.block([
							b.return(
								b.call(
									'$$_render',
									b.id(analysis.name),
									b.object([
										b.init('props', b.id('$$props')),
										b.init('context', b.member(b.id('$$opts'), b.id('context'), false, true))
									])
								)
							)
						])
					)
				)
			),
			b.export_default(b.id(analysis.name))
		);
	} else if (options.dev) {
		body.push(
			component_function,
			b.stmt(
				b.assignment(
					'=',
					b.member_id(`${analysis.name}.render`),
					b.function(
						null,
						[],
						b.block([
							b.throw_error(
								`Component.render(...) is no longer valid in Svelte 5. ` +
									'See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more information'
							)
						])
					)
				)
			),
			b.export_default(b.id(analysis.name))
		);
	} else {
		body.push(b.export_default(component_function));
	}

	return {
		type: 'Program',
		sourceType: 'module',
		body
	};
}

/**
 * @param {import('../../types').Analysis} analysis
 * @param {import('#compiler').ValidatedModuleCompileOptions} options
 * @returns {import('estree').Program}
 */
export function server_module(analysis, options) {
	/** @type {import('./types').ServerTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.module.scopes,
		// this is an anomaly — it can only be used in components, but it needs
		// to be present for `javascript_visitors` and so is included in module
		// transform state as well as component transform state
		legacy_reactive_statements: new Map()
	};

	const module = /** @type {import('estree').Program} */ (
		walk(/** @type {import('#compiler').SvelteNode} */ (analysis.module.ast), state, {
			...set_scope(analysis.module.scopes),
			...global_visitors,
			...javascript_visitors,
			...javascript_visitors_runes
		})
	);

	return {
		type: 'Program',
		sourceType: 'module',
		body: [b.import_all('$', 'svelte/internal/server'), ...module.body]
	};
}
