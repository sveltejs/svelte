import deindent from '../../utils/deindent';
import Component from '../Component';
import { CompileOptions } from '../../interfaces';
import { stringify } from '../../utils/stringify';
import Renderer from './Renderer';

export default function ssr(
	component: Component,
	options: CompileOptions
) {
	const renderer = new Renderer();

	const { name } = component;

	// create $$render function
	renderer.render(trim(component.fragment.children), Object.assign({
		locate: component.locate
	}, options));

	// TODO concatenate CSS maps
	const css = options.customElement ?
		{ code: null, map: null } :
		component.stylesheet.render(options.filename, true);

	let setup;

	if (component.javascript) {
		setup = component.javascript;
	} else if (component.props.length > 0) {
		const props = component.props.map(prop => {
			return prop.as === prop.name
				? prop.as
				: `${prop.as}: ${prop.name}`
		});

		setup = `let { ${props.join(', ')} } = $$props;`
	}

	// TODO only do this for props with a default value
	const parent_bindings = component.javascript
		? component.props.map(prop => {
			return `if ($$props.${prop.as} === void 0 && $$bindings.${prop.as} && ${prop.name} !== void 0) $$bindings.${prop.as}(${prop.name});`;
		})
		: [];

	const main = renderer.has_bindings
		? deindent`
			let $$settled;
			let $$rendered;

			do {
				$$settled = true;

				$$rendered = \`${renderer.code}\`;
			} while (!$$settled);

			return $$rendered;
		`
		: `return \`${renderer.code}\`;`;

	return (deindent`
		${css.code && deindent`
		const #css = {
			code: ${css.code ? stringify(css.code) : `''`},
			map: ${css.map ? stringify(css.map.toString()) : 'null'}
		};`}

		const ${name} = @create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
			${setup}

			${parent_bindings}

			${css.code && `$$result.css.add(#css);`}

			${main}
		});
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
