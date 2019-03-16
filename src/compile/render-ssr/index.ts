import deindent from '../../utils/deindent';
import Component from '../Component';
import { CompileOptions } from '../../interfaces';
import { stringify } from '../../utils/stringify';
import Renderer from './Renderer';
import { walk } from 'estree-walker';
import { extractNames } from '../../utils/annotateWithScopes';

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

	const reactive_stores = component.vars.filter(variable => variable.name[0] === '$' && variable.name[1] !== '$');
	const reactive_store_values = reactive_stores
		.map(({ name }) => {
			const store = component.var_lookup.get(name.slice(1));
			if (store.hoistable) return;

			const assignment = `${name} = @get_store_value(${store.name});`;

			return component.compileOptions.dev
				? `@validate_store(${store.name}, '${store.name}'); ${assignment}`
				: assignment;
		});

	// TODO remove this, just use component.vars everywhere
	const props = component.vars.filter(variable => !variable.module && variable.export_name);

	if (component.javascript) {
		component.rewrite_props(({ name }) => {
			const value = `$${name}`;

			const get_store_value = component.helper('get_store_value');

			let insert = `${value} = ${get_store_value}(${name})`;
			if (component.compileOptions.dev) {
				const validate_store = component.helper('validate_store');
				insert = `${validate_store}(${name}, '${name}'); ${insert}`;
			}

			return insert;
		});
	}

	// TODO only do this for props with a default value
	const parent_bindings = component.javascript
		? props.map(prop => {
			return `if ($$props.${prop.export_name} === void 0 && $$bindings.${prop.export_name} && ${prop.name} !== void 0) $$bindings.${prop.export_name}(${prop.name});`;
		})
		: [];

	const reactive_declarations = component.reactive_declarations.map(d => {
		const snippet = `[✂${d.node.body.start}-${d.node.end}✂]`;
		return d.injected ? `let ${snippet}` : snippet;
	});

	const main = renderer.has_bindings
		? deindent`
			let $$settled;
			let $$rendered;

			do {
				$$settled = true;

				${reactive_store_values}

				${reactive_declarations}

				$$rendered = \`${renderer.code}\`;
			} while (!$$settled);

			return $$rendered;
		`
		: deindent`
			${reactive_store_values}

			${reactive_declarations}

			return \`${renderer.code}\`;`;

	const blocks = [
		reactive_stores.length > 0 && `let ${reactive_stores
			.map(({ name }) => {
				const store = component.var_lookup.get(name.slice(1));
				if (store.hoistable) {
					const get_store_value = component.helper('get_store_value');
					return `${name} = ${get_store_value}(${store.name})`;
				}
				return name;
			})
			.join(', ')};`,
		component.javascript,
		parent_bindings.join('\n'),
		css.code && `$$result.css.add(#css);`,
		main
	].filter(Boolean);

	return (deindent`
		${css.code && deindent`
		const #css = {
			code: ${css.code ? stringify(css.code) : `''`},
			map: ${css.map ? stringify(css.map.toString()) : 'null'}
		};`}

		${component.module_javascript}

		${component.fully_hoisted.length > 0 && component.fully_hoisted.join('\n\n')}

		const ${name} = @create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
			${blocks.join('\n\n')}
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
