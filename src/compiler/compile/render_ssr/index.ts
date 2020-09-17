import { x, b } from 'code-red';
import Component from '../Component';
import { CompileOptions, CssResult } from '../../interfaces';
import { string_literal } from '../utils/stringify';
import Renderer from './Renderer';
import { INode as TemplateNode } from '../nodes/interfaces'; // TODO
import Text from '../nodes/Text';
import { LabeledStatement, Statement, Node } from 'estree';
import { walk } from 'estree-walker';
import { extract_names } from 'periscopic';

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

	const uses_slots = component.var_lookup.has('$$slots');
	const slots = uses_slots ? b`let $$slots = @compute_slots(#slots);` : null;

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

	// instrument get/set store value
	if (component.ast.instance) {
		let scope = component.instance_scope;
		const map = component.instance_scope_map;

		walk(component.ast.instance.content, {
			enter(node: Node) {
				if (map.has(node)) {
					scope = map.get(node);
				}
			},
			leave(node: Node) {
				if (map.has(node)) {
					scope = scope.parent;
				}

				if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
					const assignee = node.type === 'AssignmentExpression' ? node.left : node.argument;
					const names = new Set(extract_names(assignee));

					const vars = Array.from(names)
						.filter(name => {
							const owner = scope.find_owner(name);
							return !owner || owner === component.instance_scope;
						})
						.map(name => component.var_lookup.get(name))
						.filter(variable =>	{
							return variable && 
								!variable.hoistable &&
								!variable.global &&
								!variable.module &&
								(
									variable.subscribable || variable.name[0] === '$'
								);
						})
						.map(variable => {
							if (variable.subscribable) {
								return x`${'$' + variable.name} = @get_store_value(${variable.name})`;
							}
							if (variable.name[0] === '$') {
								return x`${variable.name.slice(1)}.set(${variable.name})`;
							}
						});

					if (vars.length) {
						this.replace(x`@identity(${node}, ${vars})`);
					}
				}
			}
		});
	}

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

	const injected = Array.from(component.injected_reactive_declaration_vars).filter(name => {
		const variable = component.var_lookup.get(name);
		return variable.injected;
	});

	const reactive_declarations = component.reactive_declarations.map(d => {
		const body: Statement = (d.node as LabeledStatement).body;

		let statement = b`${body}`;

		if (!d.declaration) { // TODO do not add label if it's not referenced
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

				${injected.map(name => b`let ${name};`)}

				${reactive_declarations}

				$$rendered = ${literal};
			} while (!$$settled);

			return $$rendered;
		`
		: b`
			${reactive_store_values}

			${injected.map(name => b`let ${name};`)}

			${reactive_declarations}

			return ${literal};`;

	const blocks = [
		rest,
		slots,
		...reactive_stores.map(({ name }) => {
			const store_name = name.slice(1);
			const store = component.var_lookup.get(store_name);
			if (store && store.hoistable) {
				return b`
					${component.compile_options.dev && b`@validate_store(${store_name}, '${store_name}');`}
					let ${name} = @get_store_value(${store_name});
				`;
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

		const ${name} = @create_ssr_component(($$result, $$props, $$bindings, #slots) => {
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
