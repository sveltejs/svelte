import {
	extract_ignores_above_position,
	extract_svelte_ignore_from_comments
} from './utils/extract_svelte_ignore.js';

/** @typedef {Record<string, (...args: any[]) => string>} Warnings */

/** @satisfies {Warnings} */
const css = {
	'unused-selector': () => 'Unused CSS selector'
};

/** @satisfies {Warnings} */
const attributes = {
	'avoid-is': () => 'The "is" attribute is not supported cross-browser and should be avoided',
	/** @param {string} name */
	'global-event-reference': (name) =>
		`You are referencing globalThis.${name}. Did you forget to declare a variable with that name?`
};

/** @satisfies {Warnings} */
const runes = {
	/** @param {string} name */
	'store-with-rune-name': (name) =>
		`It looks like you're using the $${name} rune, but there is a local binding called ${name}. ` +
		`Referencing a local variable with a $ prefix will create a store subscription. Please rename ${name} to avoid the ambiguity.`,
	/** @param {string} name */
	'non-state-reference': (name) =>
		`${name} is updated, but is not declared with $state(...). Changing its value will not correctly trigger updates.`,
	'derived-iife': () =>
		`Use \`$derived.by(() => {...})\` instead of \`$derived((() => {...})());\``,
	'invalid-props-declaration': () =>
		`Component properties are declared using $props() in runes mode. Did you forget to call the function?`
};

/** @satisfies {Warnings} */
const a11y = {
	/** @param {string} name */
	'a11y-aria-attributes': (name) => `A11y: <${name}> should not have aria-* attributes`,
	/**
	 * @param {string} attribute
	 * @param {string | null} [suggestion]
	 */
	'a11y-unknown-aria-attribute': (attribute, suggestion) =>
		`A11y: Unknown aria attribute 'aria-${attribute}'` +
		(suggestion ? ` (did you mean '${suggestion}'?)` : ''),
	/** @param {string} name */
	'a11y-hidden': (name) => `A11y: <${name}> element should not be hidden`,
	/**
	 * @param {import('aria-query').ARIAPropertyDefinition} schema
	 * @param {string} attribute
	 */
	'a11y-incorrect-aria-attribute-type': (schema, attribute) => {
		let message;
		switch (schema.type) {
			case 'boolean':
				message = `The value of '${attribute}' must be exactly one of true or false`;
				break;
			case 'id':
				message = `The value of '${attribute}' must be a string that represents a DOM element ID`;
				break;
			case 'idlist':
				message = `The value of '${attribute}' must be a space-separated list of strings that represent DOM element IDs`;
				break;
			case 'tristate':
				message = `The value of '${attribute}' must be exactly one of true, false, or mixed`;
				break;
			case 'token':
				message = `The value of '${attribute}' must be exactly one of ${(schema.values || []).join(
					', '
				)}`;
				break;
			case 'tokenlist':
				message = `The value of '${attribute}' must be a space-separated list of one or more of ${(
					schema.values || []
				).join(', ')}`;
				break;
			default:
				message = `The value of '${attribute}' must be of type ${schema.type}`;
		}
		return `A11y: ${message}`;
	},
	'a11y-aria-activedescendant-has-tabindex': () =>
		'A11y: Elements with attribute aria-activedescendant should have tabindex value',
	/** @param {string} name */
	'a11y-misplaced-role': (name) => `A11y: <${name}> should not have role attribute`,
	/** @param {string | boolean} role */
	'a11y-no-abstract-role': (role) => `A11y: Abstract role '${role}' is forbidden`,
	/**
	 * @param {string | boolean} role
	 * @param {string | null} [suggestion]
	 */
	'a11y-unknown-role': (role, suggestion) =>
		`A11y: Unknown role '${role}'` + (suggestion ? ` (did you mean '${suggestion}'?)` : ''),
	/** @param {string | boolean} role */
	'a11y-no-redundant-roles': (role) => `A11y: Redundant role '${role}'`,
	/**
	 * @param {string} role
	 * @param {string[]} props
	 */
	'a11y-role-has-required-aria-props': (role, props) =>
		`A11y: Elements with the ARIA role "${role}" must have the following attributes defined: ${props
			.map((name) => `"${name}"`)
			.join(', ')}`,
	/** @param {string} role */
	'a11y-interactive-supports-focus': (role) =>
		`A11y: Elements with the '${role}' interactive role must have a tabindex value.`,
	/**
	 * @param {string | boolean} role
	 * @param {string} element
	 */
	'a11y-no-interactive-element-to-noninteractive-role': (role, element) =>
		`A11y: <${element}> cannot have role '${role}'`,
	/**
	 * @param {string | boolean} role
	 * @param {string} element
	 */
	'a11y-no-noninteractive-element-to-interactive-role': (role, element) =>
		`A11y: Non-interactive element <${element}> cannot have interactive role '${role}'`,
	'a11y-accesskey': () => 'A11y: Avoid using accesskey',
	'a11y-autofocus': () => 'A11y: Avoid using autofocus',
	'a11y-misplaced-scope': () => 'A11y: The scope attribute should only be used with <th> elements',
	'a11y-positive-tabindex': () => 'A11y: avoid tabindex values above zero',
	'a11y-click-events-have-key-events': () =>
		'A11y: visible, non-interactive elements with a click event must be accompanied by a keyboard event handler. Consider whether an interactive element such as <button type="button"> or <a> might be more appropriate. See https://svelte.dev/docs/accessibility-warnings#a11y-click-events-have-key-events for more details.',
	'a11y-no-noninteractive-tabindex': () =>
		'A11y: noninteractive element cannot have nonnegative tabIndex value',
	/**
	 * @param {string} attribute
	 * @param {string} role
	 * @param {boolean} is_implicit
	 * @param {string} name
	 */
	'a11y-role-supports-aria-props': (attribute, role, is_implicit, name) => {
		let message = `The attribute '${attribute}' is not supported by the role '${role}'.`;
		if (is_implicit) {
			message += ` This role is implicit on the element <${name}>.`;
		}
		return `A11y: ${message}`;
	},
	/** @param {string} element */
	'a11y-no-noninteractive-element-interactions': (element) =>
		`A11y: Non-interactive element <${element}> should not be assigned mouse or keyboard event listeners.`,
	/**
	 * @param {string} element
	 * @param {string[]} handlers
	 */
	'a11y-no-static-element-interactions': (element, handlers) =>
		`A11y: <${element}> with ${handlers.join(', ')} ${
			handlers.length === 1 ? 'handler' : 'handlers'
		} must have an ARIA role`,
	/**
	 * @param {string} href_attribute
	 * @param {string} href_value
	 */
	'a11y-invalid-attribute': (href_attribute, href_value) =>
		`A11y: '${href_value}' is not a valid ${href_attribute} attribute`,
	/**
	 * @param {string} name
	 * @param {string} article
	 * @param {string} sequence
	 */
	'a11y-missing-attribute': (name, article, sequence) =>
		`A11y: <${name}> element should have ${article} ${sequence} attribute`,
	/**
	 * @param {null | true | string} type
	 * @param {null | true | string} value
	 */
	'a11y-autocomplete-valid': (type, value) =>
		`A11y: The value '${value}' is not supported by the attribute 'autocomplete' on element <input type="${
			type || '...'
		}">`,
	'a11y-img-redundant-alt': () =>
		'A11y: Screenreaders already announce <img> elements as an image.',
	'a11y-label-has-associated-control': () =>
		'A11y: A form label must be associated with a control.',
	'a11y-media-has-caption': () => 'A11y: <video> elements must have a <track kind="captions">',
	/** @param {string} name */
	'a11y-distracting-elements': (name) => `A11y: Avoid <${name}> elements`,
	/** @param {boolean} immediate */
	'a11y-structure': (immediate) =>
		immediate
			? 'A11y: <figcaption> must be an immediate child of <figure>'
			: 'A11y: <figcaption> must be first or last child of <figure>',
	/**
	 * @param {string} event
	 * @param {string} accompanied_by
	 */
	'a11y-mouse-events-have-key-events': (event, accompanied_by) =>
		`A11y: '${event}' event must be accompanied by '${accompanied_by}' event`,
	/** @param {string} name */
	'a11y-missing-content': (name) => `A11y: <${name}> element should have child content`
};

