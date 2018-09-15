import deindent from '../../utils/deindent';
import Component from '../Component';
import globalWhitelist from '../../utils/globalWhitelist';
import { Node, CompileOptions } from '../../interfaces';
import { AppendTarget } from '../../interfaces';
import { stringify } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';

export class SsrTarget {
	bindings: string[];
	renderCode: string;
	appendTargets: AppendTarget[];

	constructor() {
		this.bindings = [];
		this.renderCode = '';
		this.appendTargets = [];
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
	component: Component,
	options: CompileOptions
) {
	const format = options.format || 'cjs';

	const { computations, name, templateProperties } = component;

	// create main render() function
	trim(component.fragment.children).forEach((node: Node) => {
		node.ssr();
	});

	const css = component.customElement ?
		{ code: null, map: null } :
		component.stylesheet.render(options.filename, true);

	// generate initial state object
	const expectedProperties = Array.from(component.expectedProperties);
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

	let js = null;
	if (component.javascript) {
		const componentDefinition = new CodeBuilder();

		// not all properties are relevant to SSR (e.g. lifecycle hooks)
		const relevant = new Set([
			'data',
			'components',
			'computed',
			'helpers',
			'preload',
			'store'
		]);

		component.declarations.forEach(declaration => {
			if (relevant.has(declaration.type)) {
				componentDefinition.addBlock(declaration.block);
			}
		});

		js = (
			component.javascript[0] +
			componentDefinition +
			component.javascript[1]
		);
	}

	// TODO concatenate CSS maps
	const result = (deindent`
		${js}

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
				({ key }) => `ctx.${key} = %computed-${key}(ctx);`
			)}

			${component.target.bindings.length &&
				deindent`
				var settled = false;
				var tmp;

				while (!settled) {
					settled = true;

					${component.target.bindings.join('\n\n')}
				}
			`}

			return \`${component.target.renderCode}\`;
		};

		${name}.css = {
			code: ${css.code ? stringify(css.code) : `''`},
			map: ${css.map ? stringify(css.map.toString()) : 'null'}
		};

		var warned = false;

		${templateProperties.preload && `${name}.preload = %preload;`}
	`).trim();

	return component.generate(result, options, { name, format });
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
