/**
 * Les actions peuvent renvoyer un objet contenant les deux propriétés définies dans cette interface.
 * Les deux sont optionnelles.
 * - update: Une action peut avoir un paramètre. Cette méthode est appelée à chaque fois que ce paramètre change,
 *   juste après que Svelte ait appliqué les mises à jour au <span class="vo">[markup](/docs/web#markup)</span>.
 * 	 `ActionReturn` et `ActionReturn<undefined>` signifient toutes les deux que l'action n'accepte pas de paramètre.
 * - destroy: Méthode qui est appelée après la destruction de l'élément
 *
 * De plus, vous pouvez spécifier quels attributs et évènements additionnels l'action apporte à l'élément sur lequel elle est appliquée.
 * Ceci n'a d'impact que sur les types Typescript et n'a pas d'effet au moment de l'exécution.
 *
 * Exemple d'usage:
 * ```ts
 * interface Attributes {
 * 	newprop?: string;
 * 	'on:event': (e: CustomEvent<boolean>) => void;
 * }
 *
 * export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
 * 	// ...
 * 	return {
 * 		update: (updatedParameter) => {...},
 * 		destroy: () => {...}
 * 	};
 * }
 * ```
 *
 * Docs: https://svelte.dev/docs/svelte-action
 */
export interface ActionReturn<
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<never, any>
> {
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
 * Les actions sont des fonctions exécutées lorsqu'un élément est créé.
 * Vous pouvez utiliser cette interface pour les typer.
 * L'exemple suivant définit une action qui ne fonctionne que pour les éléments `<div>`
 * et accepte un paramètre optionnel qui a une valeur par défaut :
 * ```ts
 * export const myAction: Action<HTMLDivElement, { someProperty: boolean } | undefined> = (node, param = { someProperty: true }) => {
 *   // ...
 * }
 * ```
 * `Action<HTMLDivElement>` and `Action<HTMLDiveElement, undefined>` indiquent tous les deux que l'action n'accepte pas de paramètre.
 *
 * Une action peut renvoyer un objet avec les méthodes `update` et `destroy`, et vous pouvez typer quels attributs et évènements elle apporte.
 * Voir l'interface `ActionReturn` pour plus de détails.
 *
 * Docs: https://svelte.dev/docs/svelte-action
 */
export interface Action<
	Element = HTMLElement,
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<never, any>
> {
	<Node extends Element>(
		...args: undefined extends Parameter
			? [node: Node, parameter?: Parameter]
			: [node: Node, parameter: Parameter]
	): void | ActionReturn<Parameter, Attributes>;
}

// Implementation notes:
// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode
