---
title: 'svelte/motion'
---

Le module `svelte/motion` exporte deux fonctions, `tweened` et `spring`, pour créer des <span class="vo">[stores](/docs/sveltejs#store)</span> de type `writable` dont les valeurs changent dans le temps après `set` et `update`, plutôt qu'immédiatement.

## `tweened`

> EXPORT_SNIPPET: svelte/motion#tweened

Les <span class="vo">[stores](/docs/sveltejs#store)</span> `tweened` mettent à jour leur valeur sur une durée fixe. Les options suivantes sont disponibles:

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number` | `function`, par défaut 400) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `t => t`) - une [fonction de lissage (`easing function`)](/docs/svelte-easing)
* `interpolate` (`function`) - voir ci-dessous

`store.set` et `store.update` peuvent accepter un second argument `options` qui remplacera les options passées à l'instanciation.

Les deux fonctions retournent une promesse qui se résout lorsque la transition se termine. Si la transition est interrompue, la promesse ne sera jamais résolue.

Sans que vous n'ayez rien à faire, Svelte interpolera entre deux nombres, deux tableaux ou deux objets (tant que les tableaux et les objets ont la même "forme" et que leurs propriétés "feuilles" sont également des nombres).

```svelte
<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const size = tweened(1, {
		duration: 300,
		easing: cubicOut
	});

	function handleClick() {
		// équivalent à size.update(n => n + 1)
		$size += 1;
	}
</script>

<button on:click={handleClick} style="transform: scale({$size}); transform-origin: 0 0">
	grandir
</button>
```

Si la valeur initiale est `undefined` ou `null`, le premier changement de valeur prendra effet immédiatement. Ceci est utile lorsque vous avez des valeurs d'interpolation qui sont basées sur des propriétés de composant et que vous ne voulez pas qu'il y ait de mouvement lors du premier rendu du composant.

```ts
// @filename: ambient.d.ts
declare global {
	var $size: number;
	var big: number;
}

export {};
// @filename: motion.ts
// ---cut---
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const size = tweened(undefined, {
	duration: 300,
	easing: cubicOut
});

$: $size = big ? 100 : 10;
```

L'option `interpolate` vous permet de faire une transition entre _n'importe quelles_ valeurs arbitraires. Cette option doit être une fonction `(a, b) => t => value`, où `a` est la valeur de départ, `b` est la valeur cible, `t` est un nombre entre 0 et 1, et `value` est le résultat. Par exemple, il est possible d'utiliser [d3-interpolate](https://github.com/d3/d3-interpolate) pour interpoler entre deux couleurs.

```svelte
<script>
	import { interpolateLab } from 'd3-interpolate';
	import { tweened } from 'svelte/motion';

	const colors = ['rgb(255, 62, 0)', 'rgb(64, 179, 255)', 'rgb(103, 103, 120)'];

	const color = tweened(colors[0], {
		duration: 800,
		interpolate: interpolateLab
	});
</script>

{#each colors as c}
	<button style="background-color: {c}; color: white; border: none;" on:click={(e) => color.set(c)}>
		{c}
	</button>
{/each}

<h1 style="color: {$color}">{$color}</h1>
```

## `spring`

> EXPORT_SNIPPET: svelte/motion#spring

Un <span class="vo">[store](/docs/sveltejs#store)</span> de type `spring` change progressivement vers sa valeur cible en fonction de ses paramètres `stiffness` (raideur) et `damping` (amortissement). Alors que les stores `tweened` changent leur valeur sur une durée fixe, les stores `spring` changent leur valeur sur une durée qui est déterminée par leur vélocité courante, permettant un mouvement plus naturel dans de nombreuses situations. Les options suivantes sont disponibles :

* `stiffness` (`number`, par défaut `0.15`) - une valeur entre 0 et 1, où une valeur plus grande signifie un ressort plus 'raide'.
* `damping` (`number`, par défaut `0.8`) - une valeur entre 0 et 1, où une valeur plus basse signifie un ressort plus 'élastique'.
* `precision` (`number`, par défaut `0.01`) - détermine le seuil à partir duquel le ressort est considéré comme 'arrêté'. Une valeur plus basse signifie un ressort plus précis.

Toutes les options ci-dessus peuvent être changées pendant que le ressort est en mouvement, et prendront effet immédiatement.

```js
import { spring } from 'svelte/motion';

const size = spring(100);
size.stiffness = 0.3;
size.damping = 0.4;
size.precision = 0.005;
```

Comme avec les <span class="vo">[stores](/docs/sveltejs#store)</span> [`tweened`](/docs/svelte-motion#tweened), `set` et `update` retournent une promesse qui se résout lorsque le ressort s'arrête.

Les deux méthodes `set` et `update` peuvent prendre un second argument - un objet avec les propriétés `hard` ou `soft`. `{ hard: true }` fixe immédiatement la valeur cible ; `{ soft: n }` préserve l'élan actuel pendant `n` secondes avant de s'arrêter. `{ soft: true }` est équivalent à `{ soft: 0.5 }`.

```js
import { spring } from 'svelte/motion';

const coords = spring({ x: 50, y: 50 });
// change la valeur immédiatement
coords.set({ x: 100, y: 200 }, { hard: true });
// garde l'élan actuel pendant 1s
coords.update(
	(target_coords, coords) => {
		return { x: target_coords.x, y: coords.y };
	},
	{ soft: 1 }
);
```

[Un exemple complet de store de type `spring` est disponible dans le tutoriel.](https://learn.svelte.dev/tutorial/springs)

```svelte
<script>
	import { spring } from 'svelte/motion';

	const coords = spring(
		{ x: 50, y: 50 },
		{
			stiffness: 0.1,
			damping: 0.25
		}
	);
</script>
```

Si la valeur initiale est `undefined` ou `null`, le premier changement de valeur prendra effet immédiatement, comme pour les valeurs `tweened` (voir ci-dessus).

```ts
// @filename: ambient.d.ts
declare global {
	var $size: number;
	var big: number;
}

export {};

// @filename: motion.ts
// ---cut---
import { spring } from 'svelte/motion';

const size = spring();
$: $size = big ? 100 : 10;
```

## Types

> TYPES: svelte/motion
