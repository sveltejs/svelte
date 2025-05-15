/** @import { AssignmentExpression, ClassBody, PropertyDefinition, Expression, Identifier, PrivateIdentifier, Literal } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
/** @import { StateCreationRuneName } from '../../../../utils.js' */
import { get_parent } from '../../../utils/ast.js';
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { is_state_creation_rune } from '../../../../utils.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
		context.next();
		return;
	}

	const analyzed = new ClassAnalysis();

	context.next({
		...context.state,
		class: analyzed
	});
}

/** @typedef { StateCreationRuneName | 'regular'} PropertyAssignmentType */
/** @typedef {{ type: PropertyAssignmentType; node: AssignmentExpression | PropertyDefinition; }} PropertyAssignmentDetails */

const reassignable_assignments = new Set(['$state', '$state.raw', 'regular']);

class ClassAnalysis {
	/** @type {Map<string, PropertyAssignmentDetails>} */
	#public_assignments = new Map();

	/** @type {Map<string, PropertyAssignmentDetails>} */
	#private_assignments = new Map();

	/**
	 * Determines if the node is a valid assignment to a class property, and if so,
	 * registers the assignment.
	 * @param {AssignmentExpression | PropertyDefinition} node
	 * @param {Context} context
	 */
	register(node, context) {
		/** @type {string} */
		let name;
		/** @type {PropertyAssignmentType} */
		let type;
		/** @type {boolean} */
		let is_private;

		if (node.type === 'AssignmentExpression') {
			if (!this.is_class_property_assignment_at_constructor_root(node, context.path)) {
				return;
			}

			let maybe_name = get_name_for_identifier(node.left.property);
			if (!maybe_name) {
				return;
			}

			name = maybe_name;
			type = this.#get_assignment_type(node, context);
			is_private = node.left.property.type === 'PrivateIdentifier';

			this.#check_for_conflicts(node, name, type, is_private);
		} else {
			if (!this.#is_assigned_property(node)) {
				return;
			}

			let maybe_name = get_name_for_identifier(node.key);
			if (!maybe_name) {
				return;
			}

			name = maybe_name;
			type = this.#get_assignment_type(node, context);
			is_private = node.key.type === 'PrivateIdentifier';

			// we don't need to check for conflicts here because they're not possible yet
		}

		// we don't have to validate anything other than conflicts here, because the rune placement rules
		// catch all of the other weirdness.
		const map = is_private ? this.#private_assignments : this.#public_assignments;
		if (!map.has(name)) {
			map.set(name, { type, node });
		}
	}

	/**
	 * @template {AST.SvelteNode} T
	 * @param {AST.SvelteNode} node
	 * @param {T[]} path
	 * @returns {node is AssignmentExpression & { left: { type: 'MemberExpression' } & { object: { type: 'ThisExpression' }; property: { type: 'Identifier' | 'PrivateIdentifier' | 'Literal' } } }}
	 */
	is_class_property_assignment_at_constructor_root(node, path) {
		if (
			!(
				node.type === 'AssignmentExpression' &&
				node.operator === '=' &&
				node.left.type === 'MemberExpression' &&
				node.left.object.type === 'ThisExpression' &&
				((node.left.property.type === 'Identifier' && !node.left.computed) ||
					node.left.property.type === 'PrivateIdentifier' ||
					node.left.property.type === 'Literal')
			)
		) {
			return false;
		}
		// AssignmentExpression (here) -> ExpressionStatement (-1) -> BlockStatement (-2) -> FunctionExpression (-3) -> MethodDefinition (-4)
		const maybe_constructor = get_parent(path, -4);
		return (
			maybe_constructor &&
			maybe_constructor.type === 'MethodDefinition' &&
			maybe_constructor.kind === 'constructor'
		);
	}

	/**
	 * We only care about properties that have values assigned to them -- if they don't,
	 * they can't be a conflict for state declared in the constructor.
	 * @param {PropertyDefinition} node
	 * @returns {node is PropertyDefinition & { key: { type: 'PrivateIdentifier' | 'Identifier' | 'Literal' }; value: Expression; static: false; computed: false }}
	 */
	#is_assigned_property(node) {
		return (
			(node.key.type === 'PrivateIdentifier' ||
				node.key.type === 'Identifier' ||
				node.key.type === 'Literal') &&
			Boolean(node.value) &&
			!node.static &&
			!node.computed
		);
	}

	/**
	 * Checks for conflicts with existing assignments. A conflict occurs if:
	 * - The original assignment used `$derived` or `$derived.by` (these can never be reassigned)
	 * - The original assignment used `$state`, `$state.raw`, or `regular` and is being assigned to with any type other than `regular`
	 * @param {AssignmentExpression} node
	 * @param {string} name
	 * @param {PropertyAssignmentType} type
	 * @param {boolean} is_private
	 */
	#check_for_conflicts(node, name, type, is_private) {
		const existing = (is_private ? this.#private_assignments : this.#public_assignments).get(name);
		if (!existing) {
			return;
		}

		if (reassignable_assignments.has(existing.type) && type === 'regular') {
			return;
		}

		e.constructor_state_reassignment(node);
	}

	/**
	 * @param {AssignmentExpression | PropertyDefinition} node
	 * @param {Context} context
	 * @returns {PropertyAssignmentType}
	 */
	#get_assignment_type(node, context) {
		const value = node.type === 'AssignmentExpression' ? node.right : node.value;
		const rune = get_rune(value, context.state.scope);
		if (rune === null) {
			return 'regular';
		}
		if (is_state_creation_rune(rune)) {
			return rune;
		}
		// this does mean we return `regular` for some other runes (like `$trace` or `$state.raw`)
		// -- this is ok because the rune placement rules will throw if they're invalid.
		return 'regular';
	}
}

/**
 *
 * @param {PrivateIdentifier | Identifier | Literal} node
 */
function get_name_for_identifier(node) {
	return node.type === 'Literal' ? node.value?.toString() : node.name;
}
