/** @typedef {{ start?: number, end?: number }} NodeLike */
/** @typedef {Record<string, (...args: any[]) => string>} Errors */

/**
 * @param {Array<string | number>} items
 * @param {string} conjunction
 */
function list(items, conjunction = 'or') {
	if (items.length === 1) return items[0];
	return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`;
}

/** @satisfies {Errors} */
const internal = {
	/** @param {string} message */
	TODO: (message) => `TODO ${message}`,

	/** @param {string} message */
	INTERNAL: (message) =>
		`Internal compiler error: ${message}. Please report this to https://github.com/sveltejs/svelte/issues`
};

/** @satisfies {Errors} */
const attributes = {
	'empty-attribute-shorthand': () => `Attribute shorthand cannot be empty`,
	'duplicate-attribute': () => `Attributes need to be unique`,
	'invalid-event-attribute-value': () =>
		`Event attribute must be a JavaScript expression, not a string`,
	/** @param {string} name */
	'invalid-attribute-name': (name) => `'${name}' is not a valid attribute name`,
	/** @param {'no-each' | 'each-key' | 'child'} type */
	'invalid-animation': (type) =>
		type === 'no-each'
			? `An element that uses the animate directive must be the immediate child of a keyed each block`
			: type === 'each-key'
				? `An element that uses the animate directive must be used inside a keyed each block. Did you forget to add a key to your each block?`
				: `An element that uses the animate directive must be the sole child of a keyed each block`,
	'duplicate-animation': () => `An element can only have one 'animate' directive`,
	/** @param {string[] | undefined} [modifiers] */
	'invalid-event-modifier': (modifiers) =>
		modifiers
			? `Valid event modifiers are ${modifiers.slice(0, -1).join(', ')} or ${modifiers.slice(-1)}`
			: `Event modifiers other than 'once' can only be used on DOM elements`,
	/**
	 * @param {string} modifier1
	 * @param {string} modifier2
	 */
	'invalid-event-modifier-combination': (modifier1, modifier2) =>
		`The '${modifier1}' and '${modifier2}' modifiers cannot be used together`,
	/**
	 * @param {string} directive1
	 * @param {string} directive2
	 */
	'duplicate-transition': (directive1, directive2) => {
		/** @param {string} _directive */
		function describe(_directive) {
			return _directive === 'transition' ? "a 'transition'" : `an '${_directive}'`;
		}

		return directive1 === directive2
			? `An element can only have one '${directive1}' directive`
			: `An element cannot have both ${describe(directive1)} directive and ${describe(
					directive2
				)} directive`;
	},
	'invalid-let-directive-placement': () => 'let directive at invalid position',
	'invalid-style-directive-modifier': () =>
		`Invalid 'style:' modifier. Valid modifiers are: 'important'`,
	'invalid-sequence-expression': () =>
		`Sequence expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses`
};

/** @satisfies {Errors} */
const slots = {
	'invalid-slot-element-attribute': () =>
		`<slot> can only receive attributes and (optionally) let directives`,
	'invalid-slot-attribute': () => `slot attribute must be a static value`,
	/** @param {boolean} is_default */
	'invalid-slot-name': (is_default) =>
		is_default
			? `default is a reserved word — it cannot be used as a slot name`
			: `slot attribute must be a static value`,
	'invalid-slot-placement': () =>
		`Element with a slot='...' attribute must be a child of a component or a descendant of a custom element`,
	/** @param {string} name @param {string} component */
	'duplicate-slot-name': (name, component) => `Duplicate slot name '${name}' in <${component}>`,
	'invalid-default-slot-content': () =>
		`Found default slot content alongside an explicit slot="default"`,
	'conflicting-children-snippet': () =>
		`Cannot use explicit children snippet at the same time as implicit children content. Remove either the non-whitespace content or the children snippet block`
};

/** @satisfies {Errors} */
const bindings = {
	'invalid-binding-expression': () => `Can only bind to an Identifier or MemberExpression`,
	'invalid-binding-value': () => `Can only bind to state or props`,
	/**
	 * @param {string} binding
	 * @param {string} [elements]
	 * @param {string} [post]
	 */
	'invalid-binding': (binding, elements, post = '') =>
		(elements
			? `'${binding}' binding can only be used with ${elements}`
			: `'${binding}' is not a valid binding`) + post,
	'invalid-type-attribute': () =>
		`'type' attribute must be a static text value if input uses two-way binding`,
	'invalid-multiple-attribute': () =>
		`'multiple' attribute must be static if select uses two-way binding`,
	'missing-contenteditable-attribute': () =>
		`'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings`,
	'dynamic-contenteditable-attribute': () =>
		`'contenteditable' attribute cannot be dynamic if element uses two-way binding`
};

/** @satisfies {Errors} */
const variables = {
	'illegal-global': /** @param {string} name */ (name) =>
		`${name} is an illegal variable name. To reference a global variable called ${name}, use globalThis.${name}`,
	/** @param {string} name */
	'duplicate-declaration': (name) => `'${name}' has already been declared`,
	'default-export': () => `A component cannot have a default export`,
	'illegal-variable-declaration': () =>
		'Cannot declare same variable name which is imported inside <script context="module">',
	'illegal-store-subscription': () =>
		'Cannot subscribe to stores that are not declared at the top level of the component'
};

