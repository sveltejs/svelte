/** @import { ArrowFunctionExpression, BinaryOperator, ClassDeclaration, Expression, FunctionDeclaration, FunctionExpression, Identifier, ImportDeclaration, MemberExpression, LogicalOperator, Node, Pattern, UnaryOperator, VariableDeclarator, Super, CallExpression, NewExpression } from 'estree' */
/** @import { Context, Visitor } from 'zimmerframe' */
/** @import { AST, BindingKind, DeclarationKind } from '#compiler' */
import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import { create_expression_metadata } from './nodes.js';
import * as b from '#compiler/builders';
import * as e from '../errors.js';
import {
	extract_identifiers,
	extract_identifiers_from_destructuring,
	object,
	unwrap_pattern
} from '../utils/ast.js';
import { is_reserved, is_rune } from '../../utils.js';
import { determine_slot } from '../utils/slot.js';
import { validate_identifier_name } from './2-analyze/visitors/shared/utils.js';
import { regex_is_valid_identifier } from './patterns.js';

/** Highest precedence, could be any type, including `undefined` */
const UNKNOWN = Symbol('unknown');
/** Includes `BigInt` */
export const NUMBER = Symbol('number');
export const STRING = Symbol('string');
const NOT_NULL = Symbol('not null');
/** @typedef {NUMBER | STRING | UNKNOWN | undefined | boolean} TYPE */
const TYPES = [NUMBER, STRING, UNKNOWN, NOT_NULL, undefined, true, false];
/** @type {Record<string, [type: TYPE | TYPE[], fn?: Function]>} */
const globals = {
	BigInt: [NUMBER, BigInt],
	'Date.now': [NUMBER],
	'Math.min': [NUMBER, Math.min],
	'Math.max': [NUMBER, Math.max],
	'Math.random': [NUMBER],
	'Math.floor': [NUMBER, Math.floor],
	// @ts-ignore
	'Math.f16round': [NUMBER, Math.f16round],
	'Math.round': [NUMBER, Math.round],
	'Math.abs': [NUMBER, Math.abs],
	'Math.acos': [NUMBER, Math.acos],
	'Math.asin': [NUMBER, Math.asin],
	'Math.atan': [NUMBER, Math.atan],
	'Math.atan2': [NUMBER, Math.atan2],
	'Math.ceil': [NUMBER, Math.ceil],
	'Math.cos': [NUMBER, Math.cos],
	'Math.sin': [NUMBER, Math.sin],
	'Math.tan': [NUMBER, Math.tan],
	'Math.exp': [NUMBER, Math.exp],
	'Math.log': [NUMBER, Math.log],
	'Math.pow': [NUMBER, Math.pow],
	'Math.sqrt': [NUMBER, Math.sqrt],
	'Math.clz32': [NUMBER, Math.clz32],
	'Math.imul': [NUMBER, Math.imul],
	'Math.sign': [NUMBER, Math.sign],
	'Math.log10': [NUMBER, Math.log10],
	'Math.log2': [NUMBER, Math.log2],
	'Math.log1p': [NUMBER, Math.log1p],
	'Math.expm1': [NUMBER, Math.expm1],
	'Math.cosh': [NUMBER, Math.cosh],
	'Math.sinh': [NUMBER, Math.sinh],
	'Math.tanh': [NUMBER, Math.tanh],
	'Math.acosh': [NUMBER, Math.acosh],
	'Math.asinh': [NUMBER, Math.asinh],
	'Math.atanh': [NUMBER, Math.atanh],
	'Math.trunc': [NUMBER, Math.trunc],
	'Math.fround': [NUMBER, Math.fround],
	'Math.cbrt': [NUMBER, Math.cbrt],
	Number: [NUMBER, Number],
	'Number.isInteger': [NUMBER, Number.isInteger],
	'Number.isFinite': [NUMBER, Number.isFinite],
	'Number.isNaN': [NUMBER, Number.isNaN],
	'Number.isSafeInteger': [NUMBER, Number.isSafeInteger],
	'Number.parseFloat': [NUMBER, Number.parseFloat],
	'Number.parseInt': [NUMBER, Number.parseInt],
	'Object.is': [[true, false], Object.is],
	String: [STRING, String],
	'String.fromCharCode': [STRING, String.fromCharCode],
	'String.fromCodePoint': [STRING, String.fromCodePoint]
};

/** @type {Record<string, any>} */
const global_constants = {
	'Math.PI': Math.PI,
	'Math.E': Math.E,
	'Math.LN10': Math.LN10,
	'Math.LN2': Math.LN2,
	'Math.LOG10E': Math.LOG10E,
	'Math.LOG2E': Math.LOG2E,
	'Math.SQRT2': Math.SQRT2,
	'Math.SQRT1_2': Math.SQRT1_2
};

/**
 * @template T
 * @param {(...args: any) => T} fn
 * @returns {(this: unknown, ...args: any) => T}
 */
function call_bind(fn) {
	return /** @type {(this: unknown, ...args: any) => T} */ (fn.call.bind(fn));
}

const string_proto = String.prototype;
const number_proto = Number.prototype;

/** @type {Record<string, Record<string, [type: TYPE | TYPE[], fn?: Function]>>} */
const prototype_methods = {
	string: {
		//@ts-ignore
		toString: [STRING, call_bind(string_proto.toString)],
		toLowerCase: [STRING, call_bind(string_proto.toLowerCase)],
		toUpperCase: [STRING, call_bind(string_proto.toUpperCase)],
		slice: [STRING, call_bind(string_proto.slice)],
		at: [STRING, call_bind(string_proto.at)],
		charAt: [STRING, call_bind(string_proto.charAt)],
		trim: [STRING, call_bind(string_proto.trim)],
		indexOf: [NUMBER, call_bind(string_proto.indexOf)],
		charCodeAt: [NUMBER, call_bind(string_proto.charCodeAt)],
		codePointAt: [[NUMBER, undefined], call_bind(string_proto.codePointAt)],
		startsWith: [[true, false], call_bind(string_proto.startsWith)],
		endsWith: [[true, false], call_bind(string_proto.endsWith)],
		normalize: [STRING, call_bind(string_proto.normalize)],
		padEnd: [STRING, call_bind(string_proto.padEnd)],
		padStart: [STRING, call_bind(string_proto.padStart)],
		repeat: [STRING, call_bind(string_proto.repeat)],
		substring: [STRING, call_bind(string_proto.substring)],
		trimEnd: [STRING, call_bind(string_proto.trimEnd)],
		trimStart: [STRING, call_bind(string_proto.trimStart)],
		//@ts-ignore
		valueOf: [STRING, call_bind(string_proto.valueOf)]
	},
	number: {
		//@ts-ignore
		toString: [STRING, call_bind(number_proto.toString)],
		toFixed: [NUMBER, call_bind(number_proto.toFixed)],
		toExponential: [NUMBER, call_bind(number_proto.toExponential)],
		toPrecision: [NUMBER, call_bind(number_proto.toPrecision)],
		//@ts-ignore
		valueOf: [NUMBER, call_bind(number_proto.valueOf)]
	}
};
export class Binding {
	/** @type {Scope} */
	scope;

