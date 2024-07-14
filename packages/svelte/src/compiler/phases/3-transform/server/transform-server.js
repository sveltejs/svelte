import { walk } from 'zimmerframe';
import { set_scope, get_rune } from '../../scope.js';
import {
	extract_identifiers,
	extract_paths,
	is_event_attribute,
	is_expression_async,
	is_text_attribute,
	unwrap_optional
} from '../../../utils/ast.js';
import * as b from '../../../utils/builders.js';
import is_reference from 'is-reference';
import {
	ContentEditableBindings,
	LoadErrorElements,
	VoidElements,
	WhitespaceInsensitiveAttributes
} from '../../constants.js';
import {
	clean_nodes,
	determine_namespace_for_children,
	infer_namespace,
	transform_inspect_rune
} from '../utils.js';
import { create_attribute, is_custom_element_node, is_element_node } from '../../nodes.js';
import { binding_properties } from '../../bindings.js';
import { regex_starts_with_newline, regex_whitespaces_strict } from '../../patterns.js';
import {
	DOMBooleanAttributes,
	ELEMENT_IS_NAMESPACED,
	ELEMENT_PRESERVE_ATTRIBUTE_CASE
} from '../../../../constants.js';
import { escape_html } from '../../../../escaping.js';
import { sanitize_template_string } from '../../../utils/sanitize_template_string.js';
import {
	EMPTY_COMMENT,
	BLOCK_CLOSE,
	BLOCK_OPEN,
	BLOCK_OPEN_ELSE
} from '../../../../internal/server/hydration.js';
import { filename, locator } from '../../../state.js';
import { render_stylesheet } from '../css/index.js';

/** Opens an if/each block, so that we can remove nodes in the case of a mismatch */
const block_open = b.literal(BLOCK_OPEN);

/** Closes an if/each block, so that we can remove nodes in the case of a mismatch. Also serves as an anchor for these blocks */
const block_close = b.literal(BLOCK_CLOSE);

/** Empty comment to keep text nodes separate, or provide an anchor node for blocks */
const empty_comment = b.literal(EMPTY_COMMENT);

/**
 * @param {import('estree').Node} node
 * @returns {node is import('estree').Statement}
 */
function is_statement(node) {
	return node.type.endsWith('Statement') || node.type.endsWith('Declaration');
}

/**
 * @param {Array<import('estree').Statement | import('estree').Expression>} template
 * @param {import('estree').Identifier} out
 * @param {import('estree').AssignmentOperator} operator
 * @returns {import('estree').Statement[]}
 */
function serialize_template(template, out = b.id('$$payload.out'), operator = '+=') {
	/** @type {import('estree').TemplateElement[]} */
	let quasis = [];

	/** @type {import('estree').Expression[]} */
	let expressions = [];

	/** @type {import('estree').Statement[]} */
	const statements = [];

	const flush = () => {
		statements.push(b.stmt(b.assignment(operator, out, b.template(quasis, expressions))));
		quasis = [];
		expressions = [];
	};

	for (let i = 0; i < template.length; i++) {
		const node = template[i];

		if (is_statement(node)) {
			if (quasis.length !== 0) {
				flush();
			}

			statements.push(node);
		} else {
			let last = quasis.at(-1);
			if (!last) quasis.push((last = b.quasi('', false)));

			if (node.type === 'Literal') {
				last.value.raw +=
					typeof node.value === 'string' ? sanitize_template_string(node.value) : node.value;
			} else if (node.type === 'TemplateLiteral') {
				last.value.raw += node.quasis[0].value.raw;
				quasis.push(...node.quasis.slice(1));
				expressions.push(...node.expressions);
			} else {
				expressions.push(node);
				quasis.push(b.quasi('', i + 1 === template.length || is_statement(template[i + 1])));
			}
		}
	}

	if (quasis.length !== 0) {
		flush();
	}

	return statements;
}

/**
 * Processes an array of template nodes, joining sibling text/expression nodes and
 * recursing into child nodes.
 * @param {Array<import('#compiler').SvelteNode>} nodes
 * @param {import('./types').ComponentContext} context
 */
function process_children(nodes, { visit, state }) {
	/** @type {Array<import('#compiler').Text | import('#compiler').Comment | import('#compiler').ExpressionTag>} */
	let sequence = [];

	function flush() {
		let quasi = b.quasi('', false);
		const quasis = [quasi];

		/** @type {import('estree').Expression[]} */
		const expressions = [];

		for (let i = 0; i < sequence.length; i++) {
			const node = sequence[i];

			if (node.type === 'Text' || node.type === 'Comment') {
				quasi.value.raw += sanitize_template_string(
					node.type === 'Comment' ? `<!--${node.data}-->` : escape_html(node.data)
				);
			} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
				if (node.expression.value != null) {
					quasi.value.raw += sanitize_template_string(escape_html(node.expression.value + ''));
				}
			} else {
				expressions.push(
					b.call('$.escape', /** @type {import('estree').Expression} */ (visit(node.expression)))
				);

				quasi = b.quasi('', i + 1 === sequence.length);
				quasis.push(quasi);
			}
		}

		state.template.push(b.template(quasis, expressions));
	}

	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];

		if (node.type === 'Text' || node.type === 'Comment' || node.type === 'ExpressionTag') {
			sequence.push(node);
		} else {
			if (sequence.length > 0) {
				flush();
				sequence = [];
			}

			visit(node, { ...state });
		}
	}

	if (sequence.length > 0) {
		flush();
	}
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
			'$.store_get',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(node.name),
			serialize_get_binding(store_id, state)
		);
	}

	if (binding.expression) {
		return typeof binding.expression === 'function' ? binding.expression(node) : binding.expression;
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
	}

	return /** @type {import('estree').Expression} */ (visit(node.right));
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
		throw new Error(`Unexpected assignment type ${node.left.type}`);
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
		binding.kind !== 'bindable_prop' &&
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
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
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
 * @param {{ state: { namespace: import('#compiler').Namespace }}} context
 */
