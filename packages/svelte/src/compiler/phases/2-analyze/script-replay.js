/** @import * as ESTree from 'estree' */
/** @import { AST, Binding } from '#compiler' */
/** @import { ComponentAnalysis } from '../types.js' */
import { walk } from 'zimmerframe';
import is_reference from 'is-reference';
import * as e from '../../errors.js';
import * as b from '#compiler/builders';
import { get_rune } from '../scope.js';
import { is_custom_element_node } from '../nodes.js';
import { has_await_expression } from '../../utils/ast.js';

/**
 * This is intentionally a closed language subset, not a fallback to shared script
 * variables when a declaration or readiness consumer has not been implemented.
 *
 * @param {ComponentAnalysis} analysis
 */
export function analyze_script_replay(analysis) {
	const { instance, instance_body } = analysis;
	// There is no replay region in a synchronous wrapper component.
	if (instance_body.async.length === 0) return;

	/** @param {ESTree.Node | AST.SvelteNode | null} node @param {string} reason */
	function unsupported(node, reason) {
		e.options_invalid_value(
			node && 'start' in node ? node : null,
			`experimental.scriptReplay does not support ${reason}`
		);
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
			if (statement.type !== 'VariableDeclaration' && statement.type !== 'FunctionDeclaration') {
				unsupported(statement, 'non-declaration prefix statements');
			}
			continue;
		}

		if (statement.type !== 'VariableDeclaration' || statement.declarations.length !== 1) {
			unsupported(statement, 'anything but single-declarator suffix declarations');
		}
	}

	/** @type {NonNullable<ComponentAnalysis['script_replay']>} */
	const replay = {
		id: analysis.root.unique('$$script'),
		bindings: new Map()
	};

	for (const [checkpoint, group] of instance_body.async.entries()) {
		for (const node of group.nodes) {
			if (node.type !== 'VariableDeclarator' || node.id.type !== 'Identifier' || !node.init) {
				unsupported(node, 'destructuring or uninitialized suffix declarations');
			}

			const declaration =
				/** @type {ESTree.VariableDeclarator & { id: ESTree.Identifier; init: ESTree.Expression }} */ (
					node
				);
			const binding = /** @type {Binding} */ (instance.scope.get(declaration.id.name));
			const rune = get_rune(declaration.init, instance.scope);
			/** @type {'async' | 'derived' | 'local'} */
			let kind = 'local';
			let expression = declaration.init;

			if (rune) {
				if (rune !== '$derived') unsupported(declaration.init, `suffix ${rune} declarations`);
				expression = /** @type {ESTree.Expression} */ (
					/** @type {ESTree.CallExpression} */ (declaration.init).arguments[0]
				);
				kind = 'derived';
				if (expression.type === 'AwaitExpression') {
					kind = 'async';
					expression = expression.argument;
				}
			}

			if (has_await_expression(expression)) unsupported(expression, 'nested or inline awaits');
			if (binding.updated) unsupported(declaration, 'writes to replay bindings');

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

			replay.bindings.set(binding, {
				index: replay.bindings.size,
				checkpoint,
				kind,
				expression
			});
		}
	}

	for (const { index, expression } of replay.bindings.values()) {
		walk(expression, null, {
			Identifier(node, { path }) {
				const parent = path.at(-1);
				if (parent && !is_reference(node, parent)) return;
				const binding = instance.scope.get(node.name);
				const dependency = binding && replay.bindings.get(binding);
				if (dependency && dependency.index >= index) {
					unsupported(node, 'forward references to replay bindings');
				}
			}
		});
	}

	// Functions/arrows are normally hoisted out of the suffix by calculate_blockers.
	// Do not accidentally leave one outside the fresh attempt environment.
	for (const statement of instance_body.sync) {
		if (!prefix.includes(statement) && statement.type !== 'ImportDeclaration') {
			// A multi-declarator prefix is split by calculate_blockers.
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

	/** @type {Map<ESTree.MemberExpression, ESTree.MemberExpression>} */
	const blockers = new Map();
	for (const binding of instance.scope.declarations.values()) {
		if (binding.kind === 'store_sub') unsupported(binding.node, 'store subscriptions');
		if (replay.bindings.has(binding)) {
			for (const reference of binding.references) {
				if (reference.path.some((node) => prefix.includes(/** @type {ESTree.Node} */ (node)))) {
					unsupported(reference.node, 'prefix captures of replay bindings');
				}
			}
		}

		// Blockers describe readiness, including prefix bindings touched by a later
		// call. They do not determine which bindings need per-attempt storage.
		if (binding.blocker) {
			let ready = blockers.get(binding.blocker);
			if (!ready) {
				ready = b.member(b.member(replay.id, 'ready'), binding.blocker.property, true);
				blockers.set(binding.blocker, ready);
			}
			binding.blocker = ready;
		}
	}

	/** @param {ESTree.Expression} expression */
	function check_template_expression(expression) {
		walk(expression, null, {
			AwaitExpression(node) {
				unsupported(node, 'template awaits');
			}
		});
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
					'IfBlock'
				].includes(node.type)
			) {
				unsupported(node, `template ${node.type}`);
			}
			next();
		},
		RegularElement(node, { next }) {
			// Custom-element attributes install their own promise-gated effect instead
			// of using build_render_statement. Do not mix the two gate contracts.
			if (is_custom_element_node(node)) unsupported(node, 'custom-element readiness');
			next();
		},
		ExpressionTag(node) {
			check_template_expression(node.expression);
		},
		IfBlock(node, { visit }) {
			check_template_expression(node.test);
			visit(node.consequent);
			if (node.alternate) visit(node.alternate);
		}
	});

	analysis.script_replay = replay;
}