	/** @type {Identifier} */
	node;

	/** @type {BindingKind} */
	kind;

	/** @type {DeclarationKind} */
	declaration_kind;

	/**
	 * What the value was initialized with.
	 * For destructured props such as `let { foo = 'bar' } = $props()` this is `'bar'` and not `$props()`
	 * @type {null | Expression | FunctionDeclaration | ClassDeclaration | ImportDeclaration | AST.EachBlock | AST.SnippetBlock}
	 */
	initial = null;

	/** @type {Array<{ node: Identifier; path: AST.SvelteNode[] }>} */
	references = [];

	/**
	 * For `legacy_reactive`: its reactive dependencies
	 * @type {Binding[]}
	 */
	legacy_dependencies = [];

	/**
	 * Legacy props: the `class` in `{ export klass as class}`. $props(): The `class` in { class: klass } = $props()
	 * @type {string | null}
	 */
	prop_alias = null;

	/**
	 * Additional metadata, varies per binding type
	 * @type {null | { inside_rest?: boolean }}
	 */
	metadata = null;

	mutated = false;
	reassigned = false;

	/**
	 *
	 * @param {Scope} scope
	 * @param {Identifier} node
	 * @param {BindingKind} kind
	 * @param {DeclarationKind} declaration_kind
	 * @param {Binding['initial']} initial
	 */
	constructor(scope, node, kind, declaration_kind, initial) {
		this.scope = scope;
		this.node = node;
		this.initial = initial;
		this.kind = kind;
		this.declaration_kind = declaration_kind;
	}

	get updated() {
		return this.mutated || this.reassigned;
	}

	/**
	 * @returns {this is Binding & { initial: ArrowFunctionExpression | FunctionDeclaration | FunctionExpression }}
	 */
	is_function() {
		if (this.updated) {
			// even if it's reassigned to another function,
			// we can't use it directly as e.g. an event handler
			return false;
		}

		const type = this.initial?.type;

		return (
			type === 'ArrowFunctionExpression' ||
			type === 'FunctionExpression' ||
			type === 'FunctionDeclaration'
		);
	}
}

class Evaluation {
	/** @type {Set<any>} */
	values;

	/**
	 * True if there is exactly one possible value
	 * @readonly
	 * @type {boolean}
	 */
	is_known = true;

	/**
	 * True if the value is known to not be null/undefined
	 * @readonly
	 * @type {boolean}
	 */
	is_defined = true;

	/**
	 * True if the value is known to be a string
	 * @readonly
	 * @type {boolean}
	 */
	is_string = true;

	/**
	 * True if the value is known to be a number
	 * @readonly
	 * @type {boolean}
	 */
	is_number = true;

	/**
	 * @readonly
	 * @type {any}
	 */
	value = undefined;