function get_attribute_name(element, attribute, context) {
	let name = attribute.name;
	if (!element.metadata.svg && !element.metadata.mathml && context.state.namespace !== 'foreign') {
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
			return b.call(
				node.prefix ? '$.update_store_pre' : '$.update_store',
				b.assignment('??=', b.id('$$store_subs'), b.object([])),
				b.literal(argument.name),
				b.id(argument.name.slice(1)),
				node.operator === '--' && b.literal(-1)
			);
		}

		return next();
	},
	CallExpression(node, context) {
		const rune = get_rune(node, context.state.scope);

		if (rune === '$host') {
			return b.id('undefined');
		}

		if (rune === '$effect.tracking') {
			return b.literal(false);
		}

		if (rune === '$effect.root') {
			// ignore $effect.root() calls, just return a noop which mimics the cleanup function
			return b.arrow([], b.block([]));
		}

		if (rune === '$state.snapshot') {
			return b.call(
				'$.snapshot',
				/** @type {import('estree').Expression} */ (context.visit(node.arguments[0]))
			);
		}

		if (rune === '$state.is') {
			return b.call(
				'Object.is',
				/** @type {import('estree').Expression} */ (context.visit(node.arguments[0])),
				/** @type {import('estree').Expression} */ (context.visit(node.arguments[1]))
			);
		}

		if (rune === '$inspect' || rune === '$inspect().with') {
			return transform_inspect_rune(node, context);
		}

		context.next();
	}
};

