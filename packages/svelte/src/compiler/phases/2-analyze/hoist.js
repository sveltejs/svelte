/** @import * as ESTree from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ComponentAnalysis, Js } from '../types' */
/** @import { Scope } from '../scope.js' */
import { walk } from 'zimmerframe';
import is_reference from 'is-reference';
import { get_rune } from '../scope.js';
import {
	extract_identifiers,
	has_await_expression,
	object,
	unwrap_pattern
} from '../../utils/ast.js';

// Moves the creation of each `$derived(await ...)` up the `run(...)` chain, past every entry it doesn't
// depend on, so that it runs in parallel with them (see `hoisted_to`). Async deriveds are assumed to be pure,
// so one can be created before an entry unless it might read something the entry declares or writes.
//
// What a derived might read is everything it can `touch`. What an entry might write is found with a few
// simple heuristics, which err on the side of caution where it's cheap to do so:
// - calling a function we can see writes what it writes, and everything that's passed to a parameter it writes.
//   A parameter counts as written unless it's obviously only read
// - calling something we can't see into (imports, props, globals, built-ins, methods of objects we can't see
//   into) writes everything that's passed to it, including the receiver of a method. This only concerns code
//   outside of async deriveds, which are pure: `$derived(await api.get(a))` doesn't write `api` or `a`
// - methods are only followed if they belong to an object literal held by a `const`. So are getters and setters,
//   but when we can't see the object, we assume that any getter (or setter) with the key we access might run —
//   any at all if we don't know the key, as with spreads, rest patterns and computed keys. Destructuring
//   accesses each of its keys
// - `$effect`s only run once all async work is done, while `$effect.pre` and `$effect.root` run right away
//
// `<script module>` is analyzed like the instance script. The template is ignored, as it only runs
// once the entries it depends on are done.
//
//
// The following cases are not handled correctly (false negatives or false positives), but since they are really
// arcane and you shouldn't write code like that, and because it would double the amount of logic we would need,
// we deliberately don't handle them:
//
//   1. Mutating through a nested alias (wrong data)

//   ─ svelte ────────────────────────────────────────────────────────────
//   <script>
//         import { getUser, getTickets } from './api.js';

//         const filters = { status: 'open' };
//         const view = { filters, page: 1 };

//         const user = await getUser();
//         view.filters.status = user.defaultStatus; // really mutates `filters`

//         const tickets = $derived(await getTickets(filters.status));
//   </script>
//   ─────────────────────────────────────────────────────────────────────

//   Assigning through view.filters only counts as writing view (and direct aliases like const v = view). It doesn't count as writing the objects stored inside view. tickets reads filters, sees no conflict, and is
//   created before getUser() runs. So it fetches 'open' tickets instead of the user's default. Because filters is a plain object, nothing ever corrects it. If filters were $state, the derived should re-run when
//   the mutation happens, so you'd get a wasted request rather than wrong data.

//   2. Aliasing through ??, a ternary or a function return (wrong data)

//   ─ svelte ──────────────────────────────────────────────
//   <script>
//         import { loadPreferences, loadStyles } from './api.js';
//         let { theme } = $props();

//         const local = { mode: 'light' };
//         const active = theme ?? local; // may be `local`

//         const prefs = await loadPreferences();
//         active.mode = prefs.mode;

//         const styles = $derived(await loadStyles(local.mode));
//   </script>
//   ───────────────────────────────────────────────────────

//   Aliases are only tracked through plain references (const a = b, const a = b.c, const { x } = settings). The last one is caught. ??, ? : and function return values aren't tracked, so mutating active doesn't
//   count as writing local. Same outcome as case 1. The const { x } = { x: inner } probe from the table is the same gap in a less realistic form.

//   3. items.reduce() / items.map() (lost parallelism)

//   ─ svelte ─────────────────────────────────────────────────────────
//   <script>
//         import { getShippingRates, getRecommendations } from './api.js';
//         let { cart } = $props();
//         const items = [...cart.items];

//         const shipping = await getShippingRates();
//         const subtotal = items.reduce((sum, item) => sum + item.price, 0);

//         const recommendations = $derived(await getRecommendations(items));
//   </script>
//   ──────────────────────────────────────────────────────────────────