	/**
	 *
	 * @param {Scope} scope
	 * @param {Expression} expression
	 * @param {Set<any>} values
	 * @param {Binding[]} seen_bindings
	 */
	constructor(scope, expression, values, seen_bindings) {
		this.values = values;

		switch (expression.type) {
			case 'Literal': {
				this.values.add(expression.value);
				break;
			}

			case 'Identifier': {
				const binding = scope.get(expression.name);

				if (binding && seen_bindings.includes(binding)) break;
				if (binding) {
					if (
						binding.initial?.type === 'CallExpression' &&
						get_rune(binding.initial, scope) === '$props.id'
					) {
						this.values.add(STRING);
						break;
					}

					const is_prop =
						binding.kind === 'prop' ||
						binding.kind === 'rest_prop' ||
						binding.kind === 'bindable_prop';

					if (binding.initial?.type === 'EachBlock' && binding.initial.index === expression.name) {
						this.values.add(NUMBER);
						break;
					}

					if (!binding.updated && binding.initial !== null && !is_prop) {
						binding.scope.evaluate(/** @type {Expression} */ (binding.initial), this.values, [
							...seen_bindings,
							binding
						]);
						break;
					}

					if (binding.kind === 'rest_prop' && !binding.updated) {
						this.values.add(NOT_NULL);
						break;
					}
				} else if (expression.name === 'undefined') {
					this.values.add(undefined);
					break;
				}

				// TODO glean what we can from reassignments
				// TODO one day, expose props and imports somehow

				this.values.add(UNKNOWN);
				break;
			}

			case 'BinaryExpression': {
				const a = scope.evaluate(
					/** @type {Expression} */ (expression.left),
					new Set(),
					seen_bindings
				); // `left` cannot be `PrivateIdentifier` unless operator is `in`
				const b = scope.evaluate(expression.right, new Set(), seen_bindings);

				if (a.is_known && b.is_known) {
					this.values.add(binary[expression.operator](a.value, b.value));
					break;
				}

				switch (expression.operator) {
					case '!=':
					case '!==':
					case '<':
					case '<=':
					case '>':
					case '>=':
					case '==':
					case '===':
					case 'in':
					case 'instanceof':
						this.values.add(true);
						this.values.add(false);
						break;

					case '%':
					case '&':
					case '*':
					case '**':
					case '-':
					case '/':
					case '<<':
					case '>>':
					case '>>>':
					case '^':
					case '|':
						this.values.add(NUMBER);
						break;

					case '+':
						if (a.is_string || b.is_string) {
							this.values.add(STRING);
						} else if (a.is_number && b.is_number) {
							this.values.add(NUMBER);
						} else {
							this.values.add(STRING);
							this.values.add(NUMBER);
						}
						break;

					default:
						this.values.add(UNKNOWN);
				}
				break;
			}

			case 'ConditionalExpression': {
				const test = scope.evaluate(expression.test, new Set(), seen_bindings);
				const consequent = scope.evaluate(expression.consequent, new Set(), seen_bindings);
				const alternate = scope.evaluate(expression.alternate, new Set(), seen_bindings);

				if (test.is_known) {
					for (const value of (test.value ? consequent : alternate).values) {
						this.values.add(value);
					}
				} else {
					for (const value of consequent.values) {
						this.values.add(value);
					}

					for (const value of alternate.values) {
						this.values.add(value);
					}
				}
				break;
			}

			case 'LogicalExpression': {
				const a = scope.evaluate(expression.left, new Set(), seen_bindings);
				const b = scope.evaluate(expression.right, new Set(), seen_bindings);

				if (a.is_known) {
					if (b.is_known) {
						this.values.add(logical[expression.operator](a.value, b.value));
						break;
					}

					if (
						(expression.operator === '&&' && !a.value) ||
						(expression.operator === '||' && a.value) ||
						(expression.operator === '??' && a.value != null)
					) {
						this.values.add(a.value);
					} else {
						for (const value of b.values) {
							this.values.add(value);
						}
					}

					break;
				}

				for (const value of a.values) {
					this.values.add(value);
				}

				for (const value of b.values) {
					this.values.add(value);
				}
				break;
			}

			case 'UnaryExpression': {
				const argument = scope.evaluate(expression.argument, new Set(), seen_bindings);

				if (argument.is_known) {
					this.values.add(unary[expression.operator](argument.value));
					break;
				}

				switch (expression.operator) {
					case '!':
					case 'delete':
						this.values.add(false);
						this.values.add(true);
						break;

					case '+':
					case '-':
					case '~':
						this.values.add(NUMBER);
						break;

					case 'typeof':
						this.values.add(STRING);
						break;

					case 'void':
						this.values.add(undefined);
						break;

					default:
						this.values.add(UNKNOWN);
				}
				break;
			}

			case 'SequenceExpression': {
				const { expressions } = expression;
				const evaluated = expressions.map((expression) =>
					scope.evaluate(expression, new Set(), seen_bindings)
				);
				if (evaluated.every((ev) => ev.is_known)) {
					this.values.add(evaluated.at(-1)?.value);
				} else {
					this.values.add(UNKNOWN);
				}
				break;
			}

			case 'CallExpression': {
				const keypath = get_global_keypath(expression.callee, scope);

				if (keypath !== null) {
					if (is_rune(keypath)) {
						const arg = /** @type {Expression | undefined} */ (expression.arguments[0]);

						switch (keypath) {
							case '$state':
							case '$state.raw':
							case '$derived':
								if (arg) {
									scope.evaluate(arg, this.values);
								} else {
									this.values.add(undefined);
								}
								break;

							case '$props.id':
								this.values.add(STRING);
								break;

							case '$effect.tracking':
								this.values.add(false);
								this.values.add(true);
								break;

							case '$derived.by':
								scope.evaluate(b.call(/** @type {Expression} */ (arg)), this.values, seen_bindings);
								break;

							case '$effect.root':
								this.values.add(NOT_NULL);
								break;

							default: {
								this.values.add(UNKNOWN);
							}
						}

						break;
					}

					if (
						Object.hasOwn(globals, keypath) &&
						expression.arguments.every((arg) => arg.type !== 'SpreadElement')
					) {
						const [type, fn] = globals[keypath];
						const values = expression.arguments.map((arg) =>
							scope.evaluate(arg, new Set(), seen_bindings)
						);

						if (fn && values.every((e) => e.is_known)) {
							this.values.add(fn(...values.map((e) => e.value)));
						} else {
							if (Array.isArray(type)) {
								for (const t of type) {
									this.values.add(t);
								}
							} else {
								this.values.add(type);
							}
						}

						break;
					}
				} else if (
					expression.callee.type === 'MemberExpression' &&
					expression.callee.object.type !== 'Super' &&
					expression.arguments.every((arg) => arg.type !== 'SpreadElement')
				) {
					const object = scope.evaluate(expression.callee.object, new Set(), seen_bindings);
					if (!object.is_known) {
						this.values.add(UNKNOWN);
						break;
					}
					let property;
					if (
						expression.callee.computed &&
						expression.callee.property.type !== 'PrivateIdentifier'
					) {
						property = scope.evaluate(expression.callee.property, new Set(), seen_bindings);
						if (property.is_known) {
							property = property.value;
						} else {
							this.values.add(UNKNOWN);
							break;
						}
					} else if (expression.callee.property.type === 'Identifier') {
						property = expression.callee.property.name;
					}
					if (property === undefined) {
						this.values.add(UNKNOWN);
						break;
					}
					if (typeof object.value !== 'string' && typeof object.value !== 'number') {
						this.values.add(UNKNOWN);
						break;
					}
					const available_methods =
						prototype_methods[/** @type {'string' | 'number'} */ (typeof object.value)];
					if (Object.hasOwn(available_methods, property)) {
						const [type, fn] = available_methods[property];
						const values = expression.arguments.map((arg) =>
							scope.evaluate(arg, new Set(), seen_bindings)
						);

						if (fn && values.every((e) => e.is_known)) {
							this.values.add(fn(object.value, ...values.map((e) => e.value)));
						} else {
							if (Array.isArray(type)) {
								for (const t of type) {
									this.values.add(t);
								}
							} else {
								this.values.add(type);
							}
						}
						break;
					}
				} else if (expression.callee.type === 'Identifier' && !expression.arguments.length) {
					const binding = scope.get(expression.callee.name);
					if (binding) {
						if (is_valid_function_binding(binding)) {
							const fn =
								/** @type {FunctionExpression | FunctionDeclaration | ArrowFunctionExpression} */ (
									binding.initial
								);
							if (fn && fn.async === false && !fn?.generator) {
								const analysis = evaluate_function(fn, binding); // typescript won't tell you if a function is pure or if it could throw, so we have to do this regardless of type annotations
								// console.log({ fn, binding, analysis });
								if (!analysis.pure || !analysis.never_throws) {
									// if its not pure, or we don't know if it could throw, we can't use any constant return values from the evaluation, but we can check if its nullish
									this.values.add(NOT_NULL); // `NOT_NULL` doesn't have precedence over `UNKNOWN`, so if the value is nullish, this won't have precedence
								}
								if (Object.hasOwn(fn, 'type_information')) {
									// @ts-ignore
									const { type_information } = fn;
									if (Object.hasOwn(type_information, 'return')) {
										const return_types = get_type_of_ts_node(
											type_information.return?.type_information?.annotation,
											scope
										);
										if (Array.isArray(return_types)) {
											for (let type of return_types) {
												this.values.add(type);
											}
										} else {
											this.values.add(return_types);
										}
									} else if (analysis.is_known) {
										this.values.add(analysis.value);
										break;
									} else {
										for (let value of analysis.values) {
											this.values.add(value);
										}
									}
								} else if (analysis.is_known) {
									this.values.add(analysis.value);
									break;
								} else {
									for (let value of analysis.values) {
										this.values.add(value);
									}
								}
								break;
							}
						}
					}
				} else if (
					expression.callee.type === 'ArrowFunctionExpression' ||
					expression.callee.type === 'FunctionExpression'
				) {
					const fn = expression.callee;
					const binding = /** @type {Binding} */ ({ scope });
					if (fn && fn.async === false && !fn?.generator) {
						const analysis = evaluate_function(fn, binding);
						if (!analysis.pure || !analysis.never_throws) {
							this.values.add(NOT_NULL);
						}
						if (Object.hasOwn(fn, 'type_information')) {
							// @ts-ignore
							const { type_information } = fn;
							if (Object.hasOwn(type_information, 'return')) {
								const return_types = get_type_of_ts_node(
									type_information.return?.type_information?.annotation,
									scope
								);
								if (Array.isArray(return_types)) {
									for (let type of return_types) {
										this.values.add(type);
									}
								} else {
									this.values.add(return_types);
								}
							} else if (analysis.is_known) {
								this.values.add(analysis.value);
								break;
							} else {
								for (let value of analysis.values) {
									this.values.add(value);
								}
							}
						} else if (analysis.is_known) {
							this.values.add(analysis.value);
							break;
						} else {
							for (let value of analysis.values) {
								this.values.add(value);
							}
						}
						break;
					}
				}

				this.values.add(UNKNOWN);
				break;
			}

			case 'TemplateLiteral': {
				let result = expression.quasis[0].value.cooked;

				for (let i = 0; i < expression.expressions.length; i += 1) {
					const e = scope.evaluate(expression.expressions[i], new Set(), seen_bindings);

					if (e.is_known) {
						result += e.value + expression.quasis[i + 1].value.cooked;
					} else {
						this.values.add(STRING);
						break;
					}
				}

				this.values.add(result);
				break;
			}

			case 'MemberExpression': {
				const keypath = get_global_keypath(expression, scope);

				if (keypath !== null && Object.hasOwn(global_constants, keypath)) {
					this.values.add(global_constants[keypath]);
					break;
				} else if (keypath?.match?.(/\.name$/) && Object.hasOwn(globals, keypath.slice(0, -5))) {
					this.values.add(globals[keypath.slice(0, -5)]?.[1]?.name ?? STRING);
					break;
				}

				this.values.add(UNKNOWN);
				break;
			}

			default: {
				this.values.add(UNKNOWN);
			}
		}

		for (const value of this.values) {
			this.value = value; // saves having special logic for `size === 1`

			if (value !== STRING && typeof value !== 'string') {
				this.is_string = false;
			}

			if (value !== NUMBER && typeof value !== 'number') {
				this.is_number = false;
			}

			if (value == null || value === UNKNOWN) {
				this.is_defined = false;
			}
		}

		if (this.values.size > 1 || typeof this.value === 'symbol') {
			this.is_known = false;
		}
	}
}

