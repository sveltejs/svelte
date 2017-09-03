import deindent from '../../utils/deindent';
import Generator from '../Generator';
import Stylesheet from '../../css/Stylesheet';
import Block from './Block';
import preprocess from './preprocess';
import visit from './visit';
import { removeNode, removeObjectKey } from '../../utils/removeNode';
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
		super(parsed, source, name, stylesheet, options);
		this.bindings = [];
		this.renderCode = '';
		this.appendTargets = [];

		// in an SSR context, we don't need to include events, methods, oncreate or ondestroy
		const { templateProperties, defaultExport } = this;

		preprocess(this, parsed.html);

		this.stylesheet.warnOnUnusedSelectors(options.onwarn);

		if (templateProperties.oncreate)
			removeNode(
				this.code,
				defaultExport.declaration,
				templateProperties.oncreate
			);
		if (templateProperties.ondestroy)
			removeNode(
				this.code,
				defaultExport.declaration,
				templateProperties.ondestroy
			);
		if (templateProperties.methods)
			removeNode(
				this.code,
				defaultExport.declaration,
				templateProperties.methods
			);
		if (templateProperties.events)
			removeNode(
				this.code,
				defaultExport.declaration,
				templateProperties.events
			);
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

	const { computations, name, hasJs, templateProperties } = generator;

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

	const result = deindent`
		${hasJs && `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]`}

		var ${name} = {};

		${name}.filename = ${stringify(options.filename)};

		${name}.data = function() {
			return ${templateProperties.data ? `@template.data()` : `{}`};
		};

		${name}.render = function(state, options) {
			${templateProperties.data
				? `state = Object.assign(@template.data(), state || {});`
				: `state = state || {};`}

			${computations.map(
				({ key, deps }) =>
					`state.${key} = @template.computed.${key}(${deps.map(dep => `state.${dep}`).join(', ')});`
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

				${templateProperties.components.value.properties.map(prop => {
					const { name } = prop.key;
					const expression = generator.importedComponents.get(name) || `@template.components.${name}`;
					return `addComponent(${expression});`;
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
	`.replace(/(@+|#+)(\w*)/g, (match: string, sigil: string, name: string) => {
		return sigil === '@' ? generator.alias(name) : sigil.slice(1) + name;
	});

	return generator.generate(result, options, { name, format });
}
