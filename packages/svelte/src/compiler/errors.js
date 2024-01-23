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
const parse = {
	/** @param {string} name */
	'unclosed-element': (name) => `<${name}> was left open`,
	'unclosed-block': () => `Block was left open`,
	'unexpected-block-close': () => `Unexpected block closing tag`,
	/** @param {string} [expected]  */
	'unexpected-eof': (expected) =>
		`Unexpected end of input` + (expected ? ` (expected ${expected})` : ''),
	/** @param {string} message */
	'js-parse-error': (message) => message,
	/** @param {string} token */
	'expected-token': (token) => `Expected token ${token}`,
	/** @param {string} word */
	'unexpected-reserved-word': (word) =>
		`'${word}' is a reserved word in JavaScript and cannot be used here`,
	'missing-whitespace': () => `Expected whitespace`,
	'expected-pattern': () => `Expected identifier or destructure pattern`,
	'invalid-script-context': () =>
		`If the context attribute is supplied, its value must be "module"`,
	'invalid-elseif': () => `'elseif' should be 'else if'`,
	'invalid-continuing-block-placement': () =>
		`{:...} block is invalid at this position (did you forget to close the preceeding element or block?)`,
	/**
	 * @param {string} child
	 * @param {string} parent
	 */
	'invalid-block-missing-parent': (child, parent) => `${child} block must be a child of ${parent}`,
	/** @param {string} name */
	'duplicate-block-part': (name) => `${name} cannot appear more than once within a block`,
	'expected-block-type': () => `Expected 'if', 'each', 'await', 'key' or 'snippet'`,
	'expected-identifier': () => `Expected an identifier`,
	'invalid-debug': () => `{@debug ...} arguments must be identifiers, not arbitrary expressions`,
	'invalid-const': () => `{@const ...} must be an assignment`,
	/**
	 * @param {string} location
	 * @param {string} name
	 */
	'invalid-block-placement': (location, name) => `{#${name} ...} block cannot be ${location}`,
	/**
	 * @param {string} location
	 * @param {string} name
	 */
	'invalid-tag-placement': (location, name) => `{@${name} ...} tag cannot be ${location}`,
	'missing-attribute-value': () => `Expected attribute value`,
	/** @param {string} delimiter */
	'unclosed-attribute-value': (delimiter) => `Expected closing ${delimiter} character`,
	'invalid-directive-value': () =>
		`Directive value must be a JavaScript expression enclosed in curly braces`,
	/** @param {string} type */
	'empty-directive-name': (type) => `${type} name cannot be empty`,
	/** @param {string} name */
	'invalid-closing-tag': (name) => `</${name}> attempted to close an element that was not open`,
	/**
	 * @param {string} name
	 * @param {string} reason
	 */
	'invalid-closing-tag-after-autoclose': (name, reason) =>
		`</${name}> attempted to close element that was already automatically closed by <${reason}> (cannot nest <${reason}> inside <${name}>)`,
	'invalid-dollar-binding': () =>
		`The $ name is reserved, and cannot be used for variables and imports`,
	'invalid-dollar-prefix': () =>
		`The $ prefix is reserved, and cannot be used for variables and imports`,
	'invalid-dollar-global': () =>
		`The $ name is reserved. To reference a global variable called $, use globalThis.$`,
	'illegal-subscription': () => `Cannot reference store value inside <script context="module">`,
	'duplicate-style-element': () => `A component can have a single top-level <style> element`,
	'duplicate-script-element': () =>
		`A component can have a single top-level <script> element and/or a single top-level <script context="module"> element`
};

/** @satisfies {Errors} */
const css = {
	/** @param {string} message */
	'css-parse-error': (message) => message,
	'invalid-css-empty-declaration': () => `Declaration cannot be empty`,
	'invalid-css-global-placement': () =>
		`:global(...) can be at the start or end of a selector sequence, but not in the middle`,
	'invalid-css-global-selector': () => `:global(...) must contain exactly one selector`,
	'invalid-css-global-selector-list': () =>
		`:global(...) must not contain type or universal selectors when used in a compound selector`,
	'invalid-css-selector': () => `Invalid selector`,
	'invalid-css-identifier': () => 'Expected a valid CSS identifier'
};

