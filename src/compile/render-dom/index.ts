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

export default function dom(
	component: Component,
	options: CompileOptions
) {
	const { name } = component;

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

	const refs = Array.from(component.refs);

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

	const props = component.props.filter(x => component.writable_declarations.has(x.name));

	const set = component.meta.props || props.length > 0
		? deindent`
			$$props => {
				${component.meta.props && deindent`
				if (!${component.meta.props}) ${component.meta.props} = {};
				@assign(${component.meta.props}, $$props);
				$$make_dirty('${component.meta.props_object}');
				`}
				${props.map(prop =>
				`if ('${prop.as}' in $$props) ${prop.name} = $$props.${prop.as};`)}
			}
		`
		: null;

	const inject_refs = refs.length > 0
		? deindent`
			$$refs => {
				${refs.map(name => `${name} = $$refs.${name};`)}
			}
		`
		: null;

	const body = [];

	const not_equal = component.options.immutable ? `@not_equal` : `@safe_not_equal`;
	let dev_props_check;

	component.props.forEach(x => {
		if (component.imported_declarations.has(x.name) || component.hoistable_names.has(x.name)) {
			body.push(deindent`
				get ${x.as}() {
					return ${x.name};
				}
			`);
		} else {
			body.push(deindent`
				get ${x.as}() {
					return this.$$.get().${x.name};
				}
			`);
		}

		if (component.writable_declarations.has(x.as) && !renderer.readonly.has(x.as)) {
			body.push(deindent`
				set ${x.as}(value) {
					this.$set({ ${x.name}: value });
					@flush();
				}
			`);
		} else if (component.options.dev) {
			body.push(deindent`
				set ${x.as}(value) {
					throw new Error("<${component.tag}>: Cannot set read-only property '${x.as}'");
				}
			`);
		}
	});

	if (component.options.dev) {
		// TODO check no uunexpected props were passed, as well as
		// checking that expected ones were passed
		const expected = component.props
			.map(x => x.name)
			.filter(name => !component.initialised_declarations.has(name));

		if (expected.length) {
			dev_props_check = deindent`
				const state = this.$$.get();
				${expected.map(name => deindent`

				if (state.${name} === undefined${options.customElement && ` && !('${name}' in this.attributes)`}) {
					console.warn("<${component.tag}> was created without expected data property '${name}'");
				}`)}
			`;
		}
	}

	// instrument assignments
	if (component.instance_script) {
		let scope = component.instance_scope;
		let map = component.instance_scope_map;

		walk(component.instance_script.content, {
			enter: (node, parent) => {
				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'AssignmentExpression') {
					const { name } = getObject(node.left);

					if (scope.findOwner(name) === component.instance_scope) {
						component.instrument(node, parent, name, false);
					}
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});
	}

	const args = ['$$self'];
	if (component.props.length > 0 || component.has_reactive_assignments) args.push('$$props');
	if (component.has_reactive_assignments) args.push('$$make_dirty');

	builder.addBlock(deindent`
		function create_fragment(${component.alias('component')}, ctx) {
			${block.getContents()}
		}

		${component.module_javascript}

		${component.fully_hoisted.length > 0 && component.fully_hoisted.join('\n\n')}
	`);

	const filtered_declarations = component.declarations.filter(name => {
		if (component.hoistable_names.has(name)) return false;
		if (component.imported_declarations.has(name)) return false;
		if (component.props.find(p => p.as === name)) return true;
		return component.template_references.has(name);
	});

	const filtered_props = component.props.filter(prop => {
		if (component.hoistable_names.has(prop.name)) return false;
		if (component.imported_declarations.has(prop.name)) return false;
		return true;
	});

	const has_definition = (
		component.javascript ||
		filtered_props.length > 0 ||
		component.partly_hoisted.length > 0 ||
		filtered_declarations.length > 0 ||
		component.reactive_declarations.length > 0
	);

	const definition = has_definition
		? component.alias('define')
		: '@noop';

	const all_reactive_dependencies = new Set();
	component.reactive_declarations.forEach(d => {
		addToSet(all_reactive_dependencies, d.dependencies);
	});

	if (has_definition) {
		builder.addBlock(deindent`
			function ${definition}(${args.join(', ')}) {
				${component.javascript || (
					filtered_props.length > 0 &&
					`let { ${filtered_props.map(x => x.name === x.as ? x.as : `${x.as}: ${x.name}`).join(', ')} } = $$props;`
				)}

				${component.partly_hoisted.length > 0 && component.partly_hoisted.join('\n\n')}

				${filtered_declarations.length > 0 && `$$self.$$.get = () => (${stringifyProps(filtered_declarations)});`}

				${set && `$$self.$$.set = ${set};`}

				${component.reactive_declarations.length > 0 && deindent`
				$$self.$$.update = ($$dirty = { ${Array.from(all_reactive_dependencies).map(n => `${n}: 1`).join(', ')} }) => {
					${component.reactive_declarations.map(d => deindent`
					if (${Array.from(d.dependencies).map(n => `$$dirty.${n}`).join(' || ')}) ${d.snippet}
					`)}
				};
				`}

				${inject_refs && `$$self.$$.inject_refs = ${inject_refs};`}
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

						${(component.props.length > 0 || component.meta.props) && deindent`
						if (options.props) {
							this.$set(options.props);
							@flush();
						}`}
					}
				}

				static get observedAttributes() {
					return ${JSON.stringify(component.props.map(x => x.as))};
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
