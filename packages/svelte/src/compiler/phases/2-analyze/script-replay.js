/** @import * as ESTree from 'estree' */
/** @import { AST, Binding } from '#compiler' */
/** @import { ComponentAnalysis, ScriptReplayStage } from '../types.js' */
/** @import { Scope } from '../scope.js' */
import { walk } from 'zimmerframe';
import is_reference from 'is-reference';
import * as e from '../../errors.js';
import * as b from '#compiler/builders';
import { get_rune } from '../scope.js';
import { ExpressionMetadata, is_custom_element_node } from '../nodes.js';
import { has_await_expression } from '../../utils/ast.js';
import { find_context_mutation } from './script-replay-context.js';
import { find_stateful_class } from './script-replay-class.js';
import { find_deferred_state_write } from './script-replay-async.js';

class UnsupportedScriptReplay extends Error {
	/** @param {ESTree.Node | AST.SvelteNode | null} node @param {string} reason */
	constructor(node, reason) {
		super(reason);
		this.node = node;
	}
}

/**
 * Classify without changing analysis until the entire script/template is supported.
 * The non-strict route is transitional while the remaining binding and readiness
 * consumers migrate; strict mode makes that unsupported surface testable.
 *
 * @param {ComponentAnalysis} analysis
 * @param {boolean} strict
 */
export function analyze_script_replay(analysis, strict = true) {
	try {
		analyze_replay(analysis);
	} catch (error) {
		if (!(error instanceof UnsupportedScriptReplay)) throw error;
		if (strict) {
			e.options_invalid_value(
				error.node && 'start' in error.node ? error.node : null,
				`experimental.scriptReplay does not support ${error.message}`
			);
		}
	}
}

