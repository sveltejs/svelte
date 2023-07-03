---
title: 'svelte/transition'
---

Le module `svelte/transition` exporte 7 fonctions : `fade`, `blur`, `fly`, `slide`, `scale`, `draw` et `crossfade`. Ces fonctions sont utilisables avec les [`transitions`](/docs/element-directives#transition-fn) Svelte.

## `fade`

> EXPORT_SNIPPET: svelte/transition#fade

```svelte
<!--- copy: false --->
transition:fade={params}
```

```svelte
<!--- copy: false --->
in:fade={params}
```

```svelte
<!--- copy: false --->
out:fade={params}
```

Anime l'opacité d'un élément de 0 jusqu'à l'opacité courante pour les transitions de type `in` et depuis l'opacité courante vers 0 pour les transitions de type `out`.

Les paramètres suivants peuvent être utilisés avec `fade` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number`, par défaut 400) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `linear`) — une [fonction de lissage](/docs/svelte-easing)

Un exemple de transition de type `fade` est présenté dans le [tutoriel relatif aux transitions](PUBLIC_LEARN_SITE_URL/tutorial/transition).

```svelte
<script>
	import { fade } from 'svelte/transition';
</script>

{#if condition}
	<div transition:fade={{ delay: 250, duration: 300 }}>Apparaît et disparaît en s'estompant</div>
{/if}
```

## `blur`

> EXPORT_SNIPPET: svelte/transition#blur

```svelte
<!--- copy: false --->
transition:blur={params}
```

```svelte
<!--- copy: false --->
in:blur={params}
```

```svelte
<!--- copy: false --->
out:blur={params}
```

Anime le filtre de flou (`blur`) en même temps que l'opacité d'un élément.

Les paramètres suivants peuvent être utilisés avec `blur` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number`, par défaut 400) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `cubicInOut`) — une [fonction de lissage](/docs/svelte-easing)
* `opacity` (`number`, par défaut 0) - opacité cible de l'animation
* `amount` (`number | string`, par défaut 5) - la taille du flou. Supporte les unités CSS (par exemple : `"4rem"`). L'unité par défaut est `px`.

```svelte
<script>
	import { blur } from 'svelte/transition';
</script>

{#if condition}
	<div transition:blur={{ amount: 10 }}>Apparaît et disparaît avec un flou</div>
{/if}
```

## `fly`

> EXPORT_SNIPPET: svelte/transition#fly

```svelte
<!--- copy: false --->
transition:fly={params}
```

```svelte
<!--- copy: false --->
in:fly={params}
```

```svelte
<!--- copy: false --->
out:fly={params}
```

Anime les positions x, y et l'opacité d'un élément. Les transitions entrantes (`in`) permettent d'animer les propriétés depuis les valeurs spécifiées, passées en tant que paramètres, vers les valeurs par défaut. Les transitions sortantes (`out`) permettent quant à elles d'animer depuis les valeurs par défaut de l'élément vers les valeurs spécifiées.

Les paramètres suivants peuvent être utilisés avec `fly` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number`, par défaut 400) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `cubicOut`) — une [fonction de lissage](/docs/svelte-easing)
* `x` (`number | string`, par défaut 0) - décalage horizontal de l'animation
* `y` (`number | string`, par défaut 0) - décalage vertical de l'animation
* `opacity` (`number`, par défaut 0) - opacité cible de l'animation

x et y utilisent `px` par défaut mais supportent les unités CSS, par exemple `x: '100vw'` ou `y: '50%'`.

Un exemple de transition de type `fly` est présenté dans le [tutoriel relatif aux transitions](PUBLIC_LEARN_SITE_URL/tutorial/adding-parameters-to-transitions).

```svelte
<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div
		transition:fly={{ delay: 250, duration: 300, x: 100, y: 500, opacity: 0.5, easing: quintOut }}
	>
		apparaît et disparaît avec un déplacement
	</div>
{/if}
```

## `slide`

> EXPORT_SNIPPET: svelte/transition#slide

```svelte
<!--- copy: false --->
transition:slide={params}
```

```svelte
<!--- copy: false --->
in:slide={params}
```

```svelte
<!--- copy: false --->
out:slide={params}
```

L'animation de type `slide` permet de faire apparaître et disparaître un élément en glissant depuis et vers le haut.

Les paramètres suivants peuvent être utilisés avec `slide` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number`, par défaut 400) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `cubicOut`) — une [fonction de lissage](/docs/svelte-easing)
* `axis` (`x` | `y`, par défaut `y`) — l'axe de déplacement utilisé pour la transition

