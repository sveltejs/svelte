/**
 * Actions can return an object containing the two properties defined in this interface. Both are optional.
 * - update: An action can have a parameter. This method will be called whenever that parameter changes,
 *   immediately after Svelte has applied updates to the markup.
 * - destroy: Method that is called after the element is unmounted
 *
 * Additionally, you can specify which additional attributes and events the action enables on the applied element.
 * This applies to TypeScript typings only and has no effect at runtime.
 *
 * Example usage:
 * ```ts
 * interface Attributes {
 * 	newprop?: string;
 *	'on:event': (e: CustomEvent<boolean>) => void;
 * }
 *
 * export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
 *   // ...
 *   return {
 *     update: (updatedParameter) => {...},
 *     destroy: () => {...}
 *   };
 * }
 * ```
 *
 * Docs: https://svelte.dev/docs#template-syntax-element-directives-use-action
 */
export interface ActionReturn<Parameter = any, Attributes extends Record<string, any> = Record<never, any>> {
	update?: (parameter: Parameter) => void;
	destroy?: () => void;
	/**
	 * ### DO NOT USE THIS
	 * This exists solely for type-checking and has no effect at runtime.
	 * Set this through the `Attributes` generic instead.
	 */
	$$_attributes?: Attributes;
}

/**
 * Actions are functions that are called when an element is created.
 * You can use this interface to type such actions.
 * The following example defines an action that only works on `<div>` elements
 * and optionally accepts a parameter which it has a default value for:
 * ```ts
 * export const myAction: Action<HTMLDivElement, { someProperty: boolean }> = (node, param = { someProperty: true }) => {
 *   // ...
 * }
 * ```
 * You can return an object with methods `update` and `destroy` from the function and type which additional attributes and events it has.
 * See interface `ActionReturn` for more details.
 *
 * Docs: https://svelte.dev/docs#template-syntax-element-directives-use-action
 */
export interface Action<Element = HTMLElement, Parameter = any, Attributes extends Record<string, any> = Record<never, any>> {
	<Node extends Element>(node: Node, parameter?: Parameter): void | ActionReturn<Parameter, Attributes>;
}
