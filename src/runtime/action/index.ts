/**
 * Actions can return an object containing the two properties defined in this interface. Both are optional.
 * - update: An action can have a parameter. This method will be called whenever that parameter changes,
 *   immediately after Svelte has applied updates to the markup.
 * - destroy: Method that is called after the element is unmounted
 *
 * Example usage:
 * ```ts
 * export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter> {
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
export interface ActionReturn<Parameter = any> {
	update?: (parameter: Parameter) => void;
	destroy?: () => void;
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
 * You can return an object with methods `update` and `destroy` from the function.
 * See interface `ActionReturn` for more details.
 *
 * Docs: https://svelte.dev/docs#template-syntax-element-directives-use-action
 */
export interface Action<Element = HTMLElement, Parameter = any> {
	<Node extends Element>(node: Node, parameter?: Parameter): void | ActionReturn<Parameter>;
}
