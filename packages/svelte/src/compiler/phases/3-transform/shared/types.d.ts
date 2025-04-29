import type { AssignmentExpression, CallExpression, Identifier, MemberExpression, PropertyDefinition, MethodDefinition, PrivateIdentifier, ThisExpression } from 'estree';
import type { StateField } from '../types';
import type { Context as ServerContext } from '../server/types';
import type { Context as ClientContext } from '../client/types';
import type { StateCreationRuneName } from '../../../../utils';

export type StatefulAssignment = AssignmentExpression & {
	left: MemberExpression & {
		object: ThisExpression;
		property: Identifier | PrivateIdentifier
	};
	right: CallExpression;
};

export type StatefulPropertyDefinition = PropertyDefinition & {
	key: Identifier | PrivateIdentifier;
	value: CallExpression;
};

export type StateFieldBuilderParams<TContext extends ServerContext | ClientContext> = {
	is_private: boolean;
	field: StateField;
	node: StatefulAssignment | StatefulPropertyDefinition;
	context: TContext;
};

export type StateFieldBuilder<TContext extends ServerContext | ClientContext> = (
	params: StateFieldBuilderParams<TContext>
) => Array<PropertyDefinition | MethodDefinition>;

export type AssignmentBuilderParams<TContext extends ServerContext | ClientContext> = {
	node: StatefulAssignment;
	field: StateField;
	context: TContext;
};

export type AssignmentBuilder<TContext  extends ServerContext | ClientContext> = (params: AssignmentBuilderParams<TContext>) => void;

export type ClassAnalysis<TContext extends ServerContext | ClientContext> = {
	/**
	 * @param name - The name of the field.
	 * @param is_private - Whether the field is private (whether its name starts with '#').
	 * @param kinds - What kinds of state creation runes you're looking for, eg. only '$derived.by'.
	 * @returns The field if it exists and matches the given criteria, or null.
	 */
	get_field: (name: string, is_private: boolean, kinds?: Array<StateCreationRuneName>) => StateField | undefined;

	/**
	 * Given the body of a class, generate a new body with stateful fields.
	 * This assumes that {@link register_assignment} is registered to be called
	 * for all `AssignmentExpression` nodes in the class body.
	 * @param context - The context associated with the `ClassBody`.
	 * @returns The new body.
	 */
	generate_body: (context: TContext) => Array<PropertyDefinition | MethodDefinition>;

	/**
	 * Register an assignment expression. This checks to see if the assignment is creating
	 * a state field on the class. If it is, it registers that state field and modifies the
	 * assignment expression.
	 */
	register_assignment: (node: AssignmentExpression, context: TContext) => void;
}