```svelte
<script>
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}>
		Apparaît et disparaît en glissant
	</div>
{/if}
```

## `scale`

> EXPORT_SNIPPET: svelte/transition#scale

```svelte
<!--- copy: false --->
transition:scale={params}
```

```svelte
<!--- copy: false --->
in:scale={params}
```

```svelte
<!--- copy: false --->
out:scale={params}
```

Anime l'opacité et l'échelle d'un élément. Les transitions entrantes (`in`) s'animent à partir des valeurs fournies en paramètre vers les valeurs par défaut de l'élément, passées en paramètres. Les transitions sortantes (`out`) s'animent à partir des valeurs par défaut de l'élément vers les valeurs fournies en paramètre.

Les paramètres suivants peuvent être utilisés avec `scale` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number`, par défaut 400) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `cubicInOut`) — une [fonction de lissage](/docs/svelte-easing)
* `start` (`number`, par défaut 0) - ratio d'agrandissement de l'animation
* `opacity` (`number`, par défaut 0) - opacité cible de l'animation

```svelte
<script>
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:scale={{ duration: 500, delay: 500, opacity: 0.5, start: 0.5, easing: quintOut }}>
		Apparaît et disparaît avec un zoom
	</div>
{/if}
```

## `draw`

> EXPORT_SNIPPET: svelte/transition#draw

```svelte
<!--- copy: false --->
transition:draw={params}
```

```svelte
<!--- copy: false --->
in:draw={params}
```

```svelte
<!--- copy: false --->
out:draw={params}
```

Anime le tracé d'un élément SVG, comme un serpent dans un tube. Les transitions entrantes (`in`) commencent avec le tracé non visible et dessinent le tracé. Les transitions sortantes (`out`) commencent avec le tracé visible et l'effacent au fur et à mesure. L'animation `draw` ne fonctionne qu'avec les éléments ayant la méthode `getTotalLength`, comme `<path>` et `<polyline>`.

Les paramètres suivants peuvent être utilisés avec `draw` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `speed` (`number`, par défaut undefined) - vitesse de l'animation, voir ci-dessous.
* `duration` (`number` | `function`, par défaut 800) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `cubicInOut`) — une [fonction de lissage](/docs/svelte-easing)

Le paramètre de vitesse `speed` peut être utilisé à la place du paramètre durée `duration` pour spécifier la vitesse de la transition en fonction de la longueur totale du chemin. Il s'agit d'un coefficient permettant de calculer la durée de l'animation : `durée = longueur / vitesse` (`duration = length / speed`). Par exemple, un chemin qui mesure 1000 pixels de long avec une vitesse de 1 aura une durée de 1000ms. Avec une vitesse de `0.5`, l'animation aura un temps doublé. Avec une vitesse de `2`, l'animation sera deux fois plus lente.

```svelte
<script>
	import { draw } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
	{#if condition}
		<path
			transition:draw={{ duration: 5000, delay: 500, easing: quintOut }}
			d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"
			fill="none"
			stroke="cornflowerblue"
			stroke-width="0.1px"
			stroke-linejoin="round"
		/>
	{/if}
</svg>
```

## `crossfade`

> EXPORT_SNIPPET: svelte/transition#crossfade

La fonction de fondu croisé `crossfade` crée deux [transitions](/docs/element-directives#transition-fn) appelées `send` et `receive`. Quand un élément est "envoyé", Svelte cherche un élément correspondant "reçu" et génère une transition qui déplace l'élément vers la position de sa contrepartie en le faisant disparaître. Quand un élément est "reçu", l'inverse s'applique. S'il n'y a pas d'élément reçu, la transition par défaut `fallback` s'applique.

Les paramètres suivants peuvent être utilisés avec `crossfade` :

* `delay` (`number`, par défaut 0) - millisecondes avant le démarrage
* `duration` (`number` | `function`, par défaut 800) - durée de la transition en millisecondes
* `easing` (`function`, par défaut `cubicOut`) — une [fonction de lissage](/docs/svelte-easing)
* `fallback` (`function`) — une [transition](/docs/element-directives#transition-fn) de secours à utiliser lorsqu'il n'y a pas d'élément "reçu" correspondant.

```svelte
<script>
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const [send, receive] = crossfade({
		duration: 1500,
		easing: quintOut
	});
</script>

{#if condition}
	<h1 in:send={{ key }} out:receive={{ key }}>GROS ELEMENT</h1>
{:else}
	<small in:send={{ key }} out:receive={{ key }}>petit élément</small>
{/if}
```

## Types

> TYPES: svelte/transition
