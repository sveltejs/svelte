/** @import { AssignmentExpression, BinaryOperator, CallExpression, Expression, ExpressionStatement, MethodDefinition, Pattern, Program, Property, PropertyDefinition, Statement, VariableDeclarator } from 'estree' */
/** @import { Binding, Namespace, SvelteNode, ValidatedCompileOptions, ValidatedModuleCompileOptions } from '#compiler' */
/** @import { ComponentServerTransformState, ComponentVisitors, ServerTransformState, Visitors } from './types.js' */
/** @import { Analysis, ComponentAnalysis } from '../../types.js' */
/** @import { Scope } from '../../scope.js' */
/** @import { StateField } from '../../3-transform/client/types.js' */ // TODO move this type
import { walk } from 'zimmerframe';
import { set_scope, get_rune } from '../../scope.js';
import { extract_identifiers, extract_paths, is_expression_async } from '../../../utils/ast.js';
import * as b from '../../../utils/builders.js';
import { transform_inspect_rune } from '../utils.js';
import { filename } from '../../../state.js';
import { render_stylesheet } from '../css/index.js';
import { Identifier } from './visitors/javascript/Identifier.js';
import { AwaitBlock } from './visitors/template/AwaitBlock.js';
import { Component } from './visitors/template/Component.js';
import { ConstTag } from './visitors/template/ConstTag.js';
import { DebugTag } from './visitors/template/DebugTag.js';
import { EachBlock } from './visitors/template/EachBlock.js';
import { Fragment } from './visitors/template/Fragment.js';
import { HtmlTag } from './visitors/template/HtmlTag.js';
import { IfBlock } from './visitors/template/IfBlock.js';
import { KeyBlock } from './visitors/template/KeyBlock.js';
import { LetDirective } from './visitors/template/LetDirective.js';
import { RegularElement } from './visitors/template/RegularElement.js';
import { RenderTag } from './visitors/template/RenderTag.js';
import { SlotElement } from './visitors/template/SlotElement.js';
import { SnippetBlock } from './visitors/template/SnippetBlock.js';
import { SpreadAttribute } from './visitors/template/SpreadAttribute.js';
import { SvelteComponent } from './visitors/template/SvelteComponent.js';
import { SvelteElement } from './visitors/template/SvelteElement.js';
import { SvelteFragment } from './visitors/template/SvelteFragment.js';
import { SvelteHead } from './visitors/template/SvelteHead.js';
import { SvelteSelf } from './visitors/template/SvelteSelf.js';
import { TitleElement } from './visitors/template/TitleElement.js';
import { serialize_get_binding } from './visitors/javascript/shared/utils.js';

/**
 * @param {VariableDeclarator} declarator
 * @param {Scope} scope
 * @param {Expression} value
 * @returns {VariableDeclarator[]}
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
 * @param {AssignmentExpression} node
 * @param {Pick<import('zimmerframe').Context<SvelteNode, ServerTransformState>, 'visit' | 'state'>} context
 */
function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					serialize_get_binding(node.left, state),
					/** @type {Expression} */ (visit(node.right))
				);
	}

	return /** @type {Expression} */ (visit(node.right));
}

/**
 * @param {string} name
 */
function is_store_name(name) {
	return name[0] === '$' && /[A-Za-z_]/.test(name[1]);
}

/**
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, ServerTransformState>} context
 * @param {() => any} fallback
 * @returns {Expression}
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

		/** @type {AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {Expression[]} */
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
					b.const(tmp_id, /** @type {Expression} */ (visit(node.right))),
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
			return b.call('$.store_set', b.id(left_name), /** @type {Expression} */ (visit(node.right)));
		}
		return fallback();
	} else if (is_store) {
		return b.call(
			'$.mutate_store',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(left.name),
			b.id(left_name),
			b.assignment(node.operator, /** @type {Pattern} */ (visit(node.left)), value)
		);
	}
	return fallback();
}

/** @type {Visitors} */
const global_visitors = {
	Identifier,
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
			return b.call('$.snapshot', /** @type {Expression} */ (context.visit(node.arguments[0])));
		}

		if (rune === '$state.is') {
			return b.call(
				'Object.is',
				/** @type {Expression} */ (context.visit(node.arguments[0])),
				/** @type {Expression} */ (context.visit(node.arguments[1]))
			);
		}

		if (rune === '$inspect' || rune === '$inspect().with') {
			return transform_inspect_rune(node, context);
		}

		context.next();
	}
};

