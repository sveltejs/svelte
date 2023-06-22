import Block from './Block.js';
import FragmentWrapper from './wrappers/Fragment.js';
import { x } from 'code-red';
import flatten_reference from '../utils/flatten_reference.js';
import { reserved_keywords } from '../utils/reserved_keywords.js';
import { renderer_invalidate } from './invalidate.js';

export default class Renderer {
	/**
	 * @typedef {Object} ContextMember
	 * @property {string} name
	 * @property {import('estree').Literal} index
	 * @property {boolean} is_contextual
	 * @property {boolean} is_non_contextual
	 * @property {import('../../interfaces.js').Var} variable
	 * @property {number} priority
	 */

	/**
	 * @typedef {Array<{
	 * 	n: number;
	 * 	names: string[];
	 * }>} BitMasks
	 */

	/** @type {import('../Component.js').default} */
	component; // TODO Maybe Renderer shouldn't know about Component?

	/** @type {import('../../interfaces.js').CompileOptions} */
	options;

	/** @type {ContextMember[]} */
	context = [];

	/** @type {ContextMember[]} */
	initial_context = [];

	/** @type {Map<string, ContextMember>} */
	context_lookup = new Map();

	/** @type {boolean} */
	context_overflow;

	/** @type {Array<import('./Block.js').default | import('estree').Node | import('estree').Node[]>} */
	blocks = [];

	/** @type {Set<string>} */
	readonly = new Set();

	/** @type {Array<import('estree').Node | import('estree').Node[]>} */
	meta_bindings = []; // initial values for e.g. window.innerWidth, if there's a <svelte:window> meta tag

	/** @type {Map<string, BindingGroup>} */
	binding_groups = new Map();

	/** @type {import('./Block.js').default} */
	block;

	/** @type {import('./wrappers/Fragment.js').default} */
	fragment;

	/** @type {import('estree').Identifier} */
	file_var;

	/**
	 * Use this for stack traces. It is 1-based and acts on pre-processed sources.
	 * Use `meta_locate` for metadata on DOM elements.
	 * @type {(c: number) => { line: number; column: number }}
	 */
	locate;

