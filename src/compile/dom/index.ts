import deindent from '../../utils/deindent';
import { stringify, escape } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import globalWhitelist from '../../utils/globalWhitelist';
import Component from '../Component';
import Stylesheet from '../../css/Stylesheet';
import Stats from '../../Stats';
import Block from './Block';
import { Ast, CompileOptions } from '../../interfaces';

export class DomTarget {
	blocks: (Block|string)[];
	readonly: Set<string>;
	metaBindings: string[];

	hasIntroTransitions: boolean;
	hasOutroTransitions: boolean;
	hasComplexBindings: boolean;

	constructor() {
		this.blocks = [];
		this.readonly = new Set();

		// initial values for e.g. window.innerWidth, if there's a <svelte:window> meta tag
		this.metaBindings = [];
	}
}

export default function dom(
	component: Component,
	options: CompileOptions
) {
	const format = options.format || 'es';

	const {
		computations,
		name,
		templateProperties
	} = component;

	component.fragment.build();
	const { block } = component.fragment;

	if (component.options.nestedTransitions) {
		block.hasOutroMethod = true;
	}

	// prevent fragment being created twice (#1063)
	if (options.customElement) block.builders.create.addLine(`this.c = @noop;`);

	const builder = new CodeBuilder();
	const computationBuilder = new CodeBuilder();
	const computationDeps = new Set();

	if (computations.length) {
		computations.forEach(({ key, deps, hasRestParam }) => {
			if (component.target.readonly.has(key)) {
				// <svelte:window> bindings
				throw new Error(
					`Cannot have a computed value '${key}' that clashes with a read-only property`
				);
			}

			component.target.readonly.add(key);

			if (deps) {
				deps.forEach(dep => {
					computationDeps.add(dep);
				});

				const condition = `${deps.map(dep => `changed.${dep}`).join(' || ')}`;
				const statement = `if (this._differs(state.${key}, (state.${key} = %computed-${key}(state)))) changed.${key} = true;`;

				computationBuilder.addConditional(condition, statement);
			} else {
				// computed property depends on entire state object —
				// these must go at the end
				computationBuilder.addLine(
					`if (this._differs(state.${key}, (state.${key} = %computed-${key}(@exclude(state, "${key}"))))) changed.${key} = true;`
				);
			}
		});
	}

	if (component.javascript) {
		const componentDefinition = new CodeBuilder();
		component.declarations.forEach(declaration => {
			componentDefinition.addBlock(declaration.block);
		});

		const js = (
			component.javascript[0] +
			componentDefinition +
			component.javascript[1]
		);

		builder.addBlock(js);
	}

	if (component.options.dev) {
		builder.addLine(`const ${component.fileVar} = ${JSON.stringify(component.file)};`);
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

	component.target.blocks.forEach(block => {
		builder.addBlock(block.toString());
	});

	const sharedPath: string = options.shared === true
		? 'svelte/shared.js'
		: options.shared || '';

	const proto = sharedPath
		? `@proto`
		: deindent`
		{
			${['destroy', 'get', 'fire', 'on', 'set', '_set', '_stage', '_mount', '_differs']
				.map(n => `${n}: @${n}`)
				.join(',\n')}
		}`;

	const debugName = `<${component.customElement ? component.tag : name}>`;

	// generate initial state object
	const expectedProperties = Array.from(component.expectedProperties);
	const globals = expectedProperties.filter(prop => globalWhitelist.has(prop));
	const storeProps = expectedProperties.filter(prop => prop[0] === '$');
	const initialState = [];

	if (globals.length > 0) {
		initialState.push(`{ ${globals.map(prop => `${prop} : ${prop}`).join(', ')} }`);
	}

	if (storeProps.length > 0) {
		initialState.push(`this.store._init([${storeProps.map(prop => `"${prop.slice(1)}"`)}])`);
	}

	if (templateProperties.data) {
		initialState.push(`%data()`);
	} else if (globals.length === 0 && storeProps.length === 0) {
		initialState.push('{}');
	}

	initialState.push(`options.data`);

	const hasInitHooks = !!(templateProperties.oncreate || templateProperties.onstate || templateProperties.onupdate);

	const constructorBody = deindent`
		${options.dev && `this._debugName = '${debugName}';`}
		${options.dev && !component.customElement &&
			`if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");`}
		@init(this, options);
		${templateProperties.store && `this.store = %store();`}
		${component.refs.size > 0 && `this.refs = {};`}
		this._state = ${initialState.reduce((state, piece) => `@assign(${state}, ${piece})`)};
		${storeProps.length > 0 && `this.store._add(this, [${storeProps.map(prop => `"${prop.slice(1)}"`)}]);`}
		${component.target.metaBindings}
		${computations.length && `this._recompute({ ${Array.from(computationDeps).map(dep => `${dep}: 1`).join(', ')} }, this._state);`}
		${options.dev &&
			Array.from(component.expectedProperties).map(prop => {
				if (globalWhitelist.has(prop)) return;
				if (computations.find(c => c.key === prop)) return;

				const message = component.components.has(prop) ?
					`${debugName} expected to find '${prop}' in \`data\`, but found it in \`components\` instead` :
					`${debugName} was created without expected data property '${prop}'`;

				const conditions = [`!('${prop}' in this._state)`];
				if (component.customElement) conditions.push(`!('${prop}' in this.attributes)`);

				return `if (${conditions.join(' && ')}) console.warn("${message}");`
			})}
		${component.bindingGroups.length &&
			`this._bindingGroups = [${Array(component.bindingGroups.length).fill('[]').join(', ')}];`}
		this._intro = ${component.options.skipIntroByDefault ? '!!options.intro' : 'true'};

		${templateProperties.onstate && `this._handlers.state = [%onstate];`}
		${templateProperties.onupdate && `this._handlers.update = [%onupdate];`}

		${(templateProperties.ondestroy || storeProps.length) && (
			`this._handlers.destroy = [${
				[templateProperties.ondestroy && `%ondestroy`, storeProps.length && `@removeFromStore`].filter(Boolean).join(', ')
			}];`
		)}

		${component.slots.size && `this._slotted = options.slots || {};`}

		${component.customElement ?
			deindent`
				this.attachShadow({ mode: 'open' });
				${css.code && `this.shadowRoot.innerHTML = \`<style>${escape(css.code, { onlyEscapeAtSymbol: true }).replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${css.map.toUrl()} */` : ''}</style>\`;`}
			` :
			(component.stylesheet.hasStyles && options.css !== false &&
			`if (!document.getElementById("${component.stylesheet.id}-style")) @add_css();`)
		}

		${templateProperties.onstate && `%onstate.call(this, { changed: @assignTrue({}, this._state), current: this._state });`}

		this._fragment = @create_main_fragment(this, this._state);

		${hasInitHooks && deindent`
			this.root._oncreate.push(() => {
				${templateProperties.oncreate && `%oncreate.call(this);`}
				this.fire("update", { changed: @assignTrue({}, this._state), current: this._state });
			});
		`}

		${component.customElement ? deindent`
			this._fragment.c();
			this._fragment.${block.hasIntroMethod ? 'i' : 'm'}(this.shadowRoot, null);

			if (options.target) this._mount(options.target, options.anchor);
		` : deindent`
			if (options.target) {
				${component.options.hydratable
				? deindent`
				var nodes = @children(options.target);
				options.hydrate ? this._fragment.l(nodes) : this._fragment.c();
				nodes.forEach(@detachNode);` :
				deindent`
				${options.dev &&
				`if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the \`hydratable: true\` option");`}
				this._fragment.c();`}
				this._mount(options.target, options.anchor);

				${(component.hasComponents || component.target.hasComplexBindings || hasInitHooks || component.target.hasIntroTransitions) &&
				`@flush(this);`}
			}
		`}

		${component.options.skipIntroByDefault && `this._intro = true;`}
	`;

	if (component.customElement) {
		const props = component.props || Array.from(component.expectedProperties);

		builder.addBlock(deindent`
			class ${name} extends HTMLElement {
				constructor(options = {}) {
					super();
					${constructorBody}
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

				${component.slots.size && deindent`
					connectedCallback() {
						Object.keys(this._slotted).forEach(key => {
							this.appendChild(this._slotted[key]);
						});
					}`}

				attributeChangedCallback(attr, oldValue, newValue) {
					this.set({ [attr]: newValue });
				}

				${(component.hasComponents || component.target.hasComplexBindings || templateProperties.oncreate || component.target.hasIntroTransitions) && deindent`
					connectedCallback() {
						@flush(this);
					}
				`}
			}

			@assign(${name}.prototype, ${proto});
			${templateProperties.methods && `@assign(${name}.prototype, %methods);`}
			@assign(${name}.prototype, {
				_mount(target, anchor) {
					target.insertBefore(this, anchor);
				}
			});

			customElements.define("${component.tag}", ${name});
		`);
	} else {
		builder.addBlock(deindent`
			function ${name}(options) {
				${constructorBody}
			}

			@assign(${name}.prototype, ${proto});
			${templateProperties.methods && `@assign(${name}.prototype, %methods);`}
		`);
	}

	const immutable = templateProperties.immutable ? templateProperties.immutable.value.value : options.immutable;

	builder.addBlock(deindent`
		${options.dev && deindent`
			${name}.prototype._checkReadOnly = function _checkReadOnly(newState) {
				${Array.from(component.target.readonly).map(
					prop =>
						`if ('${prop}' in newState && !this._updatingReadonlyProperty) throw new Error("${debugName}: Cannot set read-only property '${prop}'");`
				)}
			};
		`}

		${computations.length ? deindent`
			${name}.prototype._recompute = function _recompute(changed, state) {
				${computationBuilder}
			}
		` : (!sharedPath && `${name}.prototype._recompute = @noop;`)}

		${templateProperties.setup && `%setup(${name});`}

		${templateProperties.preload && `${name}.preload = %preload;`}

		${immutable && `${name}.prototype._differs = @_differsImmutable;`}
	`);

	let result = builder.toString();

	return component.generate(result, options, {
		banner: `/* ${component.file ? `${component.file} ` : ``}generated by Svelte v${"__VERSION__"} */`,
		sharedPath,
		name,
		format,
	});
}
