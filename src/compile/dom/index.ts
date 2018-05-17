import MagicString from 'magic-string';
import isReference from 'is-reference';
import { parseExpressionAt } from 'acorn';
import annotateWithScopes from '../../utils/annotateWithScopes';
import { walk } from 'estree-walker';
import deindent from '../../utils/deindent';
import { stringify, escape } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import globalWhitelist from '../../utils/globalWhitelist';
import reservedNames from '../../utils/reservedNames';
import Compiler from '../Compiler';
import Stylesheet from '../../css/Stylesheet';
import Stats from '../../Stats';
import Block from './Block';
import { test } from '../../config';
import { Ast, CompileOptions, Node } from '../../interfaces';

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
	ast: Ast,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions,
	stats: Stats
) {
	const format = options.format || 'es';

	const target = new DomTarget();
	const compiler = new Compiler(ast, source, options.name || 'SvelteComponent', stylesheet, options, stats, true, target);

	const {
		computations,
		name,
		templateProperties,
		namespace,
	} = compiler;

	compiler.fragment.build();
	const { block } = compiler.fragment;

	if (compiler.options.nestedTransitions) {
		block.hasOutroMethod = true;
	}

	// prevent fragment being created twice (#1063)
	if (options.customElement) block.builders.create.addLine(`this.c = @noop;`);

	const builder = new CodeBuilder();
	const computationBuilder = new CodeBuilder();
	const computationDeps = new Set();

	if (computations.length) {
		computations.forEach(({ key, deps }) => {
			if (target.readonly.has(key)) {
				// <svelte:window> bindings
				throw new Error(
					`Cannot have a computed value '${key}' that clashes with a read-only property`
				);
			}

			target.readonly.add(key);

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
					`if (this._differs(state.${key}, (state.${key} = %computed-${key}(state)))) changed.${key} = true;`
				);
			}
		});
	}

	if (compiler.javascript) {
		builder.addBlock(compiler.javascript);
	}

	const css = compiler.stylesheet.render(options.filename, !compiler.customElement);
	const styles = compiler.stylesheet.hasStyles && stringify(options.dev ?
		`${css.code}\n/*# sourceMappingURL=${css.map.toUrl()} */` :
		css.code, { onlyEscapeAtSymbol: true });

	if (styles && compiler.options.css !== false && !compiler.customElement) {
		builder.addBlock(deindent`
			function @add_css() {
				var style = @createElement("style");
				style.id = '${compiler.stylesheet.id}-style';
				style.textContent = ${styles};
				@appendNode(style, document.head);
			}
		`);
	}

	target.blocks.forEach(block => {
		builder.addBlock(block.toString());
	});

	const sharedPath: string = options.shared === true
		? 'svelte/shared.js'
		: options.shared || '';

	const proto = sharedPath
		? `@proto`
		: deindent`
		{
			${['destroy', 'get', 'fire', 'on', 'set', '_set', '_mount', '_differs']
				.map(n => `${n}: @${n}`)
				.join(',\n')}
		}`;

	const debugName = `<${compiler.customElement ? compiler.tag : name}>`;

	// generate initial state object
	const expectedProperties = Array.from(compiler.expectedProperties);
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
		${options.dev && !compiler.customElement &&
			`if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");`}
		@init(this, options);
		${templateProperties.store && `this.store = %store();`}
		${compiler.usesRefs && `this.refs = {};`}
		this._state = ${initialState.reduce((state, piece) => `@assign(${state}, ${piece})`)};
		${storeProps.length > 0 && `this.store._add(this, [${storeProps.map(prop => `"${prop.slice(1)}"`)}]);`}
		${target.metaBindings}
		${computations.length && `this._recompute({ ${Array.from(computationDeps).map(dep => `${dep}: 1`).join(', ')} }, this._state);`}
		${options.dev &&
			Array.from(compiler.expectedProperties).map(prop => {
				if (globalWhitelist.has(prop)) return;
				if (computations.find(c => c.key === prop)) return;

				const message = compiler.components.has(prop) ?
					`${debugName} expected to find '${prop}' in \`data\`, but found it in \`components\` instead` :
					`${debugName} was created without expected data property '${prop}'`;

				const conditions = [`!('${prop}' in this._state)`];
				if (compiler.customElement) conditions.push(`!('${prop}' in this.attributes)`);

				return `if (${conditions.join(' && ')}) console.warn("${message}");`
			})}
		${compiler.bindingGroups.length &&
			`this._bindingGroups = [${Array(compiler.bindingGroups.length).fill('[]').join(', ')}];`}
		this._intro = ${compiler.options.skipIntroByDefault ? '!!options.intro' : 'true'};

		${templateProperties.onstate && `this._handlers.state = [%onstate];`}
		${templateProperties.onupdate && `this._handlers.update = [%onupdate];`}

		${(templateProperties.ondestroy || storeProps.length) && (
			`this._handlers.destroy = [${
				[templateProperties.ondestroy && `%ondestroy`, storeProps.length && `@removeFromStore`].filter(Boolean).join(', ')
			}];`
		)}

		${compiler.slots.size && `this._slotted = options.slots || {};`}

		${compiler.customElement ?
			deindent`
				this.attachShadow({ mode: 'open' });
				${css.code && `this.shadowRoot.innerHTML = \`<style>${escape(css.code, { onlyEscapeAtSymbol: true }).replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${css.map.toUrl()} */` : ''}</style>\`;`}
			` :
			(compiler.stylesheet.hasStyles && options.css !== false &&
			`if (!document.getElementById("${compiler.stylesheet.id}-style")) @add_css();`)
		}

		${(hasInitHooks || compiler.hasComponents || target.hasComplexBindings || target.hasIntroTransitions) && deindent`
			if (!options.root) {
				this._oncreate = [];
				${(compiler.hasComponents || target.hasComplexBindings) && `this._beforecreate = [];`}
				${(compiler.hasComponents || target.hasIntroTransitions) && `this._aftercreate = [];`}
			}
		`}

		${compiler.slots.size && `this.slots = {};`}

		this._fragment = @create_main_fragment(this, this._state);

		${hasInitHooks && deindent`
			this.root._oncreate.push(() => {
				${templateProperties.onstate && `%onstate.call(this, { changed: @assignTrue({}, this._state), current: this._state });`}
				${templateProperties.oncreate && `%oncreate.call(this);`}
				this.fire("update", { changed: @assignTrue({}, this._state), current: this._state });
			});
		`}

		${compiler.customElement ? deindent`
			this._fragment.c();
			this._fragment.${block.hasIntroMethod ? 'i' : 'm'}(this.shadowRoot, null);

			if (options.target) this._mount(options.target, options.anchor);
		` : deindent`
			if (options.target) {
				${compiler.options.hydratable
					? deindent`
						var nodes = @children(options.target);
						options.hydrate ? this._fragment.l(nodes) : this._fragment.c();
						nodes.forEach(@detachNode);
					` :
					deindent`
						${options.dev && `if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the \`hydratable: true\` option");`}
						this._fragment.c();
					`}
				this._mount(options.target, options.anchor);

				${(compiler.hasComponents || target.hasComplexBindings || hasInitHooks || target.hasIntroTransitions) && deindent`
					${compiler.hasComponents && `this._lock = true;`}
					${(compiler.hasComponents || target.hasComplexBindings) && `@callAll(this._beforecreate);`}
					${(compiler.hasComponents || hasInitHooks) && `@callAll(this._oncreate);`}
					${(compiler.hasComponents || target.hasIntroTransitions) && `@callAll(this._aftercreate);`}
					${compiler.hasComponents && `this._lock = false;`}
				`}
			}
		`}

		${compiler.options.skipIntroByDefault && `this._intro = true;`}
	`;

	if (compiler.customElement) {
		const props = compiler.props || Array.from(compiler.expectedProperties);

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

				${compiler.slots.size && deindent`
					connectedCallback() {
						Object.keys(this._slotted).forEach(key => {
							this.appendChild(this._slotted[key]);
						});
					}`}

				attributeChangedCallback(attr, oldValue, newValue) {
					this.set({ [attr]: newValue });
				}

				${(compiler.hasComponents || target.hasComplexBindings || templateProperties.oncreate || target.hasIntroTransitions) && deindent`
					connectedCallback() {
						${compiler.hasComponents && `this._lock = true;`}
						${(compiler.hasComponents || target.hasComplexBindings) && `@callAll(this._beforecreate);`}
						${(compiler.hasComponents || templateProperties.oncreate) && `@callAll(this._oncreate);`}
						${(compiler.hasComponents || target.hasIntroTransitions) && `@callAll(this._aftercreate);`}
						${compiler.hasComponents && `this._lock = false;`}
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

			customElements.define("${compiler.tag}", ${name});
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
				${Array.from(target.readonly).map(
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

	const filename = options.filename && (
		typeof process !== 'undefined' ? options.filename.replace(process.cwd(), '').replace(/^[\/\\]/, '') : options.filename
	);

	return compiler.generate(result, options, {
		banner: `/* ${filename ? `${filename} ` : ``}generated by Svelte v${"__VERSION__"} */`,
		sharedPath,
		name,
		format,
	});
}