/** @satisfies {Errors} */
const special_elements = {
	'invalid-svelte-option-attribute': () => `<svelte:options> can only receive static attributes`,
	'invalid-svelte-option-namespace': () =>
		`Unsupported <svelte:option> value for "namespace". Valid values are "html", "svg" or "foreign".`,
	'tag-option-deprecated': () => `"tag" option is deprecated — use "customElement" instead`,
	'invalid-svelte-option-runes': () =>
		`Unsupported <svelte:option> value for "runes". Valid values are true or false.`,
	'invalid-svelte-option-accessors': () =>
		'Unsupported <svelte:option> value for "accessors". Valid values are true or false.',
	'invalid-svelte-option-preserveWhitespace': () =>
		'Unsupported <svelte:option> value for "preserveWhitespace". Valid values are true or false.',
	'invalid-svelte-option-immutable': () =>
		'Unsupported <svelte:option> value for "immutable". Valid values are true or false.',
	'invalid-tag-property': () => 'tag name must be two or more words joined by the "-" character',
	'invalid-svelte-option-customElement': () =>
		'"customElement" must be a string literal defining a valid custom element name or an object of the form ' +
		'{ tag: string; shadow?: "open" | "none"; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }',
	'invalid-customElement-props-attribute': () =>
		'"props" must be a statically analyzable object literal of the form ' +
		'"{ [key: string]: { attribute?: string; reflect?: boolean; type?: "String" | "Boolean" | "Number" | "Array" | "Object" }"',
	'invalid-customElement-shadow-attribute': () => '"shadow" must be either "open" or "none"',
	'unknown-svelte-option-attribute': /** @param {string} name */ (name) =>
		`<svelte:options> unknown attribute '${name}'`,
	'illegal-svelte-head-attribute': () => '<svelte:head> cannot have attributes nor directives',
	'invalid-svelte-fragment-attribute': () =>
		`<svelte:fragment> can only have a slot attribute and (optionally) a let: directive`,
	'invalid-svelte-fragment-slot': () => `<svelte:fragment> slot attribute must have a static value`,
	'invalid-svelte-fragment-placement': () =>
		`<svelte:fragment> must be the direct child of a component`,
	/** @param {string} name */
	'invalid-svelte-element-placement': (name) =>
		`<${name}> tags cannot be inside elements or blocks`,
	/** @param {string} name */
	'duplicate-svelte-element': (name) => `A component can only have one <${name}> element`,
	'invalid-self-placement': () =>
		`<svelte:self> components can only exist inside {#if} blocks, {#each} blocks, {#snippet} blocks or slots passed to components`,
	'missing-svelte-element-definition': () => `<svelte:element> must have a 'this' attribute`,
	'missing-svelte-component-definition': () => `<svelte:component> must have a 'this' attribute`,
	'invalid-svelte-element-definition': () => `Invalid element definition — must be an {expression}`,
	'invalid-svelte-component-definition': () =>
		`Invalid component definition — must be an {expression}`,
	/**
	 * @param {string[]} tags
	 * @param {string | null} match
	 */
	'invalid-svelte-tag': (tags, match) =>
		`Valid <svelte:...> tag names are ${list(tags)}${match ? ' (did you mean ' + match + '?)' : ''}`
};

/** @satisfies {Errors} */
const runes = {
	'invalid-legacy-props': () => `Cannot use $$props in runes mode`,
	'invalid-legacy-rest-props': () => `Cannot use $$restProps in runes mode`,
	'invalid-legacy-reactive-statement': () =>
		`$: is not allowed in runes mode, use $derived or $effect instead`,
	'invalid-legacy-export': () => `Cannot use \`export let\` in runes mode — use $props instead`,
	/** @param {string} rune */
	'invalid-rune-usage': (rune) => `Cannot use ${rune} rune in non-runes mode`,
	'invalid-state-export': () => `Cannot export state if it is reassigned`,
	'invalid-derived-export': () => `Cannot export derived state`,
	'invalid-props-id': () => `$props() can only be used with an object destructuring pattern`,
	'invalid-props-pattern': () =>
		`$props() assignment must not contain nested properties or computed keys`,
	'invalid-props-location': () =>
		`$props() can only be used at the top level of components as a variable declaration initializer`,
	'invalid-derived-location': () =>
		`$derived() can only be used as a variable declaration initializer or a class field`,
	'invalid-state-location': () =>
		`$state() can only be used as a variable declaration initializer or a class field`,
	'invalid-effect-location': () => `$effect() can only be used as an expression statement`,
	/**
	 * @param {boolean} is_binding
	 * @param {boolean} show_details
	 */
	'invalid-const-assignment': (is_binding, show_details) =>
		`Invalid ${is_binding ? 'binding' : 'assignment'} to const variable${
			show_details
				? ' ($derived values, let: directives, :then/:catch variables and @const declarations count as const)'
				: ''
		}`,
	'invalid-derived-assignment': () => `Invalid assignment to derived state`,
	'invalid-derived-binding': () => `Invalid binding to derived state`,
	/**
	 * @param {string} rune
	 * @param {Array<number | string>} args
	 */
	'invalid-rune-args-length': (rune, args) =>
		`${rune} can only be called with ${list(args, 'or')} ${
			args.length === 1 && args[0] === 1 ? 'argument' : 'arguments'
		}`,
	'duplicate-props-rune': () => `Cannot use $props() more than once`
};