/** @satisfies {Errors} */
const legacy_reactivity = {
	'cyclical-reactive-declaration': /** @param {string[]} cycle */ (cycle) =>
		`Cyclical dependency detected: ${cycle.join(' → ')}`
};

/** @satisfies {Errors} */
const compiler_options = {
	/** @param {string} msg */
	'invalid-compiler-option': (msg) => `Invalid compiler option: ${msg}`,
	/** @param {string} msg */
	'removed-compiler-option': (msg) => `Invalid compiler option: ${msg}`
};

/** @satisfies {Errors} */
const const_tag = {
	'invalid-const-placement': () =>
		`{@const} must be the immediate child of {#snippet}, {#if}, {:else if}, {:else}, {#each}, {:then}, {:catch}, <svelte:fragment> or <Component>`
};

/** @satisfies {Errors} */
const errors = {
	...internal,
	...slots,
	...bindings,
	...variables,
	...compiler_options,
	...legacy_reactivity,
	...const_tag

	// missing_contenteditable_attribute: {
	// 	code: 'missing-contenteditable-attribute',
	// 	message:
	// 		"'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings"
	// },
	// textarea_duplicate_value: {
	// 	code: 'textarea-duplicate-value',
	// 	message:
	// 		'A <textarea> can have either a value attribute or (equivalently) child content, but not both'
	// },
	// invalid_attribute_head: {
	// 	code: 'invalid-attribute',
	// 	message: '<svelte:head> should not have any attributes or directives'
	// },
	// invalid_action: {
	// 	code: 'invalid-action',
	// 	message: 'Actions can only be applied to DOM elements, not components'
	// },
	// invalid_class: {
	// 	code: 'invalid-class',
	// 	message: 'Classes can only be applied to DOM elements, not components'
	// },
	// invalid_transition: {
	// 	code: 'invalid-transition',
	// 	message: 'Transitions can only be applied to DOM elements, not components'
	// },
	// invalid_let: {
	// 	code: 'invalid-let',
	// 	message: 'let directive value must be an identifier or an object/array pattern'
	// },
	// invalid_slot_directive: {
	// 	code: 'invalid-slot-directive',
	// 	message: '<slot> cannot have directives'
	// },
	// dynamic_slot_name: {
	// 	code: 'dynamic-slot-name',
	// 	message: '<slot> name cannot be dynamic'
	// },
	// invalid_slot_attribute_value_missing: {
	// 	code: 'invalid-slot-attribute',
	// 	message: 'slot attribute value is missing'
	// },
	// illegal_structure_title: {
	// 	code: 'illegal-structure',
	// 	message: '<title> can only contain text and {tags}'
	// },
	// duplicate_transition: /**
	//  * @param {string} directive
	//  * @param {string} parent_directive
	//  */ (directive, parent_directive) => {
	// 	/** @param {string} _directive */
	// 	function describe(_directive) {
	// 		return _directive === 'transition' ? "a 'transition'" : `an '${_directive}'`;
	// 	}
	// 	const message =
	// 		directive === parent_directive
	// 			? `An element can only have one '${directive}' directive`
	// 			: `An element cannot have both ${describe(parent_directive)} directive and ${describe(
	// 					directive
	// 			  )} directive`;
	// 	return {
	// 		code: 'duplicate-transition',
	// 		message
	// 	};
	// },
	// default_export: {
	// 	code: 'default-export',
	// 	message: 'A component cannot have a default export'
	// },
	// illegal_declaration: {
	// 	code: 'illegal-declaration',
	// 	message: 'The $ prefix is reserved, and cannot be used for variable and import names'
	// },
	// invalid_directive_value: {
	// 	code: 'invalid-directive-value',
	// 	message:
	// 		'Can only bind to an identifier (e.g. `foo`) or a member expression (e.g. `foo.bar` or `foo[baz]`)'
	// },
};

// interface is duplicated between here (used internally) and ./interfaces.js
// (exposed publicly), and I'm not sure how to avoid that
export class CompileError extends Error {
	name = 'CompileError';

	/** @type {import('#compiler').CompileError['filename']} */
	filename = undefined;

	/** @type {import('#compiler').CompileError['position']} */
	position = undefined;

	/** @type {import('#compiler').CompileError['start']} */
	start = undefined;

	/** @type {import('#compiler').CompileError['end']} */
	end = undefined;

	/**
	 *
	 * @param {string} code
	 * @param {string} message
	 * @param {[number, number] | undefined} position
	 */
	constructor(code, message, position) {
		super(message);
		this.code = code;
		this.position = position;
	}

	toString() {
		let out = `${this.name}: ${this.message}`;

		out += `\n(${this.code})`;

		if (this.filename) {
			out += `\n${this.filename}`;

			if (this.start) {
				out += `${this.start.line}:${this.start.column}`;
			}
		}

		return out;
	}
}

/**
 * @template {Exclude<keyof typeof errors, 'TODO'>} T
 * @param {NodeLike | number | null} node
 * @param {T} code
 * @param  {Parameters<typeof errors[T]>} args
 * @returns {never}
 */
export function error(node, code, ...args) {
	const fn = errors[code];

	// @ts-expect-error
	const message = fn(...args);

	const start = typeof node === 'number' ? node : node?.start;
	const end = typeof node === 'number' ? node : node?.end;

	throw new CompileError(
		code,
		message,
		start !== undefined && end !== undefined ? [start, end] : undefined
	);
}
