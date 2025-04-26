/** @import { Context, StateField } from '../../types.js' */
/** @import { AssignmentExpression, Identifier, Literal, MethodDefinition, PrivateIdentifier, PropertyDefinition, CallExpression, Expression, StaticBlock, SpreadElement } from 'estree' */
/** @import { Scope } from '#compiler' */
/** @import { StateCreationRuneName } from '../../../../../../utils.js' */
import * as b from '#compiler/builders';
import { is_state_creation_rune } from '../../../../../../utils.js';
import { regex_invalid_identifier_chars } from '../../../../patterns.js';
import { get_rune } from '../../../../scope.js';
import { should_proxy } from '../../utils.js';

export class ClassAnalysis {
	/** @type {Map<string, StateField>} */
	public_state = new Map();

	/** @type {Map<string, StateField>} */
	private_state = new Map();

	/**
	 * Any state fields discovered from {@link register_assignment} that need to be added to the class body.
	 * @type {Array<PropertyDefinition | MethodDefinition>}
	 */
	constructor_state_fields = [];

	/** @type {Map<(MethodDefinition | PropertyDefinition)["key"], string>} */
	#definition_names = new Map();

	/** @type {Set<string>} */
	#private_ids = new Set();

	/**
	 * @param {MethodDefinition | PropertyDefinition | StaticBlock} node
	 * @param {Scope} scope
	 */
	register_body_definition(node, scope) {
		if (
			!(
				(node.type === 'PropertyDefinition' || node.type === 'MethodDefinition') &&
				(node.key.type === 'Identifier' ||
					node.key.type === 'PrivateIdentifier' ||
					node.key.type === 'Literal')
			)
		) {
			return;
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

		const name = ClassAnalysis.#get_name(node.key, this.public_state);
		if (!name) {
			return;
		}

		// we store the deconflicted name in the map so that we can access it later
		this.#definition_names.set(node.key, name);

		const is_private = node.key.type === 'PrivateIdentifier';
		if (is_private) {
			this.#private_ids.add(name);
		}

		const rune = get_rune(node.value, scope);
		if (!rune || !is_state_creation_rune(rune)) {
			return;
		}

		if (is_private) {
			this.private_state.set(name, { kind: rune, id: /** @type {PrivateIdentifier} */ (node.key) });
		} else {
			// We can't set the ID until we've identified all of the private state fields,
			// otherwise we might conflict with them. After registering all property definitions,
			// call `finalize_property_definitions` to populate the IDs.
			// @ts-expect-error this is set in `finalize_property_definitions`
			this.public_state.set(name, { kind: rune, id: undefined });
		}
	}

	/**
	 * Resolves all of the registered public state fields to their final private IDs.
	 * Must be called after all property definitions have been registered.
	 */
	finalize_property_definitions() {
		for (const [name, field] of this.public_state) {
			field.id = this.#deconflict(name);
		}
	}

	/**
	 * Important note: It is a syntax error in JavaScript to try to assign to a private class field
	 * that was not declared in the class body. So there is absolutely no risk of unresolvable conflicts here.
	 *
	 * This function will modify the assignment expression passed to it if it is registered as a state field.
	 * @param {AssignmentExpression} node
	 * @param {Context} context
	 */
	register_assignment(node, context) {
		if (
			!(
				node.operator === '=' &&
				node.left.type === 'MemberExpression' &&
				node.left.object.type === 'ThisExpression' &&
				node.left.property.type === 'Identifier'
			)
		) {
			return;
		}

		const name = ClassAnalysis.#get_name(node.left.property, this.public_state);
		if (!name) {
			return;
		}

		const rune = get_rune(node.right, context.state.scope);
		if (!rune || !is_state_creation_rune(rune)) {
			return;
		}

		const id = this.#deconflict(name);
		const field = { kind: rune, id };
		this.public_state.set(name, field);

		// We need to do two things:
		// - Communicate to the class body visitor that it needs to append nodes to create a state field
		// - Modify the assignment expression so that it's valid
		this.constructor_state_fields.push(
			...this.build_state_field(
				false,
				field,
				node.left.property,
				// this will initialize the field without assigning to it, delegating to the constructor
				null,
				context
			)
		);

		// ...swap out the assignment to go directly against the private field
		node.left.property = id;
		// ...and swap out the assignment's value for the state field init
		node.right = this.#build_init_value(
			rune,
			/** @type {CallExpression} */ (node.right).arguments[0],
			context
		);
	}

