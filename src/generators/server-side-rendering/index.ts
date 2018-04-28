import deindent from '../../utils/deindent';
import Generator from '../Generator';
import Stats from '../../Stats';
import Stylesheet from '../../css/Stylesheet';
import Block from './Block';
import visit from './visit';
import { removeNode, removeObjectKey } from '../../utils/removeNode';
import getName from '../../utils/getName';
import globalWhitelist from '../../utils/globalWhitelist';
import { Ast, Node, CompileOptions } from '../../interfaces';
import { AppendTarget } from './interfaces';
import { stringify } from '../../utils/stringify';

export class SsrGenerator extends Generator {
	bindings: string[];
	renderCode: string;
	appendTargets: AppendTarget[];

	constructor(
		ast: Ast,
		source: string,
		name: string,
		stylesheet: Stylesheet,
		options: CompileOptions,
		stats: Stats
	) {
		super(ast, source, name, stylesheet, options, stats, false);
		this.bindings = [];
		this.renderCode = '';
		this.appendTargets = [];

		this.stylesheet.warnOnUnusedSelectors(options.onwarn);
	}

	append(code: string) {
		if (this.appendTargets.length) {
			const appendTarget = this.appendTargets[this.appendTargets.length - 1];
			const slotName = appendTarget.slotStack[appendTarget.slotStack.length - 1];
			appendTarget.slots[slotName] += code;
		} else {
			this.renderCode += code;
		}
	}
}

export default function ssr(
	ast: Ast,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions,
	stats: Stats
) {
	const format = options.format || 'cjs';

	const generator = new SsrGenerator(ast, source, options.name || 'SvelteComponent', stylesheet, options, stats);

	const { computations, name, templateProperties } = generator;

	// create main render() function
	const mainBlock = new Block({
		generator,
		conditions: [],
	});

	trim(generator.fragment.children).forEach((node: Node) => {
		node.ssr(generator, mainBlock);
	});

	const css = generator.customElement ?
		{ code: null, map: null } :
		generator.stylesheet.render(options.filename, true);

	// generate initial state object
	const expectedProperties = Array.from(generator.expectedProperties);
	const globals = expectedProperties.filter(prop => globalWhitelist.has(prop));
	const storeProps = expectedProperties.filter(prop => prop[0] === '$');

	const initialState = [];
	if (globals.length > 0) {
		initialState.push(`{ ${globals.map(prop => `${prop} : ${prop}`).join(', ')} }`);
	}

	if (storeProps.length > 0) {
		const initialize = `_init([${storeProps.map(prop => `"${prop.slice(1)}"`)}])`
		initialState.push(`options.store.${initialize}`);
	}

	if (templateProperties.data) {
		initialState.push(`%data()`);
	} else if (globals.length === 0 && storeProps.length === 0) {
		initialState.push('{}');
	}

	initialState.push('ctx');

	const helpers = new Set();

	// TODO concatenate CSS maps
	const result = deindent`
		${generator.javascript}

		var ${name} = {};

		${options.filename && `${name}.filename = ${stringify(options.filename)}`};

		${name}.data = function() {
			return ${templateProperties.data ? `%data()` : `{}`};
		};

		${name}.render = function(state, options = {}) {
			var components = new Set();

			function addComponent(component) {
				components.add(component);
			}

			var result = { head: '', addComponent };
			var html = ${name}._render(result, state, options);

			var cssCode = Array.from(components).map(c => c.css && c.css.code).filter(Boolean).join('\\n');

			return {
				html,
				head: result.head,
				css: { code: cssCode, map: null },
				toString() {
					return html;
				}
			};
		}

		${name}._render = function(__result, ctx, options) {
			${templateProperties.store && `options.store = %store();`}
			__result.addComponent(${name});

			ctx = Object.assign(${initialState.join(', ')});

			${computations.map(
				({ key, deps }) =>
					`ctx.${key} = %computed-${key}(ctx);`
			)}

			${generator.bindings.length &&
				deindent`
				var settled = false;
				var tmp;

				while (!settled) {
					settled = true;

					${generator.bindings.join('\n\n')}
				}
			`}

			return \`${generator.renderCode}\`;
		};

		${name}.css = {
			code: ${css.code ? stringify(css.code) : `''`},
			map: ${css.map ? stringify(css.map.toString()) : 'null'}
		};

		var warned = false;

		${templateProperties.preload && `${name}.preload = %preload;`}

		${
			// TODO this is a bit hacky
			/__escape/.test(generator.renderCode) && deindent`
				var escaped = {
					'"': '&quot;',
					"'": '&##39;',
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;'
				};

				function __escape(html) {
					return String(html).replace(/["'&<>]/g, match => escaped[match]);
				}
			`
		}

		${
			/__each/.test(generator.renderCode) && deindent`
				function __each(items, assign, fn) {
					let str = '';
					for (let i = 0; i < items.length; i += 1) {
						str += fn(assign(items[i], i));
					}
					return str;
				}
			`
		}

		${
			/__isPromise/.test(generator.renderCode) && deindent`
				function __isPromise(value) {
					return value && typeof value.then === 'function';
				}
			`
		}

		${
			/__missingComponent/.test(generator.renderCode) && deindent`
				var __missingComponent = {
					_render: () => ''
				};
			`
		}
	`.replace(/(@+|#+|%+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
		if (sigil === '@') {
			helpers.add(name);
			return generator.alias(name);
		}

		if (sigil === '%') return generator.templateVars.get(name);
		return sigil.slice(1) + name;
	});

	return generator.generate(result, options, { name, format, helpers });
}

function trim(nodes) {
	let start = 0;
	for (; start < nodes.length; start += 1) {
		const node = nodes[start];
		if (node.type !== 'Text') break;

		node.data = node.data.replace(/^\s+/, '');
		if (node.data) break;
	}

	let end = nodes.length;
	for (; end > start; end -= 1) {
		const node = nodes[end - 1];
		if (node.type !== 'Text') break;

		node.data = node.data.replace(/\s+$/, '');
		if (node.data) break;
	}

	return nodes.slice(start, end);
}
