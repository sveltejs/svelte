import deindent from '../../utils/deindent';
import Component from '../Component';
import globalWhitelist from '../../utils/globalWhitelist';
import { CompileOptions } from '../../interfaces';
import { stringify } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import Renderer from './Renderer';

export default function ssr(
	component: Component,
	options: CompileOptions
) {
	const renderer = new Renderer();

	const { name } = component;

	// create main render() function
	renderer.render(trim(component.fragment.children), Object.assign({
		locate: component.locate
	}, options));

	const css = component.customElement ?
		{ code: null, map: null } :
		component.stylesheet.render(options.filename, true);

	const expectedProperties = Array.from(component.expectedProperties);
	const debugName = `<${component.customElement ? component.tag : name}>`;

	// TODO concatenate CSS maps
	return (deindent`
		function #define($$props) {
			${component.javascript}

			return { ${component.declarations.join(', ')} };
		}

		var ${name} = {};

		${name}.render = function(props = {}, options = {}) {
			var components = new Set();

			function addComponent(component) {
				components.add(component);
			}

			var result = { head: '', addComponent };
			var html = ${name}.$$render(result, props, options);

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

		${name}.$$render = function($$result, ${component.javascript ? 'props' : 'ctx'}, options) {
			${component.javascript && `const ctx = #define(props);`}

			$$result.addComponent(${name});

			${renderer.bindings.length &&
				deindent`
				var settled = false;
				var tmp;

				while (!settled) {
					settled = true;

					${renderer.bindings.join('\n\n')}
				}
			`}

			return \`${renderer.code}\`;
		};

		${name}.css = {
			code: ${css.code ? stringify(css.code) : `''`},
			map: ${css.map ? stringify(css.map.toString()) : 'null'}
		};

		var warned = false;
	`).trim();
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
