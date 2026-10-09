/** @import { BinaryOperator, ClassDeclaration, Expression, FunctionDeclaration, Identifier, ImportDeclaration, MemberExpression, LogicalOperator, Node, Pattern, UnaryOperator, VariableDeclarator, Super, SimpleLiteral, FunctionExpression, ArrowFunctionExpression, Program } from 'estree' */
/** @import { Context } from 'zimmerframe' */
/** @import { AST, BindingKind, DeclarationKind } from '#compiler' */
import { ExpressionMetadata } from './nodes.js';
import * as b from '#compiler/builders';
import * as e from '../errors.js';
import { referenceOf, parentOf } from '@teasel/parser';
import { extract_identifiers, tables_of, object, unwrap_pattern } from '../utils/ast.js';
import { is_reserved, is_rune } from '../../utils.js';
import { determine_slot } from '../utils/slot.js';

const UNKNOWN = Symbol('unknown');
/** Includes `BigInt` */
const NUMBER = Symbol('number');
const STRING = Symbol('string');
const FUNCTION = Symbol('string');

/** @type {Record<string, [type: typeof NUMBER | typeof  STRING | typeof  UNKNOWN, fn?: Function]>} */
const globals = {
	BigInt: [NUMBER],
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

/** A reference an identifier makes: its ancestors, and the scope it is made from. */
export class Reference {
	/** @type {Identifier} */
	node;
	/** @type {Scope} */
	scope;
	/** @type {AST.SvelteNode[] | undefined} */
	#path;
	/** @type {AST.SvelteNode | undefined} the template node that reads a name it holds, for an identifier the template made */
	#anchor;

	/**
	 * What the parser resolved the identifier to, when it did, and what it saw it do.
	 * @type {Binding | undefined}
	 */
	resolved;
	/** @type {import('@teasel/parser').Reference | undefined} */
	parsed;

	/**
	 * @param {Identifier} node
	 * @param {Scope} scope
	 * @param {Binding | undefined} resolved
	 * @param {import('@teasel/parser').Reference | undefined} parsed
	 * @param {AST.SvelteNode} [anchor]
	 */
	constructor(node, scope, resolved, parsed, anchor) {
		this.node = node;
		this.scope = scope;
		this.resolved = resolved;
		this.parsed = parsed;
		this.#anchor = anchor;
	}

	/** The ancestors of the identifier, outermost first, from the component's fragment or the script's program. */
	get path() {
		if (this.#path === undefined) {
			const path = [];
			for (
				let node = /** @type {any} */ (this.#anchor ?? parentOf(this.node));
				node !== undefined && node.type !== 'Root' && node.type !== 'Script';
				node = parentOf(node)
			) {
				path.push(/** @type {AST.SvelteNode} */ (node));
			}
			this.#path = path.reverse();
		}
		return this.#path;
	}
}

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

	/** @type {Reference[]} */
	references = [];

	/**
	 * (Re)assignments of this binding. Includes declarations such as `function x() {}`.
	 * @type {Array<{ value: Expression; scope: Scope }>}
	 */
	assignments = [];

	/**
	 * For `legacy_reactive`: its reactive dependencies
	 * @type {Binding[]}
	 */
	legacy_dependencies = [];

	/**
	 * Bindings that should be invalidated when this binding is invalidated
	 * @type {Set<Binding>}
	 */
	legacy_indirect_bindings = new Set();

	/**
	 * Legacy props: the `class` in `{ export klass as class}`. $props(): The `class` in { class: klass } = $props()
	 * @type {string | null}
	 */
	prop_alias = null;

	/**
	 * Additional metadata, varies per binding type
	 * @type {null | { inside_rest?: boolean; is_template_declaration?: boolean; exclude_props?: string[] }}
	 */
	metadata = null;

	mutated = false;
	reassigned = false;

	/**
	 * Instance-level declarations may follow (or contain) a top-level `await`. In these cases,
	 * any reads that occur in the template must wait for the corresponding promise to resolve
	 * otherwise the initial value will not have been assigned.
	 * It is a member expression of the form `$$blockers[n]`.
	 * TODO the blocker is set during transform which feels a bit grubby
	 * @type {MemberExpression | null}
	 */
	blocker = null;

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

		if (initial) {
			this.assignments.push({ value: /** @type {Expression} */ (initial), scope });
		}
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
	 * True if the possible values contains `UNKNOWN`
	 * @readonly
	 * @type {boolean}
	 */
	has_unknown = false;

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
	 * True if the value is known to be a primitive
	 * @readonly
	 * @type {boolean}
	 */
	is_primitive = true;

	/**
	 * True if the value is known to be a function
	 * @readonly
	 * @type {boolean}
	 */
	is_function = true;

	/**
	 * @readonly
	 * @type {any}
	 */
	value = undefined;

	/**
	 *
	 * @param {Scope} scope
	 * @param {Expression | FunctionDeclaration} expression
	 * @param {Set<any>} values
	 */
	constructor(scope, expression, values) {
		current_evaluations.set(expression, this);

		this.values = values;

		switch (expression.type) {
			case 'Literal': {
				this.values.add(expression.value);
				break;
			}

			case 'Identifier': {
				const binding = scope.get(expression.name);

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

					if (binding.initial?.type === 'SnippetBlock') {
						this.is_defined = true;
						this.is_known = false;
						this.values.add(UNKNOWN);
						break;
					}

					if (!binding.updated && binding.initial !== null && !is_prop) {
						binding.scope.evaluate(/** @type {Expression} */ (binding.initial), this.values);
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
				const a = scope.evaluate(/** @type {Expression} */ (expression.left)); // `left` cannot be `PrivateIdentifier` unless operator is `in`
				const b = scope.evaluate(expression.right);

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
				const test = scope.evaluate(expression.test);
				const consequent = scope.evaluate(expression.consequent);
				const alternate = scope.evaluate(expression.alternate);

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
				const a = scope.evaluate(expression.left);
				const b = scope.evaluate(expression.right);

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
				const argument = scope.evaluate(expression.argument);

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

			case 'CallExpression': {
				const keypath = get_global_keypath(expression.callee, scope);

				if (keypath) {
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
								if (arg?.type === 'ArrowFunctionExpression' && arg.body.type !== 'BlockStatement') {
									scope.evaluate(arg.body, this.values);
									break;
								}

								this.values.add(UNKNOWN);
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
						const values = expression.arguments.map((arg) => scope.evaluate(arg));

						if (fn && values.every((e) => e.is_known)) {
							this.values.add(fn(...values.map((e) => e.value)));
						} else {
							this.values.add(type);
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
					const e = scope.evaluate(expression.expressions[i]);

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

				if (keypath && Object.hasOwn(global_constants, keypath)) {
					this.values.add(global_constants[keypath]);
					break;
				}

				this.values.add(UNKNOWN);
				break;
			}

			case 'ArrowFunctionExpression':
			case 'FunctionExpression':
			case 'FunctionDeclaration': {
				this.values.add(FUNCTION);
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

			if (value !== FUNCTION) {
				this.is_function = false;
			}

			if (value == null || value === UNKNOWN) {
				this.is_defined = false;
			}

			if (value === UNKNOWN) {
				this.has_unknown = true;
				this.is_primitive = false;
			}
		}

		if (this.values.size > 1 || typeof this.value === 'symbol') {
			this.is_known = false;
		}

		current_evaluations.delete(expression);
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
	 * @type {Map<string, Reference[]>}
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
				// declaring function twice is also caught by the parser
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

		// Use cached counter to skip names already known to be taken (avoids O(n²) scanning)
		let n = this.root.next_counter(preferred_name);
		let name;

		if (n === 0) {
			name = preferred_name;
			n = 1;
		} else {
			name = `${preferred_name}_${n}`;
			n++;
		}

		while (
			this.references.has(name) ||
			this.declarations.has(name) ||
			this.root.conflicts.has(name) ||
			is_reserved(name)
		) {
			name = `${preferred_name}_${n++}`;
		}

		this.root.set_counter(preferred_name, n);
		this.references.set(name, []);
		this.root.conflicts.add(name);
		return name;
	}

	/**
	 * @param {string} name
	 * @returns {Binding | null}
	 */
	get(name) {
		/** @type {Scope | null} */
		let scope = this;
		do {
			const binding = scope.declarations.get(name);
			if (binding !== undefined) return binding;
			scope = scope.parent;
		} while (scope !== null);
		return null;
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
	 * @param {Reference} reference
	 * @param {Binding | null | undefined} [binding] what the parser resolved the reference to
	 * @returns {Binding | null} what the reference resolved to; null for a global
	 */
	record(reference, binding = undefined) {
		const { name } = reference.node;
		let references = this.references.get(name);

		if (!references) this.references.set(name, (references = []));

		references.push(reference);

		// the parser resolved the reference already, or the name walks up
		binding ??= this.declarations.get(name);
		if (binding !== undefined && binding !== null && binding.scope === this) {
			binding.references.push(reference);
			return binding;
		}
		if (this.parent) return this.parent.record(reference, binding);
		// no binding was found, and this is the top level scope,
		// which means this is a global
		this.root.conflicts.add(name);
		return null;
	}

	/**
	 * Does partial evaluation to find an exact value or at least the rough type of the expression.
	 * Only call this once scope has been fully generated in a first pass,
	 * else this evaluates on incomplete data and may yield wrong results.
	 * @param {Expression} expression
	 * @param {Set<any>} [values]
	 */
	evaluate(expression, values = new Set()) {
		const current = current_evaluations.get(expression);
		if (current) return current;

		return new Evaluation(this, expression, values);
	}
}

/**
 * Track which expressions are currently being evaluated — this allows
 * us to prevent cyclical evaluations without passing the map around
 * @type {Map<Expression | FunctionDeclaration, Evaluation>}
 */
const current_evaluations = new Map();

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

	/**
	 * Tracks the next suffix counter per name to avoid O(n) rescanning in generate/unique.
	 * @type {Map<string, number>}
	 */
	#name_counters = new Map();

	/**
	 * @param {string} name
	 * @returns {number}
	 */
	next_counter(name) {
		return this.#name_counters.get(name) ?? 0;
	}

	/**
	 * @param {string} name
	 * @param {number} value
	 */
	set_counter(name, value) {
		this.#name_counters.set(name, value);
	}

	/**
	 * @param {string} preferred_name
	 */
	unique(preferred_name) {
		preferred_name = preferred_name.replace(/[^a-zA-Z0-9_$]/g, '_');
		let n = this.#name_counters.get(preferred_name) ?? 0;
		let final_name;

		if (n === 0) {
			final_name = preferred_name;
			n = 1;
		} else {
			final_name = `${preferred_name}_${n}`;
			n++;
		}

		while (this.conflicts.has(final_name)) {
			final_name = `${preferred_name}_${n++}`;
		}

		this.#name_counters.set(preferred_name, n);
		this.conflicts.add(final_name);
		const id = b.id(final_name);
		return id;
	}
}

/**
 * @typedef {{ ast: Program, scope: Scope, scopes: Map<AST.SvelteNode, Scope>, has_await: boolean }} Js
 * @typedef {{ scope: Scope, scopes: Map<AST.SvelteNode, Scope>, has_await: boolean }} Scopes
 */

const COMPONENTS = new Set(['Component', 'SvelteComponent', 'SvelteSelf']);
const ELEMENTS = new Set(['RegularElement', 'SvelteElement', 'SlotElement', 'SvelteFragment']);
const HOSTS = new Set(['EachBlock', 'SnippetBlock', 'AwaitBlock', 'LetDirective']);

/**
 * Whether `binding` is in `scope` or a scope around it.
 * @param {Scope | null} scope
 * @param {Binding} binding
 */
function sees(scope, binding) {
	for (; scope !== null; scope = scope.parent) if (scope === binding.scope) return true;
	return false;
}

/** @returns {Program} */
function empty_program() {
	return { type: 'Program', sourceType: 'module', start: -1, end: -1, body: [] };
}

/**
 * Svelte's scopes, built in one pass over the scopes, bindings and references the parser answered
 * for the whole document, a component's or a module's: a scope for each of its scopes, a binding
 * for each of its bindings with the kind the template gives it, a reference for each of its
 * references, bound to what the parser resolved it to. Svelte's own scopes stand among them: one
 * per element, the one an await block's value is read in, a component's slots, a `$:` statement's.
 * @param {AST.Root | Program} document
 * @param {ScopeRoot} root
 * @returns {{ module: Js, instance: Js, template: Scopes }}
 */
export function create_scopes(document, root) {
	const tables = /** @type {import('../utils/ast.js').Document} */ (tables_of(document));
	const component = document.type === 'Root' ? /** @type {AST.Root} */ (document) : null;
	const module_ast = component
		? component.module?.content ?? empty_program()
		: /** @type {Program} */ (document);
	const instance_ast = component?.instance?.content ?? empty_program();

	/**
	 * The scope a walk switches to at each node that opens one.
	 * @type {Map<AST.SvelteNode, Scope>}
	 */
	const scopes = new Map();
	/** @type {Map<object, Scope>} the scope what sits under a node is in, beside the nodes `scopes` keys: a block's parts, a component's content */
	const near = new Map();
	/** @type {Map<object, Scope>} a named slot's scope, by the child that fills it */
	const slotted = new Map();
	/** @type {Map<import('@teasel/parser').Scope, Scope>} where each of the parser's scopes declares; a function's holds its parameters */
	const ours = new Map();
	/** @type {Map<import('@teasel/parser').Scope, Scope>} a function's body, which holds the rest */
	const bodies = new Map();
	/** @type {Map<import('@teasel/parser').Binding, Binding>} the parser's bindings and ours */
	const from_parser = new Map();
	/** @type {Map<import('@teasel/parser').Binding, Binding>} an await value's second declaration, where its pattern is read */
	const read_at = new Map();
	/** @type {Set<Binding>} bindings the parser sees from more places than the template lets them be seen: a component's `let:`, an await value */
	const fenced = new Set();

	const module = new Scope(root, null, false);
	scopes.set(module_ast, module);
	near.set(module_ast, module);
	ours.set(tables.scope, module);
	const instance = module.child();
	scopes.set(instance_ast, instance);
	near.set(instance_ast, instance);
	/** @type {Scope} */
	let template = instance;

	/**
	 * The scope the nodes under `node` are in.
	 * @param {any} node
	 * @returns {Scope}
	 */
	function at(node) {
		for (let n = node; n !== undefined; n = parentOf(n)) {
			const scope = near.get(n) ?? slotted.get(n);
			if (scope !== undefined) return scope;
		}
		return module;
	}

	/**
	 * The scope a node sits in.
	 * @param {any} node
	 */
	function around(node) {
		return slotted.get(node) ?? at(parentOf(node));
	}

	/** @param {any} element */
	function element_scope(element) {
		let scope = scopes.get(element);
		if (scope === undefined) {
			scope = around(element).child();
			scopes.set(element, scope);
			near.set(element, scope);
		}
		return scope;
	}

	/**
	 * A component's slots: the default, which holds its content, and one per child a named slot takes.
	 * @param {AST.Component | AST.SvelteComponent | AST.SvelteSelf} node
	 */
	function slots(node) {
		if (node.metadata.scopes === undefined) {
			const outer = around(node);
			node.metadata.scopes = { default: outer.child() };
			for (const child of node.fragment.nodes) {
				const name = determine_slot(child);
				if (name !== null) slotted.set(child, (node.metadata.scopes[name] = outer.child()));
			}
		}
		return node.metadata.scopes;
	}

	/** @param {any} node a component that `let:` declares in */
	function let_scope(node) {
		return determine_slot(node) ? around(node) : slots(node).default;
	}

	/** @type {AST.EachBlock[]} */
	const eaches = [];

	/**
	 * @param {import('@teasel/parser').Scope} parsed
	 * @param {any} node
	 */
	function fragment(parsed, node) {
		const parent = /** @type {any} */ (parentOf(node));
		/** @type {Scope} */
		let scope;
		if (parent.type === 'Root') {
			template = instance.child();
			scope = template.child(node.metadata.transparent);
			scopes.set(node, scope);
		} else if (parent.type === 'EachBlock' && parent.body === node) {
			scope = around(parent).child();
			scopes.set(parent, scope);
			if (parent.context) near.set(parent.context, scope);
			if (parent.key) near.set(parent.key, scope);
			eaches.push(parent);
		} else if (parent.type === 'SnippetBlock' && parent.body === node) {
			scope = around(parent).child();
			scopes.set(parent, scope);
			for (const param of parent.parameters) near.set(param, scope);
		} else if (COMPONENTS.has(parent.type)) {
			scope = slots(parent).default;
		} else {
			scope = (ELEMENTS.has(parent.type) ? element_scope(parent) : at(parent)).child(
				node.metadata.transparent
			);
			scopes.set(node, scope);
			if (parent.type === 'AwaitBlock') {
				const pattern =
					parent.then === node ? parent.value : parent.catch === node ? parent.error : null;
				if (pattern) {
					const inside = at(parent).child();
					scopes.set(pattern, inside);
					near.set(pattern, inside);
				}
			}
		}
		near.set(node, scope);
		ours.set(parsed, scope);
	}

	/**
	 * The `$:` statements of an instance script, each a scope of its own; an undeclared name one
	 * assigns is declared by it.
	 * @type {Identifier[]}
	 */
	const possible_implicit_declarations = [];
	if (component) {
		for (const node of instance_ast.body) {
			if (node.type !== 'LabeledStatement' || node.label.name !== '$') continue;
			const inside = instance.child();
			scopes.set(node, inside);
			near.set(node, inside);
			if (
				node.body.type === 'ExpressionStatement' &&
				node.body.expression.type === 'AssignmentExpression'
			) {
				for (const id of extract_identifiers(node.body.expression.left)) {
					if (!id.name.startsWith('$')) possible_implicit_declarations.push(id);
				}
			}
		}
	}

	let has_await = false;

	for (const parsed of tables.scopes) {
		const node = /** @type {any} */ (parsed.node);
		switch (parsed.kind) {
			case 'module':
				ours.set(parsed, module);
				break;
			case 'script':
				ours.set(parsed, component ? instance : module);
				break;
			case 'fragment':
				// without an instance script, the scope that script would open has no node
				if (node === null) {
					ours.set(parsed, instance);
					break;
				}
				has_await ||= parsed.topLevelAwait;
				fragment(parsed, node);
				break;
			case 'function': {
				// the parameters live one above the body, which holds the non-porous function scope
				const params = around(node).child(true);
				scopes.set(node, params);
				near.set(node, params);
				ours.set(parsed, params);
				if (parsed.parent?.kind === 'function-name') ours.set(parsed.parent, params);
				if (node.body.type === 'BlockStatement') {
					const body = params.child();
					scopes.set(node.body, body);
					near.set(node.body, body);
					bodies.set(parsed, body);
				}
				break;
			}
			case 'block':
				// a `let:` declares in a component's default slot or in the element that carries it
				if (COMPONENTS.has(node.type)) {
					ours.set(parsed, let_scope(node));
					break;
				}
				if (ELEMENTS.has(node.type)) {
					ours.set(parsed, element_scope(node));
					break;
				}
			// fallthrough
			case 'for':
			case 'switch':
			case 'catch':
			case 'static-block': {
				const inside = around(node).child(true);
				scopes.set(node, inside);
				near.set(node, inside);
				ours.set(parsed, inside);
				break;
			}
			default:
				ours.set(
					parsed,
					node ? around(node) : /** @type {Scope} */ (ours.get(/** @type {any} */ (parsed.parent)))
				);
		}
	}

	/** @type {[VariableDeclarator, Binding][]} */
	const declarators = [];

	/**
	 * A binding of a template block, by the block that declares it and the part of it that does.
	 * @param {import('@teasel/parser').Declared} parsed
	 * @returns {Binding | undefined}
	 */
	function declare_hosted(parsed) {
		const id = parsed.node;
		/** @type {any} */
		let part = id;
		/** @type {any} */
		let host = parentOf(id);
		let rest = false;
		while (host !== undefined && !HOSTS.has(host.type)) {
			if (host.type === 'RestElement') rest = true;
			part = host;
			host = parentOf(host);
		}
		switch (host?.type) {
			case 'EachBlock': {
				const scope = /** @type {Scope} */ (scopes.get(host));
				if (part === host.context) {
					const binding = scope.declare(id, 'each', 'const');
					binding.metadata = { inside_rest: rest };
					return binding;
				}
				const keyed =
					host.key &&
					(host.key.type !== 'Identifier' || !host.index || host.key.name !== host.index);
				return scope.declare(id, keyed ? 'template' : 'static', 'const', host);
			}
			case 'SnippetBlock':
				if (part === host.expression) return around(host).declare(id, 'normal', 'function', host);
				return /** @type {Scope} */ (scopes.get(host)).declare(id, 'snippet', 'let');
			case 'AwaitBlock': {
				const value = part === host.value;
				const binding = /** @type {Scope} */ (near.get(value ? host.then : host.catch)).declare(
					id,
					'template',
					'const'
				);
				read_at.set(parsed, /** @type {Scope} */ (near.get(part)).declare(id, 'normal', 'const'));
				fenced.add(binding);
				return binding;
			}
			case 'LetDirective': {
				const owner = /** @type {any} */ (parentOf(host));
				const scope = COMPONENTS.has(owner.type) ? let_scope(owner) : element_scope(owner);
				const binding = scope.declare(id, 'template', 'const');
				let declared = scope.declarators.get(host);
				if (!declared) scope.declarators.set(host, (declared = []));
				declared.push(binding);
				if (COMPONENTS.has(owner.type)) fenced.add(binding);
				return binding;
			}
		}
	}

	/**
	 * @param {{ params: Pattern[] } | null} holder
	 * @param {Identifier} id
	 */
	function is_rest_param(holder, id) {
		const last = holder?.params.at(-1);
		return last?.type === 'RestElement' && extract_identifiers(last).includes(id);
	}

	for (const parsed of tables.bindings) {
		// no node: `arguments`, or a declaration erased with the TypeScript it belonged to
		if (parsed.node === null || parsed.kind === 'class-name') continue;
		if (parsed.kind === 'pattern') {
			const binding = declare_hosted(parsed);
			if (binding !== undefined) from_parser.set(parsed, binding);
			continue;
		}
		const declaration = /** @type {any} */ (parsed.declaration);
		/** @type {DeclarationKind} */
		let kind = 'let';
		/** @type {Binding['initial']} */
		let initial = null;
		switch (parsed.kind) {
			case 'var':
			case 'let':
			case 'const':
				kind = parsed.kind;
				initial = declaration?.init ?? null;
				break;
			case 'function':
			case 'import':
				kind = parsed.kind;
				break;
			case 'function-name':
				kind = 'function';
				break;
			case 'param':
				kind = is_rest_param(declaration, parsed.node) ? 'rest_param' : 'param';
				break;
		}
		if (declaration?.type === 'FunctionDeclaration' || declaration?.type === 'ClassDeclaration') {
			initial = declaration;
		}
		const scope = /** @type {Scope} */ (
			parsed.kind === 'param'
				? ours.get(parsed.scope)
				: bodies.get(parsed.scope) ?? ours.get(parsed.scope)
		);
		const tag =
			declaration?.type === 'VariableDeclarator' &&
			parentOf(parentOf(declaration))?.type === 'ConstTag';
		const binding = scope.declare(parsed.node, tag ? 'template' : 'normal', kind, initial);
		from_parser.set(parsed, binding);
		if (declaration?.type === 'VariableDeclarator') {
			binding.metadata = { is_template_declaration: true };
			declarators.push([declaration, binding]);
		}
	}

	// numbered inner blocks first, as the walk that built these scopes before named them
	eaches.sort((a, b) => a.end - b.end);
	for (const node of eaches) {
		const scope = /** @type {Scope} */ (scopes.get(node));
		node.metadata = {
			expression: new ExpressionMetadata(),
			keyed: false,
			contains_group_binding: false,
			index: root.unique('$$index'),
			declarations: scope.declarations,
			is_controlled: false,
			// filled in during analysis
			transitive_deps: new Set()
		};
	}

	for (const id of possible_implicit_declarations) {
		// TODO can also be legacy_reactive if declared outside of reactive statement
		if (instance.get(id.name) === null) instance.declare(id, 'legacy_reactive', 'let');
	}

	for (const [ast, scope] of [
		[module_ast, module],
		[instance_ast, instance]
	]) {
		for (const node of /** @type {Program} */ (ast).body) {
			if (node.type !== 'ImportDeclaration') continue;
			// a type-only import binds nothing to the parser; the declaration is the initial value
			for (const specifier of node.specifiers) {
				const parsed = referenceOf(specifier.local)?.binding;
				const binding =
					(parsed && from_parser.get(parsed)) ??
					/** @type {Scope} */ (scope).declare(specifier.local, 'normal', 'import', node);
				binding.initial = node;
			}
		}
	}

	// each region's references in source order, the template's after the names it reads outside
	// JavaScript, as the walk recorded them before
	/** @type {Reference[][]} */
	const regions = [[], [], []];
	/** @param {any} node */
	const region = (node) =>
		node.start >= /** @type {number} */ (module_ast.start) &&
		node.end <= /** @type {number} */ (module_ast.end)
			? 0
			: node.start >= /** @type {number} */ (instance_ast.start) &&
				  node.end <= /** @type {number} */ (instance_ast.end)
				? 1
				: 2;

	/** @type {Reference[]} */
	const named = [];
	/** @type {[Scope, Identifier | MemberExpression, Expression][]} */
	const updates = [];
	for (const entry of tables.names ?? []) {
		if ('component' in entry) {
			const node = entry.component;
			slots(node);
			if (node.type === 'Component') {
				named.push(
					new Reference(b.id(node.name.split('.')[0]), around(node), undefined, undefined, node)
				);
			}
		} else if ('bind' in entry) {
			const expression = entry.bind.expression;
			if (expression.type !== 'SequenceExpression')
				updates.push([at(entry.bind), expression, expression]);
		} else {
			named.push(new Reference(b.id(entry.name), at(entry.host), undefined, undefined, entry.host));
		}
	}

	// a declaring identifier counts as a reference to what it declares, as the walk had it;
	// an import's did not, since the walk never entered an import declaration
	for (const parsed of tables.bindings) {
		if (parsed.node === null || parsed.kind === 'import') continue;
		const declared = read_at.get(parsed) ?? from_parser.get(parsed);
		regions[region(parsed.node)].push(
			new Reference(parsed.node, declared?.scope ?? at(parsed.node), declared, undefined)
		);
	}
	for (const parsed of tables.references) {
		if (parsed.declares) {
			// `var x` again: the declarator declares the binding the first one made
			const binding = parsed.binding === null ? undefined : from_parser.get(parsed.binding);
			/** @type {any} */
			let declarator = parentOf(parsed.node);
			while (declarator && /Pattern$|^Property$|^RestElement$/.test(declarator.type)) {
				declarator = parentOf(declarator);
			}
			if (binding && declarator?.type === 'VariableDeclarator') {
				declarators.push([declarator, binding]);
				// an initializer there assigns again, so the first one is not the value
				if (parsed.write) binding.reassigned = true;
			}
			continue;
		}
		const scope = at(parsed.node);
		let binding = parsed.binding === null ? undefined : from_parser.get(parsed.binding);
		if (binding !== undefined && fenced.has(binding) && !sees(scope, binding)) binding = undefined;
		regions[region(parsed.node)].push(new Reference(parsed.node, scope, binding, parsed));
	}

	for (const [declarator, binding] of declarators) {
		const here = at(declarator);
		let declared = here.declarators.get(declarator);
		if (!declared) here.declarators.set(declarator, (declared = []));
		declared.push(binding);
	}

	const by_start = (/** @type {Reference} */ a, /** @type {Reference} */ b) =>
		/** @type {number} */ (a.node.start) - /** @type {number} */ (b.node.start);
	for (const references of [
		regions[0].sort(by_start),
		regions[1].sort(by_start),
		named,
		regions[2].sort(by_start)
	]) {
		for (const reference of references) {
			const { scope, parsed } = reference;
			const binding = scope.record(reference, reference.resolved);
			// what the parser saw the identifier do; a declaring identifier is no reference to it
			if (binding === null || parsed === undefined) continue;
			if (parsed.write) {
				binding.reassigned = true;
				binding.assignments.push({ value: parsed.writeExpr ?? reference.node, scope });
			}
			if (parsed.mutate && !deleted(reference.node)) binding.mutated = true;
		}
	}

	for (const [scope, node, value] of updates) {
		for (const expression of unwrap_pattern(node)) {
			const left = object(expression);
			const binding = left && scope.get(left.name);

			if (binding !== null && left !== binding.node) {
				if (left === expression) {
					binding.reassigned = true;
					binding.assignments.push({ value, scope });
				} else {
					binding.mutated = true;
				}
			}
		}
	}

	return {
		module: { ast: module_ast, scope: module, scopes, has_await: tables.scope.topLevelAwait },
		instance: {
			ast: instance_ast,
			scope: instance,
			scopes,
			has_await: tables.scopes.some((s) => s.kind === 'script' && s.topLevelAwait)
		},
		template: { scope: template, scopes, has_await }
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

	if (!keypath || !is_rune(keypath)) return null;
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
		if (n.computed) return null;
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
 * Svelte counts a member assigned to or updated as a mutation, and `delete` is neither.
 * @param {Identifier} id the root of the chain the parser saw mutated
 */
function deleted(id) {
	let node = parentOf(id);
	while (node?.type === 'MemberExpression' || node?.type === 'ChainExpression')
		node = parentOf(node);
	return node?.type === 'UnaryExpression' && node.operator === 'delete';
}

/**
 * @param {Expression} node
 * @param {Scope | null} scope
 */
export function should_proxy(node, scope) {
	if (
		!node ||
		node.type === 'Literal' ||
		node.type === 'TemplateLiteral' ||
		node.type === 'ArrowFunctionExpression' ||
		node.type === 'FunctionExpression' ||
		node.type === 'UnaryExpression' ||
		node.type === 'BinaryExpression' ||
		(node.type === 'Identifier' && node.name === 'undefined')
	) {
		return false;
	}

	if (node.type === 'Identifier' && scope !== null) {
		const binding = scope.get(node.name);
		// Let's see if the reference is something that can be proxied
		if (
			binding !== null &&
			!binding.reassigned &&
			binding.initial !== null &&
			binding.initial.type !== 'FunctionDeclaration' &&
			binding.initial.type !== 'ClassDeclaration' &&
			binding.initial.type !== 'ImportDeclaration' &&
			binding.initial.type !== 'EachBlock' &&
			binding.initial.type !== 'SnippetBlock'
		) {
			return should_proxy(binding.initial, null);
		}
	}

	return true;
}

/**
 * Checks if the name is valid, which it is when it's not starting with (or is) a dollar sign or if it's a function parameter.
 * The second argument is the depth of the scope, which is there for backwards compatibility reasons: In Svelte 4, you
 * were allowed to define `$`-prefixed variables anywhere below the top level of components. Once legacy mode is gone, this
 * argument can be removed / the call sites adjusted accordingly.
 * @param {Binding | null} binding
 * @param {number | undefined} [function_depth]
 */
export function validate_identifier_name(binding, function_depth) {
	if (!binding) return;

	const declaration_kind = binding.declaration_kind;

	if (
		declaration_kind !== 'synthetic' &&
		declaration_kind !== 'param' &&
		declaration_kind !== 'rest_param' &&
		(!function_depth || function_depth <= 1)
	) {
		const node = binding.node;

		if (node.name === '$') {
			e.dollar_binding_invalid(node);
		} else if (
			node.name.startsWith('$') &&
			// import type { $Type } from "" - these are normally already filtered out,
			// but for the migration they aren't, and throwing here is preventing the migration to complete
			// TODO -> once migration script is gone we can remove this check
			!(
				binding.initial?.type === 'ImportDeclaration' &&
				/** @type {any} */ (binding.initial).importKind === 'type'
			)
		) {
			e.dollar_prefix_invalid(node);
		}
	}
}