/** @satisfies {Warnings} */
const state = {
	'static-state-reference': () =>
		`State referenced in its own scope will never update. Did you mean to reference it inside a closure?`
};

/** @satisfies {Warnings} */
const performance = {
	'avoid-inline-class': () =>
		`Avoid 'new class' — instead, declare the class at the top level scope`,
	'avoid-nested-class': () => `Avoid declaring classes below the top level scope`
};

/** @satisfies {Warnings} */
const components = {
	/** @param {string} name */
	'component-name-lowercase': (name) =>
		`<${name}> will be treated as an HTML element unless it begins with a capital letter`
};

const legacy = {
	'no-reactive-declaration': () =>
		`Reactive declarations only exist at the top level of the instance script`
};

/** @satisfies {Warnings} */
const warnings = {
	...css,
	...attributes,
	...runes,
	...a11y,
	...performance,
	...state,
	...components,
	...legacy
};

/** @typedef {typeof warnings} AllWarnings */

/**
 * @template {keyof AllWarnings} T
 * @param {import('./phases/types').RawWarning[]} array the array to push the warning to, if not ignored
 * @param {{ start?: number, end?: number, parent?: import('#compiler').SvelteNode | null, leadingComments?: import('estree').Comment[] } | null} node the node related to the warning
 * @param {import('#compiler').SvelteNode[]} path the path to the node, so that we can traverse upwards to find svelte-ignore comments
 * @param {T} code the warning code
 * @param  {Parameters<AllWarnings[T]>} args the arguments to pass to the warning function
 * @returns {void}
 */
export function warn(array, node, path, code, ...args) {
	const fn = warnings[code];

	// Traverse the AST upwards to find any svelte-ignore comments.
	// This assumes that people don't have their code littered with warnings,
	// at which point this might become inefficient.
	/** @type {string[]} */
	const ignores = [];

	for (let i = path.length - 1; i >= 0; i--) {
		const current = path[i];

		// comments inside JavaScript (estree)
		if ('leadingComments' in current) {
			ignores.push(...extract_svelte_ignore_from_comments(current));
		}

		// Svelte nodes
		if (current.type === 'Fragment') {
			ignores.push(
				...extract_ignores_above_position(
					/** @type {import('#compiler').TemplateNode} */ (path[i + 1] ?? node),
					current.nodes
				)
			);
		}
	}

	if (ignores.includes(code)) return;

	const start = node?.start;
	const end = node?.end;

	array.push({
		code,
		// @ts-expect-error
		message: fn(...args),
		position: start !== undefined && end !== undefined ? [start, end] : undefined
	});
}
