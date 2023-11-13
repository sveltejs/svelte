import is_reference from 'is-reference';
import { extract_identifiers } from '../../../utils/ast.js';

/** @type {import('../types.js').Visitors<import('../types.js').LegacyAnalysisState>} */
export const analyze_component_scope_legacy = {
	LabeledStatement(node, { next, path, state }) {
		if (
			state.ast_type !== 'instance' ||
			node.label.name !== '$' ||
			/** @type {import('#compiler').SvelteNode} */ (path.at(-1)).type !== 'Program'
		) {
			return next();
		}

		// Find all dependencies of this `$: {...}` statement
		/** @type {import('../../types.js').ReactiveStatement} */
		const reactive_statement = {
			assignments: new Set(),
			dependencies: new Set()
		};

		next({ ...state, reactive_statement, function_depth: state.scope.function_depth + 1 });

		for (const [name, nodes] of state.scope.references) {
			const binding = state.scope.get(name);
			if (binding === null) continue;

			// Include bindings that have references other than assignments and their own declarations
			if (
				nodes.some((n) => n.node !== binding.node && !reactive_statement.assignments.has(n.node))
			) {
				reactive_statement.dependencies.add(binding);
			}
		}

		state.reactive_statements.set(node, reactive_statement);

		if (
			node.body.type === 'ExpressionStatement' &&
			node.body.expression.type === 'AssignmentExpression'
		) {
			for (const id of extract_identifiers(node.body.expression.left)) {
				const binding = state.scope.get(id.name);
				if (binding?.kind === 'legacy_reactive') {
					// TODO does this include `let double; $: double = x * 2`?
					binding.legacy_dependencies = Array.from(reactive_statement.dependencies);
				}
			}
		}
	},
	AssignmentExpression(node, { state, next }) {
		if (state.reactive_statement && node.operator === '=') {
			for (const id of extract_identifiers(node.left)) {
				state.reactive_statement.assignments.add(id);
			}
		}

		next();
	},
	Identifier(node, { state, path }) {
		const parent = /** @type {import('estree').Node} */ (path.at(-1));
		if (is_reference(node, parent)) {
			if (node.name === '$$props') {
				state.analysis.uses_props = true;
			}

			if (node.name === '$$restProps') {
				state.analysis.uses_rest_props = true;
			}

			if (node.name === '$$slots') {
				state.analysis.uses_slots = true;
			}

			let binding = state.scope.get(node.name);

			if (binding?.kind === 'store_sub') {
				// get the underlying store to mark it as reactive in case it's mutated
				binding = state.scope.get(node.name.slice(1));
			}

			if (
				binding !== null &&
				binding.kind === 'normal' &&
				((binding.scope === state.instance_scope && binding.declaration_kind !== 'function') ||
					binding.declaration_kind === 'import')
			) {
				if (binding.declaration_kind === 'import') {
					if (
						binding.mutated &&
						// TODO could be more fine-grained - not every mention in the template implies a state binding
						(state.reactive_statement || state.ast_type === 'template') &&
						parent.type === 'MemberExpression'
					) {
						binding.kind = 'state';
					}
				} else if (
					binding.mutated &&
					// TODO could be more fine-grained - not every mention in the template implies a state binding
					(state.reactive_statement || state.ast_type === 'template')
				) {
					binding.kind = 'state';
				} else if (
					state.reactive_statement &&
					parent.type === 'AssignmentExpression' &&
					parent.left === binding.node
				) {
					binding.kind = 'derived';
				} else {
					let idx = -1;
					let ancestor = path.at(idx);
					while (ancestor) {
						if (ancestor.type === 'EachBlock') {
							// Ensures that the array is reactive when only its entries are mutated
							// TODO: this doesn't seem correct. We should be checking at the points where
							// the identifier (the each expression) is used in a way that makes it reactive.
							// This just forces the collection identifier to always be reactive even if it's
							// not.
							if (ancestor.expression === (idx === -1 ? node : path.at(idx + 1))) {
								binding.kind = 'state';
								break;
							}
						}
						ancestor = path.at(--idx);
					}
				}
			}
		}
	},
	ExportNamedDeclaration(node, { next, state }) {
		if (state.ast_type !== 'instance') {
			return next();
		}

		if (!node.declaration) {
			for (const specifier of node.specifiers) {
				const binding = /** @type {import('#compiler').Binding} */ (
					state.scope.get(specifier.local.name)
				);
				if (
					binding.kind === 'state' ||
					(binding.kind === 'normal' && binding.declaration_kind === 'let')
				) {
					binding.kind = 'prop';
					if (specifier.exported.name !== specifier.local.name) {
						binding.prop_alias = specifier.exported.name;
					}
				} else {
					state.analysis.exports.push({
						name: specifier.local.name,
						alias: specifier.exported.name
					});
				}
			}
			return next();
		}

		if (node.declaration.type === 'FunctionDeclaration') {
			state.analysis.exports.push({
				name: /** @type {import('estree').Identifier} */ (node.declaration.id).name,
				alias: null
			});
			return next();
		}

		if (node.declaration.type === 'VariableDeclaration') {
			if (node.declaration.kind === 'const') {
				for (const declarator of node.declaration.declarations) {
					for (const node of extract_identifiers(declarator.id)) {
						state.analysis.exports.push({ name: node.name, alias: null });
					}
				}
				return next();
			}

			for (const declarator of node.declaration.declarations) {
				for (const id of extract_identifiers(declarator.id)) {
					const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(id.name));
					binding.kind = 'prop';
				}
			}
		}
	}
};
