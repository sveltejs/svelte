import deindent from '../../utils/deindent';
import Generator from '../Generator';
import Stylesheet from '../../css/Stylesheet';
import Block from './Block';
import visit from './visit';
import { removeNode, removeObjectKey } from '../../utils/removeNode';
import getName from '../../utils/getName';
import globalWhitelist from '../../utils/globalWhitelist';
import { Parsed, Node, CompileOptions } from '../../interfaces';
import { AppendTarget } from './interfaces';
import { stringify } from '../../utils/stringify';

export class SsrGenerator extends Generator {
	bindings: string[];
	renderCode: string;
	appendTargets: AppendTarget[];

	constructor(
		parsed: Parsed,
		source: string,
		name: string,
		stylesheet: Stylesheet,
		options: CompileOptions
	) {
		super(parsed, source, name, stylesheet, options, false);
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
	parsed: Parsed,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions
) {
	const format = options.format || 'cjs';

	const generator = new SsrGenerator(parsed, source, options.name || 'SvelteComponent', stylesheet, options);

	const { computations, name, templateProperties } = generator;

	// create main render() function
	const mainBlock = new Block({
		generator,
		contexts: new Map(),
		indexes: new Map(),
		conditions: [],
	});

	trim(parsed.html.children).forEach((node: Node) => {
		visit(generator, mainBlock, node);
	});

	const css = generator.customElement ?
		{ code: null, map: null } :
		generator.stylesheet.render(options.filename, true);

	// generate initial state object
	const expectedProperties = Array.from(generator.expectedProperties);
	const globals = expectedProperties.filter(prop => globalWhitelist.has(prop));
	const storeProps = options.store || templateProperties.store ? expectedProperties.filter(prop => prop[0] === '$') : [];

	const initialState = [];
	if (globals.length > 0) {
		initialState.push(`{ ${globals.map(prop => `${prop} : ${prop}`).join(', ')} }`);
	}

	if (storeProps.length > 0) {
		const initialize = `_init([${storeProps.map(prop => `"${prop.slice(1)}"`)}])`
		if (options.store || templateProperties.store) {
			initialState.push(`options.store.${initialize}`);
		}
	}

	if (templateProperties.data) {
		initialState.push(`%data()`);
	} else if (globals.length === 0 && storeProps.length === 0) {
		initialState.push('{}');
	}

	initialState.push('state');

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

		${name}._render = function(__result, state, options) {
			${templateProperties.store && `options.store = %store();`}
			__result.addComponent(${name});

			state = Object.assign(${initialState.join(', ')});

			${computations.map(
				({ key, deps }) =>
					`state.${key} = %computed-${key}(${deps.map(dep => `state.${dep}`).join(', ')});`
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
		${name}.renderCss = function() {
			if (!warned) {
				console.error('Component.renderCss(...) is deprecated and will be removed in v2 — use Component.render(...).css instead');
				warned = true;
			}

			var components = [];

			${generator.stylesheet.hasStyles &&
				deindent`
				components.push({
					filename: ${name}.filename,
					css: ${name}.css && ${name}.css.code,
					map: ${name}.css && ${name}.css.map
				});
			`}

			${templateProperties.components &&
				deindent`
				var seen = {};

				function addComponent(component) {
					var result = component.renderCss();
					result.components.forEach(x => {
						if (seen[x.filename]) return;
						seen[x.filename] = true;
						components.push(x);
					});
				}

				${templateProperties.components.value.properties.map((prop: Node) => {
					return `addComponent(%components-${getName(prop.key)});`;
				})}
			`}

			return {
				css: components.map(x => x.css).join('\\n'),
				map: null,
				components
			};
		};

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

		${
			/__spread/.test(generator.renderCode) && deindent`
				function __spread(args) {
					const attributes = Object.assign({}, ...args);
					let str = '';

					Object.keys(attributes).forEach(name => {
						const value = attributes[name];
						if (value === undefined) return;
						if (value === true) str += " " + name;
						str += " " + name + "=" + JSON.stringify(value);
					});

					return str;
				}
			`
		}
	`.replace(/(@+|#+|%+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
		if (sigil === '@') return generator.alias(name);
		if (sigil === '%') return generator.templateVars.get(name);
		return sigil.slice(1) + name;
	});

	return generator.generate(result, options, { name, format });
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
