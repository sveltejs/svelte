import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import globalWhitelist from '../../utils/globalWhitelist';
import Component from '../Component';
import Renderer from './Renderer';
import { CompileOptions } from '../../interfaces';

export default function dom(
	component: Component,
	options: CompileOptions
) {
	const format = options.format || 'esm';

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

	const css = component.stylesheet.render(options.filename, !component.customElement);
	const styles = component.stylesheet.hasStyles && stringify(options.dev ?
		`${css.code}\n/*# sourceMappingURL=${css.map.toUrl()} */` :
		css.code, { onlyEscapeAtSymbol: true });

	if (styles && component.options.css !== false && !component.customElement) {
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

	const debugName = `<${component.customElement ? component.tag : name}>`;

	const expectedProperties = Array.from(component.expectedProperties);
	const globals = expectedProperties.filter(prop => globalWhitelist.has(prop));

	if (component.customElement) {
		// TODO use `export` to determine this
		const props = Array.from(component.expectedProperties);

		builder.addBlock(deindent`
			class ${name} extends HTMLElement {
				constructor(options = {}) {
					super();
				}

				static get observedAttributes() {
					return ${JSON.stringify(props)};
				}

				${props.map(prop => deindent`
					get ${prop}() {
						return this.get().${prop};
					}

					set ${prop}(value) {
						this.set({ ${prop}: value });
					}
				`).join('\n\n')}

				${renderer.slots.size && deindent`
					connectedCallback() {
						Object.keys(this.$$slotted).forEach(key => {
							this.appendChild(this.$$slotted[key]);
						});
					}`}

				attributeChangedCallback(attr, oldValue, newValue) {
					this.set({ [attr]: newValue });
				}

				${(component.hasComponents || renderer.hasComplexBindings || templateProperties.oncreate || renderer.hasIntroTransitions) && deindent`
					connectedCallback() {
						@flush(this);
					}
				`}
			}

			customElements.define("${component.tag}", ${name});
		`);
	} else {
		const refs = Array.from(component.refs);

		const superclass = component.alias(options.dev ? '$$ComponentDev' : '$$Component');

		if (options.dev && !options.hydratable) {
			block.builders.claim.addLine(
				'throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");'
			);
		}

		// TODO injecting CSS this way is kinda dirty. Maybe it should be an
		// explicit opt-in, or something?
		const should_add_css = (
			!component.options.customElement &&
			component.stylesheet.hasStyles &&
			options.css !== false
		);

		const props = component.exports.filter(x => component.writable_declarations.has(x.name));

		const inject_props = component.meta.props || props.length > 0
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
			: `@noop`;

		const inject_refs = refs.length > 0
			? deindent`
				$$refs => {
					${refs.map(name => `${name} = $$refs.${name};`)}
				}
			`
			: `@noop`;

		const body = [];

		const debug_name = `<${component.customElement ? component.tag : name}>`;
		const not_equal = component.options.immutable ? `@not_equal` : `@safe_not_equal`;

		if (component.options.dev) {
			// TODO check no uunexpected props were passed, as well as
			// checking that expected ones were passed
			const expected = component.exports
				.map(x => x.name)
				.filter(name => !component.initialised_declarations.has(name));

			if (expected.length) {
				body.push(deindent`
					$$checkProps() {
						const state = this.$$.get_state();
						${expected.map(name => deindent`

						if (state.${name} === undefined) {
							console.warn("${debug_name} was created without expected data property '${name}'");
						}
						`)}
					}
				`);
			}
		}

		component.exports.forEach(x => {
			body.push(deindent`
				get ${x.as}() {
					return this.$$.get_state().${x.name};
				}
			`);

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
						throw new Error("${debug_name}: Cannot set read-only property '${x.as}'");
					}
				`);
			}
		});

		builder.addBlock(deindent`
			function $$create_fragment(${component.alias('component')}, ctx) {
				${block.getContents()}
			}

			${component.module_javascript}

			${component.fully_hoisted.length > 0 && component.fully_hoisted.join('\n\n')}

			function $$init($$self, $$make_dirty) {
				${should_add_css &&
				`if (!document.getElementById("${component.stylesheet.id}-style")) @add_css();`}

				${component.javascript || component.exports.map(x => `let ${x.name};`)}

				${component.partly_hoisted.length > 0 && component.partly_hoisted.join('\n\n')}

				return [
					// TODO only what's needed by the template
					() => ({ ${component.declarations.join(', ')} }),
					${inject_props},
					${inject_refs}
				];
			}

			class ${name} extends ${superclass} {
				constructor(options) {
					super(options, $$init, $$create_fragment, ${not_equal});
				}

				${body.join('\n\n')}
			}
		`);
	}

	let result = builder.toString();

	return component.generate(result, options, {
		banner: `/* ${component.file ? `${component.file} ` : ``}generated by Svelte v${"__VERSION__"} */`,
		name,
		format,
	});
}
