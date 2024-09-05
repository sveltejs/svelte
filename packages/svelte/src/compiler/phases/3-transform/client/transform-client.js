/** @import * as ESTree from 'estree' */
/** @import { ValidatedCompileOptions, AST, ValidatedModuleCompileOptions, SvelteNode } from '#compiler' */
/** @import { ComponentAnalysis, Analysis } from '../../types' */
/** @import { Visitors, ComponentClientTransformState, ClientTransformState } from './types' */
import { walk } from 'zimmerframe';
import * as b from '../../../utils/builders.js';
import { build_getter } from './utils.js';
import { render_stylesheet } from '../css/index.js';
import { dev, filename } from '../../../state.js';
import { AnimateDirective } from './visitors/AnimateDirective.js';
import { ArrowFunctionExpression } from './visitors/ArrowFunctionExpression.js';
import { AssignmentExpression } from './visitors/AssignmentExpression.js';
import { Attribute } from './visitors/Attribute.js';
import { AwaitBlock } from './visitors/AwaitBlock.js';
import { BinaryExpression } from './visitors/BinaryExpression.js';
import { BindDirective } from './visitors/BindDirective.js';
import { BlockStatement } from './visitors/BlockStatement.js';
import { BreakStatement } from './visitors/BreakStatement.js';
import { CallExpression } from './visitors/CallExpression.js';
import { ClassBody } from './visitors/ClassBody.js';
import { Comment } from './visitors/Comment.js';
import { Component } from './visitors/Component.js';
import { ConstTag } from './visitors/ConstTag.js';
import { DebugTag } from './visitors/DebugTag.js';
import { EachBlock } from './visitors/EachBlock.js';
import { ExportNamedDeclaration } from './visitors/ExportNamedDeclaration.js';
import { ExpressionStatement } from './visitors/ExpressionStatement.js';
import { Fragment } from './visitors/Fragment.js';
import { FunctionDeclaration } from './visitors/FunctionDeclaration.js';
import { FunctionExpression } from './visitors/FunctionExpression.js';
import { HtmlTag } from './visitors/HtmlTag.js';
import { Identifier } from './visitors/Identifier.js';
import { IfBlock } from './visitors/IfBlock.js';
import { ImportDeclaration } from './visitors/ImportDeclaration.js';
import { KeyBlock } from './visitors/KeyBlock.js';
import { LabeledStatement } from './visitors/LabeledStatement.js';
import { LetDirective } from './visitors/LetDirective.js';
import { MemberExpression } from './visitors/MemberExpression.js';
import { OnDirective } from './visitors/OnDirective.js';
import { Program } from './visitors/Program.js';
import { RegularElement } from './visitors/RegularElement.js';
import { RenderTag } from './visitors/RenderTag.js';
import { SlotElement } from './visitors/SlotElement.js';
import { SnippetBlock } from './visitors/SnippetBlock.js';
import { SpreadAttribute } from './visitors/SpreadAttribute.js';
import { SvelteBody } from './visitors/SvelteBody.js';
import { SvelteComponent } from './visitors/SvelteComponent.js';
import { SvelteDocument } from './visitors/SvelteDocument.js';
import { SvelteElement } from './visitors/SvelteElement.js';
import { SvelteFragment } from './visitors/SvelteFragment.js';
import { SvelteHead } from './visitors/SvelteHead.js';
import { SvelteSelf } from './visitors/SvelteSelf.js';
import { SvelteWindow } from './visitors/SvelteWindow.js';
import { TitleElement } from './visitors/TitleElement.js';
import { TransitionDirective } from './visitors/TransitionDirective.js';
import { UpdateExpression } from './visitors/UpdateExpression.js';
import { UseDirective } from './visitors/UseDirective.js';
import { VariableDeclaration } from './visitors/VariableDeclaration.js';

