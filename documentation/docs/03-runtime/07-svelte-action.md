---
title: svelte/action
---

Les actions sont des fonctions exécutées lorsqu'un élément est créé. Elles peuvent renvoyer un objet avec une méthode `destroy` qui sera appelée lors de la destruction de l'élément.

```svelte
<script>
	/** @type {import('svelte/action').Action}  */
	function foo(node) {
		// le noeud a été ajouté au DOM

		return {
			destroy() {
				// le noeud a été supprimé du DOM
			}
		};
	}
</script>

<div use:foo />
```

Une action peut avoir un argument. Si la valeur renvoyée possède une méthode `update`, celle-ci sera exécutée à chaque fois que cet argument changera, juste après que Svelte a appliqué les modifications au <span class="vo">[markup](/docs/web#markup)</span>.

> Ne vous inquiétez pas du fait que l'on redéclare la fonction `foo` pour chaque instance — Svelte garde en mémoire toute fonction qui ne dépend pas d'un état local en dehors de la définition du composant.

```svelte
<script>
	/** @type {string} */
	export let bar;

	/** @type {import('svelte/action').Action<HTMLElement, string>}  */
	function foo(node, bar) {
		// le noeud a été ajouté au DOM

		return {
			update(bar) {
				// la valeur de `bar` a changé
			},

			destroy() {
				// le noeud a été supprimé du DOM
			}
		};
	}
</script>

<div use:foo={bar} />
```

## Attributes

Les actions émettent parfois des évènements ou appliquent des attributs personnalisés à l'élément sur lequel elles sont utilisées. Pour gérer cela, les actions typées avec `Action` ou `ActionReturn` peuvent avoir un dernier paramètres, `Attributes` :

Sometimes actions emit custom events and apply custom attributes to the element they are applied to. To support this, actions typed with `Action` or `ActionReturn` type can have a last parameter, `Attributes`:

```svelte
<script>
	/**
	 * @type {import('svelte/action').Action<HTMLDivElement, { prop: any }, { 'on:emit': (e: CustomEvent<string>) => void }>}
	 */
	function foo(node, { prop }) {
		// le noeud a été ajouté au DOM

		//...LOGIQUE
		node.dispatchEvent(new CustomEvent('emit', { detail: 'hello' }));

		return {
			destroy() {
				// le noeud a été supprimé du DOM
			}
		};
	}
</script>

<div on:emit={handleEmit} use:foo={{ prop: 'someValue' }} />
```

## Types

> TYPES: svelte/action