/** @satisfies {Errors} */
const elements = {
	'invalid-textarea-content': () =>
		`A <textarea> can have either a value attribute or (equivalently) child content, but not both`,
	'invalid-void-content': () => `Void elements cannot have children or closing tags`,
	/** @param {string} name */
	'invalid-element-content': (name) => `<${name}> cannot have children`,
	'invalid-tag-name': () => 'Expected valid tag name',
	/**
	 * @param {string} node
	 * @param {string} parent
	 */
	'invalid-node-placement': (node, parent) => `${node} is invalid inside <${parent}>`,
	'illegal-title-attribute': () => '<title> cannot have attributes nor directives',
	'invalid-title-content': () => '<title> can only contain text and {tags}'
};

/** @satisfies {Errors} */
const components = {
	'invalid-component-directive': () => `This type of directive is not valid on components`
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
	'invalid-let-directive-placement': () => 'let directive at invalid position'
};

/** @satisfies {Errors} */
const slots = {
	'invalid-slot-element-attribute': () => `<slot> can only receive attributes, not directives`,
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
		`Found default slot content alongside an explicit slot="default"`
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
	'default-export': () => `A component cannot have a default export`
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
	...parse,
	...css,
	...special_elements,
	...runes,
	...elements,
	...components,
	...attributes,
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
	// dynamic_contenteditable_attribute: {
	// 	code: 'dynamic-contenteditable-attribute',
	// 	message: "'contenteditable' attribute cannot be dynamic if element uses two-way binding"
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
	// contextual_store: {
	// 	code: 'contextual-store',
	// 	message:
	// 		'Stores must be declared at the top level of the component (this may change in a future version of Svelte)'
	// },
	// default_export: {
	// 	code: 'default-export',
	// 	message: 'A component cannot have a default export'
	// },
	// illegal_declaration: {
	// 	code: 'illegal-declaration',
	// 	message: 'The $ prefix is reserved, and cannot be used for variable and import names'
	// },
	// illegal_subscription: {
	// 	code: 'illegal-subscription',
	// 	message: 'Cannot reference store value inside <script context="module">'
	// },
	// illegal_global: /** @param {string} name */ (name) => ({
	// 	code: 'illegal-global',
	// 	message: `${name} is an illegal variable name`
	// }),
	// illegal_variable_declaration: {
	// 	code: 'illegal-variable-declaration',
	// 	message: 'Cannot declare same variable name which is imported inside <script context="module">'
	// },
	// invalid_directive_value: {
	// 	code: 'invalid-directive-value',
	// 	message:
	// 		'Can only bind to an identifier (e.g. `foo`) or a member expression (e.g. `foo.bar` or `foo[baz]`)'
	// },
	// cyclical_const_tags: /** @param {string[]} cycle */ (cycle) => ({
	// 	code: 'cyclical-const-tags',
	// 	message: `Cyclical dependency detected: ${cycle.join(' → ')}`
	// }),
	// invalid_var_declaration: {
	// 	code: 'invalid_var_declaration',
	// 	message: '"var" scope should not extend outside the reactive block'
	// },
	// invalid_style_directive_modifier: /** @param {string} valid */ (valid) => ({
	// 	code: 'invalid-style-directive-modifier',
	// 	message: `Valid modifiers for style directives are: ${valid}`
	// })
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
 * @template {keyof typeof errors} T
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
