/** @import { AssignmentExpression, Identifier, Literal, MethodDefinition, PrivateIdentifier, PropertyDefinition, StaticBlock } from 'estree' */
/** @import { StateField } from '../types.js' */
/** @import { Context as ClientContext } from '../client/types.js' */
/** @import { Context as ServerContext } from '../server/types.js' */
/** @import { StateCreationRuneName } from '../../../../utils.js' */
/** @import { AssignmentBuilder, ClassTransformer, StateFieldBuilder, StatefulAssignment, StatefulPropertyDefinition } from './types.js' */
/** @import { Scope }  from '../../scope.js' */
import * as b from '#compiler/builders';
import { once } from '../../../../internal/server/index.js';
import { is_state_creation_rune, STATE_CREATION_RUNES } from '../../../../utils.js';
import { regex_invalid_identifier_chars } from '../../patterns.js';
import { get_rune } from '../../scope.js';

/**
 * @template {ClientContext | ServerContext} TContext
 * @param {Array<PropertyDefinition | MethodDefinition | StaticBlock>} body
 * @param {StateFieldBuilder<TContext>} build_state_field
 * @param {AssignmentBuilder<TContext>} build_assignment
 * @returns {ClassTransformer<TContext>}
 */
export function create_class_transformer(body, build_state_field, build_assignment) {
	/**
	 * Public, stateful fields.
	 * @type {Map<string, StateField>}
	 */
	const public_fields = new Map();

	/**
	 * Private, stateful fields. These are namespaced separately because
	 * public and private fields can have the same name in the AST -- ex.
	 * `count` and `#count` are both named `count` -- and because it's useful
	 * in a couple of cases to be able to check for only one or the other.
	 * @type {Map<string, StateField>}
	 */
	const private_fields = new Map();

	/**
	 * Accumulates nodes for the new class body.
	 * @type {Array<PropertyDefinition | MethodDefinition>}
	 */
	const new_body = [];

	/**
	 * Private identifiers in use by this analysis.
	 * Factoid: Unlike public class fields, private fields _must_ be declared in the class body
	 * before use. So the following is actually a JavaScript syntax error, which means we can
	 * be 100% certain we know all private fields after parsing the class body:
	 *
	 * ```ts
	 * class Example {
	 *   constructor() {
	 *     this.public = 'foo'; // not a problem!
	 *     this.#private = 'bar'; // JavaScript parser error
	 *   }
	 * }
	 * ```
	 * @type {Set<string>}
	 */
	const private_ids = new Set();

	/**
	 * A registry of functions to call to complete body modifications.
	 * Replacements may insert more than one node to the body. The original
	 * body should not be modified -- instead, replacers should push new
	 * nodes to new_body.
	 *
	 * @type {Array<() => void>}
	 */
	const replacers = [];

	/**
	 * Get a state field by name.
	 *
	 * @param {string} name
	 * @param {boolean} is_private
	 * @param {ReadonlyArray<StateCreationRuneName>} [kinds]
	 */
	function get_field(name, is_private, kinds = STATE_CREATION_RUNES) {
		const value = (is_private ? private_fields : public_fields).get(name);
		if (value && kinds.includes(value.kind)) {
			return value;
		}
	}

	/**
	 * Create a child context that makes sense for passing to the child analyzers.
	 * @param {TContext} context
	 * @returns {TContext}
	 */
	function create_child_context(context) {
		const state = {
			...context.state,
			class_transformer
		};
		// @ts-expect-error - I can't find a way to make TypeScript happy with these
		const visit = (node, state_override) => context.visit(node, { ...state, ...state_override });
		// @ts-expect-error - I can't find a way to make TypeScript happy with these
		const next = (state_override) => context.next({ ...state, ...state_override });
		return {
			...context,
			state,
			visit,
			next
		};
	}

	/**
	 * Generate a new body for the class. Ensure there is a visitor for AssignmentExpression that
	 * calls `generate_assignment` to capture any stateful fields declared in the constructor.
	 * @param {TContext} context
	 */
	function generate_body(context) {
		const child_context = create_child_context(context);
		for (const node of body) {
			const was_registered = register_body_definition(node, child_context);
			if (!was_registered) {
				new_body.push(
					/** @type {PropertyDefinition | MethodDefinition} */ (
						// @ts-expect-error generics silliness
						child_context.visit(node, child_context.state)
					)
				);
			}
		}

		for (const replacer of replacers) {
			replacer();
		}

		return new_body;
	}

	/**
	 * Given an assignment expression, check to see if that assignment expression declares
	 * a stateful field. If it does, register that field and then return the processed
	 * assignment expression. If an assignment expression is returned from this function,
	 * it should be considered _fully processed_ and should replace the existing assignment
	 * expression node.
	 * @param {AssignmentExpression} node
	 * @param {TContext} context
	 * @returns {AssignmentExpression | null} The node, if `register_assignment` handled its transformation.
	 */
	function generate_assignment(node, context) {
		const child_context = create_child_context(context);
		if (
			!(
				node.operator === '=' &&
				node.left.type === 'MemberExpression' &&
				node.left.object.type === 'ThisExpression' &&
				(node.left.property.type === 'Identifier' ||
					node.left.property.type === 'PrivateIdentifier' ||
					node.left.property.type === 'Literal')
			)
		) {
			return null;
		}

		const name = get_name(node.left.property);
		if (!name) {
			return null;
		}

		const parsed = parse_stateful_assignment(node, child_context.state.scope);
		if (!parsed) {
			return null;
		}
		const { stateful_assignment, rune } = parsed;

		const is_private = stateful_assignment.left.property.type === 'PrivateIdentifier';

		let field;
		if (is_private) {
			field = {
				kind: rune,
				id: /** @type {PrivateIdentifier} */ (stateful_assignment.left.property)
			};
			private_fields.set(name, field);
		} else {
			field = {
				kind: rune,
				// it's safe to do this upfront now because we're guaranteed to already know about all private
				// identifiers (they had to have been declared at the class root, before we visited the constructor)
				id: deconflict(name)
			};
			public_fields.set(name, field);
		}

		const replacer = () => {
			const nodes = build_state_field({
				is_private,
				field,
				node: stateful_assignment,
				context: child_context
			});
			if (!nodes) {
				return;
			}
			new_body.push(...nodes);
		};
		replacers.push(replacer);

		return build_assignment({
			field,
			node: stateful_assignment,
			context: child_context
		});
	}

	/**
	 * Register a class body definition.
	 *
	 * @param {PropertyDefinition | MethodDefinition | StaticBlock} node
	 * @param {TContext} child_context
	 * @returns {boolean} if this node is stateful and was registered
	 */
	function register_body_definition(node, child_context) {
		if (node.type === 'MethodDefinition' && node.kind === 'constructor') {
			// life is easier to reason about if we've visited the constructor
			// and registered its public state field before we start building
			// anything else
			replacers.unshift(() => {
				new_body.push(
					/** @type {MethodDefinition} */ (
						// @ts-expect-error generics silliness
						child_context.visit(node, child_context.state)
					)
				);
			});
			return true;
		}

		if (
			!(
				(node.type === 'PropertyDefinition' || node.type === 'MethodDefinition') &&
				(node.key.type === 'Identifier' ||
					node.key.type === 'PrivateIdentifier' ||
					node.key.type === 'Literal')
			)
		) {
			return false;
		}

		/*
		 * We don't know if the node is stateful yet, but we still need to register some details.
		 * For example: If the node is a private identifier, we could accidentally conflict with it later
		 * if we create a private field for public state (as would happen in this example:)
		 *
		 * ```ts
		 * class Foo {
		 *   #count = 0;
		 *   count = $state(0); // would become #count if we didn't know about the private field above
		 * }
		 */

		const name = get_name(node.key);
		if (!name) {
			return false;
		}

		const is_private = node.key.type === 'PrivateIdentifier';
		if (is_private) {
			private_ids.add(name);
		}

		const parsed = prop_def_is_stateful(node, child_context.state.scope);
		if (!parsed) {
			// this isn't a stateful field definition, but if could become one in the constructor -- so we register
			// it, but conditionally -- so that if it's added as a field in the constructor (which causes us to create)
			// a field definition for it), we don't end up with a duplicate definition (this one, plus the one we create)
			replacers.push(() => {
				if (!get_field(name, is_private)) {
					new_body.push(
						/** @type {PropertyDefinition | MethodDefinition} */ (
							// @ts-expect-error generics silliness
							child_context.visit(node, child_context.state)
						)
					);
				}
			});
			return true;
		}
		const { stateful_prop_def, rune } = parsed;

		let field;
		if (is_private) {
			field = {
				kind: rune,
				id: /** @type {PrivateIdentifier} */ (stateful_prop_def.key)
			};
			private_fields.set(name, field);
		} else {
			// We can't set the ID until we've identified all of the private state fields,
			// otherwise we might conflict with them. After registering all property definitions,
			// call `finalize_property_definitions` to populate the IDs. So long as we don't
			// access the ID before the end of this loop, we're fine!
			const id = once(() => deconflict(name));
			field = {
				kind: rune,
				get id() {
					return id();
				}
			};
			public_fields.set(name, field);
		}

		const replacer = () => {
			const nodes = build_state_field({
				is_private,
				field,
				node: stateful_prop_def,
				context: child_context
			});
			if (!nodes) {
				return;
			}
			new_body.push(...nodes);
		};
		replacers.push(replacer);

		return true;
	}

	/**
	 * @param {string} name
	 * @returns {PrivateIdentifier}
	 */
	function deconflict(name) {
		let deconflicted = name;
		while (private_ids.has(deconflicted)) {
			deconflicted = '_' + deconflicted;
		}

		private_ids.add(deconflicted);
		return b.private_id(deconflicted);
	}

	/**
	 * @param {Identifier | PrivateIdentifier | Literal} node
	 */
	function get_name(node) {
		if (node.type === 'Literal') {
			let name = node.value?.toString().replace(regex_invalid_identifier_chars, '_');

			// the above could generate conflicts because it has to generate a valid identifier
			// so stuff like `0` and `1` or `state%` and `state^` will result in the same string
			// so we have to de-conflict. We can only check `public_fields` because private state
			// can't have literal keys
			while (name && public_fields.has(name)) {
				name = '_' + name;
			}
			return name;
		} else {
			return node.name;
		}
	}

	const class_transformer = {
		get_field,
		generate_body,
		generate_assignment
	};

	return class_transformer;
}

/**
 * `get_rune` is really annoying because it really guarantees this already
 * we just need this to tell the type system about it
 * @param {AssignmentExpression} node
 * @param {Scope} scope
 * @returns {{ stateful_assignment: StatefulAssignment, rune: StateCreationRuneName } | null}
 */
function parse_stateful_assignment(node, scope) {
	const rune = get_rune(node.right, scope);
	if (!rune || !is_state_creation_rune(rune)) {
		return null;
	}
	return { stateful_assignment: /** @type {StatefulAssignment} */ (node), rune };
}

/**
 * @param {PropertyDefinition | MethodDefinition} node
 * @param {Scope} scope
 * @returns {{ stateful_prop_def: StatefulPropertyDefinition, rune: StateCreationRuneName } | null}
 */
function prop_def_is_stateful(node, scope) {
	const rune = get_rune(node.value, scope);
	if (!rune || !is_state_creation_rune(rune)) {
		return null;
	}
	return { stateful_prop_def: /** @type {StatefulPropertyDefinition} */ (node), rune };
}