//   We can't see Array.prototype.reduce, so it counts as writing items. recommendations has to wait for getShippingRates() instead of running alongside it: a waterfall, but correct data. Moving subtotal into a
//   $derived would avoid it, since deriveds aren't checked.

//   4. Lookups on built-in objects like Map or URLSearchParams (lost parallelism)

//   ─ svelte ───────────────────────────────────────────
//   <script>
//         import { getSession, search } from './api.js';
//         const params = new URLSearchParams(location.search);

//         const session = await getSession();
//         const sort = params.get('sort') ?? 'relevance';

//         const results = $derived(await search(params));
//   </script>
//   ────────────────────────────────────────────────────

//   Same rule as case 3: params.get() counts as writing params, so the search waits for the session. Any method call on a local Map, Set, Date, URL or store instance does the same.

/** @typedef {ESTree.FunctionDeclaration | ESTree.FunctionExpression | ESTree.ArrowFunctionExpression} Fn */
/** @typedef {{ node: ESTree.Node; scope: Scope }} Located */

/**
 * What calling a function might do: write `writes`, and what is passed to the parameters flagged in `params`
 * (to any of them if `args`, because it uses `arguments`), and its receiver if `self`
 * @typedef {{ writes: Set<Binding>; params: boolean[]; args: boolean; self: boolean }} Summary
 */

/**
 * @param {Js} module
 * @param {Js} instance
 * @param {ComponentAnalysis['instance_body']['async']} entries
 */
export function hoist_async_deriveds(module, instance, entries) {
	/** @type {Array<[number, ESTree.Expression]>} */
	const candidates = [];

	for (let index = 1; index < entries.length; index += 1) {
		const [node, ...rest] = entries[index].nodes;

		if (
			rest.length === 0 &&
			node.type === 'VariableDeclarator' &&
			node.init &&
			get_rune(node.init, instance.scope) === '$derived' &&
			has_await_expression(node.init)
		) {
			candidates.push([index, node.init]);
		}
	}

	if (candidates.length === 0) return;

	const program = analyze(module, instance);
	if (program === null) return; // `eval` can do anything

	/** @type {Array<Set<Binding>>} */
	const outputs = [];

	for (const [index, init] of candidates) {
		const reads = program.touch(init, instance.scope);
		let target = index;

		while (target > 0) {
			const out = (outputs[target - 1] ??= program.outputs(entries[target - 1].nodes));
			if ([...out].some((binding) => reads.has(binding))) break;
			target -= 1;
		}

		if (target < index) entries[index].hoisted_to = target;
	}
}

/**
 * @param {Js} module
 * @param {Js} instance
 */