/** @param {ComponentAnalysis} analysis */
function analyze_replay(analysis) {
	const { instance, instance_body } = analysis;
	if (instance_body.async.length === 0) return;

	/** @param {ESTree.Node | AST.SvelteNode | null} node @param {string} reason @returns {never} */
	function unsupported(node, reason) {
		throw new UnsupportedScriptReplay(node, reason);
	}

	if (!analysis.runes) unsupported(instance.ast, 'legacy components');
	if (analysis.exports.length || analysis.custom_element) {
		unsupported(instance.ast, 'component exports or custom elements');
	}
	if (analysis.props_id) unsupported(analysis.props_id, '$props.id hydration initialization');

	const deferred_write = find_deferred_state_write(instance.ast.body, analysis);
	if (deferred_write)
		unsupported(deferred_write, 'state writes in deferred initialization callbacks');

	let suffix = false;
	/** @type {ESTree.Node[]} */
	const prefix = [];

	for (const statement of instance.ast.body) {
		if (statement.type === 'ImportDeclaration') continue;
		suffix ||= has_await_expression(statement);
		if (!suffix) {
			prefix.push(statement);
			continue;
		}

		if (
			statement.type !== 'ExpressionStatement' &&
			(statement.type !== 'VariableDeclaration' || statement.declarations.length !== 1)
		) {
			unsupported(statement, 'anything but single-declarator suffix declarations and expressions');
		}
	}

	const context_mutation = find_context_mutation(prefix, analysis);
	if (context_mutation) unsupported(context_mutation, 'per-attempt component context setters');

	/** @type {ScriptReplayStage[]} */
	const stages = [];
	/** @type {Map<Binding, ScriptReplayStage>} */
	const bindings = new Map();
	/** @type {Array<{ start: number; end: number }>} */
	const groups = [];
	/** @type {Map<ESTree.ArrowFunctionExpression, Set<Binding>>} */
	const callbacks = new Map();

	for (const [checkpoint, group] of instance_body.async.entries()) {
		const start = stages.length;
		for (const node of group.nodes) {
			/** @type {Binding | null} */
			let binding = null;
			/** @type {ScriptReplayStage['kind']} */
			let kind = 'statement';
			/** @type {ESTree.Expression} */
			let expression;

			if (node.type === 'VariableDeclarator') {
				if (node.id.type !== 'Identifier' || !node.init) {
					unsupported(node, 'destructuring or uninitialized suffix declarations');
				}

				binding = /** @type {Binding} */ (instance.scope.get(node.id.name));
				const rune = get_rune(node.init, instance.scope);
				kind = 'local';
				expression = node.init;
				if (rune) {
					if (rune !== '$derived' && rune !== '$state' && rune !== '$state.raw') {
						unsupported(node.init, `suffix ${rune} declarations`);
					}
					expression = /** @type {ESTree.Expression} */ (
						/** @type {ESTree.CallExpression} */ (node.init).arguments[0] ?? b.void0
					);
					kind = rune === '$derived' ? 'derived' : 'state';
				}
				if (binding.updated && kind !== 'state') unsupported(node, 'writes to replay bindings');
			} else if (node.type === 'ExpressionStatement') {
				expression = node.expression;
			} else {
				unsupported(node, 'suffix control flow');
			}

			if (kind === 'state' && has_await_expression(expression)) {
				unsupported(expression, 'awaiting state initializers');
			}
			if (expression.type === 'AwaitExpression') {
				kind = kind === 'derived' ? 'async' : 'await';
				expression = expression.argument;
			}
			if (has_await_expression(expression)) unsupported(expression, 'nested or inline awaits');

			const stage = {
				index: stages.length,
				binding,
				checkpoint,
				kind,
				expression,
				declaration: node.type === 'VariableDeclarator' ? node : null
			};
			stages.push(stage);
			if (binding) bindings.set(binding, stage);
		}
		if (!group.has_await) groups.push({ start, end: stages.length });
	}

	/** @param {Binding} binding @param {ESTree.ArrowFunctionExpression} callback */
	function callback_local(binding, callback) {
		const owner = instance.scopes.get(callback);
		for (let scope = /** @type {Scope | null} */ (binding.scope); scope; scope = scope.parent) {
			if (scope === owner) return true;
		}
		return false;
	}

	for (const stage of stages) {
		/** @param {Binding} binding @param {ESTree.Node} node @param {ESTree.ArrowFunctionExpression | null} callback */
		function capture(binding, node, callback) {
			if (!callback || callback_local(binding, callback)) return;
			const dependency = bindings.get(binding);
			if (dependency && (dependency.kind !== 'state' || dependency.index >= stage.index)) {
				unsupported(node, 'unproved suffix binding captures in state callbacks');
			}
			callbacks.get(callback)?.add(binding);
		}

		/** @param {ESTree.Pattern | ESTree.Expression} target @param {Scope} scope @param {ESTree.ArrowFunctionExpression | null} callback */
		function write(target, scope, callback) {
			if (target.type !== 'Identifier') unsupported(target, 'non-identifier suffix state writes');
			const binding = scope.get(target.name);
			if (!binding) unsupported(target, 'writes to non-state replay bindings');
			if (callback && callback_local(binding, callback)) return;
			if (binding.kind !== 'state' && binding.kind !== 'raw_state') {
				unsupported(target, 'writes to non-state replay bindings');
			}
			const dependency = bindings.get(binding);
			if (dependency && (dependency.kind !== 'state' || dependency.index >= stage.index)) {
				unsupported(target, 'forward references to replay bindings');
			}
			capture(binding, target, callback);
		}

		walk(
			/** @type {ESTree.Node} */ (stage.expression),
			{
				scope: instance.scope,
				callback: /** @type {ESTree.ArrowFunctionExpression | null} */ (null)
			},
			{
				_(node, context) {
					const scope = instance.scopes.get(node) ?? context.state.scope;
					context.next({ ...context.state, scope });
				},
				CallExpression(node, { state, next }) {
					if (get_rune(node, state.scope)) unsupported(node, 'nested suffix runes');
					next();
				},
				ArrowFunctionExpression(node, context) {
					if (stage.kind === 'derived' || stage.kind === 'async') {
						unsupported(node, 'closures in replay producers');
					}
					if (node.async || context.state.callback)
						unsupported(node, 'async or nested suffix closures');
					callbacks.set(node, new Set());
					context.next({ ...context.state, callback: node });
				},
				FunctionExpression(node) {
					unsupported(node, 'suffix closures');
				},
				FunctionDeclaration(node) {
					unsupported(node, 'suffix closures');
				},
				ClassExpression(node) {
					unsupported(node, 'suffix classes');
				},
				ClassDeclaration(node) {
					unsupported(node, 'suffix classes');
				},
				AwaitExpression(node) {
					unsupported(node, 'suspensions in state callbacks');
				},
				AssignmentExpression(node, { state, next }) {
					write(node.left, state.scope, state.callback);
					next();
				},
				UpdateExpression(node, { state, next }) {
					write(node.argument, state.scope, state.callback);
					next();
				},
				Identifier(node, { state, path }) {
					const parent = path.at(-1);
					if (parent && !is_reference(node, parent)) return;
					const binding = state.scope.get(node.name);
					if (binding && node !== binding.node) capture(binding, node, state.callback);
				}
			}
		);
	}

	for (const [callback, captures] of callbacks) {
		if (
			![...captures].some((binding) => binding.kind === 'state' || binding.kind === 'raw_state')
		) {
			unsupported(callback, 'suffix closures without an admitted state capture');
		}
	}

	const stateful_class = find_stateful_class(
		[...prefix, ...stages.map((stage) => stage.expression)],
		analysis
	);
	if (stateful_class) unsupported(stateful_class, 'stateful class or constructor initialization');

	/** @type {Map<ScriptReplayStage, Set<ScriptReplayStage>>} */
	const dependencies = new Map();
	for (const stage of stages) {
		const { index, expression } = stage;
		const references = new Set();
		dependencies.set(stage, references);
		walk(
			expression,
			{ scope: instance.scope },
			{
				_(node, context) {
					context.next({ scope: instance.scopes.get(node) ?? context.state.scope });
				},
				Identifier(node, { path, state }) {
					const parent = path.at(-1);
					if (parent && !is_reference(node, parent)) return;
					const binding = state.scope.get(node.name);
					const dependency = binding && bindings.get(binding);
					if (dependency) references.add(dependency);
					if (dependency && dependency.index >= index) {
						unsupported(node, 'forward references to replay bindings');
					}
				}
			}
		);
	}

	for (const { start, end } of groups) {
		/** @type {Set<ScriptReplayStage>} */
		const deriveds_reading_locals = new Set();
		for (const stage of stages.slice(start, end)) {
			const references = /** @type {Set<ScriptReplayStage>} */ (dependencies.get(stage));
			if (stage.kind === 'derived') {
				if (
					[...references].some(
						(dependency) =>
							((dependency.kind === 'local' || dependency.kind === 'state') &&
								dependency.index >= start) ||
							deriveds_reading_locals.has(dependency)
					)
				) {
					deriveds_reading_locals.add(stage);
				}
			} else if ([...references].some((dependency) => deriveds_reading_locals.has(dependency))) {
				// Reading this derived would consult a local projection before the group's
				// atomic publication. Do not introduce a mutable staging cache to hide that.
				unsupported(stage.expression, 'same-group local dependencies through deriveds');
			}
		}
	}

	// calculate_blockers normally hoists suffix functions. Do not put those outside
	// the fresh factory without separately proving their closure/lifetime semantics.
	for (const statement of instance_body.sync) {
		if (!prefix.includes(statement) && statement.type !== 'ImportDeclaration') {
			const is_prefix_declaration =
				statement.type === 'VariableDeclaration' &&
				statement.declarations.every((declaration) =>
					prefix.some(
						(node) => node.type === 'VariableDeclaration' && node.declarations.includes(declaration)
					)
				);
			if (!is_prefix_declaration) unsupported(statement, 'hoisted suffix functions');
		}
	}

	/** @type {NonNullable<ComponentAnalysis['script_replay']>['environment']} */
	const environment = new Map();
	for (const binding of instance.scope.declarations.values()) {
		if (binding.kind === 'store_sub') unsupported(binding.node, 'store subscriptions');
		// This exclusion applies to state on either side of the first await.
		if (binding.kind === 'state') {
			const initial = binding.initial;
			const value = initial?.type === 'CallExpression' ? initial.arguments[0] : null;
			if (
				binding.mutated ||
				(binding.reassigned &&
					(value?.type === 'ObjectExpression' || value?.type === 'ArrayExpression'))
			) {
				unsupported(binding.node, 'external writes to proxy state before publication');
			}
		}
		if (bindings.has(binding)) {
			for (const reference of binding.references) {
				if (reference.path.some((node) => prefix.includes(/** @type {ESTree.Node} */ (node)))) {
					unsupported(reference.node, 'prefix captures of replay bindings');
				}
			}
		} else if (binding.declaration_kind !== 'import') {
			if (binding.kind === 'bindable_prop' && binding.mutated) {
				unsupported(binding.node, 'bindable prop mutation hooks');
			}
			environment.set(binding, {
				index: environment.size,
				// `reactive` selects the runtime's equality-preserving reader, not the
				// source-language binding kind. A const reference is immutable even when
				// the referenced object's properties can still change.
				reactive:
					binding.declaration_kind === 'const' ||
					['state', 'raw_state', 'derived', 'prop', 'bindable_prop'].includes(binding.kind)
			});
		}
	}

	walk(/** @type {AST.SvelteNode} */ (analysis.template.ast), null, {
		_(node, { next }) {
			if (
				![
					'Fragment',
					'Text',
					'Comment',
					'RegularElement',
					'Attribute',
					'ExpressionTag',
					'IfBlock',
					'EachBlock',
					'BindDirective',
					'UseDirective'
				].includes(node.type)
			) {
				unsupported(node, `template ${node.type}`);
			}
			next();
		},
		RegularElement(node, { next }) {
			if (is_custom_element_node(node)) unsupported(node, 'custom-element readiness');
			next();
		},
		// These expressions use the ordinary visitors and the runtime's common
		// readiness-aware flatten/wait contract, including template async expressions.
		ExpressionTag() {},
		BindDirective() {},
		UseDirective() {},
		IfBlock(node, { visit }) {
			visit(node.consequent);
			if (node.alternate) visit(node.alternate);
		},
		EachBlock(node, { visit }) {
			visit(node.body);
			if (node.fallback) visit(node.fallback);
		}
	});

	// Commit classification only after every check succeeds. In particular, never
	// leave readiness expressions pointing at a replay script that was not emitted.
	const replay = {
		id: analysis.root.unique('$$script'),
		bindings,
		environment,
		stages,
		groups,
		callbacks
	};
	const blockers = new Set();
	for (const binding of instance.scope.declarations.values()) {
		if (!binding.blocker || blockers.has(binding.blocker)) continue;
		blockers.add(binding.blocker);
		// ExpressionMetadata caches blocker identities while analyzing e.g. else-if
		// chains. Preserve that identity rather than leaving cached $$promises reads.
		binding.blocker.object = b.member(replay.id, 'ready');
	}
	const environment_ready = b.member(replay.id, 'environment_ready');
	for (const binding of environment.keys()) {
		binding.blocker ??= environment_ready;
	}
	walk(/** @type {AST.SvelteNode} */ (analysis.template.ast), null, {
		_(node, { next }) {
			if ('metadata' in node && node.metadata && 'expression' in node.metadata) {
				const expression = node.metadata.expression;
				if (expression instanceof ExpressionMetadata) expression.invalidate_blockers();
			}
			next();
		}
	});
	analysis.script_replay = replay;
}