/** @type {Visitors} */
const visitors = {
	_: function set_scope(node, { next, state }) {
		const scope = state.scopes.get(node);

		if (scope && scope !== state.scope) {
			const transform = { ...state.transform };

			for (const [name, binding] of scope.declarations) {
				if (binding.kind === 'normal') {
					delete transform[name];
				}
			}

			next({ ...state, transform, scope });
		} else {
			next();
		}
	},
	AnimateDirective,
	ArrowFunctionExpression,
	AssignmentExpression,
	Attribute,
	AwaitBlock,
	BinaryExpression,
	BindDirective,
	BlockStatement,
	BreakStatement,
	CallExpression,
	ClassBody,
	Comment,
	Component,
	ConstTag,
	DebugTag,
	EachBlock,
	ExportNamedDeclaration,
	ExpressionStatement,
	Fragment,
	FunctionDeclaration,
	FunctionExpression,
	HtmlTag,
	Identifier,
	IfBlock,
	ImportDeclaration,
	KeyBlock,
	LabeledStatement,
	LetDirective,
	MemberExpression,
	OnDirective,
	Program,
	RegularElement,
	RenderTag,
	SlotElement,
	SnippetBlock,
	SpreadAttribute,
	SvelteBody,
	SvelteComponent,
	SvelteDocument,
	SvelteElement,
	SvelteFragment,
	SvelteHead,
	SvelteSelf,
	SvelteWindow,
	TitleElement,
	TransitionDirective,
	UpdateExpression,
	UseDirective,
	VariableDeclaration
};

/**
 * @param {ComponentAnalysis} analysis
 * @param {ValidatedCompileOptions} options
 * @returns {ESTree.Program}
 */
