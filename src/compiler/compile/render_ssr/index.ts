import { b } from 'code-red';
import Component from '../Component';
import { CompileOptions, CssResult } from '../../interfaces';
import { string_literal } from '../utils/stringify';
import Renderer from './Renderer';
import { INode as TemplateNode } from '../nodes/interfaces'; // TODO
import Text from '../nodes/Text';
import { extract_names } from '../utils/scope';
import { LabeledStatement, Statement, ExpressionStatement, AssignmentExpression, Node } from 'estree';

export default function ssr(
	component: Component,
	options: CompileOptions
): {js: Node[]; css: CssResult} {
	const renderer = new Renderer({
		name: component.name
	});

	const { name } = component;

	// create $$render function
	renderer.render(trim(component.fragment.children), Object.assign({
		locate: component.locate
	}, options));

	// TODO put this inside the Renderer class
	const literal = renderer.pop();

	// TODO concatenate CSS maps
	const css = options.customElement ?
		{ code: null, map: null } :
		component.stylesheet.render(options.filename, true);

	const uses_rest = component.var_lookup.has('$$restProps');
	const props = component.vars.filter(variable => !variable.module && variable.export_name);
	const rest = uses_rest ? b`let $$restProps = @compute_rest_props($$props, [${props.map(prop => `"${prop.export_name}"`).join(',')}]);` : null;

	const reactive_stores = component.vars.filter(variable => variable.name[0] === '$' && variable.name[1] !== '$');
	const reactive_store_values = reactive_stores
		.map(({ name }) => {
			const store_name = name.slice(1);
			const store = component.var_lookup.get(store_name);
			if (store && store.hoistable) return null;

			const assignment = b`${name} = @get_store_value(${store_name});`;

			return component.compile_options.dev
				? b`@validate_store(${store_name}, '${store_name}'); ${assignment}`
				: assignment;
		})
		.filter(Boolean);

	component.rewrite_props(({ name }) => {
		const value = `$${name}`;

		let insert = b`${value} = @get_store_value(${name})`;
		if (component.compile_options.dev) {
			insert = b`@validate_store(${name}, '${name}'); ${insert}`;
		}

		return insert;
	});

	const instance_javascript = component.extract_javascript(component.ast.instance);

	// TODO only do this for props with a default value
	const parent_bindings = instance_javascript
		? component.vars
			.filter(variable => !variable.module && variable.export_name)
			.map(prop => {
				return b`if ($$props.${prop.export_name} === void 0 && $$bindings.${prop.export_name} && ${prop.name} !== void 0) $$bindings.${prop.export_name}(${prop.name});`;
			})
		: [];

	const reactive_declarations = component.reactive_declarations.map(d => {
		const body: Statement = (d.node as LabeledStatement).body;

		let statement = b`${body}`;

		if (d.declaration) {
			const declared = extract_names(d.declaration);
			const injected = declared.filter(name => {
				return name[0] !== '$' && component.var_lookup.get(name).injected;
			});

			const self_dependencies = injected.filter(name => d.dependencies.has(name));

			if (injected.length) {
				// in some cases we need to do `let foo; [expression]`, in
				// others we can do `let [expression]`
				const separate = (
					self_dependencies.length > 0 ||
					declared.length > injected.length
				);

				const { left, right } = (body as ExpressionStatement).expression as AssignmentExpression;

				statement = separate
					? b`
						${injected.map(name => b`let ${name};`)}
						${statement}`
					: b`
						let ${left} = ${right}`;
			}
		} else { // TODO do not add label if it's not referenced
			statement = b`$: { ${statement} }`;
		}

		return statement;
	});

	const main = renderer.has_bindings
		? b`
			let $$settled;
			let $$rendered;

			do {
				$$settled = true;

				${reactive_store_values}

				${reactive_declarations}

				$$rendered = ${literal};
			} while (!$$settled);

			return $$rendered;
		`
		: b`
			${reactive_store_values}

			${reactive_declarations}

			return ${literal};`;

	const blocks = [
		rest,
		...reactive_stores.map(({ name }) => {
			const store_name = name.slice(1);
			const store = component.var_lookup.get(store_name);
			if (store && store.hoistable) {
				return b`let ${name} = @get_store_value(${store_name});`;
			}
			return b`let ${name};`;
		}),

		instance_javascript,
		...parent_bindings,
		css.code && b`$$result.css.add(#css);`,
		main
	].filter(Boolean);

	const js = b`
		${css.code ? b`
		const #css = {
			code: "${css.code}",
			map: ${css.map ? string_literal(css.map.toString()) : 'null'}
		};` : null}

		${component.extract_javascript(component.ast.module)}

		${component.fully_hoisted}

		const ${name} = @create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
			${blocks}
		});
	`;

	return {js, css};
}

function trim(nodes: TemplateNode[]) {
	let start = 0;
	for (; start < nodes.length; start += 1) {
		const node = nodes[start] as Text;
		if (node.type !== 'Text') break;

		node.data = node.data.replace(/^\s+/, '');
		if (node.data) break;
	}

	let end = nodes.length;
	for (; end > start; end -= 1) {
		const node = nodes[end - 1] as Text;
		if (node.type !== 'Text') break;

		node.data = node.data.replace(/\s+$/, '');
		if (node.data) break;
	}

	return nodes.slice(start, end);
}
