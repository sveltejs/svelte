import is_reference from 'is-reference';
import { is_event_attribute, is_text_attribute, object } from '../../../utils/ast.js';
import { warn } from '../../../warnings.js';
import { DelegatedEvents, SVGElements } from '../../constants.js';
import { create_attribute, is_element_node } from '../../nodes.js';
import { get_rune } from '../../scope.js';
import * as assert from '../../../utils/assert.js';
import { function_visitor } from '../utils.js';
import { regex_starts_with_newline } from '../../patterns.js';

/**
 * @param {Pick<import('#compiler').OnDirective, 'expression'| 'name' | 'modifiers'>} node
 * @param {import('../types.js').Context} context
 * @returns {null | import('#compiler').DelegatedEvent}
 */
function get_delegated_event(node, context) {
	const handler = node.expression;
	const event_name = node.name;

	// Handle delegated event handlers. Bail-out if not a delegated event.
	if (!handler || node.modifiers.includes('capture') || !DelegatedEvents.includes(event_name)) {
		return null;
	}
	// If we are not working with a RegularElement/SlotElement, then bail-out.
	const element = context.path.at(-1);
	if (element == null || (element.type !== 'RegularElement' && element.type !== 'SlotElement')) {
		return null;
	}
	// If we have multiple OnDirectives of the same type, bail-out.
	if (
		element.attributes.filter((attr) => attr.type === 'OnDirective' && attr.name === event_name)
			.length > 1
	) {
		return null;
	}

	/** @type {import('#compiler').DelegatedEvent} */
	const non_hoistable = { type: 'non-hoistable' };
	/** @type {import('estree').FunctionExpression | import('estree').FunctionDeclaration | import('estree').ArrowFunctionExpression | null} */
	let target_function = null;
	let binding = null;

	if (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression') {
		target_function = handler;
	} else if (handler.type === 'Identifier') {
		binding = context.state.scope.get(handler.name);

		if (binding != null) {
			for (const { path } of binding.references) {
				const parent = path.at(-1);
				if (parent == null) {
					return non_hoistable;
				}

				const element =
					parent.type === 'OnDirective'
						? path.at(-2)
						: parent.type === 'ExpressionTag' &&
						  is_event_attribute(/** @type {import('#compiler').Attribute} */ (path.at(-2)))
						? path.at(-3)
						: null;

				if (element) {
					if (element.type !== 'RegularElement' && element.type !== 'SlotElement') {
						return non_hoistable;
					}
				} else if (parent.type !== 'FunctionDeclaration' && parent.type !== 'VariableDeclarator') {
					return non_hoistable;
				}
			}
		}

		// If the binding is exported, bail-out
		if (context.state.analysis.exports.find((node) => node.name === handler.name)) {
			return non_hoistable;
		}

		if (binding !== null && binding.initial !== null && !binding.mutated && !binding.is_called) {
			const binding_type = binding.initial.type;

			if (
				binding_type === 'ArrowFunctionExpression' ||
				binding_type === 'FunctionDeclaration' ||
				binding_type === 'FunctionExpression'
			) {
				target_function = binding.initial;
			}
		}
	}

	// If we can't find a function, bail-out
	if (target_function == null) {
		return non_hoistable;
	}
	// If the function is marked as non-hoistable, bail-out
	if (target_function.metadata.hoistable === 'impossible') {
		return non_hoistable;
	}
	// If the function has more than one arg, then bail-out
	if (target_function.params.length > 1) {
		return non_hoistable;
	}

	const scope = target_function.metadata.scope;
	for (const [reference] of scope.references) {
		const binding = scope.get(reference);

		if (
			binding !== null &&
			// Bail-out if we reference anything from the EachBlock (for now) that mutates in non-runes mode,
			((!context.state.analysis.runes && binding.kind === 'each') ||
				// or any normal not reactive bindings that are mutated.
				(binding.kind === 'normal' && context.state.analysis.runes) ||
				// or any reactive imports (those are rewritten) (can only happen in legacy mode)
				(binding.kind === 'state' && binding.declaration_kind === 'import')) &&
			binding.mutated
		) {
			return non_hoistable;
		}
	}
	return { type: 'hoistable', function: target_function };
}

/**
 * @param {import('estree').CallExpression} node
 * @param {import('../types.js').Context} context
 * @returns {boolean}
 */
