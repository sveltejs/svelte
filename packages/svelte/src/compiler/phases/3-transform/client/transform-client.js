import { walk } from 'zimmerframe';
import { error } from '../../../errors.js';
import * as b from '../../../utils/builders.js';
import { set_scope } from '../../scope.js';
import { template_visitors } from './visitors/template.js';
import { global_visitors } from './visitors/global.js';
import { javascript_visitors } from './visitors/javascript.js';
import { javascript_visitors_runes } from './visitors/javascript-runes.js';
import { javascript_visitors_legacy } from './visitors/javascript-legacy.js';
import { serialize_get_binding } from './utils.js';

/**
 * This function ensures visitor sets don't accidentally clobber each other
 * @param  {...import('./types').Visitors} array
 * @returns {import('./types').Visitors}
 */
function combine_visitors(...array) {
	const visitors = {};

	for (const member of array) {
		for (const key in member) {
			if (key in visitors) {
				throw new Error(`Duplicate visitor: ${key}`);
			}

			// @ts-ignore
			visitors[key] = member[key];
		}
	}

	return visitors;
}

/**
 * @param {string} source
 * @param {import('../../types').ComponentAnalysis} analysis
 * @param {import('#compiler').ValidatedCompileOptions} options
 * @returns {import('estree').Program}
 */
