import deindent from '../../utils/deindent';
import { stringify, escape } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import Component from '../Component';
import Renderer from './Renderer';
import { CompileOptions } from '../../interfaces';
import { walk } from 'estree-walker';
import stringifyProps from '../../utils/stringifyProps';
import addToSet from '../../utils/addToSet';
import getObject from '../../utils/getObject';
import { extractNames } from '../../utils/annotateWithScopes';
import { nodes_match } from '../../utils/nodes_match';
import sanitize from '../../utils/sanitize';

export default function dom(
	component: Component,
	options: CompileOptions
) {
	const { name, code } = component;

	const renderer = new Renderer(component, options);
	const { block } = renderer;

	block.hasOutroMethod = true;

	// prevent fragment being created twice (#1063)
	if (options.customElement) block.builders.create.addLine(`this.c = @noop;`);

	const builder = new CodeBuilder();

	if (component.options.dev) {
		builder.addLine(`const ${renderer.fileVar} = ${JSON.stringify(component.file)};`);
	}

	const css = component.stylesheet.render(options.filename, !options.customElement);
	const styles = component.stylesheet.hasStyles && stringify(options.dev ?
		`${css.code}\n/*# sourceMappingURL=${css.map.toUrl()} */` :
		css.code, { onlyEscapeAtSymbol: true });

	if (styles && component.options.css !== false && !options.customElement) {
		builder.addBlock(deindent`
			function @add_css() {
				var style = @createElement("style");
				style.id = '${component.stylesheet.id}-style';
				style.textContent = ${styles};
				@append(document.head, style);
			}
		`);
	}

	// fix order
	// TODO the deconflicted names of blocks are reversed... should set them here
	const blocks = renderer.blocks.slice().reverse();

	blocks.forEach(block => {
		builder.addBlock(block.toString());
	});

	if (options.dev && !options.hydratable) {
		block.builders.claim.addLine(
			'throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");'
		);
	}

	// TODO injecting CSS this way is kinda dirty. Maybe it should be an
	// explicit opt-in, or something?
	const should_add_css = (
		!options.customElement &&
		component.stylesheet.hasStyles &&
		options.css !== false
	);

	const props = component.vars.filter(variable => !variable.module && variable.export_name);
	const writable_props = props.filter(variable => variable.writable);

	const set = (component.meta.props || writable_props.length > 0 || renderer.slots.size > 0)
		? deindent`
			$$props => {
				${component.meta.props && deindent`
				if (!${component.meta.props}) ${component.meta.props} = {};
				@assign(${component.meta.props}, $$props);
				$$invalidate('${component.meta.props_object}', ${component.meta.props_object});
				`}
				${writable_props.map(prop =>
				`if ('${prop.export_name}' in $$props) $$invalidate('${prop.name}', ${prop.name} = $$props.${prop.export_name});`)}
				${renderer.slots.size > 0 &&
				`if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);`}
			}
		`
		: null;

	const body = [];

	const not_equal = component.meta.immutable ? `@not_equal` : `@safe_not_equal`;
	let dev_props_check;

	props.forEach(x => {
		const variable = component.var_lookup.get(x.name);

		if (variable.hoistable) {
			body.push(deindent`
				get ${x.export_name}() {
					return ${x.name};
				}
			`);
		} else {
			body.push(deindent`
				get ${x.export_name}() {
					return this.$$.ctx.${x.name};
				}
			`);
		}

		if (variable.writable && !renderer.readonly.has(x.export_name)) {
			body.push(deindent`
				set ${x.export_name}(${x.name}) {
					this.$set({ ${x.name} });
					@flush();
				}
			`);
		} else if (component.options.dev) {
			body.push(deindent`
				set ${x.export_name}(value) {
					throw new Error("<${component.tag}>: Cannot set read-only property '${x.export_name}'");
				}
			`);
		}
	});

	if (component.options.dev) {
		// TODO check no uunexpected props were passed, as well as
		// checking that expected ones were passed
		const expected = props.filter(prop => !prop.initialised);

		if (expected.length) {
			dev_props_check = deindent`
				const { ctx } = this.$$;
				const props = ${options.customElement ? `this.attributes` : `options.props || {}`};
				${expected.map(prop => deindent`
				if (ctx.${prop.name} === undefined && !('${prop.export_name}' in props)) {
					console.warn("<${component.tag}> was created without expected prop '${prop.export_name}'");
				}`)}
			`;
		}
	}

	// instrument assignments
	if (component.ast.instance) {
		let scope = component.instance_scope;
		let map = component.instance_scope_map;

		let pending_assignments = new Set();

		walk(component.ast.instance.content, {
			enter: (node, parent) => {
				if (map.has(node)) {
					scope = map.get(node);
				}
			},

			leave(node, parent) {
				if (map.has(node)) {
					scope = scope.parent;
				}

				if (node.type === 'AssignmentExpression') {
					const names = node.left.type === 'MemberExpression'
						? [getObject(node.left).name]
						: extractNames(node.left);

					if (node.operator === '=' && nodes_match(node.left, node.right)) {
						const dirty = names.filter(name => {
							return scope.findOwner(name) === component.instance_scope;
						});

						if (dirty.length) component.has_reactive_assignments = true;

						code.overwrite(node.start, node.end, dirty.map(n => `$$invalidate('${n}', ${n})`).join('; '));
					} else {
						names.forEach(name => {
							if (scope.findOwner(name) !== component.instance_scope) return;

							const variable = component.var_lookup.get(name);
							if (variable && variable.hoistable) return;

							pending_assignments.add(name);
							component.has_reactive_assignments = true;
						});
					}
				}

				else if (node.type === 'UpdateExpression') {
					const { name } = getObject(node.argument);

					if (scope.findOwner(name) !== component.instance_scope) return;

					const variable = component.var_lookup.get(name);
					if (variable && variable.hoistable) return;

					pending_assignments.add(name);
					component.has_reactive_assignments = true;
				}

				if (pending_assignments.size > 0) {
					if (node.type === 'ArrowFunctionExpression') {
						const insert = [...pending_assignments].map(name => `$$invalidate('${name}', ${name})`).join(';');
						pending_assignments = new Set();

						code.prependRight(node.body.start, `{ const $$result = `);
						code.appendLeft(node.body.end, `; ${insert}; return $$result; }`);

						pending_assignments = new Set();
					}

					else if (/Statement/.test(node.type)) {
						const insert = [...pending_assignments].map(name => `$$invalidate('${name}', ${name})`).join('; ');

						if (/^(Break|Continue|Return)Statement/.test(node.type)) {
							if (node.argument) {
								code.overwrite(node.start, node.argument.start, `var $$result = `);
								code.appendLeft(node.argument.end, `; ${insert}; return $$result`);
							} else {
								code.prependRight(node.start, `${insert}; `);
							}
						} else if (parent && /(If|For(In|Of)?|While)Statement/.test(parent.type) && node.type !== 'BlockStatement') {
							code.prependRight(node.start, '{ ');
							code.appendLeft(node.end, `${code.original[node.end - 1] === ';' ? '' : ';'} ${insert}; }`);
						} else {
							code.appendLeft(node.end, `${code.original[node.end - 1] === ';' ? '' : ';'} ${insert};`);
						}

						pending_assignments = new Set();
					}
				}
			}
		});

		if (pending_assignments.size > 0) {
			throw new Error(`TODO this should not happen!`);
		}

		component.rewrite_props();
	}

	const args = ['$$self'];
	if (props.length > 0 || component.has_reactive_assignments || renderer.slots.size > 0) {
		args.push('$$props', '$$invalidate');
	}

	builder.addBlock(deindent`
		function create_fragment(ctx) {
			${block.getContents()}
		}

		${component.module_javascript}

		${component.fully_hoisted.length > 0 && component.fully_hoisted.join('\n\n')}
	`);

	const filtered_declarations = component.vars.filter(variable => {
		return (variable.referenced || variable.export_name) && !variable.hoistable;
	}).map(variable => variable.name);

	const filtered_props = props.filter(prop => {
		const variable = component.var_lookup.get(prop.name);

		if (variable.hoistable) return false;
		if (prop.name[0] === '$') return false;
		return true;
	});

	const reactive_stores = component.vars.filter(variable => variable.name[0] === '$');

	if (renderer.slots.size > 0) {
		const arr = Array.from(renderer.slots);
		filtered_declarations.push(...arr.map(name => `$$slot_${sanitize(name)}`), '$$scope');
	}

	if (renderer.bindingGroups.length > 0) {
		filtered_declarations.push(`$$binding_groups`);
	}

	const has_definition = (
		component.javascript ||
		filtered_props.length > 0 ||
		component.partly_hoisted.length > 0 ||
		filtered_declarations.length > 0 ||
		component.reactive_declarations.length > 0
	);

	const definition = has_definition
		? component.alias('instance')
		: 'null';

	const all_reactive_dependencies = new Set();
	component.reactive_declarations.forEach(d => {
		addToSet(all_reactive_dependencies, d.dependencies);
	});

	const user_code = component.javascript || (
		!component.ast.instance && !component.ast.module && filtered_props.length > 0
			? `let { ${filtered_props.map(x => x.name).join(', ')} } = $$props;`
			: null
	);

	const reactive_store_subscriptions = reactive_stores.length > 0 && reactive_stores
		.map(({ name }) => deindent`
			let ${name};
			${component.options.dev && `@validate_store(${name.slice(1)}, '${name.slice(1)}');`}
			$$self.$$.on_destroy.push(${name.slice(1)}.subscribe($$value => { ${name} = $$value; $$invalidate('${name}', ${name}); }));
		`)
		.join('\n\n');

	if (has_definition) {
		builder.addBlock(deindent`
			function ${definition}(${args.join(', ')}) {
				${user_code}

				${renderer.slots.size && `let { ${[...renderer.slots].map(name => `$$slot_${sanitize(name)}`).join(', ')}, $$scope } = $$props;`}

				${renderer.bindingGroups.length > 0 && `const $$binding_groups = [${renderer.bindingGroups.map(_ => `[]`).join(', ')}];`}

				${component.partly_hoisted.length > 0 && component.partly_hoisted.join('\n\n')}

				${reactive_store_subscriptions}

				${set && `$$self.$set = ${set};`}

				${component.reactive_declarations.length > 0 && deindent`
				$$self.$$.update = ($$dirty = { ${Array.from(all_reactive_dependencies).map(n => `${n}: 1`).join(', ')} }) => {
					${component.reactive_declarations.map(d => deindent`
					if (${Array.from(d.dependencies).map(n => `$$dirty.${n}`).join(' || ')}) ${d.snippet}`)}
				};
				`}

				return ${stringifyProps(filtered_declarations)};
			}
		`);
	}

	if (options.customElement) {
		builder.addBlock(deindent`
			class ${name} extends @SvelteElement {
				constructor(options) {
					super();

					${css.code && `this.shadowRoot.innerHTML = \`<style>${escape(css.code, { onlyEscapeAtSymbol: true }).replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${css.map.toUrl()} */` : ''}</style>\`;`}

					@init(this, { target: this.shadowRoot }, ${definition}, create_fragment, ${not_equal});

					${dev_props_check}

					if (options) {
						if (options.target) {
							@insert(options.target, this, options.anchor);
						}

						${(props.length > 0 || component.meta.props) && deindent`
						if (options.props) {
							this.$set(options.props);
							@flush();
						}`}
					}
				}

				static get observedAttributes() {
					return ${JSON.stringify(props.map(x => x.export_name))};
				}

				${body.length > 0 && body.join('\n\n')}
			}

			customElements.define("${component.tag}", ${name});
		`);
	} else {
		const superclass = options.dev ? 'SvelteComponentDev' : 'SvelteComponent';

		builder.addBlock(deindent`
			class ${name} extends @${superclass} {
				constructor(options) {
					super(${options.dev && `options`});
					${should_add_css && `if (!document.getElementById("${component.stylesheet.id}-style")) @add_css();`}
					@init(this, options, ${definition}, create_fragment, ${not_equal});

					${dev_props_check}
				}

				${body.length > 0 && body.join('\n\n')}
			}
		`);
	}

	return builder.toString();
}
