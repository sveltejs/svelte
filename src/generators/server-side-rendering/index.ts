import deindent from '../../utils/deindent';
import Generator from '../Generator';
import Stylesheet from '../../css/Stylesheet';
import Block from './Block';
import preprocess from './preprocess';
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

		preprocess(this, parsed.html);

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

	parsed.html.children.forEach((node: Node) => {
		visit(generator, mainBlock, node);
	});

	const { css, cssMap } = generator.customElement ?
		{ css: null, cssMap: null } :
		generator.stylesheet.render(options.filename, true);

	// generate initial state object
	const expectedProperties = Array.from(generator.expectedProperties);
	const globals = expectedProperties.filter(prop => globalWhitelist.has(prop));
	const storeProps = options.store ? expectedProperties.filter(prop => prop[0] === '$') : [];

	const initialState = [];
	if (globals.length > 0) {
		initialState.push(`{ ${globals.map(prop => `${prop} : ${prop}`).join(', ')} }`);
	}

	if (storeProps.length > 0) {
		initialState.push(`options.store._init([${storeProps.map(prop => `"${prop.slice(1)}"`)}])`);
	}

	if (templateProperties.data) {
		initialState.push(`%data()`);
	} else if (globals.length === 0 && storeProps.length === 0) {
		initialState.push('{}');
	}

	initialState.push('state');

	const result = deindent`
		${generator.javascript}

		var ${name} = {};

		${options.filename && `${name}.filename = ${stringify(options.filename)}`};

		${name}.data = function() {
			return ${templateProperties.data ? `%data()` : `{}`};
		};

		${name}.render = function(state, options = {}) {
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

			return \`${generator.renderCode}\`.trim();
		};

		${name}.renderCss = function() {
			var components = [];

			${generator.stylesheet.hasStyles &&
				deindent`
				components.push({
					filename: ${name}.filename,
					css: ${stringify(css)},
					map: ${stringify(cssMap.toString())}
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
	`.replace(/(@+|#+|%+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
		if (sigil === '@') return generator.alias(name);
		if (sigil === '%') return generator.templateVars.get(name);
		return sigil.slice(1) + name;
	});

	return generator.generate(result, options, { name, format });
}
