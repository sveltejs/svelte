import { set_current_component, current_component } from './lifecycle';
import { run_all, blank_object } from './utils';
import { Readable } from 'svelte/store';

export const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter

export function spread(args) {
	const attributes = Object.assign({}, ...args);
	let str = '';

	Object.keys(attributes).forEach(name => {
		if (invalid_attribute_name_character.test(name)) return;

		const value = attributes[name];
		if (value === undefined) return;
		if (value === true) str += " " + name;

		const escaped = String(value)
			.replace(/"/g, '&#34;')
			.replace(/'/g, '&#39;');

		str += " " + name + "=" + JSON.stringify(escaped);
	});

	return str;
}

export const escaped = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

export function escape(html) {
	return String(html).replace(/["'&<>]/g, match => escaped[match]);
}

export function each(items, fn) {
	let str = '';
	for (let i = 0; i < items.length; i += 1) {
		str += fn(items[i], i);
	}
	return str;
}

export const missing_component = {
	$$render: () => ''
};

export function validate_component(component, name) {
	if (!component || !component.$$render) {
		if (name === 'svelte:component') name += ' this={...}';
		throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
	}

	return component;
}

export function debug(file, line, column, values) {
	console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
	console.log(values); // eslint-disable-line no-console
	return '';
}

let on_destroy;

export function create_ssr_component(fn) {
	function $$render(result, props, bindings, slots) {
		const parent_component = current_component;

		const $$ = {
			on_destroy,
			context: new Map(parent_component ? parent_component.$$.context : []),

			// these will be immediately discarded
			on_mount: [],
			before_render: [],
			after_render: [],
			callbacks: blank_object()
		};

		set_current_component({ $$ });

		const html = fn(result, props, bindings, slots);

		set_current_component(parent_component);
		return html;
	}

	return {
		render: (props = {}, options = {}) => {
			on_destroy = [];

			const result = { head: '', css: new Set() };
			const html = $$render(result, props, {}, options);

			run_all(on_destroy);

			return {
				html,
				css: {
					code: Array.from(result.css).map(css => css.code).join('\n'),
					map: null // TODO
				},
				head: result.head
			};
		},

		$$render
	};
}

export function get_store_value<T>(store: Readable<T>): T | undefined {
	let value;
	store.subscribe(_ => value = _)();
	return value;
}

export function add_attribute(name, value) {
	if (!value) return '';
	return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(value) : `"${value}"`}`}`;
}

export function add_classes(classes) {
	return classes ? ` class="${classes}"` : ``;
}