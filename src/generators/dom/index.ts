import MagicString from 'magic-string';
import { parseExpressionAt } from 'acorn';
import annotateWithScopes from '../../utils/annotateWithScopes';
import isReference from '../../utils/isReference';
import { walk } from 'estree-walker';
import deindent from '../../utils/deindent';
import stringify from '../../utils/stringify';
import CodeBuilder from '../../utils/CodeBuilder';
import visit from './visit';
import shared from './shared';
import Generator from '../Generator';
import Stylesheet from '../../css/Stylesheet';
import preprocess from './preprocess';
import Block from './Block';
import { Parsed, CompileOptions, Node } from '../../interfaces';

export class DomGenerator extends Generator {
	blocks: Block[];
	readonly: Set<string>;
	metaBindings: string[];

	hydratable: boolean;

	hasIntroTransitions: boolean;
	hasOutroTransitions: boolean;
	hasComplexBindings: boolean;

	constructor(
		parsed: Parsed,
		source: string,
		name: string,
		stylesheet: Stylesheet,
		options: CompileOptions
	) {
		super(parsed, source, name, stylesheet, options);
		this.blocks = [];

		this.readonly = new Set();

		this.hydratable = options.hydratable;

		// initial values for e.g. window.innerWidth, if there's a <:Window> meta tag
		this.metaBindings = [];
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
		hasJs,
		name,
		templateProperties,
		namespace,
	} = generator;

	const { block, state } = preprocess(generator, namespace, parsed.html);

	generator.stylesheet.warnOnUnusedSelectors(options.onwarn);

	parsed.html.children.forEach((node: Node) => {
		visit(generator, block, state, node, []);
	});

	const builder = new CodeBuilder();

	if (computations.length) {
		const computationBuilder = new CodeBuilder();

		computations.forEach(({ key, deps }) => {
			if (generator.readonly.has(key)) {
				// <:Window> bindings
				throw new Error(
					`Cannot have a computed value '${key}' that clashes with a read-only property`
				);
			}

			generator.readonly.add(key);

			const condition = `isInitial || ${deps
				.map(
					dep =>
						`( '${dep}' in newState && @differs( state.${dep}, oldState.${dep} ) )`
				)
				.join(' || ')}`;
			const statement = `state.${key} = newState.${key} = @template.computed.${key}( ${deps
				.map(dep => `state.${dep}`)
				.join(', ')} );`;

			computationBuilder.addConditionalLine(condition, statement);
		});

		builder.addBlock(deindent`
			function @recompute ( state, newState, oldState, isInitial ) {
				${computationBuilder}
			}
		`);
	}

	const _set = deindent`
		${options.dev &&
			deindent`
			if ( typeof newState !== 'object' ) {
				throw new Error( 'Component .set was called without an object of data key-values to update.' );
			}

			${Array.from(generator.readonly).map(
				prop =>
					`if ( '${prop}' in newState && !this._updatingReadonlyProperty ) throw new Error( "Cannot set read-only property '${prop}'" );`
			)}
		`}

		var oldState = this._state;
		this._state = @assign( {}, oldState, newState );
		${computations.length &&
			`@recompute( this._state, newState, oldState, false )`}
		@dispatchObservers( this, this._observers.pre, newState, oldState );
		${block.hasUpdateMethod && `this._fragment.update( newState, this._state );`}
		@dispatchObservers( this, this._observers.post, newState, oldState );
		${generator.hasComponents && `@callAll(this._oncreate);`}
		${generator.hasComplexBindings && `@callAll(this._bindings);`}
		${generator.hasIntroTransitions && `@callAll(this._postcreate);`}
	`;

	if (hasJs) {
		builder.addBlock(`[✂${parsed.js.content.start}-${parsed.js.content.end}✂]`);
	}

	if (generator.stylesheet.hasStyles && options.css !== false) {
		const { css, cssMap } = generator.stylesheet.render(options.filename);

		const textContent = options.dev ?
			`${css}\n/*# sourceMappingURL=${cssMap.toUrl()} */` :
			css;

		builder.addBlock(deindent`
			function @add_css () {
				var style = @createElement( 'style' );
				style.id = '${generator.stylesheet.id}-style';
				style.textContent = ${JSON.stringify(textContent)};
				@appendNode( style, document.head );
			}
		`);
	}

	generator.blocks.forEach(block => {
		builder.addBlock(block.render());
	});

	const sharedPath = options.shared === true
		? 'svelte/shared.js'
		: options.shared;

	const prototypeBase =
		`${name}.prototype` +
		(templateProperties.methods ? `, @template.methods` : '');
	const proto = sharedPath
		? `@proto `
		: deindent`
		{
			${['get', 'fire', 'observe', 'on', 'set']
				.map(n => `${n}: @${n}`)
				.join(',\n')}
		}`;