function is_known_safe_call(node, context) {
	const callee = node.callee;

	// Check for selector() API calls
	if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier') {
		const binding = context.state.scope.get(callee.object.name);
		const selector_binding = context.state.scope.get('selector');
		if (
			selector_binding !== null &&
			selector_binding.declaration_kind === 'import' &&
			selector_binding.initial !== null &&
			selector_binding.initial.type === 'ImportDeclaration' &&
			selector_binding.initial.source.value === 'svelte' &&
			binding !== null &&
			binding.initial !== null &&
			binding.initial.type === 'CallExpression' &&
			binding.initial.callee.type === 'Identifier' &&
			binding.initial.callee.name === 'selector'
		) {
			return true;
		}
	}
	// String / Number / BigInt / Boolean casting calls
	if (callee.type === 'Identifier') {
		const name = callee.name;
		const binding = context.state.scope.get(name);
		if (
			binding === null &&
			(name === 'BigInt' || name === 'String' || name === 'Number' || name === 'Boolean')
		) {
			return true;
		}
	}
	return false;
}

/** @type {import('../types.js').Visitors} */
export const component_visitors = {
	Attribute(node, context) {
		if (node.value === true) return;

		context.next();

		node.metadata.dynamic = node.value.some((chunk) => {
			if (chunk.type !== 'ExpressionTag') {
				return false;
			}

			if (
				chunk.expression.type === 'FunctionExpression' ||
				chunk.expression.type === 'ArrowFunctionExpression'
			) {
				return false;
			}

			return chunk.metadata.dynamic;
		});

		if (is_event_attribute(node)) {
			/** @type {string[]} */
			const modifiers = [];
			const expression = node.value[0].expression;

			let name = node.name.slice(2);

			if (
				name.endsWith('capture') &&
				name !== 'ongotpointercapture' &&
				name !== 'onlostpointercapture'
			) {
				name = name.slice(0, -7);
				modifiers.push('capture');
			}

			const delegated_event = get_delegated_event({ name, expression, modifiers }, context);

			if (delegated_event !== null) {
				if (delegated_event.type === 'hoistable') {
					delegated_event.function.metadata.hoistable = true;
				}
				node.metadata.delegated = delegated_event;
			}
		}
	},
	ClassDirective(node, context) {
		context.next({ ...context.state, expression: node });
	},
	SpreadAttribute(node, context) {
		context.next({ ...context.state, expression: node });
	},
	SlotElement(node, context) {
		let name = 'default';
		for (const attr of node.attributes) {
			if (attr.type === 'Attribute' && attr.name === 'name' && is_text_attribute(attr)) {
				name = attr.value[0].data;
				break;
			}
		}
		context.state.analysis.slot_names.add(name);
	},
	StyleDirective(node, context) {
		if (node.value === true) {
			const binding = context.state.scope.get(node.name);
			if (binding?.kind !== 'normal') {
				node.metadata.dynamic = true;
			}
		} else {
			context.next();
			node.metadata.dynamic = node.value.some(
				(node) => node.type === 'ExpressionTag' && node.metadata.dynamic
			);
		}
	},
	ExpressionTag(node, context) {
		context.next({ ...context.state, expression: node });
	},
	Identifier(node, context) {
		const parent = /** @type {import('estree').Node} */ (context.path.at(-1));
		if (!is_reference(node, parent)) return;
		const binding = context.state.scope.get(node.name);

		// if no binding, means some global variable
		if (binding && binding.kind !== 'normal') {
			if (context.state.expression) {
				context.state.expression.metadata.dynamic = true;
			}

			if (
				node !== binding.node &&
				(binding.kind === 'state' || binding.kind === 'derived') &&
				context.state.function_depth === binding.scope.function_depth
			) {
				warn(context.state.analysis.warnings, node, context.path, 'static-state-reference');
			}
		}
	},
	CallExpression(node, context) {
		if (context.state.expression?.type === 'ExpressionTag' && !is_known_safe_call(node, context)) {
			context.state.expression.metadata.contains_call_expression = true;
		}

		const callee = node.callee;
		if (callee.type === 'Identifier') {
			const binding = context.state.scope.get(callee.name);

			if (binding !== null) {
				binding.is_called = true;
			}

			if (get_rune(node, context.state.scope) === '$derived') {
				// special case — `$derived(foo)` is treated as `$derived(() => foo)`
				// for the purposes of identifying static state references
				context.next({
					...context.state,
					function_depth: context.state.function_depth + 1
				});

				return;
			}
		}

		context.next();
	},
	MemberExpression(node, context) {
		if (context.state.expression) {
			context.state.expression.metadata.dynamic = true;
		}

		context.next();
	},
	BindDirective(node, context) {
		let i = context.path.length;
		while (i--) {
			const parent = context.path[i];
			if (
				parent.type === 'Component' ||
				parent.type === 'SvelteComponent' ||
				parent.type === 'SvelteSelf'
			) {
				context.state.analysis.uses_component_bindings = true;
				break;
			} else if (is_element_node(parent)) {
				break;
			}
		}

		if (node.name !== 'group') return;

		i = context.path.length;
		while (i--) {
			const parent = context.path[i];
			if (parent.type === 'EachBlock') {
				parent.metadata.contains_group_binding = true;
				for (const binding of parent.metadata.references) {
					binding.mutated = true;
				}
			}
		}

		const id = object(node.expression);

		const binding = id === null ? null : context.state.scope.get(id.name);
		assert.ok(binding);

		let group = context.state.analysis.binding_groups.get(binding);
		if (!group) {
			group = {
				name: context.state.scope.root.unique('binding_group'),
				directives: []
			};

			context.state.analysis.binding_groups.set(binding, group);
		}

		group.directives.push(node);

		node.metadata = {
			binding_group_name: group.name,
			parent_each_blocks: /** @type {import('#compiler').EachBlock[]} */ (
				context.path.filter((p) => p.type === 'EachBlock')
			)
		};
	},
	OnDirective(node, context) {
		node.metadata = { delegated: null };
		context.next();
		const delegated_event = get_delegated_event(node, context);

		if (delegated_event !== null) {
			if (delegated_event.type === 'hoistable') {
				delegated_event.function.metadata.hoistable = true;
			}
			node.metadata.delegated = delegated_event;
		}
	},
	ArrowFunctionExpression: function_visitor,
	FunctionExpression: function_visitor,
	FunctionDeclaration: function_visitor,
	RegularElement(node, context) {
		if (context.state.options.namespace !== 'foreign' && SVGElements.includes(node.name)) {
			node.metadata.svg = true;
		}

		// Special case: Move the children of <textarea> into a value attribute if they are dynamic
		if (
			context.state.options.namespace !== 'foreign' &&
			node.name === 'textarea' &&
			node.fragment.nodes.length > 0
		) {
			if (node.fragment.nodes.length > 1 || node.fragment.nodes[0].type !== 'Text') {
				const first = node.fragment.nodes[0];
				if (first.type === 'Text') {
					// The leading newline character needs to be stripped because of a qirk:
					// It is ignored by browsers if the tag and its contents are set through
					// innerHTML, but we're now setting it through the value property at which
					// point it is _not_ ignored, so we need to strip it ourselves.
					// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
					// see https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element
					first.data = first.data.replace(regex_starts_with_newline, '');
					first.raw = first.raw.replace(regex_starts_with_newline, '');
				}

				node.attributes.push(
					create_attribute(
						'value',
						/** @type {import('#compiler').Text} */ (node.fragment.nodes.at(0)).start,
						/** @type {import('#compiler').Text} */ (node.fragment.nodes.at(-1)).end,
						// @ts-ignore
						node.fragment.nodes
					)
				);

				node.fragment.nodes = [];
			}
		}

		// Special case: single expression tag child of option element -> add "fake" attribute
		// to ensure that value types are the same (else for example numbers would be strings)
		if (
			context.state.options.namespace !== 'foreign' &&
			node.name === 'option' &&
			node.fragment.nodes?.length === 1 &&
			node.fragment.nodes[0].type === 'ExpressionTag' &&
			!node.attributes.some(
				(attribute) => attribute.type === 'Attribute' && attribute.name === 'value'
			)
		) {
			const child = node.fragment.nodes[0];
			node.attributes.push(create_attribute('value', child.start, child.end, [child]));
		}

		context.state.analysis.elements.push(node);
	},
	SvelteElement(node, { state }) {
		state.analysis.elements.push(node);
	}
};