function analyze(module, instance) {
	/** @param {ESTree.Node} node */
	const scope_of = (node) => instance.scopes.get(node) ?? module.scopes.get(node);

	/** Values assigned to bindings in ways `binding.assignments` doesn't record @type {Map<Binding, Located[]>} */
	const sources = new Map();

	/**
	 * Values that might be stored in the objects held by bindings, as in `object.key = value` — or `object.method(value)`,
	 * because any method might store its arguments in its receiver, like `array.push(value)` does
	 * @type {Map<Binding, Located[]>}
	 */
	const contents = new Map();

	/** Bindings holding objects that properties are assigned to, which might replace the methods we see @type {Set<Binding>} */
	const assigned = new Set();

	/** Everything passed to a call, which is what the parameter of a function might hold if we don't know its callers @type {Located[]} */
	const pool = [];

	/** @type {Located[]} */
	const throws = [];

	/** @type {Set<Binding>} */
	const catch_params = new Set();

	/** Functions by their scope @type {Map<Scope, Fn>} */
	const functions = new Map();

	/** Keys of object members and stored properties, with `'*'` for computed ones */
	const keys = new Set();

	/** All getters and setters, of object literals and classes @type {Array<{ kind: 'get' | 'set'; key: string; fn: Fn }>} */
	const accessors = [];

	let has_eval = false;

	/**
	 * @param {Map<Binding, Located[]>} map
	 * @param {Binding | null | undefined} binding
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 */
	const add = (map, binding, node, scope) => {
		if (binding) map.set(binding, [...(map.get(binding) ?? []), { node, scope }]);
	};

	/**
	 * The binding at the root of `a.b.c`
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 */
	const root = (node, scope) => {
		const id = node.type === 'Identifier' || node.type === 'MemberExpression' ? object(node) : null;
		return id && scope.get(id.name);
	};

	for (const ast of [module.ast, instance.ast]) {
		const program = /** @type {ESTree.Node} */ (ast);

		walk(program, /** @type {Scope} */ (scope_of(program)), {
			_(node, { state, next, path }) {
				const scope = scope_of(node) ?? state;

				switch (node.type) {
					case 'FunctionDeclaration':
					case 'FunctionExpression':
					case 'ArrowFunctionExpression':
						functions.set(scope, node);

						// a named function expression can refer to itself, and a `var` can shadow a function declaration
						if (node.type === 'FunctionExpression' && node.id) {
							add(sources, scope.get(node.id.name), node, state);
						} else if (node.type === 'FunctionDeclaration' && node.id) {
							const binding = state.get(node.id.name);
							if (binding?.initial !== node) add(sources, binding, node, state);
						}
						break;

					case 'VariableDeclarator':
						// `var`s can be redeclared, and lose their initial value when declared in a nested block
						for (const id of node.init ? extract_identifiers(node.id) : []) {
							const binding = state.get(id.name);
							if (!binding?.assignments.some(({ value }) => value === node.init)) {
								add(sources, binding, /** @type {ESTree.Expression} */ (node.init), state);
							}
						}
						break;

					case 'AssignmentPattern':
						for (const id of extract_identifiers(node.left)) {
							add(sources, scope.get(id.name), node.right, scope);
						}
						break;

					case 'ForOfStatement':
					case 'ForInStatement': {
						const left =
							node.left.type === 'VariableDeclaration' ? node.left.declarations[0].id : node.left;

						for (const target of unwrap_pattern(left)) {
							const binding = root(target, scope);

							if (target.type === 'Identifier') {
								add(sources, binding, node.right, scope);
							} else {
								add(contents, binding, node.right, scope);
								if (binding) assigned.add(binding);
							}
						}
						break;
					}

					case 'CatchClause':
						for (const id of node.param ? extract_identifiers(node.param) : []) {
							const binding = scope.get(id.name);
							if (binding) catch_params.add(binding);
						}
						break;

					case 'ThrowStatement':
						throws.push({ node: node.argument, scope });
						break;

					case 'AssignmentExpression':
						for (const target of unwrap_pattern(node.left)) {
							if (target.type !== 'MemberExpression') continue;

							const binding = root(target, scope);
							add(contents, binding, node.right, scope);
							if (binding) assigned.add(binding);
							keys.add(static_key(target));
						}
						break;

					case 'CallExpression':
					case 'NewExpression':
					case 'TaggedTemplateExpression': {
						const callee = node.type === 'TaggedTemplateExpression' ? node.tag : node.callee;

						// strings and numbers can't store anything
						const receiver =
							callee.type === 'MemberExpression' &&
							callee.object.type !== 'Super' &&
							!is_primitive(callee.object, scope)
								? root(callee.object, scope)
								: null;

						if (callee.type === 'Identifier' && callee.name === 'eval' && !scope.get('eval')) {
							has_eval = true;
						}

						for (const arg of get_arguments(node)) {
							pool.push({ node: arg, scope });
							add(contents, receiver, arg, scope);
						}
						break;
					}

					case 'Property':
						if (path.at(-1)?.type !== 'ObjectExpression') break;
						keys.add(property_key(node));

						if (node.kind !== 'init') {
							const fn = /** @type {Fn} */ (node.value);
							accessors.push({ kind: node.kind, key: property_key(node), fn });
						}
						break;

					case 'MethodDefinition':
					case 'PropertyDefinition':
						keys.add(property_key(node));

						if (node.type === 'MethodDefinition' && (node.kind === 'get' || node.kind === 'set')) {
							accessors.push({ kind: node.kind, key: property_key(node), fn: node.value });
						}
						break;
				}

				next(scope);
			}
		});
	}

	if (has_eval) return null;

	/** Whether converting something to a primitive might call code we can see */
	const coercible = keys.has('valueOf') || keys.has('toString') || keys.has('*');

	/** Whether awaiting something might call a `then` method we can see */
	const thenable = keys.has('then') || keys.has('*');

	/**
	 * Everything that evaluating `node` (and calling what it evaluates to) might read: the bindings it references,
	 * and transitively whatever might flow into those, including the code of functions and what's stored in objects
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 * @param {Fn | null} [inside] a function whose parameters we're not interested in
	 * @returns {Set<Binding>}
	 */
	function touch(node, scope, inside = null) {
		/** @type {Set<Binding>} */
		const bindings = new Set();

		/** @type {Set<ESTree.Node>} */
		const seen = new Set();

		let pooled = false;

		/**
		 * @param {ESTree.Node} node
		 * @param {Scope} scope
		 */
		const visit = (node, scope) => {
			if (seen.has(node)) return;
			seen.add(node);

			walk(node, scope, {
				_(node, { state, next }) {
					next(scope_of(node) ?? state);
				},
				Identifier(node, { state, path }) {
					const parent = path.at(-1);
					if (parent && !is_reference(node, parent)) return;

					const binding = state.get(node.name);
					if (binding) add(binding, path);
				}
			});
		};

		/**
		 * @param {Binding} binding
		 * @param {ESTree.Node[]} path
		 */
		const add = (binding, path) => {
			if (!bindings.has(binding)) {
				bindings.add(binding);

				for (const { value, scope } of binding.assignments) visit(value, scope);
				for (const { node, scope } of sources.get(binding) ?? []) visit(node, scope);
				for (const { node, scope } of contents.get(binding) ?? []) visit(node, scope);
				if (catch_params.has(binding)) throws.forEach(({ node, scope }) => visit(node, scope));

				const store = get_store(binding);
				if (store) add(store, []);
			}

			// A parameter's value might escape its function, as in `callback = param`. Unless we got here through
			// the code that runs when it's invoked (whose arguments we see anyway), it could be anything passed to anything
			const fn = is_param(binding) ? functions.get(binding.scope) : undefined;

			if (fn && fn !== inside && !path.includes(fn) && !pooled) {
				pooled = true;
				pool.forEach(({ node, scope }) => visit(node, scope));
			}
		};

		visit(node, scope);
		return bindings;
	}

	/**
	 * The bindings that might hold the object `node` evaluates to, so that mutating it writes them
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 */
	function holders(node, scope) {
		const binding = root(node, scope);
		if (!binding) return touch(node, scope);

		/** @type {Set<Binding>} */
		const result = new Set();

		/** @param {Binding} binding */
		const add = (binding) => {
			if (result.has(binding)) return;
			result.add(binding);

			const store = get_store(binding);
			if (store) result.add(store);

			// aliases, as in `const alias = object` or `const nested = object.nested`
			for (const { value, scope } of binding.assignments) {
				const alias = root(value, scope);
				if (alias) add(alias);
			}
		};

		add(binding);
		return result;
	}

	/**
	 * The property `key` of the object literal held by `node`, if we can tell (`property` is `null` if there's
	 * none). `assigned` is whether properties are assigned to the object, which might replace this one
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 * @param {string} key
	 * @returns {{ property: ESTree.Property | null; scope: Scope; assigned: boolean } | null}
	 */
	function find(node, scope, key) {
		const binding = node.type === 'Identifier' ? scope.get(node.name) : null;
		if (!binding || binding.reassigned || sources.has(binding)) return null;

		const [assignment] = binding.assignments;
		if (assignment?.value.type !== 'ObjectExpression' || key === '*') return null;

		let property = null;

		for (const p of assignment.value.properties) {
			// spreads and computed keys could be anything
			if (p.type !== 'Property' || p.computed) return null;
			if (property_key(p) === key) property = p;
		}

		return { property, scope: assignment.scope, assigned: assigned.has(binding) };
	}

	/**
	 * The functions we can see that `node` might evaluate to, with `'opaque'` for those we can't see,
	 * or `null` if we can't tell
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 * @param {Set<Binding>} [seen]
	 * @returns {Array<{ node: Fn; scope: Scope } | 'opaque'> | null}
	 */
	function resolve(node, scope, seen = new Set()) {
		switch (node.type) {
			case 'FunctionDeclaration':
			case 'FunctionExpression':
			case 'ArrowFunctionExpression':
				return [{ node, scope }];

			case 'ChainExpression':
				return resolve(node.expression, scope, seen);

			case 'Literal':
				return [];

			case 'Identifier': {
				const binding = scope.get(node.name);
				if (!binding || binding.declaration_kind === 'import' || is_prop(binding))
					return ['opaque'];
				if (is_param(binding)) return null;
				if (seen.has(binding)) return [];

				seen.add(binding);

				/** @type {Array<{ node: Fn; scope: Scope } | 'opaque'>} */
				const fns = [];
				const values = binding.assignments.map(({ value, scope }) => ({ node: value, scope }));

				for (const value of [...values, ...(sources.get(binding) ?? [])]) {
					const result = resolve(value.node, value.scope, seen);
					if (!result) return null;
					fns.push(...result);
				}

				return fns;
			}

			case 'MemberExpression': {
				const found = find(node.object, scope, static_key(node));

				if (found && !found.assigned) {
					// a key that isn't there refers to the prototype, i.e. to a built-in
					if (!found.property) return ['opaque'];
					return found.property.kind === 'init'
						? resolve(found.property.value, found.scope, seen)
						: null;
				}

				if (node.object.type === 'Super') return null;

				const id = object(node);
				const binding = id && scope.get(id.name);

				// methods of globals, imports and primitives
				if (id && (!binding || binding.declaration_kind === 'import')) return ['opaque'];
				return is_primitive(node.object, scope) ? ['opaque'] : null;
			}

			case 'CallExpression':
				// the result of something opaque is opaque, too
				return get_rune(node, scope) === null &&
					resolve(node.callee, scope, seen)?.every((fn) => fn === 'opaque')
					? ['opaque']
					: null;

			default:
				return null;
		}
	}

	/** @type {Map<Fn, Summary | null>} */
	const summaries = new Map();

	/**
	 * @param {Fn} fn
	 * @returns {Summary}
	 */
	function summarize(fn) {
		const scope = /** @type {Scope} */ (scope_of(fn));
		let summary = summaries.get(fn);

		if (summary) return summary;

		if (summary === null) {
			// recursion: assume the worst
			const writes = touch(fn, /** @type {Scope} */ (scope.parent), fn);
			return { writes, params: fn.params.map(() => true), args: true, self: true };
		}

		summaries.set(fn, null);

		/** @type {Set<Binding>} */
		const writes = new Set();
		for (const node of [...fn.params, fn.body]) effects(node, scope, fn, writes);

		// a parameter is written unless it's obviously only read, in which case so is its default value
		const params = fn.params.map((param) => {
			const written = extract_identifiers(param).some((id) =>
				scope
					.get(id.name)
					?.references.some(
						({ node, path }) => node !== id && !is_read(node, /** @type {ESTree.Node[]} */ (path))
					)
			);

			if (written && param.type === 'AssignmentPattern') {
				for (const binding of touch(param.right, scope, fn)) {
					if (!is_local(binding, scope)) writes.add(binding);
				}
			}

			return written;
		});

		let self = false;

		if (fn.type !== 'ArrowFunctionExpression') {
			walk(/** @type {ESTree.Node} */ (fn.body), null, {
				_(node, { next }) {
					if (node.type !== 'FunctionDeclaration' && node.type !== 'FunctionExpression') next();
				},
				ThisExpression(node, { path }) {
					self ||= !is_read(node, path);
				}
			});
		}

		const args = fn.type !== 'ArrowFunctionExpression' && scope.references.has('arguments');

		summary = { writes, params, args, self };
		summaries.set(fn, summary);
		return summary;
	}

	/**
	 * Whether a reference is obviously only read: it's used (or a property of it is) to compute a primitive
	 * @param {ESTree.Node} node
	 * @param {ESTree.Node[]} path
	 */
	function is_read(node, path) {
		let i = path.length - 1;

		while (
			path[i]?.type === 'MemberExpression' &&
			/** @type {ESTree.MemberExpression} */ (path[i]).object === node
		) {
			node = path[i--];
		}

		const parent = path[i];

		switch (parent?.type) {
			case 'BinaryExpression':
				return !coercible || ['===', '!==', 'in', 'instanceof'].includes(parent.operator);
			case 'UnaryExpression':
				return (
					['!', 'typeof', 'void'].includes(parent.operator) ||
					(!coercible && parent.operator !== 'delete')
				);
			case 'TemplateLiteral':
				return !coercible;
			case 'MemberExpression':
				return parent.property === node && !coercible;
			case 'LogicalExpression':
				return is_read(parent, path.slice(0, i));
			case 'ConditionalExpression':
			case 'IfStatement':
			case 'WhileStatement':
			case 'DoWhileStatement':
			case 'ForStatement':
			case 'SwitchCase':
				return parent.test === node;
			case 'SwitchStatement':
				return parent.discriminant === node;
			case 'ExpressionStatement':
				return true;
			default:
				return false;
		}
	}

	/**
	 * Collects what evaluating `node` might write. Within `fn`, what it declares itself (including its
	 * parameters) is fresh for each invocation and left out — `summarize` deals with the parameters
	 * @param {ESTree.Node} node
	 * @param {Scope} scope
	 * @param {Fn | null} fn
	 * @param {Set<Binding>} writes
	 */
	function effects(node, scope, fn, writes) {
		const local = fn && /** @type {Scope} */ (scope_of(fn));

		/** @param {Iterable<Binding>} bindings */
		const write = (bindings) => {
			for (const binding of bindings) {
				if (!local || !is_local(binding, local)) writes.add(binding);
			}
		};

		/**
		 * Assumes that the expressions might be called, and write anything they can reach
		 * @param {ESTree.Node[]} nodes
		 * @param {Scope} scope
		 */
		const fallback = (nodes, scope) => {
			for (const node of nodes) write(touch(node, scope, fn));
		};

		/**
		 * @param {Summary} summary
		 * @param {ESTree.Node[]} args
		 * @param {Scope} scope
		 * @param {ESTree.Node | null} receiver
		 */
		const apply = (summary, args, scope, receiver) => {
			write(summary.writes);

			const spread = args.some((arg) => arg.type === 'SpreadElement');

			// does any of what's passed to a parameter it writes hold something the derived reads?
			args.forEach((arg, i) => {
				const param = summary.params[Math.min(i, summary.params.length - 1)];
				if (summary.args || param || (spread && summary.params.includes(true)))
					fallback([arg], scope);
			});

			if (summary.self && receiver) write(holders(receiver, scope));
		};

		/**
		 * @param {ESTree.Node} callee
		 * @param {ESTree.Node[]} args
		 * @param {Scope} scope
		 */
		const call = (callee, args, scope) => {
			const receiver = callee.type === 'MemberExpression' ? callee.object : null;
			const fns = resolve(callee, scope);

			// e.g. `object.method()` on something we can't see into: assume it writes `object`, and what's passed to it
			if (!fns) return fallback([callee, ...args], scope);

			for (const fn of fns) {
				if (fn !== 'opaque') {
					apply(summarize(fn.node), args, scope, receiver);
					continue;
				}

				// We can't see what this does, so we assume that it mutates everything it's given, including its
				// receiver (unless that's a primitive). Functions we can see are called instead...
				const inputs = receiver && !is_primitive(receiver, scope) ? [receiver, ...args] : args;

				for (const input of inputs) {
					const callbacks = resolve(input, scope);

					if (!callbacks?.length || callbacks.includes('opaque')) {
						fallback([input], scope);
						continue;
					}

					for (const callback of /** @type {Array<{ node: Fn; scope: Scope }>} */ (callbacks)) {
						const summary = summarize(callback.node);
						write(summary.writes);

						// ...with arguments that might have been derived from the inputs
						if (summary.args || summary.params.includes(true)) fallback(inputs, scope);
					}
				}
			}
		};

		/**
		 * Runs the getters or setters that accessing `object[key]` might invoke: those of the object literal it
		 * holds if we can see it, and otherwise any with that key — or any at all, if we don't know the key
		 * @param {ESTree.Node | null} object
		 * @param {string} key
		 * @param {'get' | 'set'} kind
		 * @param {ESTree.Node[]} args
		 * @param {Scope} scope
		 */
		const access = (object, key, kind, args, scope) => {
			if (accessors.length === 0) return;

			const found = object && find(object, scope, key);
			const property = found?.property;

			const fns = found
				? property?.kind === kind
					? [/** @type {Fn} */ (property.value)]
					: []
				: accessors
						.filter((a) => a.kind === kind && (key === '*' || a.key === key || a.key === '*'))
						.map((a) => a.fn);

			for (const fn of fns) apply(summarize(fn), args, scope, object);
		};

		/**
		 * @param {ESTree.Pattern} left
		 * @param {ESTree.Node | null} value
		 * @param {Scope} scope
		 */
		const assign = (left, value, scope) => {
			for (const target of unwrap_pattern(left)) {
				if (target.type === 'Identifier') {
					// `$store = value` writes the store
					const binding = scope.get(target.name);
					const store = get_store(binding);
					write([binding, store].filter((binding) => binding !== null));
					continue;
				}

				write(holders(target.object, scope));
				access(target.object, static_key(target), 'set', value ? [value] : [], scope);
			}
		};

		/**
		 * Methods and instance fields only run once the class is used, which is covered when it is
		 * @param {ESTree.ClassDeclaration | ESTree.ClassExpression} node
		 * @param {{ visit: (node: ESTree.Node) => void }} context
		 */
		const create_class = (node, { visit }) => {
			if (node.superClass) visit(node.superClass);

			for (const element of node.body.body) {
				if (element.type === 'StaticBlock') {
					visit(element);
					continue;
				}

				if (element.computed) visit(element.key);

				if (element.type === 'PropertyDefinition' && element.static && element.value) {
					visit(element.value);
				}
			}
		};

		walk(node, scope, {
			_(node, { state, next }) {
				next(scope_of(node) ?? state);
			},

			// creating a function doesn't run its code...
			ArrowFunctionExpression() {},
			FunctionExpression() {},
			FunctionDeclaration() {},

			// ...while creating a class runs its heritage, computed keys and static members
			ClassDeclaration: create_class,
			ClassExpression: create_class,

			VariableDeclarator(node, { state, next }) {
				const rune = get_rune(node.init, state);

				// deriveds are lazy and pure
				if (rune !== '$derived' && rune !== '$derived.by') next();
			},

			AssignmentExpression(node, { state, next }) {
				next();
				assign(node.left, node.right, state);
			},

			UpdateExpression(node, { state, next }) {
				next();
				assign(/** @type {ESTree.Pattern} */ (node.argument), null, state);
			},

			ForOfStatement(node, { state, next }) {
				next();
				assign(
					node.left.type === 'VariableDeclaration' ? node.left.declarations[0].id : node.left,
					null,
					state
				);
			},

			ForInStatement(node, { state, next }) {
				next();
				assign(
					node.left.type === 'VariableDeclaration' ? node.left.declarations[0].id : node.left,
					null,
					state
				);
			},

			UnaryExpression(node, { state, next }) {
				next();

				if (node.operator === 'delete' && node.argument.type === 'MemberExpression') {
					write(holders(node.argument.object, state));
				} else if (coercible && ['+', '-', '~'].includes(node.operator)) {
					fallback([node.argument], state);
				}
			},

			// converting objects to primitives might call their `valueOf` or `toString`...
			BinaryExpression(node, { state, next }) {
				next();
				if (coercible && !['===', '!==', 'in', 'instanceof'].includes(node.operator)) {
					fallback([node.left, node.right], state);
				}
			},

			TemplateLiteral(node, { state, next }) {
				next();
				if (coercible) fallback(node.expressions, state);
			},

			// ...and awaiting them their `then`
			AwaitExpression(node, { state, next }) {
				next();
				if (thenable) fallback([node.argument], state);
			},

			MemberExpression(node, { state, next }) {
				next();
				access(node.object, static_key(node), 'get', [], state);
			},

			// destructuring accesses each of its keys...
			ObjectPattern(node, { state, next, path }) {
				next();

				const parent = path.at(-1);
				const source =
					parent?.type === 'VariableDeclarator' && parent.id === node
						? parent.init
						: parent?.type === 'AssignmentExpression' && parent.left === node
							? parent.right
							: null;

				for (const property of node.properties) {
					const key = property.type === 'RestElement' ? '*' : property_key(property);
					access(source ?? null, key, 'get', [], state);
				}
			},

			// ...and spreading an object accesses all of them
			SpreadElement(node, { state, next, path }) {
				next();
				if (path.at(-1)?.type === 'ObjectExpression') access(node.argument, '*', 'get', [], state);
			},

			CallExpression(node, { state, next }) {
				const rune = get_rune(node, state);

				// `$effect`s only run once all async work is done, while deriveds are lazy and pure
				if (rune === '$effect' || rune === '$derived' || rune === '$derived.by') return;

				next();

				if (rune === '$effect.pre' || rune === '$effect.root') {
					// unlike `$effect`, these run right away
					if (node.arguments[0]) call(node.arguments[0], [], state);
				} else if (!rune) {
					call(node.callee, node.arguments, state);
				}
			},

			NewExpression(node, { state, next }) {
				next();
				call(node.callee, node.arguments, state);
			},

			TaggedTemplateExpression(node, { state, next }) {
				next();
				call(node.tag, [node.quasi, ...node.quasi.expressions], state);
			}
		});

		return writes;
	}

	/**
	 * What evaluating the given top-level statements or declarators might declare or write
	 * @param {Array<ESTree.Statement | ESTree.VariableDeclarator>} nodes
	 */
	function outputs(nodes) {
		/** @type {Set<Binding>} */
		const writes = new Set();

		for (const node of nodes) {
			if (node.type === 'VariableDeclarator') {
				for (const binding of instance.scope.get_bindings(node)) writes.add(binding);
			} else if (node.type === 'ClassDeclaration') {
				const binding = instance.scope.get(node.id.name);
				if (binding) writes.add(binding);
			}

			effects(node, instance.scope, null, writes);
		}

		return writes;
	}

	return { touch, outputs };
}

