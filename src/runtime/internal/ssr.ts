import { set_current_component, current_component } from './lifecycle';
import { run_all, blank_object } from './utils';

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
			before_update: [],
			after_update: [],
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

			const result: {
				head: string;
				css: Set<{
					map: null;
					code: string;
				}>;
			} = { head: '', css: new Set() };

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

export function add_attribute(name, value, boolean) {
	if (value == null || (boolean && !value)) return '';
	return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

export function add_classes(classes) {
	return classes ? ` class="${classes}"` : ``;
}

function is_date(value) {
	return value instanceof Date;
}

function pad(n, len = 2) {
	n = String(n);
	while (n.length < len) n = `0${n}`;
	return n;
}

export function date_input_value(date) {
	if (!is_date(date)) return '';

	const yyyy = date.getUTCFullYear();
	const mm = pad(date.getUTCMonth() + 1);
	const dd = pad(date.getUTCDate());

	return `${yyyy}-${mm}-${dd}`;
}

export function month_input_value(date) {
	if (!is_date(date)) return '';

	const yyyy = date.getUTCFullYear();
	const mm = pad(date.getUTCMonth() + 1);

	return `${yyyy}-${mm}`;
}

export function time_input_value(date) {
	if (!is_date(date)) return '';

	const HH = pad(date.getHours());
	const mm = pad(date.getMinutes());

	let str = `${HH}:${mm}`;

	let s, S;
	if (s = date.getSeconds()) str += `:${pad(s)}`;
	if (S = date.getMilliseconds()) str += `:${pad(S, 3)}`;

	return str;
}

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const to_day = (date, target) => {
	const day = date.getUTCDay() || 7;
	date.setDate(date.getDate() - (day - target));
};

export const week_input_value = date => {
	date = new Date(date);
	to_day(date, 4); // pretend it's Thursday to figure out which year we should use

	const year = date.getUTCFullYear();
	const start = new Date(year, 0, 4); // week 1 always contains Jan 4
	to_day(start, 1); // weeks start on Mondays

	const elapsed = Math.floor((date - start.getTime()) / ONE_WEEK);

	return `${year}-W${pad(elapsed + 1)}`;
};