export function client_component(analysis, options) {
	/** @type {ComponentClientTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.module.scopes,
		is_instance: false,
		hoisted: [b.import_all('$', 'svelte/internal/client')],
		node: /** @type {any} */ (null), // populated by the root node
		legacy_reactive_imports: [],
		legacy_reactive_statements: new Map(),
		metadata: {
			context: {
				template_needs_import_node: false,
				template_contains_script_tag: false
			},
			namespace: options.namespace,
			bound_contenteditable: false
		},
		events: new Set(),
		preserve_whitespace: options.preserveWhitespace,
		public_state: new Map(),
		private_state: new Map(),
		transform: {},
		in_constructor: false,

		// these are set inside the `Fragment` visitor, and cannot be used until then
		before_init: /** @type {any} */ (null),
		init: /** @type {any} */ (null),
		update: /** @type {any} */ (null),
		after_update: /** @type {any} */ (null),
		template: /** @type {any} */ (null),
		locations: /** @type {any} */ (null)
	};

	const module = /** @type {ESTree.Program} */ (
		walk(/** @type {SvelteNode} */ (analysis.module.ast), state, visitors)
	);

	const instance_state = {
		...state,
		transform: { ...state.transform },
		scope: analysis.instance.scope,
		scopes: analysis.instance.scopes,
		is_instance: true
	};

	const instance = /** @type {ESTree.Program} */ (
		walk(/** @type {SvelteNode} */ (analysis.instance.ast), instance_state, visitors)
	);

	const template = /** @type {ESTree.Program} */ (
		walk(
			/** @type {SvelteNode} */ (analysis.template.ast),
			{
				...state,
				transform: instance_state.transform,
				scope: analysis.instance.scope,
				scopes: analysis.template.scopes
			},
			visitors
		)
	);

	module.body.unshift(...state.legacy_reactive_imports);

	/** @type {ESTree.Statement[]} */
	const store_setup = [];

	/** @type {ESTree.VariableDeclaration[]} */
	const legacy_reactive_declarations = [];

	for (const [name, binding] of analysis.instance.scope.declarations) {
		if (binding.kind === 'legacy_reactive') {
			legacy_reactive_declarations.push(b.const(name, b.call('$.mutable_state')));
		}
		if (binding.kind === 'store_sub') {
			if (store_setup.length === 0) {
				store_setup.push(b.const('$$stores', b.call('$.setup_stores')));
			}

			// We're creating an arrow function that gets the store value which minifies better for two or more references
			const store_reference = build_getter(b.id(name.slice(1)), instance_state);
			const store_get = b.call('$.store_get', store_reference, b.literal(name), b.id('$$stores'));
			store_setup.push(
				b.const(
					binding.node,
					dev
						? b.thunk(
								b.sequence([
									b.call('$.validate_store', store_reference, b.literal(name.slice(1))),
									store_get
								])
							)
						: b.thunk(store_get)
				)
			);
		}
	}

	for (const [node] of analysis.reactive_statements) {
		const statement = [...state.legacy_reactive_statements].find(([n]) => n === node);
		if (statement === undefined) {
			throw new Error('Could not find reactive statement');
		}
		instance.body.push(statement[1]);
	}

	if (analysis.reactive_statements.size > 0) {
		instance.body.push(b.stmt(b.call('$.legacy_pre_effect_reset')));
	}

	/**
	 * Used to store the group nodes
	 * @type {ESTree.VariableDeclaration[]}
	 */
	const group_binding_declarations = [];
	for (const group of analysis.binding_groups.values()) {
		group_binding_declarations.push(b.const(group.name, b.array([])));
	}

	/** @type {Array<ESTree.Property | ESTree.SpreadElement>} */
	const component_returned_object = analysis.exports.flatMap(({ name, alias }) => {
		const binding = instance_state.scope.get(name);
		const expression = build_getter(b.id(name), instance_state);
		const getter = b.get(alias ?? name, [b.return(expression)]);

		if (expression.type === 'Identifier') {
			if (binding?.declaration_kind === 'let' || binding?.declaration_kind === 'var') {
				return [
					getter,
					b.set(alias ?? name, [b.stmt(b.assignment('=', expression, b.id('$$value')))])
				];
			} else if (!dev) {
				return b.init(alias ?? name, expression);
			}
		}

		if (binding?.kind === 'state' || binding?.kind === 'raw_state') {
			const value = binding.kind === 'state' ? b.call('$.proxy', b.id('$$value')) : b.id('$$value');
			return [getter, b.set(alias ?? name, [b.stmt(b.call('$.set', b.id(name), value))])];
		}

		return getter;
	});

	const properties = [...analysis.instance.scope.declarations].filter(
		([name, binding]) =>
			(binding.kind === 'prop' || binding.kind === 'bindable_prop') && !name.startsWith('$$')
	);

	if (dev && analysis.runes) {
		const exports = analysis.exports.map(({ name, alias }) => b.literal(alias ?? name));
		/** @type {ESTree.Literal[]} */
		const bindable = [];
		for (const [name, binding] of properties) {
			if (binding.kind === 'bindable_prop') {
				bindable.push(b.literal(binding.prop_alias ?? name));
			}
		}
		instance.body.unshift(
			b.stmt(
				b.call(
					'$.validate_prop_bindings',
					b.id('$$props'),
					b.array(bindable),
					b.array(exports),
					b.id(`${analysis.name}`)
				)
			)
		);
	}

	if (analysis.accessors) {
		for (const [name, binding] of properties) {
			const key = binding.prop_alias ?? name;

			const getter = b.get(key, [b.return(b.call(b.id(name)))]);

			const setter = b.set(key, [
				b.stmt(b.call(b.id(name), b.id('$$value'))),
				b.stmt(b.call('$.flush_sync'))
			]);

			if (analysis.runes && binding.initial) {
				// turn `set foo($$value)` into `set foo($$value = expression)`
				setter.value.params[0] = {
					type: 'AssignmentPattern',
					left: b.id('$$value'),
					right: /** @type {ESTree.Expression} */ (binding.initial)
				};
			}

			component_returned_object.push(getter, setter);
		}
	}

	if (options.compatibility.componentApi === 4) {
		component_returned_object.push(
			b.init('$set', b.id('$.update_legacy_props')),
			b.init(
				'$on',
				b.arrow(
					[b.id('$$event_name'), b.id('$$event_cb')],
					b.call(
						'$.add_legacy_event_listener',
						b.id('$$props'),
						b.id('$$event_name'),
						b.id('$$event_cb')
					)
				)
			)
		);
	} else if (dev) {
		component_returned_object.push(b.spread(b.call(b.id('$.legacy_api'))));
	}

	const push_args = [b.id('$$props'), b.literal(analysis.runes)];
	if (dev) push_args.push(b.id(analysis.name));

	const component_block = b.block([
		...store_setup,
		...legacy_reactive_declarations,
		...group_binding_declarations,
		...analysis.top_level_snippets,
		.../** @type {ESTree.Statement[]} */ (instance.body),
		analysis.runes || !analysis.needs_context ? b.empty : b.stmt(b.call('$.init')),
		.../** @type {ESTree.Statement[]} */ (template.body)
	]);

	if (!analysis.runes) {
		// Bind static exports to props so that people can access them with bind:x
		for (const { name, alias } of analysis.exports) {
			component_block.body.push(
				b.stmt(
					b.call(
						'$.bind_prop',
						b.id('$$props'),
						b.literal(alias ?? name),
						build_getter(b.id(name), instance_state)
					)
				)
			);
		}
	}

	if (analysis.css.ast !== null && analysis.inject_styles) {
		const hash = b.literal(analysis.css.hash);
		const code = b.literal(render_stylesheet(analysis.source, analysis, options).code);

		state.hoisted.push(b.const('$$css', b.object([b.init('hash', hash), b.init('code', code)])));

		component_block.body.unshift(
			b.stmt(
				b.call('$.append_styles', b.id('$$anchor'), b.id('$$css'), options.customElement && b.true)
			)
		);
	}

	const should_inject_context =
		dev ||
		analysis.needs_context ||
		analysis.reactive_statements.size > 0 ||
		component_returned_object.length > 0;

	if (should_inject_context) {
		component_block.body.unshift(b.stmt(b.call('$.push', ...push_args)));

		component_block.body.push(
			component_returned_object.length > 0
				? b.return(b.call('$.pop', b.object(component_returned_object)))
				: b.stmt(b.call('$.pop'))
		);
	}

	if (analysis.uses_rest_props) {
		const named_props = analysis.exports.map(({ name, alias }) => alias ?? name);
		for (const [name, binding] of analysis.instance.scope.declarations) {
			if (binding.kind === 'bindable_prop') named_props.push(binding.prop_alias ?? name);
		}

		component_block.body.unshift(
			b.const(
				'$$restProps',
				b.call(
					'$.legacy_rest_props',
					b.id('$$sanitized_props'),
					b.array(named_props.map((name) => b.literal(name)))
				)
			)
		);
	}

	if (analysis.uses_props || analysis.uses_rest_props) {
		const to_remove = [
			b.literal('children'),
			b.literal('$$slots'),
			b.literal('$$events'),
			b.literal('$$legacy')
		];
		if (analysis.custom_element) {
			to_remove.push(b.literal('$$host'));
		}

		component_block.body.unshift(
			b.const(
				'$$sanitized_props',
				b.call('$.legacy_rest_props', b.id('$$props'), b.array(to_remove))
			)
		);
	}

	if (analysis.uses_slots) {
		component_block.body.unshift(b.const('$$slots', b.call('$.sanitize_slots', b.id('$$props'))));
	}

	let should_inject_props =
		should_inject_context ||
		analysis.needs_props ||
		analysis.uses_props ||
		analysis.uses_rest_props ||
		analysis.uses_slots ||
		analysis.slot_names.size > 0;

	// Merge hoisted statements into module body.
	// Ensure imports are on top, with the order preserved, then module body, then hoisted statements
	/** @type {ESTree.ImportDeclaration[]} */
	const imports = [];
	/** @type {ESTree.Program['body']} */
	let body = [];

	for (const entry of [...module.body, ...state.hoisted]) {
		if (entry.type === 'ImportDeclaration') {
			imports.push(entry);
		} else {
			body.push(entry);
		}
	}

	body = [...imports, ...body];

	const component = b.function_declaration(
		b.id(analysis.name),
		should_inject_props ? [b.id('$$anchor'), b.id('$$props')] : [b.id('$$anchor')],
		component_block
	);

	if (options.hmr) {
		const id = b.id(analysis.name);
		const HMR = b.id('$.HMR');

		const existing = b.member(id, HMR, true);
		const incoming = b.member(b.id('module.default'), HMR, true);

		const accept_fn_body = [
			b.stmt(b.assignment('=', b.member(incoming, 'source'), b.member(existing, 'source'))),
			b.stmt(b.call('$.set', b.member(existing, 'source'), b.member(incoming, 'original')))
		];

		if (analysis.css.hash) {
			// remove existing `<style>` element, in case CSS changed
			accept_fn_body.unshift(
				b.stmt(
					b.call(
						b.member(
							b.call('document.querySelector', b.literal('#' + analysis.css.hash)),
							'remove',
							false,
							true
						)
					)
				)
			);
		}

		const hmr = b.block([
			b.stmt(b.assignment('=', id, b.call('$.hmr', id, b.thunk(b.member(existing, 'source'))))),

			b.stmt(b.call('import.meta.hot.accept', b.arrow([b.id('module')], b.block(accept_fn_body))))
		]);

		body.push(component, b.if(b.id('import.meta.hot'), hmr), b.export_default(b.id(analysis.name)));
	} else {
		body.push(b.export_default(component));
	}

	if (dev) {
		// add `App[$.FILENAME] = 'App.svelte'` so that we can print useful messages later
		body.unshift(
			b.stmt(
				b.assignment('=', b.member(b.id(analysis.name), '$.FILENAME', true), b.literal(filename))
			)
		);

		body.unshift(b.stmt(b.call(b.id('$.mark_module_start'))));
		body.push(b.stmt(b.call(b.id('$.mark_module_end'), b.id(analysis.name))));
	}

	if (options.discloseVersion) {
		body.unshift(b.imports([], 'svelte/internal/disclose-version'));
	}

	if (options.compatibility.componentApi === 4) {
		body.unshift(b.imports([['createClassComponent', '$$_createClassComponent']], 'svelte/legacy'));
		component_block.body.unshift(
			b.if(
				b.id('new.target'),
				b.return(
					b.call(
						'$$_createClassComponent',
						// When called with new, the first argument is the constructor options
						b.object([b.init('component', b.id(analysis.name)), b.spread(b.id('$$anchor'))])
					)
				)
			)
		);
	} else if (dev) {
		component_block.body.unshift(b.stmt(b.call('$.check_target', b.id('new.target'))));
	}

	if (state.events.size > 0) {
		body.push(
			b.stmt(b.call('$.delegate', b.array(Array.from(state.events).map((name) => b.literal(name)))))
		);
	}

	if (analysis.custom_element) {
		const ce = analysis.custom_element;

		/** @type {ESTree.Property[]} */
		const props_str = [];

		for (const [name, binding] of properties) {
			const key = binding.prop_alias ?? name;
			const prop_def = typeof ce === 'boolean' ? {} : ce.props?.[key] || {};
			if (
				!prop_def.type &&
				binding.initial?.type === 'Literal' &&
				typeof binding.initial.value === 'boolean'
			) {
				prop_def.type = 'Boolean';
			}

			const value = b.object(
				/** @type {ESTree.Property[]} */ (
					[
						prop_def.attribute ? b.init('attribute', b.literal(prop_def.attribute)) : undefined,
						prop_def.reflect ? b.init('reflect', b.literal(true)) : undefined,
						prop_def.type ? b.init('type', b.literal(prop_def.type)) : undefined
					].filter(Boolean)
				)
			);
			props_str.push(b.init(key, value));
		}

		const slots_str = b.array([...analysis.slot_names.keys()].map((name) => b.literal(name)));
		const accessors_str = b.array(
			analysis.exports.map(({ name, alias }) => b.literal(alias ?? name))
		);
		const use_shadow_dom = typeof ce === 'boolean' || ce.shadow !== 'none' ? true : false;

		const create_ce = b.call(
			'$.create_custom_element',
			b.id(analysis.name),
			b.object(props_str),
			slots_str,
			accessors_str,
			b.literal(use_shadow_dom),
			/** @type {any} */ (typeof ce !== 'boolean' ? ce.extend : undefined)
		);

		// If a tag name is provided, call `customElements.define`, otherwise leave to the user
		if (typeof ce !== 'boolean' && typeof ce.tag === 'string') {
			const define = b.stmt(b.call('customElements.define', b.literal(ce.tag), create_ce));

			if (options.hmr) {
				body.push(
					b.if(b.binary('==', b.call('customElements.get', b.literal(ce.tag)), b.null), define)
				);
			} else {
				body.push(define);
			}
		} else {
			body.push(b.stmt(create_ce));
		}
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
 * @returns {ESTree.Program}
 */
export function client_module(analysis, options) {
	/** @type {ClientTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.module.scopes,
		public_state: new Map(),
		private_state: new Map(),
		transform: {},
		in_constructor: false
	};

	const module = /** @type {ESTree.Program} */ (
		walk(/** @type {SvelteNode} */ (analysis.module.ast), state, visitors)
	);

	return {
		type: 'Program',
		sourceType: 'module',
		body: [b.import_all('$', 'svelte/internal/client'), ...module.body]
	};
}