/**
 * @param {ESTree.CallExpression | ESTree.NewExpression | ESTree.TaggedTemplateExpression} node
 * @returns {ESTree.Node[]}
 */
function get_arguments(node) {
	return node.type === 'TaggedTemplateExpression'
		? [node.quasi, ...node.quasi.expressions]
		: node.arguments;
}

/**
 * @param {ESTree.MemberExpression} node
 * @returns {string}
 */
function static_key({ property, computed }) {
	if (computed) return property.type === 'Literal' ? String(property.value) : '*';
	return property.type === 'PrivateIdentifier'
		? '#' + property.name
		: /** @type {ESTree.Identifier} */ (property).name;
}

/**
 * @param {ESTree.Property | ESTree.MethodDefinition | ESTree.PropertyDefinition} node
 * @returns {string}
 */
function property_key({ key, computed }) {
	if (key.type === 'Literal') return String(key.value);
	if (computed) return '*';
	return key.type === 'PrivateIdentifier'
		? '#' + key.name
		: /** @type {ESTree.Identifier} */ (key).name;
}

/** @param {Binding} binding */
function is_param(binding) {
	return binding.declaration_kind === 'param' || binding.declaration_kind === 'rest_param';
}

/** @param {Binding} binding */
function is_prop(binding) {
	return get_rune(/** @type {ESTree.Node | null} */ (binding.initial), binding.scope) === '$props';
}

/**
 * Whether the binding is declared in `scope` or one of its descendants
 * @param {Binding} binding
 * @param {Scope} scope
 */
function is_local(binding, scope) {
	for (
		let current = /** @type {Scope | null} */ (binding.scope);
		current;
		current = current.parent
	) {
		if (current === scope) return true;
	}

	return false;
}

/**
 * Whether `node` is known to evaluate to a string or number, which can't be mutated
 * @param {ESTree.Node} node
 * @param {Scope} scope
 */
function is_primitive(node, scope) {
	const value = scope.evaluate(/** @type {ESTree.Expression} */ (node));
	return value.is_string || value.is_number;
}

/**
 * The store behind a `$store` subscription
 * @param {Binding | null} binding
 */
function get_store(binding) {
	return binding?.kind === 'store_sub' ? binding.scope.get(binding.node.name.slice(1)) : null;
}
