import MagicString from 'magic-string';
import { parseExpressionAt } from 'acorn';
import annotateWithScopes from '../../utils/annotateWithScopes';
import isReference from '../../utils/isReference';
import { walk } from 'estree-walker';
import deindent from '../../utils/deindent';
import { stringify, escape } from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import globalWhitelist from '../../utils/globalWhitelist';
import reservedNames from '../../utils/reservedNames';
import shared from './shared';
import Generator from '../Generator';
import Stylesheet from '../../css/Stylesheet';
import Block from './Block';
import { test } from '../../config';
import { Parsed, CompileOptions, Node } from '../../interfaces';

export class DomGenerator extends Generator {
	blocks: (Block|string)[];
	readonly: Set<string>;
	metaBindings: string[];

	hydratable: boolean;
	legacy: boolean;

	hasIntroTransitions: boolean;
	hasOutroTransitions: boolean;
	hasComplexBindings: boolean;

	needsEncapsulateHelper: boolean;

	constructor(
		parsed: Parsed,
		source: string,
		name: string,
		stylesheet: Stylesheet,
		options: CompileOptions
	) {
		super(parsed, source, name, stylesheet, options, true);
		this.blocks = [];

		this.readonly = new Set();

		this.hydratable = options.hydratable;
		this.legacy = options.legacy;
		this.needsEncapsulateHelper = false;

		// initial values for e.g. window.innerWidth, if there's a <:Window> meta tag
		this.metaBindings = [];
	}

	getUniqueNameMaker(params: string[]) {
		const localUsedNames = new Set(params);

		function add(name: string) {
			localUsedNames.add(name);
		}

		reservedNames.forEach(add);
		this.userVars.forEach(add);
		for (const name in shared) {
			localUsedNames.add(test ? `${name}$` : name);
		}

		return (name: string) => {
			if (test) name = `${name}$`;
			let alias = name;
			for (
				let i = 1;
				this.usedNames.has(alias) ||
				localUsedNames.has(alias);
				alias = `${name}_${i++}`
			);
			localUsedNames.add(alias);
			return alias;
		};
	}
}