export function client_component(source, analysis, options) {
	/** @type {import('./types').ComponentClientTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.template.scopes,
		hoisted: [b.import_all('$', 'svelte/internal')],
		node: /** @type {any} */ (null), // populated by the root node
		// these should be set by create_block - if they're called outside, it's a bug
		get init() {
			/** @type {any[]} */
			const a = [];
			a.push = () => error(null, 'INTERNAL', 'init.push should not be called outside create_block');
			return a;
		},
		get update() {
			/** @type {any[]} */
			const a = [];
			a.push = () =>
				error(null, 'INTERNAL', 'update.push should not be called outside create_block');
			return a;
		},
		get update_effects() {
			/** @type {any[]} */
			const a = [];
			a.push = () =>
				error(null, 'INTERNAL', 'update_effects.push should not be called outside create_block');
			return a;
		},
		get after_update() {
			/** @type {any[]} */
			const a = [];
			a.push = () =>
				error(null, 'INTERNAL', 'after_update.push should not be called outside create_block');
			return a;
		},
		get template() {
			/** @type {any[]} */
			const a = [];
			a.push = () =>
				error(null, 'INTERNAL', 'template.push should not be called outside create_block');
			return a;
		},
		legacy_reactive_statements: new Map(),
		metadata: {
			template_needs_import_node: false,
			namespace: options.namespace,
			bound_contenteditable: false
		},
		events: new Set(),
		preserve_whitespace: options.preserveWhitespace,
		public_state: new Map(),
		private_state: new Map(),
		in_constructor: false
	};

	const module = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.module.ast),
			state,
			combine_visitors(
				set_scope(analysis.module.scopes),
				global_visitors,
				// @ts-expect-error TODO
				javascript_visitors,
				analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy
			)
		)
	);

	const instance_state = { ...state, scope: analysis.instance.scope };
	const instance = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.instance.ast),
			instance_state,
			combine_visitors(
				set_scope(analysis.instance.scopes),
				global_visitors,
				// @ts-expect-error TODO
				javascript_visitors,
				analysis.runes ? javascript_visitors_runes : javascript_visitors_legacy,
				{
					ImportDeclaration(node, { state }) {
						// @ts-expect-error TODO
						state.hoisted.push(node);
						return { type: 'EmptyStatement' };
					},
					ExportNamedDeclaration(node, { visit }) {
						if (node.declaration) {
							return visit(node.declaration);
						}

						// specifiers are handled elsewhere
						return b.empty;
					}
				}
			)
		)
	);

	const template = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.template.ast),
			{ ...state, scope: analysis.instance.scope },
			// @ts-expect-error TODO
			combine_visitors(set_scope(analysis.template.scopes), global_visitors, template_visitors)
		)
	);

	// Very very dirty way of making import statements reactive in legacy mode if needed
	if (!analysis.runes) {
		for (const [name, binding] of analysis.module.scope.declarations) {
			if (binding.kind === 'state' && binding.declaration_kind === 'import') {
				instance.body.unshift(
					b.var('$$_import_' + name, b.call('$.reactive_import', b.thunk(b.id(name))))
				);
			}
		}
	}

	/** @type {import('estree').Statement[]} */
	const store_setup = [];

	/** @type {import('estree').VariableDeclaration[]} */
	const legacy_reactive_declarations = [];

	for (const [name, binding] of analysis.instance.scope.declarations) {
		if (binding.kind === 'legacy_reactive') {
			legacy_reactive_declarations.push(b.const(name, b.call('$.source')));
		}
		if (binding.kind === 'store_sub') {
			if (store_setup.length === 0) {
				store_setup.push(
					b.const('$$subscriptions', b.object([])),
					b.stmt(b.call('$.unsubscribe_on_destroy', b.id('$$subscriptions')))
				);
			}
			// We're creating an arrow function that gets the store value which minifies better for two or more references
			const store_reference = serialize_get_binding(b.id(name.slice(1)), instance_state);
			const store_get = b.call(
				'$.store_get',
				store_reference,
				b.literal(name),
				b.id('$$subscriptions')
			);
			store_setup.push(
				b.const(
					binding.node,
					options.dev
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
			error(node, 'INTERNAL', 'Could not find reactive statement');
		}
		instance.body.push(statement[1]);
	}

	/**
	 * Used to store the group nodes
	 * @type {import('estree').VariableDeclaration[]}
	 */
	const group_binding_declarations = [];
	for (const group of analysis.binding_groups.values()) {
		group_binding_declarations.push(b.const(group.name, b.array([])));
	}

	// Bind static exports to props so that people can access them with bind:x
	const static_bindings = analysis.exports.map(({ name, alias }) => {
		const binding = analysis.instance.scope.get(name);
		return b.stmt(
			b.call(
				'$.bind_prop',
				b.id('$$props'),
				b.literal(alias ?? name),
				binding?.kind === 'state' ? b.call('$.get', b.id(name)) : b.id(name)
			)
		);
	});

	const properties = analysis.exports.map(({ name, alias }) => {
		const binding = analysis.instance.scope.get(name);
		// TODO This is always a getter because the `renamed-instance-exports` test wants it that way.
		// Should we for code size reasons make it an init in runes mode and/or non-dev mode?
		return b.get(alias ?? name, [
			b.return(binding?.kind === 'state' ? b.call('$.get', b.id(name)) : b.id(name))
		]);
	});

	if (analysis.accessors) {
		for (const [name, binding] of analysis.instance.scope.declarations) {
			if (binding.kind !== 'prop' || name.startsWith('$$')) continue;

			const key = binding.prop_alias ?? name;

			properties.push(
				b.get(key, [b.return(b.call('$.get', b.id(name)))]),
				b.set(key, [b.stmt(b.call('$.set_sync', b.id(name), b.id('$$value')))])
			);
		}
	}

	const component_block = b.block([
		b.stmt(
			b.call(
				'$.push',
				b.id('$$props'),
				b.literal(analysis.runes),
				...(options.immutable ? [b.literal(true)] : [])
			)
		),
		...store_setup,
		...legacy_reactive_declarations,
		...group_binding_declarations,
		.../** @type {import('estree').Statement[]} */ (instance.body),
		.../** @type {import('estree').Statement[]} */ (template.body),
		...static_bindings
	]);

	const append_styles =
		analysis.inject_styles && analysis.stylesheet.has_styles
			? () =>
					component_block.body.push(
						b.stmt(
							b.call(
								'$.append_styles',
								b.id('$$anchor'),
								b.literal(analysis.stylesheet.id),
								b.literal(analysis.stylesheet.render(analysis.name, source, options.dev).code)
							)
						)
					)
			: () => {};

	if (properties.length > 0) {
		component_block.body.push(
			b.var('$$accessors', b.object(properties)),
			b.stmt(b.call('$.pop', b.id('$$accessors')))
		);
		append_styles();
		component_block.body.push(b.return(b.id('$$accessors')));
	} else {
		component_block.body.push(b.stmt(b.call('$.pop')));
		append_styles();
	}

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
			b.const(
				'$$sanitized_props',
				b.call(
					'$.rest_props',
					b.id('$$props'),
					b.array([b.literal('children'), b.literal('$$slots'), b.literal('$$events')])
				)
			)
		);
	}

	if (analysis.uses_slots) {
		component_block.body.unshift(b.const('$$slots', b.call('$.sanitize_slots', b.id('$$props'))));
	}

	const body = [
		...state.hoisted,
		...module.body,
		b.export_default(
			b.function_declaration(
				b.id(analysis.name),
				[b.id('$$anchor'), b.id('$$props')],
				component_block
			)
		)
	];

	if (options.discloseVersion) {
		body.unshift(b.imports([], 'svelte/internal/disclose-version'));
	}

	if (options.legacy.componentApi) {
		body.unshift(b.imports([['createClassComponent', '$$_createClassComponent']], 'svelte/legacy'));
		component_block.body.unshift(
			b.if(
				b.binary('===', b.id('new.target'), b.id(analysis.name)),
				b.return(
					b.call(
						'$$_createClassComponent',
						// When called with new, the first argument is the constructor options
						b.object([b.init('component', b.id(analysis.name)), b.spread(b.id('$$anchor'))])
					)
				)
			)
		);
	} else if (options.dev) {
		component_block.body.unshift(
			b.if(
				b.binary('===', b.id('new.target'), b.id(analysis.name)),
				b.throw_error(
					`Instantiating a component with \`new\` is no longer valid in Svelte 5. ` +
						'See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more information'
				)
			)
		);
	}

	if (state.events.size > 0) {
		body.push(
			b.stmt(b.call('$.delegate', b.array(Array.from(state.events).map((name) => b.literal(name)))))
		);
	}

	if (analysis.custom_element) {
		const ce = analysis.custom_element;

		/** @type {import('estree').Property[]} */
		const props_str = [];

		for (const [name, binding] of analysis.instance.scope.declarations) {
			if (binding.kind !== 'prop' || name.startsWith('$$')) continue;

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
				/** @type {import('estree').Property[]} */ (
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

		// If customElement option is set, we define the custom element directly. Else we still create
		// the custom element class so that the user may instantiate a custom element themselves later.
		if (typeof ce !== 'boolean') {
			body.push(b.stmt(b.call('customElements.define', b.literal(ce.tag), create_ce)));
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
 * @param {import('../../types').Analysis} analysis
 * @param {import('#compiler').ValidatedModuleCompileOptions} options
 * @returns {import('estree').Program}
 */
export function client_module(analysis, options) {
	/** @type {import('./types').ClientTransformState} */
	const state = {
		analysis,
		options,
		scope: analysis.module.scope,
		scopes: analysis.module.scopes,
		legacy_reactive_statements: new Map(),
		public_state: new Map(),
		private_state: new Map(),
		in_constructor: false
	};

	const module = /** @type {import('estree').Program} */ (
		walk(
			/** @type {import('#compiler').SvelteNode} */ (analysis.module.ast),
			state,
			combine_visitors(
				set_scope(analysis.module.scopes),
				global_visitors,
				// @ts-expect-error
				javascript_visitors,
				javascript_visitors_runes
			)
		)
	);

	return {
		type: 'Program',
		sourceType: 'module',
		body: [b.import_all('$', 'svelte/internal'), ...module.body]
	};
}