/** @type {Visitors} */
const javascript_visitors_runes = {
	ClassBody(node, { state, visit }) {
		/** @type {Map<string, StateField>} */
		const public_derived = new Map();

		/** @type {Map<string, StateField>} */
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
						/** @type {StateField} */
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

		/** @type {Array<MethodDefinition | PropertyDefinition>} */
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
					const init = /** @type {Expression} **/ (
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

			body.push(/** @type {MethodDefinition} **/ (visit(definition, child_state)));
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
							: /** @type {Expression} */ (visit(node.value.arguments[0]))
				};
			}
			if (rune === '$derived.by') {
				return {
					...node,
					value:
						node.value.arguments.length === 0
							? null
							: b.call(/** @type {Expression} */ (visit(node.value.arguments[0])))
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
				declarations.push(/** @type {VariableDeclarator} */ (visit(declarator)));
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
								? /** @type {Expression} */ (visit(node.right.arguments[0]))
								: b.id('undefined');
							return b.assignment_pattern(node.left, right);
						}
					}
				});
				declarations.push(b.declarator(id, b.id('$$props')));
				continue;
			}

			const args = /** @type {CallExpression} */ (init).arguments;
			const value =
				args.length === 0 ? b.id('undefined') : /** @type {Expression} */ (visit(args[0]));

			if (rune === '$derived.by') {
				declarations.push(
					b.declarator(/** @type {Pattern} */ (visit(declarator.id)), b.call(value))
				);
				continue;
			}

			if (declarator.id.type === 'Identifier') {
				declarations.push(b.declarator(declarator.id, value));
				continue;
			}

			if (rune === '$derived') {
				declarations.push(b.declarator(/** @type {Pattern} */ (visit(declarator.id)), value));
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

/** @type {Visitors} */
const javascript_visitors_legacy = {
	VariableDeclaration(node, { state, visit }) {
		/** @type {VariableDeclarator[]} */
		const declarations = [];

		for (const declarator of node.declarations) {
			const bindings = /** @type {Binding[]} */ (state.scope.get_bindings(declarator));
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				declarations.push(/** @type {VariableDeclarator} */ (visit(declarator)));
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
							/** @type {Expression} */ (visit(/** @type {Expression} */ (declarator.init)))
						)
					);
					for (const path of paths) {
						const value = path.expression?.(b.id(tmp));
						const name = /** @type {Identifier} */ (path.node).name;
						const binding = /** @type {Binding} */ (state.scope.get(name));
						const prop = b.member(b.id('$$props'), b.literal(binding.prop_alias ?? name), true);
						declarations.push(
							b.declarator(path.node, b.call('$.value_or_fallback', prop, b.thunk(value)))
						);
					}
					continue;
				}

				const binding = /** @type {Binding} */ (state.scope.get(declarator.id.name));
				const prop = b.member(
					b.id('$$props'),
					b.literal(binding.prop_alias ?? declarator.id.name),
					true
				);

				/** @type {Expression} */
				let init = prop;
				if (declarator.init) {
					const default_value = /** @type {Expression} */ (visit(declarator.init));
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
					/** @type {Expression} */ (declarator.init && visit(declarator.init))
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
			b.labeled('$', /** @type {ExpressionStatement} */ (context.visit(node.body)))
		);

		return b.empty;
	}
};

/** @type {ComponentVisitors} */
const template_visitors = {
	AwaitBlock,
	Component,
	ConstTag,
	DebugTag,
	EachBlock,
	Fragment,
	HtmlTag,
	IfBlock,
	KeyBlock,
	LetDirective,
	RegularElement,
	RenderTag,
	SlotElement,
	SnippetBlock,
	SpreadAttribute,
	SvelteComponent,
	SvelteElement,
	SvelteFragment,
	SvelteHead,
	SvelteSelf,
	TitleElement
};

/**
 * @param {ComponentAnalysis} analysis
 * @param {ValidatedCompileOptions} options
 * @returns {Program}
 */
export function server_component(analysis, options) {
	/** @type {ComponentServerTransformState} */
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
		getters: {},
		skip_hydration_boundaries: false
	};

	const module = /** @type {Program} */ (
		walk(
			/** @type {SvelteNode} */ (analysis.module.ast),
			state,
			// @ts-expect-error TODO: zimmerframe types
			{
				...set_scope(analysis.module.scopes),
				...global_visitors,
				...(analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy)
			}
		)
	);

	const instance = /** @type {Program} */ (
		walk(
			/** @type {SvelteNode} */ (analysis.instance.ast),
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

	const template = /** @type {Program} */ (
		walk(
			/** @type {SvelteNode} */ (analysis.template.ast),
			{ ...state, scope: analysis.template.scope },
			// @ts-expect-error TODO: zimmerframe types
			{
				...set_scope(analysis.template.scopes),
				...global_visitors,
				...template_visitors
			}
		)
	);

	/** @type {VariableDeclarator[]} */
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
					b.block(/** @type {Statement[]} */ (rest))
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
	/** @type {Property[]} */
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
	/** @type {Expression[]} */
	const push_args = [];
	if (options.dev) push_args.push(b.id(analysis.name));

	const component_block = b.block([
		.../** @type {Statement[]} */ (instance.body),
		.../** @type {Statement[]} */ (template.body)
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
		// add `App[$.FILENAME] = 'App.svelte'` so that we can print useful messages later
		body.unshift(
			b.stmt(
				b.assignment(
					'=',
					b.member(b.id(analysis.name), b.id('$.FILENAME'), true),
					b.literal(filename)
				)
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
 * @param {Analysis} analysis
 * @param {ValidatedModuleCompileOptions} options
 * @returns {Program}
 */
export function server_module(analysis, options) {
	/** @type {ServerTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.module.scopes,
		// this is an anomaly — it can only be used in components, but it needs
		// to be present for `javascript_visitors_legacy` and so is included in module
		// transform state as well as component transform state
		legacy_reactive_statements: new Map(),
		private_derived: new Map(),
		getters: {}
	};

	const module = /** @type {Program} */ (
		walk(/** @type {SvelteNode} */ (analysis.module.ast), state, {
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
