import deindent from '../../utils/deindent';
import { stringify, escape } from '../../utils/stringify';
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

	const refs = Array.from(component.refs);

	const superclass = component.alias(options.dev ? 'SvelteComponentDev' : 'SvelteComponent');

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

	const debug_name = `<${component.customElement ? component.tag : name}>`;
	const not_equal = component.options.immutable ? `@not_equal` : `@safe_not_equal`;
	let dev_props_check;

	component.exports.forEach(x => {
		body.push(deindent`
			get ${x.as}() {
				return this.$$.get().${x.name};
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

	if (component.options.dev) {
		// TODO check no uunexpected props were passed, as well as
		// checking that expected ones were passed
		const expected = component.exports
			.map(x => x.name)
			.filter(name => !component.initialised_declarations.has(name));

		if (expected.length) {
			dev_props_check = deindent`
				const state = this.$$.get();
				${expected.map(name => deindent`

				if (state.${name} === undefined) {
					console.warn("${debug_name} was created without expected data property '${name}'");
				}`)}
			`;
		}
	}

	builder.addBlock(deindent`
		function create_fragment(${component.alias('component')}, ctx) {
			${block.getContents()}
		}

		${component.module_javascript}

		${component.fully_hoisted.length > 0 && component.fully_hoisted.join('\n\n')}

		function define($$self, $$make_dirty) {
			${should_add_css &&
			`if (!document.getElementById("${component.stylesheet.id}-style")) @add_css();`}

			${component.javascript || component.exports.map(x => `let ${x.name};`)}

			${component.partly_hoisted.length > 0 && component.partly_hoisted.join('\n\n')}

			// TODO only what's needed by the template
			$$self.$$.get = () => ({ ${component.declarations.join(', ')} });

			${set && `$$self.$$.set = ${set};`}

			${inject_refs && `$$self.$$.inject_refs = ${inject_refs};`}
		}
	`);

	if (component.customElement) {
		builder.addBlock(deindent`
			class ${name} extends @SvelteElement {
				constructor(options) {
					super();

					${css.code && `this.shadowRoot.innerHTML = \`<style>${escape(css.code, { onlyEscapeAtSymbol: true }).replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${css.map.toUrl()} */` : ''}</style>\`;`}

					@init(this, { target: this.shadowRoot }, define, create_fragment, ${not_equal});

					if (options) {
						if (options.target) {
							@insert(options.target, this, options.anchor);
						}

						if (options.props) {
							this.$set(options.props);
							@flush();
						}
					}
				}

				static get observedAttributes() {
					return ${JSON.stringify(component.exports.map(x => x.as))};
				}

				${body.join('\n\n')}
			}

			customElements.define("${component.customElement.tag}", ${name});
		`);
	} else {
		builder.addBlock(deindent`
			class ${name} extends ${superclass} {
				constructor(options) {
					super(${options.dev && `options`});
					@init(this, options, define, create_fragment, ${not_equal});

					${dev_props_check}
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