/** @type {import('./types').Visitors} */
const javascript_visitors_runes = {
	ClassBody(node, { state, visit }) {
		/** @type {Map<string, import('../../3-transform/client/types.js').StateField>} */
		const public_derived = new Map();

		/** @type {Map<string, import('../../3-transform/client/types.js').StateField>} */
		const private_derived = new Map();

		/** @type {string[]} */
		const private_ids = [];

		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				(definition.key.type === 'Identifier' || definition.key.type === 'PrivateIdentifier')
			) {
				const { type, name } = definition.key;

				const is_private = type === 'PrivateIdentifier';
				if (is_private) private_ids.push(name);

				if (definition.value?.type === 'CallExpression') {
					const rune = get_rune(definition.value, state.scope);
					if (rune === '$derived' || rune === '$derived.by') {
						/** @type {import('../../3-transform/client/types.js').StateField} */
						const field = {
							kind: rune === '$derived.by' ? 'derived_call' : 'derived',
							// @ts-expect-error this is set in the next pass
							id: is_private ? definition.key : null
						};

						if (is_private) {
							private_derived.set(name, field);
						} else {
							public_derived.set(name, field);
						}
					}
				}
			}
		}

		// each `foo = $derived()` needs a backing `#foo` field
		for (const [name, field] of public_derived) {
			let deconflicted = name;
			while (private_ids.includes(deconflicted)) {
				deconflicted = '_' + deconflicted;
			}

			private_ids.push(deconflicted);
			field.id = b.private_id(deconflicted);
		}

		/** @type {Array<import('estree').MethodDefinition | import('estree').PropertyDefinition>} */
		const body = [];

		const child_state = { ...state, private_derived };

		// Replace parts of the class body
		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				(definition.key.type === 'Identifier' || definition.key.type === 'PrivateIdentifier')
			) {
				const name = definition.key.name;

				const is_private = definition.key.type === 'PrivateIdentifier';
				const field = (is_private ? private_derived : public_derived).get(name);

				if (definition.value?.type === 'CallExpression' && field !== undefined) {
					const init = /** @type {import('estree').Expression} **/ (
						visit(definition.value.arguments[0], child_state)
					);
					const value =
						field.kind === 'derived_call'
							? b.call('$.once', init)
							: b.call('$.once', b.thunk(init));

					if (is_private) {
						body.push(b.prop_def(field.id, value));
					} else {
						// #foo;
						const member = b.member(b.this, field.id);
						body.push(b.prop_def(field.id, value));

						// get foo() { return this.#foo; }
						body.push(b.method('get', definition.key, [], [b.return(b.call(member))]));

						if ((field.kind === 'derived' || field.kind === 'derived_call') && state.options.dev) {
							body.push(
								b.method(
									'set',
									definition.key,
									[b.id('_')],
									[b.throw_error(`Cannot update a derived property ('${name}')`)]
								)
							);
						}
					}

					continue;
				}
			}

			body.push(/** @type {import('estree').MethodDefinition} **/ (visit(definition, child_state)));
		}

		return { ...node, body };
	},
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
			if (rune === '$derived.by') {
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
			const init = declarator.init;
			const rune = get_rune(init, state.scope);
			if (!rune || rune === '$effect.tracking' || rune === '$inspect' || rune === '$effect.root') {
				declarations.push(/** @type {import('estree').VariableDeclarator} */ (visit(declarator)));
				continue;
			}

			if (rune === '$props') {
				// remove $bindable() from props declaration
				const id = walk(declarator.id, null, {
					AssignmentPattern(node) {
						if (
							node.right.type === 'CallExpression' &&
							get_rune(node.right, state.scope) === '$bindable'
						) {
							const right = node.right.arguments.length
								? /** @type {import('estree').Expression} */ (visit(node.right.arguments[0]))
								: b.id('undefined');
							return b.assignment_pattern(node.left, right);
						}
					}
				});
				declarations.push(b.declarator(id, b.id('$$props')));
				continue;
			}

			const args = /** @type {import('estree').CallExpression} */ (init).arguments;
			const value =
				args.length === 0
					? b.id('undefined')
					: /** @type {import('estree').Expression} */ (visit(args[0]));

			if (rune === '$derived.by') {
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
	MemberExpression(node, context) {
		if (node.object.type === 'ThisExpression' && node.property.type === 'PrivateIdentifier') {
			const field = context.state.private_derived.get(node.property.name);
			if (field) {
				return b.call(node);
			}
		}

		context.next();
	}
};

/**
 *
 * @param {true | Array<import('#compiler').Text | import('#compiler').ExpressionTag>} value
 * @param {import('./types').ComponentContext} context
 * @param {boolean} trim_whitespace
 * @param {boolean} is_component
 * @returns {import('estree').Expression}
 */
function serialize_attribute_value(value, context, trim_whitespace = false, is_component = false) {
	if (value === true) {
		return b.true;
	}

	if (value.length === 1) {
		const chunk = value[0];

		if (chunk.type === 'Text') {
			const data = trim_whitespace
				? chunk.data.replace(regex_whitespaces_strict, ' ').trim()
				: chunk.data;

			return b.literal(is_component ? data : escape_html(data, true));
		}

		return /** @type {import('estree').Expression} */ (context.visit(chunk.expression));
	}

	let quasi = b.quasi('', false);
	const quasis = [quasi];

	/** @type {import('estree').Expression[]} */
	const expressions = [];

	for (let i = 0; i < value.length; i++) {
		const node = value[i];

		if (node.type === 'Text') {
			quasi.value.raw += trim_whitespace
				? node.data.replace(regex_whitespaces_strict, ' ')
				: node.data;
		} else {
			expressions.push(
				b.call(
					'$.stringify',
					/** @type {import('estree').Expression} */ (context.visit(node.expression))
				)
			);

			quasi = b.quasi('', i + 1 === value.length);
			quasis.push(quasi);
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
	let classes;
	let styles;
	let flags = 0;

	if (class_directives.length > 0 || context.state.analysis.css.hash) {
		const properties = class_directives.map((directive) =>
			b.init(
				directive.name,
				directive.expression.type === 'Identifier' && directive.expression.name === directive.name
					? b.id(directive.name)
					: /** @type {import('estree').Expression} */ (context.visit(directive.expression))
			)
		);

		if (context.state.analysis.css.hash) {
			properties.unshift(b.init(context.state.analysis.css.hash, b.literal(true)));
		}

		classes = b.object(properties);
	}

	if (style_directives.length > 0) {
		const properties = style_directives.map((directive) =>
			b.init(
				directive.name,
				directive.value === true
					? b.id(directive.name)
					: serialize_attribute_value(directive.value, context, true)
			)
		);

		styles = b.object(properties);
	}

	if (element.metadata.svg || element.metadata.mathml) {
		flags |= ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE;
	} else if (is_custom_element_node(element)) {
		flags |= ELEMENT_PRESERVE_ATTRIBUTE_CASE;
	}

	const object = b.object(
		attributes.map((attribute) => {
			if (attribute.type === 'Attribute') {
				const name = get_attribute_name(element, attribute, context);
				const value = serialize_attribute_value(
					attribute.value,
					context,
					WhitespaceInsensitiveAttributes.includes(name)
				);
				return b.prop('init', b.key(name), value);
			}

			return b.spread(/** @type {import('estree').Expression} */ (context.visit(attribute)));
		})
	);

	const args = [object, classes, styles, flags ? b.literal(flags) : undefined];
	context.state.template.push(b.call('$.spread_attributes', ...args));
}

/**
 * @param {import('#compiler').Component | import('#compiler').SvelteComponent | import('#compiler').SvelteSelf} node
 * @param {import('estree').Expression} expression
 * @param {import('./types').ComponentContext} context
 */
function serialize_inline_component(node, expression, context) {
	/** @type {Array<import('estree').Property[] | import('estree').Expression>} */
	const props_and_spreads = [];

	/** @type {import('estree').Property[]} */
	const custom_css_props = [];

	/** @type {import('estree').ExpressionStatement[]} */
	const lets = [];

	/** @type {Record<string, import('#compiler').TemplateNode[]>} */
	const children = {};

	/**
	 * If this component has a slot property, it is a named slot within another component. In this case
	 * the slot scope applies to the component itself, too, and not just its children.
	 */
	let slot_scope_applies_to_itself = false;

	/**
	 * Components may have a children prop and also have child nodes. In this case, we assume
	 * that the child component isn't using render tags yet and pass the slot as $$slots.default.
	 * We're not doing it for spread attributes, as this would result in too many false positives.
	 */
	let has_children_prop = false;

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
			lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
		} else if (attribute.type === 'SpreadAttribute') {
			props_and_spreads.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
		} else if (attribute.type === 'Attribute') {
			if (attribute.name.startsWith('--')) {
				const value = serialize_attribute_value(attribute.value, context, false, true);
				custom_css_props.push(b.init(attribute.name, value));
				continue;
			}

			if (attribute.name === 'slot') {
				slot_scope_applies_to_itself = true;
			}

			if (attribute.name === 'children') {
				has_children_prop = true;
			}

			const value = serialize_attribute_value(attribute.value, context, false, true);
			push_prop(b.prop('init', b.key(attribute.name), value));
		} else if (attribute.type === 'BindDirective' && attribute.name !== 'this') {
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

	if (slot_scope_applies_to_itself) {
		context.state.init.push(...lets);
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
		const block = /** @type {import('estree').BlockStatement} */ (
			context.visit(
				{
					...node.fragment,
					// @ts-expect-error
					nodes: children[slot_name]
				},
				{
					...context.state,
					scope:
						context.state.scopes.get(slot_name === 'default' ? children[slot_name][0] : node) ??
						context.state.scope
				}
			)
		);

		if (block.body.length === 0) continue;

		const slot_fn = b.arrow(
			[b.id('$$payload'), b.id('$$slotProps')],
			b.block([
				...(slot_name === 'default' && !slot_scope_applies_to_itself ? lets : []),
				...block.body
			])
		);

		if (
			slot_name === 'default' &&
			!has_children_prop &&
			lets.length === 0 &&
			children.default.every((node) => node.type !== 'SvelteFragment')
		) {
			push_prop(
				b.prop(
					'init',
					b.id('children'),
					context.state.options.dev ? b.call('$.add_snippet_symbol', slot_fn) : slot_fn
				)
			);
			// We additionally add the default slot as a boolean, so that the slot render function on the other
			// side knows it should get the content to render from $$props.children
			serialized_slots.push(b.init('default', b.true));
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
		(node.type === 'SvelteComponent' ? b.maybe_call : b.call)(
			context.state.options.dev ? b.call('$.validate_component', expression) : expression,
			b.id('$$payload'),
			props_expression
		)
	);

	if (snippet_declarations.length > 0) {
		statement = b.block([...snippet_declarations, statement]);
	}

	const dynamic =
		node.type === 'SvelteComponent' || (node.type === 'Component' && node.metadata.dynamic);

	if (custom_css_props.length > 0) {
		context.state.template.push(
			b.stmt(
				b.call(
					'$.css_props',
					b.id('$$payload'),
					b.literal(context.state.namespace === 'svg' ? false : true),
					b.object(custom_css_props),
					b.thunk(b.block([statement])),
					dynamic && b.true
				)
			)
		);
	} else {
		if (dynamic) {
			context.state.template.push(empty_comment);
		}

		context.state.template.push(statement);

		if (!context.state.skip_hydration_boundaries) {
			context.state.template.push(empty_comment);
		}
	}
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
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

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
						declarations.push(
							b.declarator(path.node, b.call('$.value_or_fallback', prop, b.thunk(value)))
						);
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

				/** @type {import('estree').Expression} */
				let init = prop;
				if (declarator.init) {
					const default_value = /** @type {import('estree').Expression} */ (visit(declarator.init));
					init = is_expression_async(default_value)
						? b.await(b.call('$.value_or_fallback_async', prop, b.thunk(default_value, true)))
						: b.call('$.value_or_fallback', prop, b.thunk(default_value));
				}

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
		const parent = context.path.at(-1) ?? node;
		const namespace = infer_namespace(context.state.namespace, parent, node.nodes);

		const { hoisted, trimmed, is_standalone, is_text_first } = clean_nodes(
			parent,
			node.nodes,
			context.path,
			namespace,
			context.state,
			context.state.preserve_whitespace,
			context.state.options.preserveComments
		);

		/** @type {import('./types').ComponentServerTransformState} */
		const state = {
			...context.state,
			init: [],
			template: [],
			namespace,
			skip_hydration_boundaries: is_standalone
		};

		for (const node of hoisted) {
			context.visit(node, state);
		}

		if (is_text_first) {
			// insert `<!---->` to prevent this from being glued to the previous fragment
			state.template.push(empty_comment);
		}

		process_children(trimmed, { ...context, state });

		return b.block([...state.init, ...serialize_template(state.template)]);
	},
	HtmlTag(node, context) {
		const expression = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		context.state.template.push(b.call('$.html', expression));
	},
	ConstTag(node, { state, visit }) {
		const declaration = node.declaration.declarations[0];
		const pattern = /** @type {import('estree').Pattern} */ (visit(declaration.id));
		const init = /** @type {import('estree').Expression} */ (visit(declaration.init));
		state.init.push(b.declaration('const', pattern, init));
	},
	DebugTag(node, { state, visit }) {
		state.template.push(
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
			),
			b.debugger
		);
	},
	RenderTag(node, context) {
		const callee = unwrap_optional(node.expression).callee;
		const raw_args = unwrap_optional(node.expression).arguments;

		const expression = /** @type {import('estree').Expression} */ (context.visit(callee));
		const snippet_function = context.state.options.dev
			? b.call(
					'$.validate_snippet',
					expression,
					raw_args.length && callee.type === 'Identifier' && callee.name === 'children'
						? b.id('$$props')
						: undefined
				)
			: expression;

		const snippet_args = raw_args.map((arg) => {
			return /** @type {import('estree').Expression} */ (context.visit(arg));
		});

		context.state.template.push(
			b.stmt(
				(node.expression.type === 'CallExpression' ? b.call : b.maybe_call)(
					snippet_function,
					b.id('$$payload'),
					...snippet_args
				)
			)
		);

		if (!context.state.skip_hydration_boundaries) {
			context.state.template.push(empty_comment);
		}
	},
	ClassDirective() {
		throw new Error('Node should have been handled elsewhere');
	},
	StyleDirective() {
		throw new Error('Node should have been handled elsewhere');
	},
	RegularElement(node, context) {
		context.state.template.push(b.literal(`<${node.name}`));
		const body = serialize_element_attributes(node, context);
		context.state.template.push(b.literal('>'));

		if ((node.name === 'script' || node.name === 'style') && node.fragment.nodes.length === 1) {
			context.state.template.push(
				b.literal(/** @type {import('#compiler').Text} */ (node.fragment.nodes[0]).data),
				b.literal(`</${node.name}>`)
			);

			return;
		}

		const namespace = determine_namespace_for_children(node, context.state.namespace);

		/** @type {import('./types').ComponentServerTransformState} */
		const state = {
			...context.state,
			namespace,
			preserve_whitespace:
				context.state.preserve_whitespace ||
				((node.name === 'pre' || node.name === 'textarea') && namespace !== 'foreign')
		};

		const { hoisted, trimmed } = clean_nodes(
			node,
			node.fragment.nodes,
			context.path,
			namespace,
			{
				...state,
				scope: /** @type {import('../../scope').Scope} */ (state.scopes.get(node.fragment))
			},
			state.preserve_whitespace,
			state.options.preserveComments
		);

		for (const node of hoisted) {
			context.visit(node, state);
		}

		if (state.options.dev) {
			const location = /** @type {import('locate-character').Location} */ (locator(node.start));
			state.template.push(
				b.stmt(
					b.call(
						'$.push_element',
						b.id('$$payload'),
						b.literal(node.name),
						b.literal(location.line),
						b.literal(location.column)
					)
				)
			);
		}

		if (body === null) {
			process_children(trimmed, { ...context, state });
		} else {
			let id = body;

			if (body.type !== 'Identifier') {
				id = b.id(state.scope.generate('$$body'));
				state.template.push(b.const(id, body));
			}

			// if this is a `<textarea>` value or a contenteditable binding, we only add
			// the body if the attribute/binding is falsy
			const inner_state = { ...state, template: [], init: [] };
			process_children(trimmed, { ...context, state: inner_state });

			// Use the body expression as the body if it's truthy, otherwise use the inner template
			state.template.push(
				b.if(
					id,
					b.block(serialize_template([id])),
					b.block([...inner_state.init, ...serialize_template(inner_state.template)])
				)
			);
		}

		if (!VoidElements.includes(node.name) && namespace !== 'foreign') {
			state.template.push(b.literal(`</${node.name}>`));
		}

		if (state.options.dev) {
			state.template.push(b.stmt(b.call('$.pop_element')));
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

		const state = {
			...context.state,
			namespace: determine_namespace_for_children(node, context.state.namespace),
			template: [],
			init: []
		};

		serialize_element_attributes(node, { ...context, state });

		if (context.state.options.dev) {
			context.state.template.push(b.stmt(b.call('$.push_element', tag, b.id('$$payload'))));
		}

		const attributes = b.block([...state.init, ...serialize_template(state.template)]);
		const children = /** @type {import('estree').BlockStatement} */ (
			context.visit(node.fragment, state)
		);

		context.state.template.push(
			b.stmt(
				b.call(
					'$.element',
					b.id('$$payload'),
					tag,
					attributes.body.length > 0 && b.thunk(attributes),
					children.body.length > 0 && b.thunk(children)
				)
			)
		);

		if (context.state.options.dev) {
			context.state.template.push(b.stmt(b.call('$.pop_element')));
		}
	},
	EachBlock(node, context) {
		const state = context.state;

		const each_node_meta = node.metadata;
		const collection = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		const item = each_node_meta.item;
		const index =
			each_node_meta.contains_group_binding || !node.index
				? each_node_meta.index
				: b.id(node.index);

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

		each.push(.../** @type {import('estree').BlockStatement} */ (context.visit(node.body)).body);

		const for_loop = b.for(
			b.let(index, b.literal(0)),
			b.binary('<', index, b.member(array_id, b.id('length'))),
			b.update('++', index, false),
			b.block(each)
		);

		if (node.fallback) {
			const open = b.stmt(b.assignment('+=', b.id('$$payload.out'), block_open));

			const fallback = /** @type {import('estree').BlockStatement} */ (
				context.visit(node.fallback)
			);

			fallback.body.unshift(
				b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(BLOCK_OPEN_ELSE)))
			);

			state.template.push(
				b.if(
					b.binary('!==', b.member(array_id, b.id('length')), b.literal(0)),
					b.block([open, for_loop]),
					fallback
				),
				block_close
			);
		} else {
			state.template.push(block_open, for_loop, block_close);
		}
	},
	IfBlock(node, context) {
		const test = /** @type {import('estree').Expression} */ (context.visit(node.test));

		const consequent = /** @type {import('estree').BlockStatement} */ (
			context.visit(node.consequent)
		);

		const alternate = node.alternate
			? /** @type {import('estree').BlockStatement} */ (context.visit(node.alternate))
			: b.block([]);

		consequent.body.unshift(b.stmt(b.assignment('+=', b.id('$$payload.out'), block_open)));

		alternate.body.unshift(
			b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(BLOCK_OPEN_ELSE)))
		);

		context.state.template.push(b.if(test, consequent, alternate), block_close);
	},
	AwaitBlock(node, context) {
		context.state.template.push(
			empty_comment,
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
						node.value ? [/** @type {import('estree').Pattern} */ (context.visit(node.value))] : [],
						node.then
							? /** @type {import('estree').BlockStatement} */ (context.visit(node.then))
							: b.block([])
					),
					b.arrow(
						node.error ? [/** @type {import('estree').Pattern} */ (context.visit(node.error))] : [],
						node.catch
							? /** @type {import('estree').BlockStatement} */ (context.visit(node.catch))
							: b.block([])
					)
				)
			),
			empty_comment
		);
	},
	KeyBlock(node, context) {
		const block = /** @type {import('estree').BlockStatement} */ (context.visit(node.fragment));
		context.state.template.push(empty_comment, block, empty_comment);
	},
	SnippetBlock(node, context) {
		const fn = b.function_declaration(
			node.expression,
			[b.id('$$payload'), ...node.parameters],
			/** @type {import('estree').BlockStatement} */ (context.visit(node.body))
		);
		// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
		fn.___snippet = true;
		// TODO hoist where possible
		context.state.init.push(fn);

		if (context.state.options.dev) {
			context.state.init.push(b.stmt(b.call('$.add_snippet_symbol', node.expression)));
		}
	},
	Component(node, context) {
		serialize_inline_component(node, b.id(node.name), context);
	},
	SvelteSelf(node, context) {
		serialize_inline_component(node, b.id(context.state.analysis.name), context);
	},
	SvelteComponent(node, context) {
		serialize_inline_component(
			node,
			/** @type {import('estree').Expression} */ (context.visit(node.expression)),
			context
		);
	},
	LetDirective(node, { state }) {
		if (node.expression === null || node.expression.type === 'Identifier') {
			const name = node.expression === null ? node.name : node.expression.name;
			return b.const(name, b.member(b.id('$$slotProps'), b.id(node.name)));
		}

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
	},
	SpreadAttribute(node, { visit }) {
		return visit(node.expression);
	},
	SvelteFragment(node, context) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				context.state.template.push(
					/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute))
				);
			}
		}

		const block = /** @type {import('estree').BlockStatement} */ (context.visit(node.fragment));

		context.state.template.push(block);
	},
	TitleElement(node, context) {
		// title is guaranteed to contain only text/expression tag children
		const template = [b.literal('<title>')];
		process_children(node.fragment.nodes, { ...context, state: { ...context.state, template } });
		template.push(b.literal('</title>'));

		context.state.init.push(...serialize_template(template, b.id('$$payload.title'), '='));
	},
	SlotElement(node, context) {
		/** @type {import('estree').Property[]} */
		const props = [];

		/** @type {import('estree').Expression[]} */
		const spreads = [];

		/** @type {import('estree').ExpressionStatement[]} */
		const lets = [];

		/** @type {import('estree').Expression} */
		let expression = b.call('$.default_slot', b.id('$$props'));

		for (const attribute of node.attributes) {
			if (attribute.type === 'SpreadAttribute') {
				spreads.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
			} else if (attribute.type === 'Attribute') {
				const value = serialize_attribute_value(attribute.value, context, false, true);

				if (attribute.name === 'name') {
					expression = b.member(b.member_id('$$props.$$slots'), value, true, true);
				} else if (attribute.name !== 'slot') {
					if (attribute.metadata.dynamic) {
						props.push(b.get(attribute.name, [b.return(value)]));
					} else {
						props.push(b.init(attribute.name, value));
					}
				}
			} else if (attribute.type === 'LetDirective') {
				lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
			}
		}

		// Let bindings first, they can be used on attributes
		context.state.init.push(...lets);

		const props_expression =
			spreads.length === 0
				? b.object(props)
				: b.call('$.spread_props', b.array([b.object(props), ...spreads]));

		const fallback =
			node.fragment.nodes.length === 0
				? b.literal(null)
				: b.thunk(/** @type {import('estree').BlockStatement} */ (context.visit(node.fragment)));

		const slot = b.call('$.slot', b.id('$$payload'), expression, props_expression, fallback);

		context.state.template.push(empty_comment, b.stmt(slot), empty_comment);
	},
	SvelteHead(node, context) {
		const block = /** @type {import('estree').BlockStatement} */ (context.visit(node.fragment));

		context.state.template.push(
			b.stmt(b.call('$.head', b.id('$$payload'), b.arrow([b.id('$$payload')], block)))
		);
	}
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

	/** @type {import('estree').Expression | null} */
	let content = null;

	let has_spread = false;
	// Use the index to keep the attributes order which is important for spreading
	let class_index = -1;
	let style_index = -1;
	let events_to_capture = new Set();

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'value') {
				if (node.name === 'textarea') {
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
					content = b.call('$.escape', serialize_attribute_value(attribute.value, context));
				} else if (node.name !== 'select') {
					// omit value attribute for select elements, it's irrelevant for the initially selected value and has no
					// effect on the selected value after the user interacts with the select element (the value _property_ does, but not the attribute)
					attributes.push(attribute);
				}

				// omit event handlers except for special cases
			} else if (is_event_attribute(attribute)) {
				if (
					(attribute.name === 'onload' || attribute.name === 'onerror') &&
					LoadErrorElements.includes(node.name)
				) {
					events_to_capture.add(attribute.name);
				}
			} else {
				if (attribute.name === 'class') {
					class_index = attributes.length;
				} else if (attribute.name === 'style') {
					style_index = attributes.length;
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
				content = /** @type {import('estree').Expression} */ (context.visit(attribute.expression));
			} else if (attribute.name === 'value' && node.name === 'textarea') {
				content = b.call(
					'$.escape',
					/** @type {import('estree').Expression} */ (context.visit(attribute.expression))
				);
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
			if (LoadErrorElements.includes(node.name)) {
				events_to_capture.add('onload');
				events_to_capture.add('onerror');
			}
		} else if (attribute.type === 'UseDirective') {
			if (LoadErrorElements.includes(node.name)) {
				events_to_capture.add('onload');
				events_to_capture.add('onerror');
			}
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
			/** @type {import('#compiler').Attribute | null} */ (attributes[class_index] ?? null)
		);
		if (class_index === -1) {
			attributes.push(class_attribute);
		}
	}

	if (style_directives.length > 0 && !has_spread) {
		serialize_style_directives(
			style_directives,
			/** @type {import('#compiler').Attribute | null} */ (attributes[style_index] ?? null),
			context
		);
		if (style_index > -1) {
			attributes.splice(style_index, 1);
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
						b.literal(
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
				b.call('$.attr', b.literal(name), value, is_boolean && b.literal(is_boolean))
			);
		}
	}

	if (events_to_capture.size !== 0) {
		for (const event of events_to_capture) {
			context.state.template.push(b.literal(` ${event}="this.__e=event"`));
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

	const arg =
		style_attribute === null
			? b.object(styles)
			: b.call(
					'$.merge_styles',
					serialize_attribute_value(style_attribute.value, context, true),
					b.object(styles)
				);

	context.state.template.push(b.call('$.add_styles', arg));
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
		// these are set inside the `Fragment` visitor, and cannot be used until then
		init: /** @type {any} */ (null),
		template: /** @type {any} */ (null),
		namespace: options.namespace,
		preserve_whitespace: options.preserveWhitespace,
		private_derived: new Map(),
		skip_hydration_boundaries: false
	};

	const module = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.module.ast),
			state,
			// @ts-expect-error TODO: zimmerframe types
			{
				...set_scope(analysis.module.scopes),
				...global_visitors,
				...(analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy)
			}
		)
	);

	const instance = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.instance.ast),
			{ ...state, scope: analysis.instance.scope },
			// @ts-expect-error TODO: zimmerframe types
			{
				...set_scope(analysis.instance.scopes),
				...global_visitors,
				...(analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy),
				ImportDeclaration(node) {
					state.hoisted.push(node);
					return b.empty;
				},
				ExportNamedDeclaration(node, context) {
					if (node.declaration) {
						return context.visit(node.declaration);
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
			// @ts-expect-error TODO: zimmerframe types
			{
				...set_scope(analysis.template.scopes),
				...global_visitors,
				...template_visitors
			}
		)
	);

	/** @type {import('estree').VariableDeclarator[]} */
	const legacy_reactive_declarations = [];

	for (const [node] of analysis.reactive_statements) {
		const statement = [...state.legacy_reactive_statements].find(([n]) => n === node);
		if (statement === undefined) {
			throw new Error('Could not find reactive statement');
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

	// If the component binds to a child, we need to put the template in a loop and repeat until legacy bindings are stable.
	// We can remove this once the legacy syntax is gone.
	if (analysis.uses_component_bindings) {
		const snippets = template.body.filter(
			(node) =>
				node.type === 'FunctionDeclaration' &&
				// @ts-expect-error
				node.___snippet
		);
		const rest = template.body.filter(
			(node) =>
				node.type !== 'FunctionDeclaration' ||
				// @ts-expect-error
				!node.___snippet
		);
		template.body = [
			...snippets,
			b.let('$$settled', b.true),
			b.let('$$inner_payload'),
			b.stmt(
				b.function(
					b.id('$$render_inner'),
					[b.id('$$payload')],
					b.block(/** @type {import('estree').Statement[]} */ (rest))
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
		instance.body.unshift(b.var('$$store_subs'));
		template.body.push(
			b.if(b.id('$$store_subs'), b.stmt(b.call('$.unsubscribe_stores', b.id('$$store_subs'))))
		);
	}
	// Propagate values of bound props upwards if they're undefined in the parent and have a value.
	// Don't do this as part of the props retrieval because people could eagerly mutate the prop in the instance script.
	/** @type {import('estree').Property[]} */
	const props = [];
	for (const [name, binding] of analysis.instance.scope.declarations) {
		if (binding.kind === 'bindable_prop' && !name.startsWith('$$')) {
			props.push(b.init(binding.prop_alias ?? name, b.id(name)));
		}
	}
	for (const { name, alias } of analysis.exports) {
		props.push(b.init(alias ?? name, b.id(name)));
	}
	if (props.length > 0) {
		// This has no effect in runes mode other than throwing an error when someone passes
		// undefined to a binding that has a default value.
		template.body.push(b.stmt(b.call('$.bind_props', b.id('$$props'), b.object(props))));
	}
	/** @type {import('estree').Expression[]} */
	const push_args = [];
	if (options.dev) push_args.push(b.id(analysis.name));

	const component_block = b.block([
		.../** @type {import('estree').Statement[]} */ (instance.body),
		.../** @type {import('estree').Statement[]} */ (template.body)
	]);

	let should_inject_context = analysis.needs_context || options.dev;

	if (should_inject_context) {
		component_block.body.unshift(b.stmt(b.call('$.push', ...push_args)));
		component_block.body.push(b.stmt(b.call('$.pop')));
	}

	if (analysis.uses_rest_props) {
		/** @type {string[]} */
		const named_props = analysis.exports.map(({ name, alias }) => alias ?? name);
		for (const [name, binding] of analysis.instance.scope.declarations) {
			if (binding.kind === 'bindable_prop') named_props.push(binding.prop_alias ?? name);
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

	if (analysis.css.ast !== null && options.css === 'injected' && !options.customElement) {
		const hash = b.literal(analysis.css.hash);
		const code = b.literal(render_stylesheet(analysis.source, analysis, options).code);

		body.push(b.const('$$css', b.object([b.init('hash', hash), b.init('code', code)])));
		component_block.body.unshift(b.stmt(b.call('$$payload.css.add', b.id('$$css'))));
	}

	let should_inject_props =
		should_inject_context ||
		props.length > 0 ||
		analysis.needs_props ||
		analysis.uses_props ||
		analysis.uses_rest_props ||
		analysis.uses_slots ||
		analysis.slot_names.size > 0;

	const component_function = b.function_declaration(
		b.id(analysis.name),
		should_inject_props ? [b.id('$$payload'), b.id('$$props')] : [b.id('$$payload')],
		component_block
	);
	if (options.compatibility.componentApi === 4) {
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

	if (options.dev && filename) {
		// add `App.filename = 'App.svelte'` so that we can print useful messages later
		body.unshift(
			b.stmt(
				b.assignment('=', b.member(b.id(analysis.name), b.id('filename')), b.literal(filename))
			)
		);
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
		// to be present for `javascript_visitors_legacy` and so is included in module
		// transform state as well as component transform state
		legacy_reactive_statements: new Map(),
		private_derived: new Map()
	};

	const module = /** @type {import('estree').Program} */ (
		walk(/** @type {import('#compiler').SvelteNode} */ (analysis.module.ast), state, {
			...set_scope(analysis.module.scopes),
			...global_visitors,
			...javascript_visitors_runes
		})
	);

	return {
		type: 'Program',
		sourceType: 'module',
		body: [b.import_all('$', 'svelte/internal/server'), ...module.body]
	};
}