	/**
	 * Use this for metadata on DOM elements. It is 1-based and acts on sources that have not been pre-processed.
	 * Use `locate` for source mappings.
	 * @type {(c: number) => { line: number; column: number }}
	 */
	meta_locate;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('../../interfaces.js').CompileOptions} options
	 */
	constructor(component, options) {
		this.component = component;
		this.options = options;
		this.locate = component.locate; // TODO messy
		this.meta_locate = component.meta_locate; // TODO messy
		this.file_var = options.dev && this.component.get_unique_name('file');
		component.vars
			.filter((v) => !v.hoistable || (v.export_name && !v.module))
			.forEach((v) => this.add_to_context(v.name));
		// ensure store values are included in context
		component.vars.filter((v) => v.subscribable).forEach((v) => this.add_to_context(`$${v.name}`));
		reserved_keywords.forEach((keyword) => {
			if (component.var_lookup.has(keyword)) {
				this.add_to_context(keyword);
			}
		});
		if (component.slots.size > 0) {
			this.add_to_context('$$scope');
			this.add_to_context('#slots');
		}
		// main block
		this.block = new Block({
			renderer: this,
			name: null,
			type: 'component',
			key: null,
			bindings: new Map(),
			dependencies: new Set()
		});
		this.block.has_update_method = true;
		this.fragment = new FragmentWrapper(
			this,
			this.block,
			component.fragment.children,
			null,
			true,
			null
		);
		// TODO messy
		this.blocks.forEach((block) => {
			if (block instanceof Block) {
				block.assign_variable_names();
			}
		});
		this.block.assign_variable_names();
		this.fragment.render(this.block, null, /** @type {import('estree').Identifier} */ (x`#nodes`));
		this.context_overflow = this.context.length > 31;
		this.context.forEach((member) => {
			const { variable } = member;
			if (variable) {
				member.priority += 2;
				if (variable.mutated || variable.reassigned) member.priority += 4;
				// these determine whether variable is included in initial context
				// array, so must have the highest priority
				if (variable.is_reactive_dependency && (variable.mutated || variable.reassigned))
					member.priority += 16;
				if (variable.export_name) member.priority += 32;
				if (variable.referenced) member.priority += 64;
			} else if (member.is_non_contextual) {
				// determine whether variable is included in initial context
				// array, so must have the highest priority
				member.priority += 8;
			}
			if (!member.is_contextual) {
				member.priority += 1;
			}
		});
		this.context.sort(
			(a, b) =>
				b.priority - a.priority ||
				/** @type {number} */ (a.index.value) - /** @type {number} */ (b.index.value)
		);
		this.context.forEach((member, i) => (member.index.value = i));
		let i = this.context.length;
		while (i--) {
			const member = this.context[i];
			if (member.variable) {
				if (
					member.variable.referenced ||
					member.variable.export_name ||
					(member.variable.is_reactive_dependency &&
						(member.variable.mutated || member.variable.reassigned))
				)
					break;
			} else if (member.is_non_contextual) {
				break;
			}
		}
		this.initial_context = this.context.slice(0, i + 1);
	}

	/**
	 * @param {string} name
	 * @param {any} contextual
	 */
	add_to_context(name, contextual = false) {
		if (!this.context_lookup.has(name)) {
			/** @type {ContextMember} */
			const member = {
				name,
				index: { type: 'Literal', value: this.context.length },
				is_contextual: false,
				is_non_contextual: false,
				variable: null,
				priority: 0
			};
			this.context_lookup.set(name, member);
			this.context.push(member);
		}
		const member = this.context_lookup.get(name);
		if (contextual) {
			member.is_contextual = true;
		} else {
			member.is_non_contextual = true;
			member.variable = this.component.var_lookup.get(name);
		}
		return member;
	}

	/**
	 * @param {string} name
	 * @param {unknown} [value]
	 * @param {boolean} main_execution_context
	 */
	invalidate(name, value, main_execution_context = false) {
		return renderer_invalidate(this, name, value, main_execution_context);
	}

	/**
	 * @param {string[]} names
	 * @param {any} is_reactive_declaration
	 * @returns {import('estree').Expression}
	 */
	dirty(names, is_reactive_declaration = false) {
		const renderer = this;
		const dirty = /** @type {| import('estree').Identifier
                    | import('estree').MemberExpression} */ (
			is_reactive_declaration ? x`$$self.$$.dirty` : x`#dirty`
		);
		const get_bitmask = () => {
			/** @type {BitMasks} */
			const bitmask = [];
			names.forEach((name) => {
				const member = renderer.context_lookup.get(name);
				if (!member) return;
				if (member.index.value === -1) {
					throw new Error('unset index');
				}
				const value = /** @type {number} */ (member.index.value);
				const i = (value / 31) | 0;
				const n = 1 << value % 31;
				if (!bitmask[i]) bitmask[i] = { n: 0, names: [] };
				bitmask[i].n |= n;
				bitmask[i].names.push(name);
			});
			return bitmask;
		};
		// TODO: context-overflow make it less gross
		return /** @type {any} */ ({
			// Using a ParenthesizedExpression allows us to create
			// the expression lazily. TODO would be better if
			// context was determined before rendering, so that
			// this indirection was unnecessary
			type: 'ParenthesizedExpression',
			get expression() {
				const bitmask = get_bitmask();
				if (!bitmask.length) {
					return /** @type {import('estree').BinaryExpression} */ (
						x`${dirty} & /*${names.join(', ')}*/ 0`
					);
				}
				if (renderer.context_overflow) {
					return bitmask
						.map((b, i) => ({ b, i }))
						.filter(({ b }) => b)
						.map(({ b, i }) => x`${dirty}[${i}] & /*${b.names.join(', ')}*/ ${b.n}`)
						.reduce((lhs, rhs) => x`${lhs} | ${rhs}`);
				}
				return /** @type {import('estree').BinaryExpression} */ (
					x`${dirty} & /*${names.join(', ')}*/ ${bitmask[0].n}`
				);
			}
		});
	}
	// NOTE: this method may be called before this.context_overflow / this.context is fully defined
	// therefore, they can only be evaluated later in a getter function

	/** @returns {import('estree').UnaryExpression | import('estree').ArrayExpression} */
	get_initial_dirty() {
		const _this = this;
		// TODO: context-overflow make it less gross

		/** @type {import('estree').UnaryExpression} */
		const val = /** @type {import('estree').UnaryExpression} */ (x`-1`);
		return {
			get type() {
				return _this.context_overflow ? 'ArrayExpression' : 'UnaryExpression';
			},
			// as [-1]
			get elements() {
				const elements = [];
				for (let i = 0; i < _this.context.length; i += 31) {
					elements.push(val);
				}
				return elements;
			},
			// as -1
			operator: val.operator,
			prefix: val.prefix,
			argument: val.argument
		};
	}

	/**
	 * @param {string | import('estree').Identifier | import('estree').MemberExpression} node
	 * @param {string | void} ctx
	 */
	reference(node, ctx = '#ctx') {
		if (typeof node === 'string') {
			node = { type: 'Identifier', name: node };
		}
		const { name, nodes } = flatten_reference(node);
		const member = this.context_lookup.get(name);
		// TODO is this correct?
		if (this.component.var_lookup.get(name)) {
			this.component.add_reference(node, name);
		}
		if (member !== undefined) {
			const replacement = /** @type {import('estree').MemberExpression} */ (
				x`/*${member.name}*/ ${ctx}[${member.index}]`
			);
			if (nodes[0].loc) replacement.object.loc = nodes[0].loc;
			nodes[0] = replacement;
			return nodes.reduce((lhs, rhs) => x`${lhs}.${rhs}`);
		}
		return node;
	}

	/** @param {import('./Block.js').default | import('estree').Node | import('estree').Node[]} block */
	remove_block(block) {
		this.blocks.splice(this.blocks.indexOf(block), 1);
	}
}

/**
 * @typedef {Object} BindingGroup
 * @property {(to_reference?:boolean)=>import('estree').Node} binding_group
 * @property {string[]} contexts
 * @property {Set<string>} list_dependencies
 * @property {string} keypath
 * @property {(block:Block,element:import('estree').PrivateIdentifier) => void} add_element
 * @property {(block:Block)=>void} render
 */