export class Scope {
	/** @type {ScopeRoot} */
	root;

	/**
	 * The immediate parent scope
	 * @type {Scope | null}
	 */
	parent;

	/**
	 * Whether or not `var` declarations are contained by this scope
	 * @type {boolean}
	 */
	#porous;

	/**
	 * A map of every identifier declared by this scope, and all the
	 * identifiers that reference it
	 * @type {Map<string, Binding>}
	 */
	declarations = new Map();

	/**
	 * A map of declarators to the bindings they declare
	 * @type {Map<VariableDeclarator | AST.LetDirective, Binding[]>}
	 */
	declarators = new Map();

	/**
	 * A set of all the names referenced with this scope
	 * — useful for generating unique names
	 * @type {Map<string, { node: Identifier; path: AST.SvelteNode[] }[]>}
	 */
	references = new Map();

	/**
	 * The scope depth allows us to determine if a state variable is referenced in its own scope,
	 * which is usually an error. Block statements do not increase this value
	 */
	function_depth = 0;

	/**
	 * If tracing of reactive dependencies is enabled for this scope
	 * @type {null | Expression}
	 */
	tracing = null;

	/**
	 *
	 * @param {ScopeRoot} root
	 * @param {Scope | null} parent
	 * @param {boolean} porous
	 */
	constructor(root, parent, porous) {
		this.root = root;
		this.parent = parent;
		this.#porous = porous;
		this.function_depth = parent ? parent.function_depth + (porous ? 0 : 1) : 0;
	}

	/**
	 * @param {Identifier} node
	 * @param {Binding['kind']} kind
	 * @param {DeclarationKind} declaration_kind
	 * @param {null | Expression | FunctionDeclaration | ClassDeclaration | ImportDeclaration | AST.EachBlock | AST.SnippetBlock} initial
	 * @returns {Binding}
	 */
	declare(node, kind, declaration_kind, initial = null) {
		if (this.parent) {
			if (declaration_kind === 'var' && this.#porous) {
				return this.parent.declare(node, kind, declaration_kind);
			}

			if (declaration_kind === 'import') {
				return this.parent.declare(node, kind, declaration_kind, initial);
			}
		}

		if (this.declarations.has(node.name)) {
			const binding = this.declarations.get(node.name);
			if (binding && binding.declaration_kind !== 'var' && declaration_kind !== 'var') {
				// This also errors on function types, but that's arguably a good thing
				// declaring function twice is also caught by acorn in the parse phase
				e.declaration_duplicate(node, node.name);
			}
		}

		const binding = new Binding(this, node, kind, declaration_kind, initial);

		validate_identifier_name(binding, this.function_depth);

		this.declarations.set(node.name, binding);
		this.root.conflicts.add(node.name);
		return binding;
	}

	child(porous = false) {
		return new Scope(this.root, this, porous);
	}

	/**
	 * @param {string} preferred_name
	 * @returns {string}
	 */
	generate(preferred_name) {
		if (this.#porous) {
			return /** @type {Scope} */ (this.parent).generate(preferred_name);
		}

		preferred_name = preferred_name.replace(/[^a-zA-Z0-9_$]/g, '_').replace(/^[0-9]/, '_');
		let name = preferred_name;
		let n = 1;

		while (
			this.references.has(name) ||
			this.declarations.has(name) ||
			this.root.conflicts.has(name) ||
			is_reserved(name)
		) {
			name = `${preferred_name}_${n++}`;
		}

		this.references.set(name, []);
		this.root.conflicts.add(name);
		return name;
	}

	/**
	 * @param {string} name
	 * @returns {Binding | null}
	 */
	get(name) {
		return this.declarations.get(name) ?? this.parent?.get(name) ?? null;
	}

	/**
	 * @param {VariableDeclarator | AST.LetDirective} node
	 * @returns {Binding[]}
	 */
	get_bindings(node) {
		const bindings = this.declarators.get(node);
		if (!bindings) {
			throw new Error('No binding found for declarator');
		}
		return bindings;
	}

	/**
	 * @param {string} name
	 * @returns {Scope | null}
	 */
	owner(name) {
		return this.declarations.has(name) ? this : this.parent && this.parent.owner(name);
	}

	/**
	 * @param {Identifier} node
	 * @param {AST.SvelteNode[]} path
	 */
	reference(node, path) {
		path = [...path]; // ensure that mutations to path afterwards don't affect this reference
		let references = this.references.get(node.name);

		if (!references) this.references.set(node.name, (references = []));

		references.push({ node, path });

		const binding = this.declarations.get(node.name);
		if (binding) {
			binding.references.push({ node, path });
		} else if (this.parent) {
			this.parent.reference(node, path);
		} else {
			// no binding was found, and this is the top level scope,
			// which means this is a global
			this.root.conflicts.add(node.name);
		}
	}

	/**
	 * Does partial evaluation to find an exact value or at least the rough type of the expression.
	 * Only call this once scope has been fully generated in a first pass,
	 * else this evaluates on incomplete data and may yield wrong results.
	 * @param {Expression} expression
	 * @param {Set<any>} [values]
	 * @param {Binding[]} [seen_bindings]
	 */
	evaluate(expression, values = new Set(), seen_bindings = []) {
		return new Evaluation(this, expression, values, seen_bindings);
	}
}