	/**
	 *
	 * @param {PropertyDefinition | MethodDefinition | StaticBlock} node
	 * @param {Context} context
	 * @returns {Array<PropertyDefinition | MethodDefinition> | null}
	 */
	build_state_field_from_body_definition(node, context) {
		if (
			!(
				node.type === 'PropertyDefinition' &&
				(node.key.type === 'Identifier' ||
					node.key.type === 'PrivateIdentifier' ||
					node.key.type === 'Literal')
			)
		) {
			return null;
		}

		const name = this.#definition_names.get(node.key);
		if (!name) throw new Error('This should not be possible'); // TODO

		const is_private = node.key.type === 'PrivateIdentifier';
		const field = (is_private ? this.private_state : this.public_state).get(name);

		if (!field) {
			return null;
		}

		return this.build_state_field(
			is_private,
			field,
			node.key,
			// we can cast this because if we have a field for this definition it definitely is a call
			// expression, otherwise it wouldn't have produced a rune earlier.
			/** @type {CallExpression} */ (node.value),
			context
		);
	}

	/**
	 * @param {boolean} is_private
	 * @param {StateField} field
	 * @param {(MethodDefinition | PropertyDefinition)["key"]} original_definition_id
	 * @param {CallExpression | null} call_expression
	 * @param {Context} context
	 *
	 * @returns {Array<PropertyDefinition | MethodDefinition>}
	 */
	build_state_field(is_private, field, original_definition_id, call_expression, context) {
		let value;
		if (!call_expression) {
			// if there's no call expression, this is state that's created in the constructor.
			// it's guaranteed to be the very first assignment to this field, so we initialize
			// the field but don't assign to it.
			value = null;
		} else if (call_expression.arguments.length > 0) {
			value = this.#build_init_value(field.kind, call_expression.arguments[0], context);
		} else {
			// if no arguments, we know it's state as `$derived()` is a compile error
			value = b.call('$.state');
		}

		if (is_private) {
			return [b.prop_def(field.id, value)];
		}

		const member = b.member(b.this, field.id);
		const val = b.id('value');
		return [
			// #foo;
			b.prop_def(field.id, value),
			// get foo() { return this.#foo; }
			b.method('get', original_definition_id, [], [b.return(b.call('$.get', member))]),
			// set foo(value) { this.#foo = value; }
			b.method(
				'set',
				original_definition_id,
				[val],
				[b.stmt(b.call('$.set', member, val, field.kind === '$state' && b.true))]
			)
		];
	}

	/**
	 *
	 * @param {StateCreationRuneName} kind
	 * @param {Expression | SpreadElement} arg
	 * @param {Context} context
	 */
	#build_init_value(kind, arg, context) {
		const init = /** @type {Expression} **/ (
			context.visit(arg, {
				...context.state,
				class_analysis: this
			})
		);

		switch (kind) {
			case '$state':
				return b.call(
					'$.state',
					should_proxy(init, context.state.scope) ? b.call('$.proxy', init) : init
				);
			case '$state.raw':
				return b.call('$.state', init);
			case '$derived':
				return b.call('$.derived', b.thunk(init));
			case '$derived.by':
				return b.call('$.derived', init);
		}
	}

	/**
	 * @param {string} name
	 * @returns {PrivateIdentifier}
	 */
	#deconflict(name) {
		let deconflicted = name;
		while (this.#private_ids.has(deconflicted)) {
			deconflicted = '_' + deconflicted;
		}

		this.#private_ids.add(deconflicted);
		return b.private_id(deconflicted);
	}

	/**
	 * @param {Identifier | PrivateIdentifier | Literal} node
	 * @param {Map<string, unknown>} public_state
	 */
	static #get_name(node, public_state) {
		if (node.type === 'Literal') {
			let name = node.value?.toString().replace(regex_invalid_identifier_chars, '_');

			// the above could generate conflicts because it has to generate a valid identifier
			// so stuff like `0` and `1` or `state%` and `state^` will result in the same string
			// so we have to de-conflict. We can only check `public_state` because private state
			// can't have literal keys
			while (name && public_state.has(name)) {
				name = '_' + name;
			}
			return name;
		} else {
			return node.name;
		}
	}
}