export default function dom(
	parsed: Parsed,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions
) {
	const format = options.format || 'es';

	const generator = new DomGenerator(parsed, source, options.name || 'SvelteComponent', stylesheet, options);

	const {
		computations,
		name,
		templateProperties,
		namespace,
	} = generator;

	parsed.html.build();
	const { block } = parsed.html;

	generator.stylesheet.warnOnUnusedSelectors(options.onwarn);

	const builder = new CodeBuilder();
	const computationBuilder = new CodeBuilder();
	const computationDeps = new Set();

	if (computations.length) {
		computations.forEach(({ key, deps }) => {
			deps.forEach(dep => {
				computationDeps.add(dep);
			});

			if (generator.readonly.has(key)) {
				// <:Window> bindings
				throw new Error(
					`Cannot have a computed value '${key}' that clashes with a read-only property`
				);
			}

			generator.readonly.add(key);

			const condition = `${deps.map(dep => `changed.${dep}`).join(' || ')}`;

			const statement = `if (@differs(state.${key}, (state.${key} = %computed-${key}(${deps
				.map(dep => `state.${dep}`)
				.join(', ')})))) changed.${key} = true;`;

			computationBuilder.addConditional(condition, statement);
		});
	}

	if (generator.javascript) {
		builder.addBlock(generator.javascript);
	}

	if (generator.needsEncapsulateHelper) {
		builder.addBlock(deindent`
			function @encapsulateStyles(node) {
				@setAttribute(node, "${generator.stylesheet.id}", "");
			}
		`);
	}

	const { css, cssMap } = generator.stylesheet.render(options.filename, !generator.customElement);
	const styles = generator.stylesheet.hasStyles && stringify(options.dev ?
		`${css}\n/*# sourceMappingURL=${cssMap.toUrl()} */` :
		css, { onlyEscapeAtSymbol: true });

	if (styles && generator.options.css !== false && !generator.customElement) {
		builder.addBlock(deindent`
			function @add_css() {
				var style = @createElement("style");
				style.id = '${generator.stylesheet.id}-style';
				style.textContent = ${styles};
				@appendNode(style, document.head);
			}
		`);
	}

	generator.blocks.forEach(block => {
		builder.addBlock(block.toString());
	});

	const sharedPath: string = options.shared === true
		? 'svelte/shared.js'
		: options.shared || '';

	const prototypeBase =
		`${name}.prototype` +
		(templateProperties.methods ? `, %methods` : '');
	const proto = sharedPath
		? `@proto`
		: deindent`
		{
			${['destroy', 'get', 'fire', 'observe', 'on', 'set', 'teardown', '_set', '_mount', '_unmount']
				.map(n => `${n}: @${n === 'teardown' ? 'destroy' : n}`)
				.join(',\n')}
		}`;

	const debugName = `<${generator.customElement ? generator.tag : name}>`;

	// generate initial state object
	const expectedProperties = Array.from(generator.expectedProperties);
	const globals = expectedProperties.filter(prop => globalWhitelist.has(prop));
	const storeProps = options.store ? expectedProperties.filter(prop => prop[0] === '$') : [];

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

	const constructorBody = deindent`
		${options.dev && `this._debugName = '${debugName}';`}
		${options.dev && !generator.customElement &&
			`if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");`}
		@init(this, options);
		${generator.usesRefs && `this.refs = {};`}
		this._state = @assign(${initialState.join(', ')});
		${storeProps.length > 0 && `this.store._add(this, [${storeProps.map(prop => `"${prop.slice(1)}"`)}]);`}
		${generator.metaBindings}
		${computations.length && `this._recompute({ ${Array.from(computationDeps).map(dep => `${dep}: 1`).join(', ')} }, this._state);`}
		${options.dev &&
			Array.from(generator.expectedProperties).map(
				prop =>
					`if (!('${prop}' in this._state)) console.warn("${debugName} was created without expected data property '${prop}'");`
			)}
		${generator.bindingGroups.length &&
			`this._bindingGroups = [${Array(generator.bindingGroups.length).fill('[]').join(', ')}];`}

		${(templateProperties.ondestroy || storeProps.length) && (
			`this._handlers.destroy = [${
				[templateProperties.ondestroy && `%ondestroy`, storeProps.length && `@removeFromStore`].filter(Boolean).join(', ')
			}];`
		)}

		${generator.slots.size && `this._slotted = options.slots || {};`}

		${generator.customElement ?
			deindent`
				this.attachShadow({ mode: 'open' });
				${css && `this.shadowRoot.innerHTML = \`<style>${escape(css, { onlyEscapeAtSymbol: true }).replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${cssMap.toUrl()} */` : ''}</style>\`;`}
			` :
			(generator.stylesheet.hasStyles && options.css !== false &&
			`if (!document.getElementById("${generator.stylesheet.id}-style")) @add_css();`)
		}

		${templateProperties.oncreate && `var _oncreate = %oncreate.bind(this);`}

		${(templateProperties.oncreate || generator.hasComponents || generator.hasComplexBindings || generator.hasIntroTransitions) && deindent`
			if (!options.root) {
				this._oncreate = [${templateProperties.oncreate && `_oncreate`}];
				${(generator.hasComponents || generator.hasComplexBindings) && `this._beforecreate = [];`}
				${(generator.hasComponents || generator.hasIntroTransitions) && `this._aftercreate = [];`}
			} ${templateProperties.oncreate && deindent`
				else {
					this.root._oncreate.push(_oncreate);
				}
			`}
		`}

		${generator.slots.size && `this.slots = {};`}

		this._fragment = @create_main_fragment(this._state, this);

		${generator.customElement ? deindent`
			this._fragment.c();
			this._fragment.${block.hasIntroMethod ? 'i' : 'm'}(this.shadowRoot, null);

			if (options.target) this._mount(options.target, options.anchor || null);
		` : deindent`
			if (options.target) {
				${generator.hydratable
					? deindent`
						var nodes = @children(options.target);
						options.hydrate ? this._fragment.l(nodes) : this._fragment.c();
						nodes.forEach(@detachNode);
					` :
					deindent`
						${options.dev && `if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the \`hydratable: true\` option");`}
						this._fragment.c();
					`}
				this._fragment.${block.hasIntroMethod ? 'i' : 'm'}(options.target, options.anchor || null);

				${(generator.hasComponents || generator.hasComplexBindings || templateProperties.oncreate || generator.hasIntroTransitions) && deindent`
					${generator.hasComponents && `this._lock = true;`}
					${(generator.hasComponents || generator.hasComplexBindings) && `@callAll(this._beforecreate);`}
					${(generator.hasComponents || templateProperties.oncreate) && `@callAll(this._oncreate);`}
					${(generator.hasComponents || generator.hasIntroTransitions) && `@callAll(this._aftercreate);`}
					${generator.hasComponents && `this._lock = false;`}
				`}
			}
		`}
	`;

	if (generator.customElement) {
		const props = generator.props || Array.from(generator.expectedProperties);

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
						return this.get('${prop}');
					}

					set ${prop}(value) {
						this.set({ ${prop}: value });
					}
				`).join('\n\n')}

				${generator.slots.size && deindent`
					connectedCallback() {
						Object.keys(this._slotted).forEach(key => {
							this.appendChild(this._slotted[key]);
						});
					}`}

				attributeChangedCallback(attr, oldValue, newValue) {
					this.set({ [attr]: newValue });
				}
			}

			customElements.define("${generator.tag}", ${name});
			@assign(${prototypeBase}, ${proto}, {
				_mount(target, anchor) {
					target.insertBefore(this, anchor);
				},

				_unmount() {
					this.parentNode.removeChild(this);
				}
			});
		`);
	} else {
		builder.addBlock(deindent`
			function ${name}(options) {
				${constructorBody}
			}

			@assign(${prototypeBase}, ${proto});
		`);
	}

	builder.addBlock(deindent`
		${options.dev && deindent`
			${name}.prototype._checkReadOnly = function _checkReadOnly(newState) {
				${Array.from(generator.readonly).map(
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
	`);

	const usedHelpers = new Set();

	let result = builder
		.toString()
		.replace(/(%+|@+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
			if (sigil === '@') {
				if (name in shared) {
					if (options.dev && `${name}Dev` in shared) name = `${name}Dev`;
					usedHelpers.add(name);
				}

				return generator.alias(name);
			}

			if (sigil === '%') {
				return generator.templateVars.get(name);
			}

			return sigil.slice(1) + name;
		});

	let helpers;

	if (sharedPath) {
		if (format !== 'es' && format !== 'cjs') {
			throw new Error(`Components with shared helpers must be compiled with \`format: 'es'\` or \`format: 'cjs'\``);
		}
		const used = Array.from(usedHelpers).sort();
		helpers = used.map(name => {
			const alias = generator.alias(name);
			return { name, alias };
		});
	} else {
		let inlineHelpers = '';

		usedHelpers.forEach(key => {
			const str = shared[key];
			const code = new MagicString(str);
			const expression = parseExpressionAt(str, 0);

			let scope = annotateWithScopes(expression);

			walk(expression, {
				enter(node: Node, parent: Node) {
					if (node._scope) scope = node._scope;

					if (
						node.type === 'Identifier' &&
						isReference(node, parent) &&
						!scope.has(node.name)
					) {
						if (node.name in shared) {
							// this helper function depends on another one
							const dependency = node.name;
							usedHelpers.add(dependency);

							const alias = generator.alias(dependency);
							if (alias !== node.name)
								code.overwrite(node.start, node.end, alias);
						}
					}
				},

				leave(node: Node) {
					if (node._scope) scope = scope.parent;
				},
			});

			if (key === 'transitionManager') {
				// special case
				const global = `_svelteTransitionManager`;

				inlineHelpers += `\n\nvar ${generator.alias('transitionManager')} = window.${global} || (window.${global} = ${code});\n\n`;
			} else {
				const alias = generator.alias(expression.id.name);
				if (alias !== expression.id.name)
					code.overwrite(expression.id.start, expression.id.end, alias);

				inlineHelpers += `\n\n${code}`;
			}
		});

		result += inlineHelpers;
	}

	const filename = options.filename && (
		typeof process !== 'undefined' ? options.filename.replace(process.cwd(), '').replace(/^[\/\\]/, '') : options.filename
	);

	return generator.generate(result, options, {
		banner: `/* ${filename ? `${filename} ` : ``}generated by Svelte v${"__VERSION__"} */`,
		sharedPath,
		helpers,
		name,
		format,
	});
}