/** @type {Record<BinaryOperator, (left: any, right: any) => any>} */
const binary = {
	'!=': (left, right) => left != right,
	'!==': (left, right) => left !== right,
	'<': (left, right) => left < right,
	'<=': (left, right) => left <= right,
	'>': (left, right) => left > right,
	'>=': (left, right) => left >= right,
	'==': (left, right) => left == right,
	'===': (left, right) => left === right,
	in: (left, right) => left in right,
	instanceof: (left, right) => left instanceof right,
	'%': (left, right) => left % right,
	'&': (left, right) => left & right,
	'*': (left, right) => left * right,
	'**': (left, right) => left ** right,
	'+': (left, right) => left + right,
	'-': (left, right) => left - right,
	'/': (left, right) => left / right,
	'<<': (left, right) => left << right,
	'>>': (left, right) => left >> right,
	'>>>': (left, right) => left >>> right,
	'^': (left, right) => left ^ right,
	'|': (left, right) => left | right
};

/** @type {Record<UnaryOperator, (argument: any) => any>} */
const unary = {
	'-': (argument) => -argument,
	'+': (argument) => +argument,
	'!': (argument) => !argument,
	'~': (argument) => ~argument,
	typeof: (argument) => typeof argument,
	void: () => undefined,
	delete: () => true
};

/** @type {Record<LogicalOperator, (left: any, right: any) => any>} */
const logical = {
	'||': (left, right) => left || right,
	'&&': (left, right) => left && right,
	'??': (left, right) => left ?? right
};

export class ScopeRoot {
	/** @type {Set<string>} */
	conflicts = new Set();
	/** @type {Map<AST.SvelteNode, Scope>} */
	scopes = new Map();

	/**
	 * @param {string} preferred_name
	 */
	unique(preferred_name) {
		preferred_name = preferred_name.replace(/[^a-zA-Z0-9_$]/g, '_');
		let final_name = preferred_name;
		let n = 1;

		while (this.conflicts.has(final_name)) {
			final_name = `${preferred_name}_${n++}`;
		}

		this.conflicts.add(final_name);
		const id = b.id(final_name);
		return id;
	}
}

/**
 * @param {AST.SvelteNode} ast
 * @param {ScopeRoot} root
 * @param {boolean} allow_reactive_declarations
 * @param {Scope | null} parent
 */