	// TODO deprecate component.teardown()
	builder.addBlock(deindent`
		function ${name} ( options ) {
			options = options || {};
			${options.dev &&
				`if ( !options.target && !options._root ) throw new Error( "'target' is a required option" );`}
			${generator.usesRefs && `this.refs = {};`}
			this._state = ${templateProperties.data
				? `@assign( @template.data(), options.data )`
				: `options.data || {}`};
			${generator.metaBindings}
			${computations.length && `@recompute( this._state, this._state, {}, true );`}
			${options.dev &&
				Array.from(generator.expectedProperties).map(
					prop =>
						`if ( !( '${prop}' in this._state ) ) console.warn( "Component was created without expected data property '${prop}'" );`
				)}
			${generator.bindingGroups.length &&
				`this._bindingGroups = [ ${Array(generator.bindingGroups.length)
					.fill('[]')
					.join(', ')} ];`}

			this._observers = {
				pre: Object.create( null ),
				post: Object.create( null )
			};

			this._handlers = Object.create( null );

			this._root = options._root || this;
			this._yield = options._yield;

			this._torndown = false;
			${generator.stylesheet.hasStyles &&
				options.css !== false &&
				`if ( !document.getElementById( '${generator.stylesheet.id}-style' ) ) @add_css();`}
			${generator.hasComponents && `this._oncreate = [];`}
			${generator.hasComplexBindings && `this._bindings = [];`}
			${generator.hasIntroTransitions && `this._postcreate = [];`}

			this._fragment = @create_main_fragment( this._state, this );

			if ( options.target ) {
				${generator.hydratable
					? deindent`
						var nodes = @children( options.target );
						options.hydrate ? this._fragment.claim( nodes ) : this._fragment.create();
						nodes.forEach( @detachNode );
					` :
					deindent`
						${options.dev && `if ( options.hydrate ) throw new Error( 'options.hydrate only works if the component was compiled with the \`hydratable: true\` option' );`}
						this._fragment.create();
					`}
				this._fragment.${block.hasIntroMethod ? 'intro' : 'mount'}( options.target, null );
			}
			
			${generator.hasComponents && `@callAll(this._oncreate);`}
			${generator.hasComplexBindings && `@callAll(this._bindings);`}

			${templateProperties.oncreate && deindent`
				if ( options._root ) {
					options._root._oncreate.push( @template.oncreate.bind( this ) );
				} else {
					@template.oncreate.call( this );
				}`}

			${generator.hasIntroTransitions && `@callAll(this._postcreate);`}
		}

		@assign( ${prototypeBase}, ${proto});

		${name}.prototype._set = function _set ( newState ) {
			${_set}
		};

		${name}.prototype.teardown = ${name}.prototype.destroy = function destroy ( detach ) {
			this.fire( 'destroy' );
			${templateProperties.ondestroy && `@template.ondestroy.call( this );`}

			if ( detach !== false ) this._fragment.unmount();
			this._fragment.destroy();
			this._fragment = null;

			this._state = {};
			this._torndown = true;
		};
	`);

	const usedHelpers = new Set();

	let result = builder
		.toString()
		.replace(/(\\)?@(\w*)/g, (match: string, escaped: string, name: string) => {
			if (escaped) return match.slice(1);

			if (name in shared) {
				if (options.dev && `${name}Dev` in shared) name = `${name}Dev`;
				usedHelpers.add(name);
			}

			return generator.alias(name);
		});

	if (sharedPath) {
		if (format !== 'es') {
			throw new Error(
				`Components with shared helpers must be compiled to ES2015 modules (format: 'es')`
			);
		}

		const names = Array.from(usedHelpers).sort().map(name => {
			return name !== generator.alias(name)
				? `${name} as ${generator.alias(name)}`
				: name;
		});

		result =
			`import { ${names.join(', ')} } from ${stringify(sharedPath)};\n\n` +
			result;
	} else {
		usedHelpers.forEach(key => {
			const str = shared[key];
			const code = new MagicString(str);
			const expression = parseExpressionAt(str, 0);

			let scope = annotateWithScopes(expression);

			walk(expression, {
				enter(node, parent) {
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

				leave(node) {
					if (node._scope) scope = scope.parent;
				},
			});

			if (key === 'transitionManager') {
				// special case
				const global = `_svelteTransitionManager`;

				result += `\n\nvar ${generator.alias(
					'transitionManager'
				)} = window.${global} || ( window.${global} = ${code});`;
			} else {
				const alias = generator.alias(expression.id.name);
				if (alias !== expression.id.name)
					code.overwrite(expression.id.start, expression.id.end, alias);

				result += `\n\n${code}`;
			}
		});
	}

	return generator.generate(result, options, {
		name,
		format,
	});
}
