---
title: 'svelte/animate'
---

Le module `svelte/animate` exporte une fonction à utiliser avec les [animations](/docs/element-directives#animate-fn) Svelte.

## `flip`

> EXPORT_SNIPPET: svelte/animate#flip

```svelte
animate:flip={params}
```

La méthode `flip` calcule la position de départ et d'arrivée d'un élément et génère une animation de translation des coordonnées `x` et `y`. Le mot `flip` est l'acronyme de [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/) (en anglais).

Les paramètres suivants peuvent être utilisés avec `flip` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number` | `function`, par défaut `d => Math.sqrt(d) * 120`) - voir ci-dessous
* `easing` (`function`, par défaut `cubicOut`) — une [fonction de lissage](/docs/svelte-easing)


Le paramètre de durée `duration` peut être:

- soit un nombre, en millisecondes.
- une fonction, `distance: number => duration: number`, dont le paramètre correspond à la distance que l'élément va parcourir en pixels et qui retourne la durée en millisecondes. Cela permet de définir une durée, relative à la distance parcourue de l'élément.

Un exemple complet est présenté dans le [tutoriel relatif aux animations](https://learn.svelte.dev/tutorial/animate).

```svelte
<script>
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	let list = [1, 2, 3];
</script>

{#each list as n (n)}
	<div animate:flip={{ delay: 250, duration: 250, easing: quintOut }}>
		{n}
	</div>
{/each}
```

## Types

> TYPES: svelte/animate