export function create_scopes(ast, root, allow_reactive_declarations, parent) {
	/** @typedef {{ scope: Scope }} State */

	/**
	 * A map of node->associated scope. A node appearing in this map does not necessarily mean that it created a scope
	 * @type {Map<AST.SvelteNode, Scope>}
	 */
	const scopes = new Map();
	const scope = new Scope(root, parent, false);
	scopes.set(ast, scope);

	root.scopes = scopes;
	/** @type {State} */
	const state = { scope };

	/** @type {[Scope, { node: Identifier; path: AST.SvelteNode[] }][]} */
	const references = [];

	/** @type {[Scope, Pattern | MemberExpression][]} */
	const updates = [];

	/**
	 * An array of reactive declarations, i.e. the `a` in `$: a = b * 2`
	 * @type {Identifier[]}
	 */
	const possible_implicit_declarations = [];

	/**
	 * @param {Scope} scope
	 * @param {Pattern[]} params
	 */
	function add_params(scope, params) {
		for (const param of params) {
			for (const node of extract_identifiers(param)) {
				scope.declare(node, 'normal', param.type === 'RestElement' ? 'rest_param' : 'param');
			}
		}
	}

	/**
	 * @type {Visitor<Node, State, AST.SvelteNode>}
	 */
	const create_block_scope = (node, { state, next }) => {
		const scope = state.scope.child(true);
		scopes.set(node, scope);

		next({ scope });
	};

	/**
	 * @type {Visitor<AST.ElementLike, State, AST.SvelteNode>}
	 */
	const SvelteFragment = (node, { state, next }) => {
		const scope = state.scope.child();
		scopes.set(node, scope);
		next({ scope });
	};

	/**
	 * @type {Visitor<AST.Component | AST.SvelteComponent | AST.SvelteSelf, State, AST.SvelteNode>}
	 */
	const Component = (node, context) => {
		node.metadata.scopes = {
			default: context.state.scope.child()
		};

		if (node.type === 'SvelteComponent') {
			context.visit(node.expression);
		}

		const default_state = determine_slot(node)
			? context.state
			: { scope: node.metadata.scopes.default };

		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				context.visit(attribute, default_state);
			} else {
				context.visit(attribute);
			}
		}

		for (const child of node.fragment.nodes) {
			let state = default_state;

			const slot_name = determine_slot(child);

			if (slot_name !== null) {
				node.metadata.scopes[slot_name] = context.state.scope.child();

				state = {
					scope: node.metadata.scopes[slot_name]
				};
			}

			context.visit(child, state);
		}
	};

	/**
	 * @type {Visitor<AST.AnimateDirective | AST.TransitionDirective | AST.UseDirective, State, AST.SvelteNode>}
	 */
	const SvelteDirective = (node, { state, path, visit }) => {
		state.scope.reference(b.id(node.name.split('.')[0]), path);

		if (node.expression) {
			visit(node.expression);
		}
	};

	walk(ast, state, {
		// references
		Identifier(node, { path, state }) {
			const parent = path.at(-1);
			if (
				parent &&
				is_reference(node, /** @type {Node} */ (parent)) &&
				// TSTypeAnnotation, TSInterfaceDeclaration etc - these are normally already filtered out,
				// but for the migration they aren't, so we need to filter them out here
				// TODO -> once migration script is gone we can remove this check
				!parent.type.startsWith('TS')
			) {
				references.push([state.scope, { node, path: path.slice() }]);
			}
		},
		LabeledStatement(node, { path, next }) {
			if (path.length > 1 || !allow_reactive_declarations) return next();
			if (node.label.name !== '$') return next();

			// create a scope for the $: block
			const scope = state.scope.child();
			scopes.set(node, scope);

			if (
				node.body.type === 'ExpressionStatement' &&
				node.body.expression.type === 'AssignmentExpression'
			) {
				for (const id of extract_identifiers(node.body.expression.left)) {
					if (!id.name.startsWith('$')) {
						possible_implicit_declarations.push(id);
					}
				}
			}

			next({ scope });
		},

		SvelteFragment,
		SlotElement: SvelteFragment,
		SvelteElement: SvelteFragment,
		RegularElement: SvelteFragment,

		LetDirective(node, context) {
			const scope = context.state.scope;

			/** @type {Binding[]} */
			const bindings = [];
			scope.declarators.set(node, bindings);

			if (node.expression) {
				for (const id of extract_identifiers_from_destructuring(node.expression)) {
					const binding = scope.declare(id, 'template', 'const');
					scope.reference(id, [context.path[context.path.length - 1], node]);
					bindings.push(binding);
				}
			} else {
				/** @type {Identifier} */
				const id = {
					name: node.name,
					type: 'Identifier',
					start: node.start,
					end: node.end
				};
				const binding = scope.declare(id, 'template', 'const');
				scope.reference(id, [context.path[context.path.length - 1], node]);
				bindings.push(binding);
			}
		},

		Component: (node, context) => {
			context.state.scope.reference(b.id(node.name), context.path);
			Component(node, context);
		},
		SvelteSelf: Component,
		SvelteComponent: Component,

		// updates
		AssignmentExpression(node, { state, next }) {
			updates.push([state.scope, node.left]);
			next();
		},

		UpdateExpression(node, { state, next }) {
			updates.push([state.scope, /** @type {Identifier | MemberExpression} */ (node.argument)]);
			next();
		},

		ImportDeclaration(node, { state }) {
			for (const specifier of node.specifiers) {
				state.scope.declare(specifier.local, 'normal', 'import', node);
			}
		},

		FunctionExpression(node, { state, next }) {
			const scope = state.scope.child();
			scopes.set(node, scope);

			if (node.id) scope.declare(node.id, 'normal', 'function');

			add_params(scope, node.params);
			next({ scope });
		},

		FunctionDeclaration(node, { state, next }) {
			if (node.id) state.scope.declare(node.id, 'normal', 'function', node);

			const scope = state.scope.child();
			scopes.set(node, scope);

			add_params(scope, node.params);
			next({ scope });
		},

		ArrowFunctionExpression(node, { state, next }) {
			const scope = state.scope.child();
			scopes.set(node, scope);

			add_params(scope, node.params);
			next({ scope });
		},

		ForStatement: create_block_scope,
		ForInStatement: create_block_scope,
		ForOfStatement: create_block_scope,
		SwitchStatement: create_block_scope,
		BlockStatement(node, context) {
			const parent = context.path.at(-1);
			if (
				parent?.type === 'FunctionDeclaration' ||
				parent?.type === 'FunctionExpression' ||
				parent?.type === 'ArrowFunctionExpression'
			) {
				// We already created a new scope for the function
				context.next();
			} else {
				create_block_scope(node, context);
			}
		},

		ClassDeclaration(node, { state, next }) {
			if (node.id) state.scope.declare(node.id, 'normal', 'let', node);
			next();
		},

		VariableDeclaration(node, { state, path, next }) {
			const is_parent_const_tag = path.at(-1)?.type === 'ConstTag';
			for (const declarator of node.declarations) {
				/** @type {Binding[]} */
				const bindings = [];

				state.scope.declarators.set(declarator, bindings);

				for (const id of extract_identifiers(declarator.id)) {
					const binding = state.scope.declare(
						id,
						is_parent_const_tag ? 'template' : 'normal',
						node.kind,
						declarator.init
					);
					bindings.push(binding);
				}
			}

			next();
		},

		CatchClause(node, { state, next }) {
			if (node.param) {
				const scope = state.scope.child(true);
				scopes.set(node, scope);

				for (const id of extract_identifiers(node.param)) {
					scope.declare(id, 'normal', 'let');
				}

				next({ scope });
			} else {
				next();
			}
		},

		EachBlock(node, { state, visit }) {
			visit(node.expression);

			// context and children are a new scope
			const scope = state.scope.child();
			scopes.set(node, scope);

			if (node.context) {
				// declarations
				for (const id of extract_identifiers(node.context)) {
					const binding = scope.declare(id, 'each', 'const');

					let inside_rest = false;
					let is_rest_id = false;
					walk(node.context, null, {
						Identifier(node) {
							if (inside_rest && node === id) {
								is_rest_id = true;
							}
						},
						RestElement(_, { next }) {
							const prev = inside_rest;
							inside_rest = true;
							next();
							inside_rest = prev;
						}
					});

					binding.metadata = { inside_rest: is_rest_id };
				}

				// Visit to pick up references from default initializers
				visit(node.context, { scope });
			}

			if (node.index) {
				const is_keyed =
					node.key &&
					(node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index);
				scope.declare(b.id(node.index), is_keyed ? 'template' : 'normal', 'const', node);
			}
			if (node.key) visit(node.key, { scope });

			// children
			for (const child of node.body.nodes) {
				visit(child, { scope });
			}
			if (node.fallback) visit(node.fallback, { scope });

			node.metadata = {
				expression: create_expression_metadata(),
				keyed: false,
				contains_group_binding: false,
				index: scope.root.unique('$$index'),
				declarations: scope.declarations,
				is_controlled: false
			};
		},

		AwaitBlock(node, context) {
			context.visit(node.expression);

			if (node.pending) {
				context.visit(node.pending);
			}

			if (node.then) {
				context.visit(node.then);
				if (node.value) {
					const then_scope = /** @type {Scope} */ (scopes.get(node.then));
					const value_scope = context.state.scope.child();
					scopes.set(node.value, value_scope);
					context.visit(node.value, { scope: value_scope });
					for (const id of extract_identifiers(node.value)) {
						then_scope.declare(id, 'template', 'const');
						value_scope.declare(id, 'normal', 'const');
					}
				}
			}

			if (node.catch) {
				context.visit(node.catch);
				if (node.error) {
					const catch_scope = /** @type {Scope} */ (scopes.get(node.catch));
					const error_scope = context.state.scope.child();
					scopes.set(node.error, error_scope);
					context.visit(node.error, { scope: error_scope });
					for (const id of extract_identifiers(node.error)) {
						catch_scope.declare(id, 'template', 'const');
						error_scope.declare(id, 'normal', 'const');
					}
				}
			}
		},

		SnippetBlock(node, context) {
			const state = context.state;
			let scope = state.scope;

			scope.declare(node.expression, 'normal', 'function', node);

			const child_scope = state.scope.child();
			scopes.set(node, child_scope);

			for (const param of node.parameters) {
				for (const id of extract_identifiers(param)) {
					child_scope.declare(id, 'snippet', 'let');
				}
			}

			context.next({ scope: child_scope });
		},

		Fragment: (node, context) => {
			const scope = context.state.scope.child(node.metadata.transparent);
			scopes.set(node, scope);
			context.next({ scope });
		},

		BindDirective(node, context) {
			updates.push([
				context.state.scope,
				/** @type {Identifier | MemberExpression} */ (node.expression)
			]);
			context.next();
		},

		TransitionDirective: SvelteDirective,
		AnimateDirective: SvelteDirective,
		UseDirective: SvelteDirective,
		// using it's own function instead of `SvelteDirective` because
		// StyleDirective doesn't have expressions and are generally already
		// handled by `Identifier`. This is the special case for the shorthand
		// eg <button style:height /> where the variable has the same name of
		// the css property
		StyleDirective(node, { path, state, next }) {
			if (node.value === true) {
				state.scope.reference(b.id(node.name), path.concat(node));
			}
			next();
		}

		// TODO others
	});

	for (const id of possible_implicit_declarations) {
		const binding = scope.get(id.name);
		if (binding) continue; // TODO can also be legacy_reactive if declared outside of reactive statement

		scope.declare(id, 'legacy_reactive', 'let');
	}

	// we do this after the fact, so that we don't need to worry
	// about encountering references before their declarations
	for (const [scope, { node, path }] of references) {
		scope.reference(node, path);
	}

	for (const [scope, node] of updates) {
		for (const expression of unwrap_pattern(node)) {
			const left = object(expression);
			const binding = left && scope.get(left.name);

			if (binding !== null && left !== binding.node) {
				if (left === expression) {
					binding.reassigned = true;
				} else {
					binding.mutated = true;
				}
			}
		}
	}

	return {
		scope,
		scopes
	};
}

