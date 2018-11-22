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
	const format = options.format || 'es';

	const { name } = component;

	const renderer = new Renderer(component, options);

	const { block } = renderer;

	if (component.options.nestedTransitions) {
		block.hasOutroMethod = true;
	}

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

		const declarations = component.declarations.concat(
			component.event_handlers.map(handler => handler.name)
		);

		const superclass = component.alias(options.dev ? '$$ComponentDev' : '$$Component');

		if (options.dev && !options.hydratable) {
			block.builders.claim.addLine(
				'throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");'
			);
		}

		const body = [
			deindent`
				$$init($$make_dirty) {
					${component.init_uses_self && `const $$self = this;`}
					${component.javascript || component.exports.map(x => `let ${x.name};`)}

					${component.event_handlers.map(handler => handler.body)}

					return [
						// TODO only what's needed by the template
						() => ({ ${declarations.join(', ')} }),
						props => {
							// TODO only do this for export let|var
							${(component.exports.map(name =>
							`if ('${name.as}' in props) ${name.as} = props.${name.as};`
							))}
						},
						refs => {
							// TODO only if we have some refs
							${refs.map(name => `${name} = refs.${name};`)}
						}
					];
				}

				$$create_fragment(${component.alias('component')}, ctx) {
					${block.getContents()}
				}
			`
		];

		const debug_name = `<${component.customElement ? component.tag : name}>`;

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

			if (component.writable_declarations.has(x.as)) {
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
			class ${name} extends ${superclass} {
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
