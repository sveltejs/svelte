/** @import * as ESTree from 'estree' */
/** @import { AST, Binding } from '#compiler' */
/** @import { ComponentAnalysis, ScriptReplayStage } from '../types.js' */
/** @import { Scope } from '../scope.js' */
import { walk } from 'zimmerframe';
import is_reference from 'is-reference';
import * as e from '../../errors.js';
import * as b from '#compiler/builders';
import { get_rune } from '../scope.js';
import { is_custom_element_node } from '../nodes.js';
import { has_await_expression, object, unwrap_pattern } from '../../utils/ast.js';

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

	/** @type {ScriptReplayStage[]} */
	const stages = [];
	/** @type {Map<Binding, ScriptReplayStage>} */
	const bindings = new Map();
	/** @type {Array<{ start: number; end: number }>} */
	const groups = [];

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
					if (rune !== '$derived') unsupported(node.init, `suffix ${rune} declarations`);
					expression = /** @type {ESTree.Expression} */ (
						/** @type {ESTree.CallExpression} */ (node.init).arguments[0]
					);
					kind = 'derived';
				}
				if (binding.updated) unsupported(node, 'writes to replay bindings');
			} else if (node.type === 'ExpressionStatement') {
				expression = node.expression;
			} else {
				unsupported(node, 'suffix control flow');
			}

			if (expression.type === 'AwaitExpression') {
				kind = kind === 'derived' ? 'async' : 'await';
				expression = expression.argument;
			}
			if (has_await_expression(expression)) unsupported(expression, 'nested or inline awaits');
			if ((kind === 'local' || kind === 'await') && calls_state_mutator(expression, analysis)) {
				unsupported(expression, 'state-mutating local or raw-await initializers');
			}

			walk(expression, null, {
				CallExpression(node, { next }) {
					if (get_rune(node, instance.scope)) unsupported(node, 'nested suffix runes');
					next();
				},
				ArrowFunctionExpression(node) {
					unsupported(node, 'suffix closures');
				},
				FunctionExpression(node) {
					unsupported(node, 'suffix closures');
				},
				ClassExpression(node) {
					unsupported(node, 'suffix classes');
				},
				AssignmentExpression(node) {
					unsupported(node, 'suffix assignments');
				},
				UpdateExpression(node) {
					unsupported(node, 'suffix updates');
				}
			});

			const stage = { index: stages.length, binding, checkpoint, kind, expression };
			stages.push(stage);
			if (binding) bindings.set(binding, stage);
		}
		if (!group.has_await) groups.push({ start, end: stages.length });
	}

	/** @type {Map<ScriptReplayStage, Set<ScriptReplayStage>>} */
	const dependencies = new Map();
	for (const stage of stages) {
		const { index, expression } = stage;
		const references = new Set();
		dependencies.set(stage, references);
		walk(expression, null, {
			Identifier(node, { path }) {
				const parent = path.at(-1);
				if (parent && !is_reference(node, parent)) return;
				const binding = instance.scope.get(node.name);
				const dependency = binding && bindings.get(binding);
				if (dependency) references.add(dependency);
				if (dependency && dependency.index >= index) {
					unsupported(node, 'forward references to replay bindings');
				}
			}
		});
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
							(dependency.kind === 'local' && dependency.index >= start) ||
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

	for (const binding of instance.scope.declarations.values()) {
		if (binding.kind === 'store_sub') unsupported(binding.node, 'store subscriptions');
		if (bindings.has(binding)) {
			for (const reference of binding.references) {
				if (reference.path.some((node) => prefix.includes(/** @type {ESTree.Node} */ (node)))) {
					unsupported(reference.node, 'prefix captures of replay bindings');
				}
			}
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
	const replay = { id: analysis.root.unique('$$script'), bindings, stages, groups };
	const blockers = new Set();
	for (const binding of instance.scope.declarations.values()) {
		if (!binding.blocker || blockers.has(binding.blocker)) continue;
		blockers.add(binding.blocker);
		// ExpressionMetadata caches blocker identities while analyzing e.g. else-if
		// chains. Preserve that identity rather than leaving cached $$promises reads.
		binding.blocker.object = b.member(replay.id, 'ready');
	}
	analysis.script_replay = replay;
}

/**
 * Local/await inputs must be tracked until sealing. Unlike standalone statements,
 * we cannot untrack an initializer merely to permit writes hidden in a helper.
 * Keep statically known mutating helpers on their existing lowering for now.
 * Imported/dynamic callees require a more general initialization reaction context.
 *
 * @param {ESTree.Expression} expression
 * @param {ComponentAnalysis} analysis
 */
function calls_state_mutator(expression, analysis) {
	/** @type {Set<ESTree.Node>} */
	const seen = new Set();
	let mutates = false;

	/** @param {ESTree.Node} node @param {Scope} scope */
	function visit(node, scope) {
		if (seen.has(node) || mutates) return;
		seen.add(node);
		walk(
			node,
			{ scope },
			{
				_(node, context) {
					if (mutates) return;
					context.next({
						scope:
							analysis.instance.scopes.get(node) ??
							analysis.module.scopes.get(node) ??
							context.state.scope
					});
				},
				AssignmentExpression(node, { state, next }) {
					check_assignment(node.left, state.scope);
					next();
				},
				UpdateExpression(node, { state, next }) {
					check_assignment(node.argument, state.scope);
					next();
				},
				CallExpression(node, { state, next }) {
					if (node.callee.type === 'Identifier') {
						const binding = state.scope.get(node.callee.name);
						const initial = binding?.initial;
						if (
							binding &&
							initial &&
							['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(
								initial.type
							)
						) {
							visit(/** @type {ESTree.Node} */ (initial), binding.scope);
						}
					}
					next();
				}
			}
		);
	}

	/** @param {ESTree.Pattern | ESTree.Expression} pattern @param {Scope} scope */
	function check_assignment(pattern, scope) {
		for (const target of unwrap_pattern(/** @type {ESTree.Pattern} */ (pattern))) {
			const node = object(target);
			const binding = node && scope.get(node.name);
			if (binding && ['state', 'raw_state', 'derived'].includes(binding.kind)) mutates = true;
		}
	}

	visit(expression, analysis.instance.scope);
	return mutates;
}