/**
 * @template {{ scope: Scope, scopes: Map<AST.SvelteNode, Scope> }} State
 * @param {AST.SvelteNode} node
 * @param {Context<AST.SvelteNode, State>} context
 */
export function set_scope(node, { next, state }) {
	const scope = state.scopes.get(node);
	next(scope !== undefined && scope !== state.scope ? { ...state, scope } : state);
}

/**
 * Returns the name of the rune if the given expression is a `CallExpression` using a rune.
 * @param {Node | null | undefined} node
 * @param {Scope} scope
 */
export function get_rune(node, scope) {
	if (!node) return null;
	if (node.type !== 'CallExpression') return null;

	const keypath = get_global_keypath(node.callee, scope);

	if (keypath === null || !is_rune(keypath)) return null;
	return keypath;
}

/**
 * Returns the name of the rune if the given expression is a `CallExpression` using a rune.
 * @param {Expression | Super} node
 * @param {Scope} scope
 */
function get_global_keypath(node, scope) {
	let n = node;

	let joined = '';

	while (n.type === 'MemberExpression') {
		if (n.computed && n.property.type !== 'PrivateIdentifier') {
			const property = scope.evaluate(n.property);
			if (property.is_known) {
				if (!regex_is_valid_identifier.test(property.value)) {
					return null;
				}
				joined = '.' + property.value + joined;
				n = n.object;
				continue;
			}
		}
		if (n.property.type !== 'Identifier') return null;
		joined = '.' + n.property.name + joined;
		n = n.object;
	}

	if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
		joined = '()' + joined;
		n = n.callee;
	}

	if (n.type !== 'Identifier') return null;

	const binding = scope.get(n.name);
	if (binding !== null) return null; // rune name, but references a variable or store

	return n.name + joined;
}

/**
 * @param {{type: string} & Record<string, any>} node
 * @param {Scope} scope
 * @returns {any}
 */
function get_type_of_ts_node(node, scope) {
	/**
	 * @param {any[]} types
	 * @returns {any[]}
	 */
	function intersect_types(types) {
		if (types.includes(UNKNOWN)) return [UNKNOWN];
		/** @type {any[]} */
		let res = [];
		if (
			types.filter((type) => typeof type === 'number' || typeof type === 'bigint').length > 1 ||
			(!types.some((type) => typeof type === 'number' || typeof type === 'bigint') &&
				types.includes(NUMBER))
		) {
			res.push(NUMBER);
		} else {
			res.push(...types.filter((type) => typeof type === 'number' || typeof type === 'bigint'));
		}
		if (
			types.filter((type) => typeof type === 'string').length > 1 ||
			(!types.some((type) => typeof type === 'string') && types.includes(STRING))
		) {
			res.push(STRING);
		} else {
			res.push(...types.filter((type) => typeof type === 'string'));
		}
		if (
			types.filter((type) => !['symbol', 'string', 'number', 'bigint'].includes(typeof type))
				.length > 1
		) {
			res.push(UNKNOWN);
		} else {
			types.push(
				...types.filter((type) => !['symbol', 'string', 'number', 'bigint'].includes(typeof type))
			);
		}
		return res;
	}
	switch (node.type) {
		case 'TypeAnnotation':
			return get_type_of_ts_node(node.annotation, scope);
		case 'TSCheckType':
			return [
				get_type_of_ts_node(node.trueType, scope),
				get_type_of_ts_node(node.falseType, scope)
			].flat();
		case 'TSUnionType':
			//@ts-ignore
			return node.types.map((type) => get_type_of_ts_node(type, scope)).flat();
		case 'TSIntersectionType':
			//@ts-ignore
			return intersect_types(node.types.map((type) => get_type_of_ts_node(type, scope)).flat());
		case 'TSBigIntKeyword':
		case 'TSNumberKeyword':
			return NUMBER;
		case 'TSStringKeyword':
			return STRING;
		case 'TSLiteralType':
			return node.literal.type === 'Literal'
				? node.literal.value
				: node.literal.type === 'TemplateLiteral'
					? STRING
					: UNKNOWN;
		case 'TSBooleanKeyword':
			return [true, false];
		case 'TSNeverKeyword':
		case 'TSVoidKeyword':
			return undefined;
		case 'TSNullKeyword':
			return null;
		default:
			return UNKNOWN;
	}
}

// TODO add more
const global_classes = [
	'String',
	'BigInt',
	'Object',
	'Set',
	'Array',
	'Proxy',
	'Map',
	'Boolean',
	'WeakMap',
	'WeakRef',
	'WeakSet',
	'Number',
	'RegExp',
	'Error',
	'Date'
];

// TODO ditto
const known_globals = [
	...global_classes,
	'Symbol',
	'console',
	'Math',
	'isNaN',
	'isFinite',
	'setTimeout',
	'setInterval',
	'NaN',
	'undefined',
	'globalThis'
];

let fn_cache = new Map();

/**
 * Analyzes and partially evaluates the provided function.
 * @param {FunctionExpression | ArrowFunctionExpression | FunctionDeclaration} fn
 * @param {Binding} binding
 * @param {Set<Binding>} [stack]
 * @param {Binding[]} [seen_bindings]
 */
