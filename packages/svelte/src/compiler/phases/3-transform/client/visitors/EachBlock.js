/** @import { AssignmentExpression, BlockStatement, Expression, Identifier, MemberExpression, Pattern, Statement } from 'estree' */
/** @import { Binding, EachBlock } from '#compiler' */
/** @import { ComponentContext, Context } from '../types' */
import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED
} from '../../../../../constants.js';
import { dev } from '../../../../state.js';
import { extract_paths, object } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { get_assignment_value, build_getter, build_setter, with_loc } from '../utils.js';

/**
 * @param {EachBlock} node
 * @param {ComponentContext} context
 */
export function EachBlock(node, context) {
	const each_node_meta = node.metadata;
	const collection = /** @type {Expression} */ (context.visit(node.expression));

	if (!each_node_meta.is_controlled) {
		context.state.template.push('<!>');
	}

	if (each_node_meta.array_name !== null) {
		context.state.init.push(b.const(each_node_meta.array_name, b.thunk(collection)));
	}

	let flags = 0;

	if (node.metadata.keyed) {
		flags |= EACH_KEYED;

		if (node.index) {
			flags |= EACH_INDEX_REACTIVE;
		}

		// In runes mode, if key === item, we don't need to wrap the item in a source
		const key_is_item =
			/** @type {Expression} */ (node.key).type === 'Identifier' &&
			node.context.type === 'Identifier' &&
			node.context.name === node.key.name;

		if (!context.state.analysis.runes || !key_is_item) {
			flags |= EACH_ITEM_REACTIVE;
		}
	} else {
		flags |= EACH_ITEM_REACTIVE;
	}

	// Since `animate:` can only appear on elements that are the sole child of a keyed each block,
	// we can determine at compile time whether the each block is animated or not (in which
	// case it should measure animated elements before and after reconciliation).
	if (
		node.key &&
		node.body.nodes.some((child) => {
			if (child.type !== 'RegularElement' && child.type !== 'SvelteElement') return false;
			return child.attributes.some((attr) => attr.type === 'AnimateDirective');
		})
	) {
		flags |= EACH_IS_ANIMATED;
	}

	if (each_node_meta.is_controlled) {
		flags |= EACH_IS_CONTROLLED;
	}

	if (context.state.analysis.runes) {
		flags |= EACH_IS_STRICT_EQUALS;
	}

	// If the array is a store expression, we need to invalidate it when the array is changed.
	// This doesn't catch all cases, but all the ones that Svelte 4 catches, too.
	let store_to_invalidate = '';
	if (node.expression.type === 'Identifier' || node.expression.type === 'MemberExpression') {
		const id = object(node.expression);
		if (id) {
			const binding = context.state.scope.get(id.name);
			if (binding?.kind === 'store_sub') {
				store_to_invalidate = id.name;
			}
		}
	}

	// Legacy mode: find the parent each blocks which contain the arrays to invalidate
	const indirect_dependencies = collect_parent_each_blocks(context).flatMap((block) => {
		const array = /** @type {Expression} */ (context.visit(block.expression));
		const transitive_dependencies = build_transitive_dependencies(
			block.metadata.references,
			context
		);
		return [array, ...transitive_dependencies];
	});

	if (each_node_meta.array_name) {
		indirect_dependencies.push(b.call(each_node_meta.array_name));
	} else {
		indirect_dependencies.push(collection);

		const transitive_dependencies = build_transitive_dependencies(
			each_node_meta.references,
			context
		);
		indirect_dependencies.push(...transitive_dependencies);
	}

	const child_state = {
		...context.state,
		getters: { ...context.state.getters },
		setters: { ...context.state.setters }
	};

	/** The state used when generating the key function, if necessary */
	const key_state = {
		...context.state,
		getters: { ...context.state.getters }
	};

	/**
	 * @param {Pattern} expression_for_id
	 * @returns {(assignment: AssignmentExpression, context: Context) => Expression}
	 */
	const create_mutation = (expression_for_id) => {
		return (assignment, context) => {
			if (assignment.left.type !== 'Identifier' && assignment.left.type !== 'MemberExpression') {
				// build_setter turns other patterns into IIFEs and separates the assignments
				// into separate expressions, at which point this is called again with an identifier or member expression
				return build_setter(assignment, context, () => assignment);
			}

			const left = object(assignment.left);
			const value = get_assignment_value(assignment, context);
			const invalidate = b.call(
				'$.invalidate_inner_signals',
				b.thunk(b.sequence(indirect_dependencies))
			);
			const invalidate_store = store_to_invalidate
				? b.call('$.invalidate_store', b.id('$$stores'), b.literal(store_to_invalidate))
				: undefined;

			const sequence = [];
			if (!context.state.analysis.runes) sequence.push(invalidate);
			if (invalidate_store) sequence.push(invalidate_store);

			if (left === assignment.left) {
				const assign = b.assignment('=', expression_for_id, value);
				sequence.unshift(assign);
				return b.sequence(sequence);
			} else {
				const original_left = /** @type {MemberExpression} */ (assignment.left);
				const left = /** @type {Pattern} */ (context.visit(original_left));
				const assign = b.assignment(assignment.operator, left, value);
				sequence.unshift(assign);
				return b.sequence(sequence);
			}
		};
	};

	// We need to generate a unique identifier in case there's a bind:group below
	// which needs a reference to the index
	const index =
		each_node_meta.contains_group_binding || !node.index ? each_node_meta.index : b.id(node.index);
	const item = each_node_meta.item;
	const binding = /** @type {Binding} */ (context.state.scope.get(item.name));
	const getter = (/** @type {Identifier} */ id) => {
		const item_with_loc = with_loc(item, id);
		return b.call('$.unwrap', item_with_loc);
	};
	child_state.getters[item.name] = getter;

	if (node.index) {
		child_state.getters[node.index] = (id) => {
			const index_with_loc = with_loc(index, id);
			return (flags & EACH_INDEX_REACTIVE) === 0 ? index_with_loc : b.call('$.get', index_with_loc);
		};

		key_state.getters[node.index] = b.id(node.index);
	}

	/** @type {Statement[]} */
	const declarations = [];

	if (node.context.type === 'Identifier') {
		child_state.setters[node.context.name] = create_mutation(
			b.member(
				each_node_meta.array_name ? b.call(each_node_meta.array_name) : collection,
				index,
				true
			)
		);

		key_state.getters[node.context.name] = node.context;
	} else {
		const unwrapped = getter(binding.node);
		const paths = extract_paths(node.context);

		for (const path of paths) {
			const name = /** @type {Identifier} */ (path.node).name;
			const binding = /** @type {Binding} */ (context.state.scope.get(name));
			const needs_derived = path.has_default_value; // to ensure that default value is only called once
			const fn = b.thunk(
				/** @type {Expression} */ (context.visit(path.expression?.(unwrapped), child_state))
			);

			declarations.push(b.let(path.node, needs_derived ? b.call('$.derived_safe_equal', fn) : fn));

			const getter = needs_derived ? b.call('$.get', b.id(name)) : b.call(name);
			child_state.getters[name] = getter;
			child_state.setters[name] = create_mutation(
				/** @type {Pattern} */ (path.update_expression(unwrapped))
			);

			// we need to eagerly evaluate the expression in order to hit any
			// 'Cannot access x before initialization' errors
			if (dev) {
				declarations.push(b.stmt(getter));
			}

			key_state.getters[name] = path.node;
		}
	}

	const block = /** @type {BlockStatement} */ (context.visit(node.body, child_state));

	/** @type {Expression} */
	let key_function = b.id('$.index');

	if (node.metadata.keyed) {
		const expression = /** @type {Expression} */ (
			context.visit(/** @type {Expression} */ (node.key), key_state)
		);

		key_function = b.arrow([node.context, index], expression);
	}

	if (node.index && each_node_meta.contains_group_binding) {
		// We needed to create a unique identifier for the index above, but we want to use the
		// original index name in the template, therefore create another binding
		declarations.push(b.let(node.index, index));
	}

	if (dev && (flags & EACH_KEYED) !== 0) {
		context.state.init.push(
			b.stmt(b.call('$.validate_each_keys', b.thunk(collection), key_function))
		);
	}

	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.literal(flags),
		each_node_meta.array_name ? each_node_meta.array_name : b.thunk(collection),
		key_function,
		b.arrow([b.id('$$anchor'), item, index], b.block(declarations.concat(block.body)))
	];

	if (node.fallback) {
		args.push(
			b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fallback)))
		);
	}

	context.state.init.push(b.stmt(b.call('$.each', ...args)));
}

/**
 * @param {ComponentContext} context
 */
function collect_parent_each_blocks(context) {
	return /** @type {EachBlock[]} */ (context.path.filter((node) => node.type === 'EachBlock'));
}

/**
 * @param {Binding[]} references
 * @param {ComponentContext} context
 */
function build_transitive_dependencies(references, context) {
	/** @type {Set<Binding>} */
	const dependencies = new Set();

	for (const ref of references) {
		const deps = collect_transitive_dependencies(ref);
		for (const dep of deps) {
			dependencies.add(dep);
		}
	}

	return [...dependencies].map((dep) => build_getter({ ...dep.node }, context.state));
}

/**
 * @param {Binding} binding
 * @param {Set<Binding>} seen
 * @returns {Binding[]}
 */
function collect_transitive_dependencies(binding, seen = new Set()) {
	if (binding.kind !== 'legacy_reactive') return [];

	for (const dep of binding.legacy_dependencies) {
		if (!seen.has(dep)) {
			seen.add(dep);
			for (const transitive_dep of collect_transitive_dependencies(dep, seen)) {
				seen.add(transitive_dep);
			}
		}
	}

	return [...seen];
}