function evaluate_function(fn, binding, stack = new Set(), [...seen_bindings] = []) {
	if (fn_cache.has(fn)) {
		return fn_cache.get(fn);
	}
	/**
	 * This big blob of comments is for my (https://github.com/Ocean-OS) sanity and for that of anyone who tries working with this function. Feel free to modify this as the function evolves.
	 * So, when evaluating functions at compile-time, there are a few things you have to avoid evaluating:
	 *
	 * - Side effects
	 * 	A function that modifies state from outside of its scope should not be evaluated.
	 * 	Additionally, since `$effect`s and `$derived`s exist, any reference to an external value could lead to a missed dependency if the function is evaluated by the compiler.
	 * - Errors
	 * 	A function that could throw an error should not be evaluated. Additionally, `$derived`s could be reevaluated upon reading, which could throw an error.
	 * 	The purpose of a compile-time evaluator is to replicate the behavior the function would have at runtime, but in compile time.
	 * 	If an error is/could be thrown, that can not be replicated.
	 *
	 * So, how do we figure out if either of these things (could) happen in a function?
	 * Well, for errors, it's relatively simple. If a `throw` statement is used in the function, then we assume that the error could be thrown at any time.
	 * For side effects, it gets a bit tricky. External `Identifier`s that change their value are definitely side effects, but also any `MemberExpression` that isn't a known global constant could have a side effect, due to getters and `Proxy`s.
	 * Additionally, since a function can call other functions, we check each individual function call: if it's a known global, we know its pure, and if we can find its definition, the parent function inherits its throwability and purity. If we cannot find its definition, we assume it is impure and could throw.
	 *
	 * A few other things to note/remember:
	 * - Not all functions rely on return statements to determine the return value.
	 * 	Arrow functions without a `BlockStatement` for a body use their expression body as an implicit `ReturnStatement`.
	 * - While currently all the globals we have are pure and error-free, that could change, so we shouldn't be too dependent on that in the future.
	 * 	Things like `JSON.stringify` and a *lot* of array methods are prime examples.
	 */
	let thing;
	const analysis = {
		pure: true,
		is_known: false,
		is_defined: true,
		values: new Set(),
		/** @type {any} */
		value: undefined,
		never_throws: true
	};
	const fn_binding = binding;
	const fn_scope = fn.metadata.scope;
	const CALL_EXPRESSION = 1 << 1;
	const NEW_EXPRESSION = 1 << 2;
	const state = {
		scope: fn_scope,
		scope_path: [fn_scope],
		current_call: 0
	};
	const uses_implicit_return =
		fn.type === 'ArrowFunctionExpression' && fn.body.type !== 'BlockStatement';
	/**
	 * @param {CallExpression | NewExpression} node
	 * @param {import('zimmerframe').Context<AST.SvelteNode, typeof state>} context
	 */
	function handle_call_expression(node, context) {
		const { callee: call, arguments: args } = node;
		const callee = context.visit(call, {
			...context.state,
			current_call: (node.type === 'CallExpression' ? CALL_EXPRESSION : NEW_EXPRESSION) | 0
		});
		for (let arg of args) {
			context.visit(arg);
		}
		if (analysis.pure || analysis.never_throws) {
			// don't check unless we think the function is pure or error-free
			if (callee.type === 'Identifier') {
				const binding = context.state.scope.get(callee.name);
				if (
					binding &&
					binding !== fn_binding &&
					!stack.has(binding) &&
					is_valid_function_binding(binding) &&
					node.type === 'CallExpression'
				) {
					const child_analysis = evaluate_function(
						/** @type {ArrowFunctionExpression | FunctionDeclaration | FunctionExpression} */ (
							binding.initial
						),
						binding,
						new Set([...stack, fn_binding])
					);
					analysis.pure &&= child_analysis.pure;
					analysis.never_throws &&= child_analysis.never_throws;
				}
			} else if (
				node.type === 'CallExpression' &&
				callee !== fn &&
				(callee.type === 'FunctionExpression' || callee.type === 'ArrowFunctionExpression') &&
				[...stack].every(({ scope }) => scope !== callee.metadata.scope)
			) {
				const child_analysis = evaluate_function(
					callee,
					/** @type {Binding} */ ({ scope: callee.metadata.scope }),
					new Set([...stack, fn_binding])
				);
				analysis.pure &&= child_analysis.pure;
				analysis.never_throws &&= child_analysis.never_throws;
			}
		}
	}
	walk(/** @type {AST.SvelteNode} */ (fn), state, {
		MemberExpression(node, context) {
			const keypath = get_global_keypath(node, context.state.scope);
			const evaluated = context.state.scope.evaluate(node);
			if (keypath === null && !evaluated.is_known) {
				analysis.pure = false;
				analysis.never_throws = false;
			}
			context.next();
		},
		Identifier(node, context) {
			if (is_reference(node, /** @type {Node} */ (context.path.at(-1)))) {
				const binding = context.state.scope.get(node.name);
				if (binding !== fn_binding) {
					if (binding === null) {
						if (!known_globals.includes(node.name)) {
							analysis.pure = false;
						}
						return;
					}
					if (
						binding.scope !== fn_scope &&
						!binding.updated &&
						context.state.current_call === 0 &&
						!seen_bindings.includes(binding)
					) {
						let has_fn_scope = false;
						/** @type {null | Scope} */
						let curr = binding.scope;
						while (curr !== null) {
							curr = curr?.parent ?? null;
							if (fn_scope === curr) {
								has_fn_scope = true;
								break;
							}
						}
						if (!has_fn_scope) {
							analysis.pure = false;
						}
						seen_bindings.push(binding);
					}
					if (binding.kind === 'derived') {
						analysis.never_throws = false; //derived evaluation could throw
					}
				}
			}
			context.next();
		},
		CallExpression: handle_call_expression,
		NewExpression: handle_call_expression,
		ThrowStatement(node, context) {
			if (
				fn.type !== 'FunctionDeclaration' ||
				context.path.findLast((parent) => parent.type === 'FunctionDeclaration') === fn // FunctionDeclarations are separately declared functions; we treat other types of functions as functions that could be evaluated by the parent
			) {
				analysis.never_throws = false;
			}
			context.next();
		},
		ReturnStatement(node, context) {
			if (
				!uses_implicit_return &&
				context.path.findLast((parent) =>
					['ArrowFunctionExpression', 'FunctionDeclaration', 'FunctionExpression'].includes(
						parent.type
					)
				) === fn
			) {
				if (node.argument) {
					const argument = /** @type {Expression} */ (context.visit(node.argument));
					context.state.scope.evaluate(argument, analysis.values, seen_bindings);
				} else {
					analysis.values.add(undefined);
				}
			}
		},
		_(node, context) {
			const new_scope =
				node.type === 'FunctionDeclaration' ||
				node.type === 'ArrowFunctionExpression' ||
				node.type === 'FunctionExpression'
					? node.metadata.scope
					: binding.scope.root.scopes.get(node);
			if (
				new_scope &&
				context.state.scope !== new_scope &&
				(node.type !== 'FunctionDeclaration' || node === fn)
			) {
				context.next({
					scope: new_scope,
					scope_path: [...context.state.scope_path, new_scope],
					current_call: context.state.current_call
				});
			} else {
				context.next();
			}
		}
	});
	if (uses_implicit_return) {
		fn_scope.evaluate(/** @type {Expression} */ (fn.body), analysis.values, seen_bindings);
	}
	for (const value of analysis.values) {
		analysis.value = value; // saves having special logic for `size === 1`

		if (value == null || value === UNKNOWN) {
			analysis.is_defined = false;
		}
	}

	if (
		(analysis.values.size <= 1 && !TYPES.includes(analysis.value)) ||
		analysis.values.size === 0
	) {
		analysis.is_known = true;
	}
	fn_cache.set(fn, analysis);
	return analysis;
}

/**
 * @param {Binding} binding
 * @returns {boolean}
 */
function is_valid_function_binding(binding) {
	return (
		(binding.kind === 'normal' &&
			!binding.reassigned &&
			binding.initial?.type === 'ArrowFunctionExpression') ||
		binding.initial?.type === 'FunctionDeclaration' ||
		(binding.initial?.type === 'FunctionExpression' &&
			(binding.declaration_kind === 'function' ||
				binding.declaration_kind === 'const' ||
				binding.declaration_kind === 'let' ||
				binding.declaration_kind === 'var'))
	);
}
